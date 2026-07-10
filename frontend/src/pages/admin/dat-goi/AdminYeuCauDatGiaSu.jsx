import ModalNhapLyDo from "../../../components/ModalNhapLyDo";
import ModalXacNhan from "../../../components/ModalXacNhan";
import BoLocDatGoi from "./BoLocDatGoi";
import ChiTietYeuCauDatGoi from "./ChiTietYeuCauDatGoi";
import { BO_LOC_TRANG_THAI } from "./constants";
import TheYeuCauDatGoi from "./TheYeuCauDatGoi";
import useYeuCauDatGoi from "./hooks/useYeuCauDatGoi";
import TabDanhSachGoiHoc from "./TabDanhSachGoiHoc";

const MO_TA_DANH_SACH = {
    cho_xu_ly: {
        tieuDe: "Danh sách yêu cầu",
        moTa: "Các yêu cầu đặt gói đang chờ admin xử lý hoặc gửi cho gia sư.",
    },
    cho_thanh_toan: {
        tieuDe: "Chờ thanh toán",
        moTa: "Các gói gia sư đã đồng ý và đang chờ học viên thanh toán.",
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
        boLocTrangThai,
        boLocTrangThaiCon,
        dangTai,
        dangXuLyHanhDong,
        danhSachDaLoc,
        hopThoaiLyDo,
        hopThoaiXacNhan,
        tuKhoa,
        yeuCauDangChon,
        dongHopThoaiLyDo,
        dongHopThoaiXacNhan,
        demTheoTrangThai,
        doiTrangThai,
        setBoLocTrangThaiCon,
        setTuKhoa,
        setYeuCauDangChonId,
        xacNhanHopThoai,
        xacNhanHopThoaiLyDo,
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

            <BoLocDatGoi
                tuKhoa={tuKhoa}
                soKetQua={danhSachDaLoc.length}
                onDoiTuKhoa={setTuKhoa}
            >
                {boLocTrangThai === "danh_sach_goi_hoc" && (
                    <label className="block w-[180px] shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wide text-white/45">
                            Trạng thái
                        </span>
                        <select
                            value={boLocTrangThaiCon}
                            onChange={(e) => setBoLocTrangThaiCon(e.target.value)}
                            className="mt-1.5 w-full appearance-none rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-2.5 text-sm font-semibold text-white outline-none transition hover:border-white/20 focus:border-blue-500"
                        >
                            <option value="tat_ca">Tất cả</option>
                            <option value="dang_hoc">Đang học</option>
                            <option value="hoan_thanh">Đã hoàn thành</option>
                        </select>
                    </label>
                )}
            </BoLocDatGoi>

            {boLocTrangThai === "danh_sach_goi_hoc" ? (
                <div className="mt-5">
                    <TabDanhSachGoiHoc
                        danhSachDaLoc={danhSachDaLoc}
                        onXuLyHanhDong={xuLyHanhDong}
                    />
                </div>
            ) : (
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
            )}

            <ModalXacNhan
                mo={Boolean(hopThoaiXacNhan)}
                tieuDe={hopThoaiXacNhan?.tieuDe}
                moTa={hopThoaiXacNhan?.moTa}
                nutXacNhan={hopThoaiXacNhan?.nutXacNhan}
                bienThe={hopThoaiXacNhan?.bienThe}
                dangXuLy={dangXuLyHanhDong}
                onDong={dongHopThoaiXacNhan}
                onXacNhan={xacNhanHopThoai}
            />

            <ModalNhapLyDo
                mo={Boolean(hopThoaiLyDo)}
                tieuDe={hopThoaiLyDo?.tieuDe}
                moTa={hopThoaiLyDo?.moTa}
                placeholder={hopThoaiLyDo?.placeholder}
                nutXacNhan={hopThoaiLyDo?.nutXacNhan}
                dangXuLy={dangXuLyHanhDong}
                onDong={dongHopThoaiLyDo}
                onXacNhan={xacNhanHopThoaiLyDo}
            />
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
