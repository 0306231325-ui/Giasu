import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

const SO_DONG_MOI_TRANG = 10;

const BO_LOC_VAI_TRO = [
  { value: "", label: "Tất cả vai trò" },
  { value: "admin", label: "Admin" },
  { value: "giasu", label: "Gia sư" },
  { value: "hocvien", label: "Học viên" },
];

const BO_LOC_HANH_DONG = [
  { value: "", label: "Tất cả hành động" },
  { value: "tai_khoan", label: "Tài khoản" },
  { value: "ho_so", label: "Duyệt hồ sơ" },
  { value: "dat_goi", label: "Đặt gói" },
  { value: "thanh_toan", label: "Thanh toán" },
  { value: "lich_hoc", label: "Lịch học" },
  { value: "bai_viet", label: "Bài viết" },
  { value: "danh_muc", label: "Danh mục" },
];

const NHAN_HANH_DONG = {
  khoa_tai_khoan: "Khóa tài khoản",
  mo_khoa_tai_khoan: "Mở khóa tài khoản",
  gui_don_dang_ky_gia_su: "Gửi đơn đăng ký gia sư",
  duyet_ho_so_gia_su: "Duyệt hồ sơ gia sư",
  tu_choi_ho_so_gia_su: "Từ chối hồ sơ gia sư",
  duyet_yeu_cau_chuyen_mon: "Duyệt yêu cầu chuyên môn",
  tu_choi_yeu_cau_chuyen_mon: "Từ chối yêu cầu chuyên môn",
  dat_goi_hoc: "Đặt gói học",
  gui_yeu_cau_cho_gia_su: "Gửi yêu cầu cho gia sư",
  chuyen_cho_thanh_toan: "Chuyển chờ thanh toán",
  gia_su_dong_y: "Gia sư đồng ý",
  gia_su_tu_choi: "Gia sư từ chối",
  huy_goi_hoc: "Hủy gói học",
  gui_minh_chung_thanh_toan: "Gửi minh chứng thanh toán",
  duyet_thanh_toan: "Duyệt thanh toán",
  tu_choi_thanh_toan: "Từ chối thanh toán",
  tao_lich_hoc: "Tạo lịch học",
  xac_nhan_hoan_thanh_buoi_hoc: "Xác nhận hoàn thành",
  huy_buoi_hoc: "Hủy buổi học",
  yeu_cau_doi_buoi: "Yêu cầu đổi buổi",
  tao_bai_viet: "Tạo bài viết",
  sua_bai_viet: "Sửa bài viết",
  xoa_bai_viet: "Xóa bài viết",
  them_danh_muc: "Thêm danh mục",
  sua_danh_muc: "Sửa danh mục",
  xoa_danh_muc: "Xóa danh mục",
};

const META_MAC_DINH = {
  current_page: 1,
  last_page: 1,
  per_page: SO_DONG_MOI_TRANG,
  total: 0,
};

function AdminNhatKy() {
  const [tuKhoaNhap, setTuKhoaNhap] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [vaiTro, setVaiTro] = useState("");
  const [nhomHanhDong, setNhomHanhDong] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [danhSach, setDanhSach] = useState([]);
  const [meta, setMeta] = useState(META_MAC_DINH);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [lanTai, setLanTai] = useState(0);

  const tongSoTrang = Math.max(Number(meta.last_page || 1), 1);
  const trangHopLe = Math.min(Number(meta.current_page || trangHienTai), tongSoTrang);

  const thamSoLoc = useMemo(
    () => ({
      page: trangHienTai,
      tu_khoa: tuKhoa || undefined,
      vai_tro: vaiTro || undefined,
      nhom_hanh_dong: nhomHanhDong || undefined,
    }),
    [nhomHanhDong, trangHienTai, tuKhoa, vaiTro],
  );

  useEffect(() => {
    let daHuy = false;

    const taiDanhSach = async () => {
      setDangTai(true);
      setLoi("");

      try {
        const response = await api.get("/admin/nhat-ky", {
          params: thamSoLoc,
        });

        if (daHuy) {
          return;
        }

        setDanhSach(response.data?.data || []);
        setMeta(response.data?.meta || META_MAC_DINH);
      } catch (error) {
        if (daHuy) {
          return;
        }

        setDanhSach([]);
        setMeta(META_MAC_DINH);
        setLoi(
          error.response?.data?.message ||
            "Không thể tải danh sách nhật ký hệ thống.",
        );
      } finally {
        if (!daHuy) {
          setDangTai(false);
        }
      }
    };

    taiDanhSach();

    return () => {
      daHuy = true;
    };
  }, [thamSoLoc, lanTai]);

  useEffect(() => {
    const lamMoi = () => {
      setTrangHienTai(1);
      setLanTai((lan) => lan + 1);
    };

    window.addEventListener("admin:refresh", lamMoi);

    return () => {
      window.removeEventListener("admin:refresh", lamMoi);
    };
  }, []);

  const timKiem = () => {
    setTuKhoa(tuKhoaNhap.trim());
    setTrangHienTai(1);
  };

  const lamMoiBoLoc = () => {
    setTuKhoaNhap("");
    setTuKhoa("");
    setVaiTro("");
    setNhomHanhDong("");
    setTrangHienTai(1);
    setLanTai((lan) => lan + 1);
  };

  const xuLyNhanEnter = (event) => {
    if (event.key === "Enter") {
      timKiem();
    }
  };

  const doiVaiTro = (event) => {
    setVaiTro(event.target.value);
    setTrangHienTai(1);
  };

  const doiNhomHanhDong = (event) => {
    setNhomHanhDong(event.target.value);
    setTrangHienTai(1);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-blue-300">
              Nhật ký hệ thống
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-white">
              Theo dõi lịch sử thao tác
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              Hiển thị các thao tác quan trọng đã được ghi lại trong hệ thống.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-100">
            Tổng sau lọc: {meta.total || 0}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_auto_220px_240px_auto]">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/45">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={tuKhoaNhap}
              onChange={(event) => setTuKhoaNhap(event.target.value)}
              onKeyDown={xuLyNhanEnter}
              placeholder="Tìm nội dung, người thực hiện, mã đối tượng..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/70"
            />
          </div>

          <button
            type="button"
            onClick={timKiem}
            className="mt-auto inline-flex h-[46px] items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white transition hover:bg-blue-700"
          >
            Tìm kiếm
          </button>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/45">
              Vai trò
            </label>
            <select
              value={vaiTro}
              onChange={doiVaiTro}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-blue-400/70"
            >
              {BO_LOC_VAI_TRO.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/45">
              Nhóm hành động
            </label>
            <select
              value={nhomHanhDong}
              onChange={doiNhomHanhDong}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-blue-400/70"
            >
              {BO_LOC_HANH_DONG.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={lamMoiBoLoc}
            className="mt-auto inline-flex h-[46px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-extrabold text-white/80 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white"
          >
            Làm mới lọc
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              Danh sách nhật ký
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Mỗi trang hiển thị {SO_DONG_MOI_TRANG} dòng.
            </p>
          </div>
          <div className="text-sm font-bold text-white/55">
            Trang {trangHopLe}/{tongSoTrang}
          </div>
        </div>

        {loi && (
          <div className="border-b border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200">
            {loi}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Người thực hiện</th>
                <th className="px-5 py-4">Vai trò</th>
                <th className="px-5 py-4">Hành động</th>
                <th className="px-5 py-4">Đối tượng</th>
                <th className="px-5 py-4">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dangTai ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-semibold text-white/50"
                  >
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : danhSach.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-semibold text-white/50"
                  >
                    Không có nhật ký phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                danhSach.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-white/70">
                      {item.created_at || "Chưa có thời gian"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-white">
                        {item.nguoi_thuc_hien || "Hệ thống"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        {item.user_id ? `User #${item.user_id}` : "Không gắn user"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <NhanVaiTro vaiTro={item.vai_tro} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold text-blue-200">
                        {NHAN_HANH_DONG[item.hanh_dong] || item.hanh_dong}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-white/70">
                      {item.doi_tuong_id ? `#${item.doi_tuong_id}` : "—"}
                    </td>
                    <td className="min-w-[320px] px-5 py-4 leading-6 text-white/70">
                      {item.noi_dung}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-white/50">
            Hiển thị {danhSach.length} / {meta.total || 0} nhật ký
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={trangHopLe <= 1 || dangTai}
              onClick={() => setTrangHienTai((trang) => Math.max(1, trang - 1))}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>
            {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map(
              (trang) => (
                <button
                  key={trang}
                  type="button"
                  disabled={dangTai}
                  onClick={() => setTrangHienTai(trang)}
                  className={[
                    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50",
                    trangHopLe === trang
                      ? "border-blue-400 bg-blue-600 text-white"
                      : "border-white/10 text-white/65 hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white",
                  ].join(" ")}
                >
                  {trang}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={trangHopLe >= tongSoTrang || dangTai}
              onClick={() =>
                setTrangHienTai((trang) => Math.min(tongSoTrang, trang + 1))
              }
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function NhanVaiTro({ vaiTro }) {
  const cauHinh = {
    admin: "border-purple-300/30 bg-purple-300/10 text-purple-200",
    giasu: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    hocvien: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  };

  const nhan = {
    admin: "Admin",
    giasu: "Gia sư",
    hocvien: "Học viên",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
        cauHinh[vaiTro] || "border-white/10 bg-white/5 text-white/70",
      ].join(" ")}
    >
      {nhan[vaiTro] || vaiTro || "Hệ thống"}
    </span>
  );
}

export default AdminNhatKy;
