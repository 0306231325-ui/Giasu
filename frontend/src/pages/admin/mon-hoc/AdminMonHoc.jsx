import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

const formMacDinh = {
  ten_mon: "",
  cap_hoc_id: "",
  lop: "",
  gia: "",
  mo_ta: "",
};

const dinhDangTien = (gia) => {
  const soTien = Number(gia || 0);
  return soTien ? `${soTien.toLocaleString("vi-VN")} đ/giờ` : "Chưa cập nhật";
};

const monMacDinhTheoCap = {
  "Tiểu học": ["Toán Học", "Tiếng Việt", "Tiếng Anh"],
  THCS: ["Toán Học", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh"],
  THPT: ["Toán Học", "Ngữ Văn", "Vật Lý", "Hóa Học", "Sinh Học", "Tiếng Anh"],
};

const laySoLopTheoCap = (tenCapHoc) => {
  if (tenCapHoc === "Tiểu học") return [1, 2, 3, 4, 5];
  if (tenCapHoc === "THCS") return [6, 7, 8, 9];
  if (tenCapHoc === "THPT") return [10, 11, 12];

  return [];
};

const SO_DONG_MOI_TRANG = 8;

function AdminMonHoc() {
  const [danhSach, setDanhSach] = useState([]);
  const [capHocs, setCapHocs] = useState([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [capHocLoc, setCapHocLoc] = useState("");
  const [form, setForm] = useState(formMacDinh);
  const [monDangSua, setMonDangSua] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXoaId, setDangXoaId] = useState(null);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);

  const danhSachLoc = useMemo(() => danhSach, [danhSach]);
  const tongSoTrang = Math.max(Math.ceil(danhSachLoc.length / SO_DONG_MOI_TRANG), 1);
  const trangHopLe = Math.min(trangHienTai, tongSoTrang);
  const danhSachDangHienThi = useMemo(() => {
    const batDau = (trangHopLe - 1) * SO_DONG_MOI_TRANG;

    return danhSachLoc.slice(batDau, batDau + SO_DONG_MOI_TRANG);
  }, [danhSachLoc, trangHopLe]);
  const capHocDangChon = useMemo(
    () => capHocs.find((capHoc) => String(capHoc.id) === String(form.cap_hoc_id)),
    [capHocs, form.cap_hoc_id],
  );
  const cacLopTheoCap = useMemo(
    () => laySoLopTheoCap(capHocDangChon?.ten),
    [capHocDangChon],
  );
  const goiYTenMon = useMemo(() => {
    const tenMonDaCo = danhSach
      .filter((monHoc) => !form.cap_hoc_id || String(monHoc.cap_hoc_id) === String(form.cap_hoc_id))
      .map((monHoc) => monHoc.ten_mon)
      .filter(Boolean);
    const tenMonMacDinh = monMacDinhTheoCap[capHocDangChon?.ten] || [];

    return [...new Set([...tenMonMacDinh, ...tenMonDaCo])].sort((a, b) => a.localeCompare(b, "vi"));
  }, [capHocDangChon, danhSach, form.cap_hoc_id]);

  const taiDanhSach = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const response = await api.get("/admin/mon-hoc", {
        params: {
          ...(tuKhoa.trim() ? { q: tuKhoa.trim() } : {}),
          ...(capHocLoc ? { cap_hoc_id: capHocLoc } : {}),
        },
      });

      if (response.data.success) {
        setDanhSach(response.data.data.mon_hoc || []);
        setCapHocs(response.data.data.cap_hoc || []);
      }
    } catch (err) {
      setLoi(err.response?.data?.message || "Không tải được danh sách môn học.");
    } finally {
      setDangTai(false);
    }
  }, [capHocLoc, tuKhoa]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void taiDanhSach();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [taiDanhSach]);

  useEffect(() => {
    const lamMoi = () => {
      void taiDanhSach();
    };

    window.addEventListener("admin:refresh", lamMoi);

    return () => {
      window.removeEventListener("admin:refresh", lamMoi);
    };
  }, [taiDanhSach]);

  const capNhatForm = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "cap_hoc_id") {
        next.lop = "";
      }

      return next;
    });
    setLoi("");
    setThongBao("");
  };

  const chonSua = (monHoc) => {
    setMonDangSua(monHoc);
    setForm({
      ten_mon: monHoc.ten_mon || "",
      cap_hoc_id: monHoc.cap_hoc_id || "",
      lop: monHoc.lop || "",
      gia: monHoc.gia ?? "",
      mo_ta: monHoc.mo_ta || "",
    });
    setLoi("");
    setThongBao("");
  };

  const huySua = () => {
    setMonDangSua(null);
    setForm(formMacDinh);
    setLoi("");
  };

  const luuMonHoc = async (event) => {
    event.preventDefault();
    setDangLuu(true);
    setLoi("");
    setThongBao("");

    const payload = {
      ten_mon: form.ten_mon.trim(),
      cap_hoc_id: form.cap_hoc_id || null,
      lop: form.lop.trim() || null,
      gia: form.gia === "" ? null : Number(form.gia),
      mo_ta: form.mo_ta.trim() || null,
    };

    try {
      const response = monDangSua
        ? await api.patch(`/admin/mon-hoc/${monDangSua.id}`, payload)
        : await api.post("/admin/mon-hoc", payload);

      if (response.data.success) {
        setThongBao(response.data.message);
        setForm(formMacDinh);
        setMonDangSua(null);
        await taiDanhSach();
      }
    } catch (err) {
      setLoi(err.response?.data?.message || "Không lưu được môn học.");
    } finally {
      setDangLuu(false);
    }
  };

  const xoaMonHoc = async (monHoc) => {
    const xacNhan = window.confirm(`Xóa môn ${monHoc.ten_mon}${monHoc.lop ? ` - lớp ${monHoc.lop}` : ""}?`);
    if (!xacNhan) return;

    setDangXoaId(monHoc.id);
    setLoi("");
    setThongBao("");

    try {
      const response = await api.delete(`/admin/mon-hoc/${monHoc.id}`);
      if (response.data.success) {
        setThongBao(response.data.message);
        setDanhSach((hienTai) => hienTai.filter((item) => item.id !== monHoc.id));
      }
    } catch (err) {
      setLoi(err.response?.data?.message || "Không xóa được môn học.");
    } finally {
      setDangXoaId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold">Quản lý môn học</div>
          <div className="mt-2 text-sm text-white/70">
            Thêm mới, chỉnh sửa hoặc xóa thông tin môn học trong hệ thống.
          </div>
        </div>
        <div className="text-sm text-white/70">
          Tổng: <span className="font-bold text-white">{danhSachLoc.length}</span>
        </div>
      </div>

      {(loi || thongBao) && (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-semibold",
            loi
              ? "border-red-400/30 bg-red-500/10 text-red-100"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
          ].join(" ")}
        >
          {loi || thongBao}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={tuKhoa}
              onChange={(event) => {
                setTuKhoa(event.target.value);
                setTrangHienTai(1);
              }}
              placeholder="Tìm theo tên môn, lớp, mô tả..."
              className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-400"
            />
            <select
              value={capHocLoc}
              onChange={(event) => {
                setCapHocLoc(event.target.value);
                setTrangHienTai(1);
              }}
              className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
            >
              <option value="">Tất cả cấp học</option>
              {capHocs.map((capHoc) => (
                <option key={capHoc.id} value={capHoc.id}>
                  {capHoc.ten}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase text-white/55">
                <tr>
                  <th className="px-4 py-3">Môn học</th>
                  <th className="px-4 py-3">Cấp học</th>
                  <th className="px-4 py-3">Lớp</th>
                  <th className="px-4 py-3">Giá gốc</th>
                  <th className="px-4 py-3">Gia sư</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {dangTai ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/60">
                      Đang tải danh sách môn học...
                    </td>
                  </tr>
                ) : danhSachLoc.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/60">
                      Chưa có môn học phù hợp.
                    </td>
                  </tr>
                ) : (
                  danhSachDangHienThi.map((monHoc) => (
                    <tr key={monHoc.id} className="align-top">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{monHoc.ten_mon}</div>
                        <div className="mt-1 max-w-xs text-xs leading-5 text-white/55">
                          {monHoc.mo_ta || "Chưa có mô tả."}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/75">{monHoc.cap_hoc || "Chưa chọn"}</td>
                      <td className="px-4 py-3 text-white/75">{monHoc.lop || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-blue-200">{dinhDangTien(monHoc.gia)}</td>
                      <td className="px-4 py-3 text-white/75">{monHoc.so_gia_su}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => chonSua(monHoc)}
                            className="rounded-lg border border-blue-300/30 px-3 py-2 text-xs font-bold text-blue-100 transition hover:bg-blue-500/15"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => xoaMonHoc(monHoc)}
                            disabled={dangXoaId === monHoc.id}
                            className="rounded-lg border border-red-300/30 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {danhSachLoc.length > SO_DONG_MOI_TRANG && (
            <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Hiển thị {(trangHopLe - 1) * SO_DONG_MOI_TRANG + 1}
                {" - "}
                {Math.min(trangHopLe * SO_DONG_MOI_TRANG, danhSachLoc.length)}
                {" / "}
                {danhSachLoc.length} môn
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTrangHienTai((trang) => Math.max(trang - 1, 1))}
                  disabled={trangHopLe === 1}
                  className="rounded-lg border border-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trước
                </button>
                <span className="px-2 font-semibold text-white">
                  {trangHopLe}/{tongSoTrang}
                </span>
                <button
                  type="button"
                  onClick={() => setTrangHienTai((trang) => Math.min(trang + 1, tongSoTrang))}
                  disabled={trangHopLe === tongSoTrang}
                  className="rounded-lg border border-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </section>

        <form onSubmit={luuMonHoc} className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-lg font-extrabold">{monDangSua ? "Chỉnh sửa môn học" : "Thêm môn học"}</div>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">Tên môn</span>
              <input
                list="goi-y-ten-mon"
                value={form.ten_mon}
                onChange={(event) => capNhatForm("ten_mon", event.target.value)}
                placeholder={form.cap_hoc_id ? "Ví dụ: Toán Học" : "Chọn cấp học trước để xem gợi ý"}
                required
                className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-400"
              />
              <datalist id="goi-y-ten-mon">
                {goiYTenMon.map((tenMon) => (
                  <option key={tenMon} value={tenMon} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">Cấp học</span>
              <select
                value={form.cap_hoc_id}
                onChange={(event) => capNhatForm("cap_hoc_id", event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="">Chưa chọn</option>
                {capHocs.map((capHoc) => (
                  <option key={capHoc.id} value={capHoc.id}>
                    {capHoc.ten}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">Lớp</span>
              <select
                value={form.lop}
                onChange={(event) => capNhatForm("lop", event.target.value)}
                disabled={!form.cap_hoc_id}
                required
                className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {form.cap_hoc_id ? "Chọn lớp" : "Chọn cấp học trước"}
                </option>
                {cacLopTheoCap.map((lop) => (
                  <option key={lop} value={`Lớp ${lop}`}>
                    Lớp {lop}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">Giá gốc / giờ</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.gia}
                onChange={(event) => capNhatForm("gia", event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">Mô tả</span>
              <textarea
                rows={4}
                value={form.mo_ta}
                onChange={(event) => capNhatForm("mo_ta", event.target.value)}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={dangLuu}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dangLuu ? "Đang lưu..." : monDangSua ? "Lưu thay đổi" : "Thêm môn"}
            </button>
            {monDangSua && (
              <button
                type="button"
                onClick={huySua}
                className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminMonHoc;
