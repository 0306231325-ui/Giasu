import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

const BO_LOC_TRANG_THAI = [
  { value: "", label: "Tất cả", countKey: "tat_ca" },
  { value: "cho_xacnhan", label: "Chờ xác nhận", countKey: "cho_xacnhan" },
  { value: "da_nhan", label: "Đã nhận", countKey: "da_nhan" },
  { value: "hoanthanh", label: "Hoàn thành", countKey: "hoanthanh" },
  { value: "dahuy", label: "Đã hủy", countKey: "dahuy" },
];

const MAU_TRANG_THAI = {
  cho_xacnhan: "border-amber-300/30 bg-amber-500/10 text-amber-100",
  da_nhan: "border-blue-300/30 bg-blue-500/10 text-blue-100",
  hoanthanh: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
  dahuy: "border-red-300/30 bg-red-500/10 text-red-100",
};

function AdminLichHoc() {
  const [danhSach, setDanhSach] = useState([]);
  const [thongKe, setThongKe] = useState({});
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [lichDangChonId, setLichDangChonId] = useState(null);
  const [boLoc, setBoLoc] = useState({
    trang_thai: "",
    q: "",
    tu_ngay: "",
    den_ngay: "",
  });

  const lichDangChon = useMemo(
    () => danhSach.find((lich) => lich.id === lichDangChonId) || danhSach[0] || null,
    [danhSach, lichDangChonId],
  );

  const taiLichHoc = async () => {
    setDangTai(true);
    setLoi("");

    try {
      const response = await api.get("/admin/lich-hoc", { params: boLoc });
      if (response.data.success) {
        const nextDanhSach = response.data.data?.danh_sach || [];
        setDanhSach(nextDanhSach);
        setThongKe(response.data.data?.thong_ke || {});
        setLichDangChonId((currentId) => (
          nextDanhSach.some((lich) => lich.id === currentId) ? currentId : nextDanhSach[0]?.id || null
        ));
      }
    } catch (error) {
      setLoi(error.response?.data?.message || "Không tải được danh sách lịch học.");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiLichHoc();
  }, [boLoc.trang_thai, boLoc.tu_ngay, boLoc.den_ngay]);

  useEffect(() => {
    const timer = window.setTimeout(() => taiLichHoc(), 350);
    return () => window.clearTimeout(timer);
  }, [boLoc.q]);

  useEffect(() => {
    const lamMoi = () => taiLichHoc();
    window.addEventListener("admin:refresh", lamMoi);
    return () => window.removeEventListener("admin:refresh", lamMoi);
  }, [boLoc]);

  const capNhatBoLoc = (field, value) => {
    setBoLoc((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-300">
            Điều phối buổi học
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Quản lý lịch học</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Theo dõi các buổi học đã tạo từ gói học, trạng thái buổi học, học viên, gia sư và đánh giá nếu có.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {BO_LOC_TRANG_THAI.map((item) => (
          <button
            key={item.countKey}
            type="button"
            onClick={() => capNhatBoLoc("trang_thai", item.value)}
            className={[
              "rounded-2xl border p-4 text-left transition",
              boLoc.trang_thai === item.value
                ? "border-blue-400/50 bg-blue-600 text-white"
                : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            <div className="text-2xl font-extrabold">{thongKe[item.countKey] || 0}</div>
            <div className="mt-1 text-sm font-semibold">{item.label}</div>
          </button>
        ))}
      </div>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            value={boLoc.q}
            onChange={(event) => capNhatBoLoc("q", event.target.value)}
            placeholder="Tìm học viên, gia sư, môn học, email hoặc số điện thoại"
            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400"
          />
          <input
            type="date"
            value={boLoc.tu_ngay}
            onChange={(event) => capNhatBoLoc("tu_ngay", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
          />
          <input
            type="date"
            value={boLoc.den_ngay}
            onChange={(event) => capNhatBoLoc("den_ngay", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
          />
        </div>
      </section>

      {loi && (
        <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
          {loi}
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-extrabold">Danh sách buổi học</h2>
              <p className="mt-1 text-sm text-white/45">Hiển thị tối đa 300 buổi gần nhất theo bộ lọc.</p>
            </div>
            <div className="text-sm font-semibold text-white/55">{danhSach.length} buổi</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase text-white/50">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Môn học</th>
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Gia sư</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Gói</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {dangTai ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-white/50">Đang tải lịch học...</td>
                  </tr>
                ) : danhSach.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-white/50">Chưa có buổi học phù hợp.</td>
                  </tr>
                ) : (
                  danhSach.map((lich) => (
                    <tr
                      key={lich.id}
                      onClick={() => setLichDangChonId(lich.id)}
                      className={[
                        "cursor-pointer transition hover:bg-white/[0.04]",
                        lichDangChon?.id === lich.id ? "bg-blue-500/10" : "",
                      ].join(" ")}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{lich.ngayHocText}</div>
                        <div className="mt-1 text-xs text-white/45">{lich.thuText} · {lich.khungGio}</div>
                      </td>
                      <td className="px-4 py-3 text-white/75">{lich.monHoc?.tenHienThi || "Chưa cập nhật"}</td>
                      <td className="px-4 py-3 text-white/75">{lich.hocVien?.hoTen || "Chưa cập nhật"}</td>
                      <td className="px-4 py-3 text-white/75">{lich.giaSu?.hoTen || "Chưa cập nhật"}</td>
                      <td className="px-4 py-3">
                        <TrangThaiBadge lich={lich} />
                      </td>
                      <td className="px-4 py-3 text-white/60">{lich.maGoi}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <ChiTietLichHoc lich={lichDangChon} />
      </div>
    </div>
  );
}

function TrangThaiBadge({ lich }) {
  return (
    <span className={[
      "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
      MAU_TRANG_THAI[lich.trangThai] || "border-white/15 bg-white/5 text-white/70",
    ].join(" ")}
    >
      {lich.trangThaiText}
    </span>
  );
}

function ChiTietLichHoc({ lich }) {
  if (!lich) {
    return (
      <aside className="rounded-2xl border border-white/10 bg-white p-6 text-center text-sm text-slate-500">
        Chọn một buổi học để xem chi tiết.
      </aside>
    );
  }

  return (
    <aside className="h-fit rounded-2xl border border-white/10 bg-white p-5 text-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">{lich.maGoi}</p>
          <h2 className="mt-2 text-xl font-extrabold">{lich.monHoc?.tenHienThi || "Buổi học"}</h2>
          <p className="mt-1 text-sm text-slate-500">{lich.thuText}, {lich.ngayHocText} · {lich.khungGio}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {lich.loaiBuoiText}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <KhoiThongTin title="Trạng thái">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Buổi học</span>
            <span className="text-sm font-bold text-slate-900">{lich.trangThaiText}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Gói học</span>
            <span className="text-sm font-bold text-slate-900">{lich.goiHoc?.trangThaiText || "Chưa cập nhật"}</span>
          </div>
        </KhoiThongTin>

        <KhoiThongTin title="Học viên">
          <Dong label="Họ tên" value={lich.hocVien?.hoTen} />
          <Dong label="Email" value={lich.hocVien?.email} />
          <Dong label="SĐT" value={lich.hocVien?.sdt} />
        </KhoiThongTin>

        <KhoiThongTin title="Gia sư">
          <Dong label="Họ tên" value={lich.giaSu?.hoTen} />
          <Dong label="Email" value={lich.giaSu?.email} />
          <Dong label="SĐT" value={lich.giaSu?.sdt} />
        </KhoiThongTin>

        <KhoiThongTin title="Thông tin học">
          <Dong label="Hình thức" value={lich.hinhThucHocText} />
          <Dong label="Địa chỉ" value={lich.diaChiHoc || (lich.hinhThucHoc === "online" ? "Online" : "Chưa cập nhật")} />
          <Dong label="Tiền học" value={dinhDangTien(lich.tienHoc)} />
          <Dong label="Gia sư nhận" value={dinhDangTien(lich.tienGiaSuNhan)} />
        </KhoiThongTin>

        <KhoiThongTin title="Đánh giá">
          {lich.danhGia ? (
            <>
              <Dong label="Số sao" value={`${lich.danhGia.soSao}/5`} />
              <Dong label="Ngày đánh giá" value={lich.danhGia.ngayDanhGia} />
              <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                {lich.danhGia.binhLuan || "Không có nội dung đánh giá."}
              </p>
            </>
          ) : (
            <div className="text-sm text-slate-500">Chưa có đánh giá.</div>
          )}
        </KhoiThongTin>

        {(lich.ghiChu || lich.lyDoHuy) && (
          <KhoiThongTin title="Ghi chú">
            {lich.ghiChu && <p className="text-sm leading-6 text-slate-600">{lich.ghiChu}</p>}
            {lich.lyDoHuy && <p className="mt-2 text-sm leading-6 text-red-600">{lich.lyDoHuy}</p>}
          </KhoiThongTin>
        )}
      </div>
    </aside>
  );
}

function KhoiThongTin({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Dong({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">{value || "Chưa cập nhật"}</span>
    </div>
  );
}

function dinhDangTien(value) {
  const soTien = Number(value || 0);
  return soTien ? `${soTien.toLocaleString("vi-VN")} đ` : "0 đ";
}

export default AdminLichHoc;
