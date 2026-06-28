import { TRANG_THAI_GOI } from "./constants";
import { layNhanThanhToanPhu } from "./utils";

function TheYeuCauDatGoi({ yeuCau, active, onClick }) {
    const trangThai = TRANG_THAI_GOI[yeuCau.trangThai] ?? TRANG_THAI_GOI.cho_xu_ly;
    const nhanThanhToanPhu = layNhanThanhToanPhu(yeuCau);

    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full rounded-2xl border p-4 text-left transition",
                active
                    ? "border-blue-400/60 bg-blue-500/15"
                    : "border-white/10 bg-white/[0.03] hover:border-blue-400/30 hover:bg-white/[0.06]",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-white/35">
                        {yeuCau.ma}
                    </p>
                    <h3 className="mt-2 text-base font-extrabold text-white">
                        {yeuCau.mon} · {yeuCau.capHoc}
                    </h3>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${trangThai.className}`}>
                    {trangThai.label}
                </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/55">
                <p>HV: <span className="font-semibold text-white/80">{yeuCau.hocVien}</span></p>
                <p>GS: <span className="font-semibold text-white/80">{yeuCau.giaSu}</span></p>
                <p className="line-clamp-2">{yeuCau.lichMongMuon}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs font-semibold text-white/40">
                    {yeuCau.soBuoi} buổi · {yeuCau.gioMoiBuoi} giờ/buổi
                </span>
                <span className="text-sm font-extrabold text-blue-200">
                    {yeuCau.tongTien}
                </span>
            </div>

            {yeuCau.phanHoi && (
                <div className={[
                    "mt-3 rounded-xl px-3 py-2 text-xs font-bold",
                    yeuCau.phanHoi.ketQua === "dong_y"
                        ? "bg-emerald-400/10 text-emerald-200"
                        : "bg-red-400/10 text-red-200",
                ].join(" ")}
                >
                    Phản hồi: {yeuCau.phanHoi.ketQua === "dong_y" ? "Đồng ý" : "Từ chối"}
                </div>
            )}

            {nhanThanhToanPhu && (
                <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${nhanThanhToanPhu.className}`}>
                    {nhanThanhToanPhu.nhan}
                </div>
            )}
        </button>
    );
}

export default TheYeuCauDatGoi;
