import IconLichDay from "./IconLichDay";
import { trangThaiLichHoc } from "./duLieuQuanLyLich";

function ModalChiTietLichHoc({ lichHoc, onDong }) {
    const trangThai = trangThaiLichHoc[lichHoc.trangThai];
    const daHoanThanh = lichHoc.trangThai === "hoan_thanh";
    const daHuy = lichHoc.trangThai === "da_huy";

    return (
        <LopModal onDong={onDong}>
            <TieuDeModal
                tieuDe="Chi tiết lịch học"
                phuDe={`Mã buổi học: LH${String(lichHoc.id).padStart(6, "0")}`}
                onDong={onDong}
            />
            <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-5">
                    <div>
                        <p className="text-sm font-bold text-blue-600">
                            {lichHoc.thu}, {lichHoc.ngayHoc}
                        </p>
                        <p className="mt-1 text-2xl font-extrabold">
                            {lichHoc.batDau} – {lichHoc.ketThuc}
                        </p>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${trangThai.lop.replaceAll("400/10", "50").replaceAll("200", "700")}`}
                    >
                        {trangThai.nhan}
                    </span>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <ThongTin nhan="Học viên" giaTri={lichHoc.hocVien} />
                    <ThongTin
                        nhan="Môn học"
                        giaTri={`${lichHoc.mon} · ${lichHoc.capHoc}`}
                    />
                    <ThongTin nhan="Loại buổi" giaTri={lichHoc.loaiBuoi} />
                    <ThongTin nhan="Hình thức" giaTri={lichHoc.hinhThuc} />
                    <ThongTin
                        nhan="Địa điểm/phòng học"
                        giaTri={lichHoc.diaDiem}
                    />
                    <ThongTin
                        nhan="Tiền gia sư nhận"
                        giaTri={lichHoc.tienNhan}
                    />
                    <ThongTin
                        nhan="Nội dung buổi học"
                        giaTri={lichHoc.ghiChu}
                        className="sm:col-span-2"
                    />
                </div>

                {lichHoc.lienKet && (
                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                        Link vào lớp: {lichHoc.lienKet}
                    </div>
                )}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-extrabold text-slate-900">
                                Xác nhận hoàn thành buổi học
                            </p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                Gia sư xác nhận sau khi buổi học đã kết thúc để hệ thống ghi nhận tiến độ.
                            </p>
                        </div>

                        {daHoanThanh ? (
                            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-700">
                                <IconLichDay ten="check" className="h-4 w-4" />
                                Đã hoàn thành
                            </span>
                        ) : (
                            <button
                                type="button"
                                disabled={daHuy}
                                className={[
                                    "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition",
                                    daHuy
                                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                                        : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
                                ].join(" ")}
                            >
                                <IconLichDay ten={daHuy ? "x" : "check"} className="h-4 w-4" />
                                {daHuy ? "Buổi học đã huỷ" : "Xác nhận đã hoàn thành"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onDong}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </LopModal>
    );
}

export function LopModal({ children, onDong }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onDong();
            }}
        >
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-xl">
                {children}
            </div>
        </div>
    );
}

export function TieuDeModal({ tieuDe, phuDe, onDong }) {
    return (
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
                <h2 className="text-xl font-extrabold">{tieuDe}</h2>
                {phuDe && (
                    <p className="mt-1 text-sm text-slate-500">{phuDe}</p>
                )}
            </div>
            <button
                type="button"
                onClick={onDong}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
            >
                <IconLichDay ten="x" />
            </button>
        </div>
    );
}

export function ThongTin({ nhan, giaTri, className = "" }) {
    return (
        <div className={className}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {nhan}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-800">
                {giaTri}
            </p>
        </div>
    );
}

export default ModalChiTietLichHoc;
