import { dinhDangTien } from "../utils";

function DongThuNhap({ dong, onXemChiTiet }) {
    const [ngayHoc] = String(dong.thoiGian || "").split(" · ");

    return (
        <div className="grid gap-3 border-t border-slate-100 px-5 py-4 text-sm first:border-t-0 sm:px-7 lg:grid-cols-[0.9fr_1fr_1fr_1fr_1fr_0.8fr] lg:items-center">
            <div>
                <p className="font-extrabold text-slate-900">{dong.ma}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 lg:hidden">{ngayHoc}</p>
            </div>
            <p className="hidden font-bold text-slate-700 lg:block">{ngayHoc}</p>
            <p className="flex items-center justify-between gap-3 font-bold text-slate-700 lg:block lg:text-right">
                <span className="text-xs uppercase tracking-wider text-slate-400 lg:hidden">Tiền học</span>
                {dinhDangTien(dong.tienHoc)}
            </p>
            <p className="flex items-center justify-between gap-3 font-bold text-rose-500 lg:block lg:text-right">
                <span className="text-xs uppercase tracking-wider text-slate-400 lg:hidden">Hoa hồng</span>
                -{dinhDangTien(dong.phiHoaHong)}
            </p>
            <p className="text-right text-base font-extrabold text-emerald-600">
                {dinhDangTien(dong.thuNhap)}
            </p>
            <button
                type="button"
                onClick={onXemChiTiet}
                className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-extrabold text-blue-600 transition hover:bg-blue-50 lg:justify-self-end"
            >
                Xem chi tiết
            </button>
        </div>
    );
}

export default DongThuNhap;
