import { dinhDangTien } from "../utils";

function ModalChiTietThuNhap({ dong, onDong }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-500">
                            Chi tiết buổi học
                        </p>
                        <h3 className="mt-2 text-xl font-extrabold">{dong.ma}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onDong}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>

                <div className="grid gap-3 px-6 py-5 text-sm sm:grid-cols-2">
                    <DongChiTiet label="Thời gian" value={dong.thoiGian} />
                    <DongChiTiet label="Loại buổi" value={dong.loaiBuoi} />
                    <DongChiTiet label="Học viên" value={dong.hocVien} />
                    <DongChiTiet label="Môn học" value={dong.monHoc} />
                    <DongChiTiet label="Tiền học" value={dinhDangTien(dong.tienHoc)} />
                    <DongChiTiet label="Phí hoa hồng" value={`-${dinhDangTien(dong.phiHoaHong)}`} />
                </div>

                <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4">
                        <span className="text-sm font-bold text-slate-500">Gia sư thực nhận</span>
                        <span className="text-xl font-extrabold text-emerald-600">
                            {dinhDangTien(dong.thuNhap)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DongChiTiet({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 font-bold text-slate-800">{value || "-"}</p>
        </div>
    );
}

export default ModalChiTietThuNhap;
