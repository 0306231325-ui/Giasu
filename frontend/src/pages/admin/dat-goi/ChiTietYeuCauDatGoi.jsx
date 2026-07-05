import { useState } from "react";
import ModalXemTaiLieu from "../../../components/ModalXemTaiLieu";
import IconAdminGiaSu from "../gia-su/IconAdminGiaSu";
import { TRANG_THAI_GOI } from "./constants";
import { dinhDangNgay, layHanhDong, layNhanThanhToanPhu } from "./utils";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

function ChiTietYeuCauDatGoi({ yeuCau, onThucHien }) {
    return (
        <div>
            <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
                            {yeuCau.ma}
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold">
                            {yeuCau.mon} · {yeuCau.capHoc}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Tạo lúc {yeuCau.ngayTao}
                        </p>
                    </div>
                    <NhanTrangThai trangThai={yeuCau.trangThai} />
                </div>
            </div>

            <div className="space-y-5 p-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <KhoiThongTin tieuDe="Thông tin học viên" icon="user">
                        <ThongTin label="Họ tên" value={yeuCau.hocVien} />
                        <ThongTin label="Email" value={yeuCau.hocVienEmail} />
                        <ThongTin label="Số điện thoại" value={yeuCau.hocVienSdt} />
                    </KhoiThongTin>

                    <KhoiThongTin tieuDe="Gia sư được chọn" icon="user">
                        <ThongTin label="Họ tên" value={yeuCau.giaSu} />
                        <ThongTin label="Email" value={yeuCau.giaSuEmail} />
                    </KhoiThongTin>
                </div>

                <KhoiThongTin tieuDe="Thông tin gói học" icon="book">
                    <div className="grid gap-4 md:grid-cols-3">
                        <ThongTin label="Loại gói" value={yeuCau.loaiGoi} />
                        <ThongTin label="Số buổi" value={`${yeuCau.soBuoi} buổi`} />
                        <ThongTin label="Tổng tiền" value={yeuCau.tongTien} noiBat />
                        <ThongTin
                            label="Ngày học mong muốn"
                            value={yeuCau.ngayMongMuon || yeuCau.lichMongMuon}
                        />
                        <ThongTin
                            label="Giờ mong muốn"
                            value={yeuCau.gioMongMuon || "Chưa cập nhật"}
                        />
                        <ThongTin label="Hình thức" value={yeuCau.hinhThuc} />
                        <ThongTin label="Địa điểm" value={yeuCau.diaDiem} />
                    </div>
                    <DanhSachBuoiHoc yeuCau={yeuCau} />
                </KhoiThongTin>

                <KhoiPhanHoi yeuCau={yeuCau} />
                <KhoiThanhToan yeuCau={yeuCau} />

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-base font-extrabold">Hành động tiếp theo</h3>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {layHanhDong(yeuCau).map((hanhDong) => (
                            <button
                                key={hanhDong.label}
                                type="button"
                                onClick={() => onThucHien(yeuCau, hanhDong.key)}
                                className={hanhDong.className}
                            >
                                {hanhDong.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KhoiThanhToan({ yeuCau }) {
    const [taiLieuDangXem, setTaiLieuDangXem] = useState(null);

    if (!["cho_thanh_toan", "da_tao_lich"].includes(yeuCau.trangThai)) {
        return null;
    }

    const thanhToan = yeuCau.thanhToan || {};
    const nhanPhu = layNhanThanhToanPhu(yeuCau);
    const anhMinhChung = thanhToan.anhMinhChung || thanhToan.anh_minh_chung;
    const urlMinhChung = taoUrlFile(anhMinhChung);
    const moAnhMinhChung = () => {
        if (!urlMinhChung) return;

        setTaiLieuDangXem({
            urlTrucTiep: urlMinhChung,
            tenFile: anhMinhChung?.split("/")?.pop() || "minh-chung-thanh-toan.jpg",
            tieuDe: "Minh chứng thanh toán",
        });
    };

    return (
        <KhoiThongTin tieuDe="Thanh toán" icon="money">
            <div className="grid gap-4 md:grid-cols-3">
                <ThongTin label="Trạng thái" value={nhanPhu?.nhan || "Chưa cập nhật"} noiBat />
                <ThongTin label="Số tiền" value={thanhToan.soTien || thanhToan.so_tien || yeuCau.tongTien} />
                <ThongTin label="Phương thức" value={thanhToan.phuongThuc || thanhToan.phuong_thuc || "Chưa gửi"} />
                <ThongTin label="Mã giao dịch" value={thanhToan.maGiaoDich || thanhToan.ma_giaodich || "Chưa gửi"} />
                <ThongTin label="Ngày gửi" value={thanhToan.ngayThanhToan || thanhToan.ngay_thanhtoan || "Chưa gửi"} />
                <ThongTin label="Minh chứng" value={anhMinhChung ? "Đã gửi minh chứng" : "Chưa gửi"} />
            </div>

            {urlMinhChung && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-extrabold text-slate-900">
                                Ảnh minh chứng thanh toán
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                                Admin kiểm tra ảnh trước khi duyệt hoặc từ chối thanh toán.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={moAnhMinhChung}
                            className="inline-flex justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
                        >
                            Xem ảnh minh chứng
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={moAnhMinhChung}
                        className="mt-4 block w-full overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                        <img
                            src={urlMinhChung}
                            alt="Minh chứng thanh toán"
                            className="max-h-[420px] w-full object-contain"
                        />
                    </button>
                </div>
            )}

            {yeuCau.trangThai === "cho_thanh_toan" && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                    Khi học viên gửi minh chứng thanh toán, gói sẽ xuất hiện ở tab Xác nhận thanh toán.
                </div>
            )}
            <ModalXemTaiLieu
                taiLieu={taiLieuDangXem}
                onDong={() => setTaiLieuDangXem(null)}
            />
        </KhoiThongTin>
    );
}

function taoUrlFile(duongDan) {
    if (!duongDan) return "";
    if (/^https?:\/\//i.test(duongDan)) return duongDan;
    if (duongDan.startsWith("/")) return `${API_ORIGIN}${duongDan}`;
    return `${API_ORIGIN}/${duongDan}`;
}

function DanhSachBuoiHoc({ yeuCau }) {
    const danhSach = yeuCau.lichHoc || [];

    if (danhSach.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                Chưa có dữ liệu giờ học chi tiết.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-extrabold text-slate-900">
                        {yeuCau.hocDinhKy ? "Lịch học định kỳ" : "Các buổi học không định kỳ"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                        {yeuCau.hocDinhKy
                            ? "Hệ thống tóm tắt theo thứ và khung giờ học."
                            : "Hiển thị từng buổi học viên đã chọn khi đặt gói."}
                    </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                    {danhSach.length} buổi
                </span>
            </div>

            <div className="mt-4 max-h-48 overflow-y-auto pr-1">
                <div className="grid gap-2 md:grid-cols-2">
                    {danhSach.map((buoiHoc) => (
                        <div
                            key={buoiHoc.id}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                        >
                            <p className="text-sm font-bold text-slate-800">
                                {buoiHoc.thu} · {dinhDangNgay(buoiHoc.ngayHoc)}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                                {buoiHoc.gioBatDau} - {buoiHoc.gioKetThuc} · {buoiHoc.hinhThuc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function KhoiPhanHoi({ yeuCau }) {
    if (!yeuCau.phanHoi) {
        return (
            <KhoiThongTin tieuDe="Phản hồi gia sư" icon="mail">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <p className="font-extrabold">Gia sư chưa phản hồi</p>
                    <p className="mt-1">
                        Khi gia sư bấm đồng ý/từ chối, hệ thống sẽ tạo dòng trong bảng phản hồi và cập nhật trạng thái gói học.
                    </p>
                </div>
            </KhoiThongTin>
        );
    }

    const laDongY = yeuCau.phanHoi.ketQua === "dong_y";

    return (
        <KhoiThongTin tieuDe="Phản hồi gia sư" icon="mail">
            <div className={[
                "rounded-2xl border px-4 py-3",
                laDongY
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800",
            ].join(" ")}
            >
                <p className="font-extrabold">
                    Trạng thái: {laDongY ? "Đã đồng ý" : "Đã từ chối"}
                </p>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                    <ThongTin label="Gia sư" value={yeuCau.giaSu} />
                    <ThongTin label="Thời gian phản hồi" value={yeuCau.phanHoi.thoiGian} />
                </div>
                {!laDongY && (
                    <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm">
                        <span className="font-bold">Lý do:</span> {yeuCau.phanHoi.lyDo}
                    </div>
                )}
            </div>
        </KhoiThongTin>
    );
}

function KhoiThongTin({ tieuDe, icon, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <IconAdminGiaSu ten={icon} className="h-5 w-5" />
                </span>
                <h3 className="text-base font-extrabold">{tieuDe}</h3>
            </div>
            <div className="space-y-4 p-5">{children}</div>
        </section>
    );
}

function ThongTin({ label, value, noiBat = false }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className={[
                "mt-1.5 text-sm font-semibold",
                noiBat ? "text-blue-600" : "text-slate-800",
            ].join(" ")}
            >
                {value}
            </p>
        </div>
    );
}

function NhanTrangThai({ trangThai }) {
    const thongTin = TRANG_THAI_GOI[trangThai] ?? TRANG_THAI_GOI.cho_xu_ly;
    return (
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-extrabold ${thongTin.className}`}>
            {thongTin.label}
        </span>
    );
}

export default ChiTietYeuCauDatGoi;
