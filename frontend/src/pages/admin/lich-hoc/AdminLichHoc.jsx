import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

const BO_LOC_TRANG_THAI = [
  { value: "", label: "Tất cả", countKey: "tat_ca" },
  { value: "da_nhan", label: "Đã nhận", countKey: "da_nhan" },
  { value: "hoanthanh", label: "Hoàn thành", countKey: "hoanthanh" },
  { value: "dahuy", label: "Đã hủy", countKey: "dahuy" },
];

const MAU_TRANG_THAI = {
  da_nhan: "border-blue-300/30 bg-blue-500/10 text-blue-100",
  hoanthanh: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
  dahuy: "border-red-300/30 bg-red-500/10 text-red-100",
};

const SO_BUOI_MOI_TRANG = 8;

const dinhDangNgayInput = (date) => {
  const nam = date.getFullYear();
  const thang = String(date.getMonth() + 1).padStart(2, "0");
  const ngay = String(date.getDate()).padStart(2, "0");

  return `${nam}-${thang}-${ngay}`;
};

const congNgay = (date, soNgay) => {
  const next = new Date(date);
  next.setDate(next.getDate() + soNgay);

  return next;
};

function AdminLichHoc() {
  const [danhSach, setDanhSach] = useState([]);
  const [thongKe, setThongKe] = useState({});
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [lichDangChonId, setLichDangChonId] = useState(null);
  const [lichChiTietId, setLichChiTietId] = useState(null);
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [boLoc, setBoLoc] = useState({
    trang_thai: "",
    q: "",
    tu_ngay: "",
    den_ngay: "",
  });

  const lichDangChon = useMemo(
    () => danhSach.find((lich) => lich.id === lichDangChonId) || null,
    [danhSach, lichDangChonId],
  );
  const lichChiTiet = useMemo(
    () => danhSach.find((lich) => lich.id === lichChiTietId) || null,
    [danhSach, lichChiTietId],
  );
  const tongSoTrang = Math.max(Math.ceil(danhSach.length / SO_BUOI_MOI_TRANG), 1);
  const trangHopLe = Math.min(trangHienTai, tongSoTrang);
  const danhSachDangHienThi = useMemo(() => {
    const batDau = (trangHopLe - 1) * SO_BUOI_MOI_TRANG;

    return danhSach.slice(batDau, batDau + SO_BUOI_MOI_TRANG);
  }, [danhSach, trangHopLe]);
  const dangCoLoc = Boolean(boLoc.trang_thai || boLoc.q || boLoc.tu_ngay || boLoc.den_ngay);

  const taiLichHoc = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const lichHocResponse = await api.get("/admin/lich-hoc", { params: boLoc });

      if (lichHocResponse.data.success) {
        const nextDanhSach = lichHocResponse.data.data?.danh_sach || [];
        setDanhSach(nextDanhSach);
        setThongKe(lichHocResponse.data.data?.thong_ke || {});
        setLichDangChonId((currentId) => (
          nextDanhSach.some((lich) => lich.id === currentId) ? currentId : null
        ));
        setLichChiTietId((currentId) => (
          nextDanhSach.some((lich) => lich.id === currentId) ? currentId : null
        ));
      }
    } catch (error) {

      setLoi(error.response?.data?.message || "Không tải được danh sách lịch học.");
    } finally {
      setDangTai(false);
    }
  }, [boLoc]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void taiLichHoc();
    }, boLoc.q ? 350 : 0);

    return () => window.clearTimeout(timer);
  }, [boLoc.q, taiLichHoc]);

  useEffect(() => {
    const lamMoi = () => {
      void taiLichHoc();
    };

    window.addEventListener("admin:refresh", lamMoi);
    return () => window.removeEventListener("admin:refresh", lamMoi);
  }, [taiLichHoc]);

  useEffect(() => {
    if (!loi && !thongBao) return undefined;

    const timer = window.setTimeout(() => {
      setLoi("");
      setThongBao("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [loi, thongBao]);

  const capNhatBoLoc = (field, value) => {
    setBoLoc((prev) => ({ ...prev, [field]: value }));
    setTrangHienTai(1);
  };

  const datKhoangNgay = (tuNgay, denNgay) => {
    setBoLoc((prev) => ({
      ...prev,
      tu_ngay: tuNgay,
      den_ngay: denNgay,
    }));
    setTrangHienTai(1);
  };

  const xoaBoLoc = () => {
    setBoLoc({
      trang_thai: "",
      q: "",
      tu_ngay: "",
      den_ngay: "",
    });
    setTrangHienTai(1);
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-300">
            Điều phối buổi học
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Quản lý lịch học</h1>
        </div>
      </div>


      <div className="mt-6 grid gap-3 md:grid-cols-4">
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
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const homNay = dinhDangNgayInput(new Date());
              datKhoangNgay(homNay, homNay);
            }}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/75 transition hover:bg-white/5 hover:text-white"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => {
              const homNay = new Date();
              datKhoangNgay(dinhDangNgayInput(homNay), dinhDangNgayInput(congNgay(homNay, 7)));
            }}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/75 transition hover:bg-white/5 hover:text-white"
          >
            7 ngày tới
          </button>
          {dangCoLoc && (
            <button
              type="button"
              onClick={xoaBoLoc}
              className="rounded-lg border border-blue-300/30 px-3 py-2 text-xs font-bold text-blue-100 transition hover:bg-blue-500/15"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </section>

      {loi && (
        <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
          {loi}
        </div>
      )}
      {thongBao && (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
          {thongBao}
        </div>
      )}

      <div className="mt-5">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-extrabold">Danh sách buổi học</h2>
            </div>
            <div className="text-sm font-semibold text-white/55">
              {danhSach.length} buổi
            </div>
          </div>

          <div className="p-4">
            {dangTai ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/50">
                Đang tải lịch học...
              </div>
            ) : danhSach.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center text-sm text-white/50">
                Chưa có buổi học phù hợp.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                <div className="divide-y divide-white/10">
                  {danhSachDangHienThi.map((lich) => (
                    <button
                      key={lich.id}
                      type="button"
                      onClick={() => {
                        setLichDangChonId(lich.id);
                        setLichChiTietId(lich.id);
                      }}
                      className={[
                        "grid w-full gap-3 px-4 py-3 text-left transition lg:grid-cols-[132px_96px_minmax(0,1fr)_132px]",
                        lichDangChon?.id === lich.id
                          ? "bg-blue-500/15"
                          : "hover:bg-white/[0.045]",
                      ].join(" ")}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-blue-100">{lich.ngayHocText || "Chưa có ngày"}</div>
                        <div className="mt-1 text-xs font-semibold text-white/45">{lich.thuText || ""}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <div className="w-[82px] rounded-lg border border-blue-300/20 bg-[#07122f] px-2.5 py-1.5 text-center lg:w-full">
                          <div className="text-sm font-extrabold text-white">{lich.gioBatDau}</div>
                          <div className="text-[11px] font-bold text-blue-200">{lich.gioKetThuc}</div>
                        </div>
                        <div className="text-xs font-semibold text-white/45 lg:mt-1.5 lg:text-center">
                          {lich.hinhThucHocText || "Chưa cập nhật"}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate font-extrabold text-white">
                            {lich.monHoc?.tenHienThi || "Chưa cập nhật"}
                          </div>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/55">
                            {lich.maGoi}
                          </span>
                        </div>
                        <div className="mt-1.5 grid gap-1 text-xs md:grid-cols-2">
                          <div className="truncate text-white/70">
                            <span className="font-bold text-white/85">HV:</span> {lich.hocVien?.hoTen || "Chưa cập nhật"}
                          </div>
                          <div className="truncate text-white/55">
                            <span className="font-bold text-white/70">GS:</span> {lich.giaSu?.hoTen || "Chưa cập nhật"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-end lg:justify-center">
                        <TrangThaiBadge lich={lich} />
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <NhanXacNhanNho active={lich.xacNhan?.hocVienDaXacNhan} warning={lich.xacNhan?.hocVienBaoVanDe}>
                            HV
                          </NhanXacNhanNho>
                          <NhanXacNhanNho active={lich.xacNhan?.giaSuDaXacNhan} warning={lich.xacNhan?.giaSuBaoVanDe}>
                            GS
                          </NhanXacNhanNho>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {danhSach.length > SO_BUOI_MOI_TRANG && (
            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Hiển thị {(trangHopLe - 1) * SO_BUOI_MOI_TRANG + 1}
                {" - "}
                {Math.min(trangHopLe * SO_BUOI_MOI_TRANG, danhSach.length)}
                {" / "}
                {danhSach.length} buổi
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTrangHienTai((trang) => Math.max(trang - 1, 1))}
                  disabled={trangHopLe === 1}
                  className="rounded-lg border border-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trước
                </button>
                {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map((trang) => (
                  <button
                    key={trang}
                    type="button"
                    onClick={() => setTrangHienTai(trang)}
                    className={[
                      "h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition",
                      trangHopLe === trang
                        ? "border-blue-400/50 bg-blue-600 text-white"
                        : "border-white/10 text-white/65 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    {trang}
                  </button>
                ))}
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
      </div>

      <ModalChiTietLichHocAdmin
        lich={lichChiTiet}
        onDong={() => setLichChiTietId(null)}
      />
    </div>
  );
}


function ModalChiTietLichHocAdmin({ lich, onDong }) {
  if (!lich) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDong?.();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Chi tiết</p>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">{lich.monHoc?.tenHienThi || "Buổi học"}</h2>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
        <div className="p-4">
          <ChiTietLichHoc lich={lich} compact />
        </div>
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

function NhanXacNhanNho({ active, warning, children }) {
  return (
    <span
      className={[
        "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
        warning
          ? "bg-amber-300 text-amber-950"
          : active
            ? "bg-emerald-300 text-emerald-950"
            : "bg-white/10 text-white/50",
      ].join(" ")}
      title={warning ? "Báo vấn đề" : active ? "Đã xác nhận" : "Chưa xác nhận"}
    >
      {children}
    </span>
  );
}

function ChiTietLichHoc({ lich, compact = false }) {
  if (!lich) {
    return (
      <aside className="rounded-2xl border border-white/10 bg-white p-6 text-center text-sm text-slate-500">
        Chọn một buổi học để xem chi tiết.
      </aside>
    );
  }

  const xacNhan = lich.xacNhan || {};

  return (
    <aside className={`${compact ? "" : "h-fit rounded-2xl border border-white/10 bg-white p-5"} text-slate-900`}>
      <div className="grid gap-3">
        <KhoiThongTin title="Tổng quan">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">{lich.maGoi}</p>
              <p className="mt-1 text-sm text-slate-500">{lich.thuText}, {lich.ngayHocText} · {lich.khungGio}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {lich.loaiBuoiText}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Buổi học</span>
            <span className="text-sm font-bold text-slate-900">{lich.trangThaiText}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Gói học</span>
            <span className="text-sm font-bold text-slate-900">{lich.goiHoc?.trangThaiText || "Chưa cập nhật"}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <NhanXacNhan active={xacNhan.hocVienDaXacNhan} warning={xacNhan.hocVienBaoVanDe}>
              Học viên
            </NhanXacNhan>
            <NhanXacNhan active={xacNhan.giaSuDaXacNhan} warning={xacNhan.giaSuBaoVanDe}>
              Gia sư
            </NhanXacNhan>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TheLienHe tieuDe="Học viên" nguoi={lich.hocVien} />
            <TheLienHe tieuDe="Gia sư" nguoi={lich.giaSu} />
          </div>
        </KhoiThongTin>

        <KhoiThongTin title="Thông tin">
          <div className="grid gap-2 sm:grid-cols-2">
            <OThongTin label="Hình thức" value={lich.hinhThucHocText} />
            <OThongTin label="Địa chỉ" value={lich.diaChiHoc || (lich.hinhThucHoc === "online" ? "Online" : "Chưa cập nhật")} />
            <OThongTin label="Tiền học" value={dinhDangTien(lich.tienHoc)} />
            <OThongTin label="Gia sư nhận" value={dinhDangTien(lich.tienGiaSuNhan)} />
          </div>
        </KhoiThongTin>

        {lich.danhGia && (
          <KhoiThongTin title="Đánh giá">
            <>
              <Dong label="Số sao" value={`${lich.danhGia.soSao}/5`} />
              <Dong label="Ngày đánh giá" value={lich.danhGia.ngayDanhGia} />
              <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                {lich.danhGia.binhLuan || "Không có nội dung đánh giá."}
              </p>
            </>
          </KhoiThongTin>
        )}

        {lich.lyDoHuy && (
          <KhoiThongTin title="Ghi chú">
            <p className="text-sm leading-6 text-red-600">{lich.lyDoHuy}</p>
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

function NhanXacNhan({ active, warning, children }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-bold",
        warning
          ? "bg-amber-100 text-amber-700"
          : active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {children}: {warning ? "Báo vấn đề" : active ? "Đã xác nhận" : "Chưa xác nhận"}
    </span>
  );
}

function TheLienHe({ tieuDe, nguoi }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{tieuDe}</div>
      <div className="mt-2 text-sm font-bold text-slate-950">{nguoi?.hoTen || "Chưa cập nhật"}</div>
      <div className="mt-1 truncate text-xs text-slate-500">{nguoi?.email || "Chưa có email"}</div>
      <div className="mt-1 text-xs font-semibold text-slate-600">{nguoi?.sdt || "Chưa có SĐT"}</div>
    </div>
  );
}

function OThongTin({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-bold uppercase text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-bold text-slate-900">{value || "Chưa cập nhật"}</div>
    </div>
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

