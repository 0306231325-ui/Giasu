import BoLocDatGoi from "./BoLocDatGoi";
import ChiTietYeuCauDatGoi from "./ChiTietYeuCauDatGoi";
import { BO_LOC_TRANG_THAI } from "./constants";
import TheYeuCauDatGoi from "./TheYeuCauDatGoi";
import useYeuCauDatGoi from "./hooks/useYeuCauDatGoi";

const MO_TA_DANH_SACH = {
    cho_xu_ly: {
        tieuDe: "Danh sách yêu cầu",
        moTa: "Các yêu cầu đặt gói đang chờ admin xử lý hoặc gửi cho gia sư.",
    },
    da_phan_hoi: {
        tieuDe: "Gia sư đã phản hồi",
        moTa: "Các gói học đã được gia sư đồng ý hoặc từ chối.",
    },
    cho_thanh_toan: {
        tieuDe: "Chờ thanh toán",
        moTa: "Các gói đang chờ học viên gửi thông tin thanh toán.",
    },
    xac_nhan_thanh_toan: {
        tieuDe: "Xác nhận thanh toán",
        moTa: "Các gói học viên đã gửi minh chứng, chờ admin xác nhận.",
    },
    danh_sach_goi_hoc: {
        tieuDe: "Danh sách gói học",
        moTa: "Các gói học đã thanh toán và chuyển sang trạng thái đang học/hoàn thành.",
    },
    da_huy: {
        tieuDe: "Gói học đã huỷ",
        moTa: "Các yêu cầu hoặc gói học đã bị huỷ.",
    },
};

function AdminYeuCauDatGiaSu() {
    const {
        boLocPhanHoi,
        boLocTrangThai,
        dangTai,
        danhSachDaLoc,
        thongBao,
        tuKhoa,
        yeuCauDangChon,
        demTheoTrangThai,
        doiTrangThai,
        setBoLocPhanHoi,
        setTuKhoa,
        setYeuCauDangChonId,
        xuLyHanhDong,
    } = useYeuCauDatGoi();
    const thongTinDanhSach = MO_TA_DANH_SACH[boLocTrangThai] ?? MO_TA_DANH_SACH.cho_xu_ly;

    return (
        <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-300">
                        Điều phối lớp học
                    </p>
                    <h1 className="mt-2 text-2xl font-extrabold">
                        Quản lý đặt gói
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                        Theo dõi các gói học được đặt, gửi yêu cầu cho gia sư, xem phản hồi và chuyển bước thanh toán/tạo lịch.
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {BO_LOC_TRANG_THAI.map((muc) => (
                    <button
                        key={muc.value}
                        type="button"
                        onClick={() => doiTrangThai(muc.value)}
                        className={[
                            "rounded-xl border px-4 py-2.5 text-sm font-bold transition",
                            boLocTrangThai === muc.value
                                ? "border-blue-400/40 bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white",
                        ].join(" ")}
                    >
                        {muc.label}
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
                            {demTheoTrangThai(muc.value)}
                        </span>
                    </button>
                ))}
            </div>

            {thongBao && (
                <div className="fixed right-6 top-6 z-50 max-w-md rounded-2xl border border-blue-300/40 bg-[#0b1748] px-5 py-4 text-sm font-semibold text-blue-50 shadow-2xl shadow-slate-950/40">
                    {thongBao}
                </div>
            )}

            <BoLocDatGoi
                boLocTrangThai={boLocTrangThai}
                boLocPhanHoi={boLocPhanHoi}
                tuKhoa={tuKhoa}
                soKetQua={danhSachDaLoc.length}
                onDoiTuKhoa={setTuKhoa}
                onDoiPhanHoi={setBoLocPhanHoi}
            />

            <div className="mt-5 grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
                    <div className="border-b border-white/10 px-5 py-4">
                        <h2 className="text-lg font-extrabold">{thongTinDanhSach.tieuDe}</h2>
                        <p className="mt-1 text-sm text-white/45">
                            {thongTinDanhSach.moTa}
                        </p>
                    </div>

                    <div className="max-h-[720px] space-y-3 overflow-y-auto p-3">
                        {dangTai ? (
                            <div className="rounded-2xl border border-white/10 px-5 py-12 text-center text-white/55">
                                Đang tải danh sách đặt gói...
                            </div>
                        ) : danhSachDaLoc.length === 0 ? (
                            <TrangThaiRong />
                        ) : (
                            danhSachDaLoc.map((yeuCau) => (
                                <TheYeuCauDatGoi
                                    key={yeuCau.id}
                                    yeuCau={yeuCau}
                                    active={yeuCauDangChon?.id === yeuCau.id}
                                    onClick={() => setYeuCauDangChonId(yeuCau.id)}
                                />
                            ))
                        )}
                    </div>
                </section>

                <section className="min-h-[720px] rounded-2xl border border-white/10 bg-white text-slate-900">
                    {yeuCauDangChon ? (
                        <ChiTietYeuCauDatGoi
                            yeuCau={yeuCauDangChon}
                            onThucHien={xuLyHanhDong}
                        />
                    ) : (
                        <div className="flex min-h-[520px] items-center justify-center px-6 text-center text-slate-500">
                            Chọn một yêu cầu bên trái để xem chi tiết.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function TrangThaiRong() {
    return (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center text-white/45">
            Không có yêu cầu phù hợp với bộ lọc.
        </div>
    );
}

export default AdminYeuCauDatGiaSu;
