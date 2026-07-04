function DongDanhGia({ danhGia }) {
    return (
        <div className="grid gap-3 border-t border-slate-100 px-5 py-4 text-sm first:border-t-0 sm:px-7 lg:grid-cols-[1fr_1.15fr_0.8fr_0.7fr] lg:items-center">
            <div>
                <p className="font-extrabold text-slate-900">{danhGia.maBuoiHoc}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{danhGia.thoiGian}</p>
                <p className="mt-1 text-xs text-slate-400">HV: {danhGia.hocVien}</p>
            </div>

            <div>
                <p className="font-semibold text-slate-800">
                    {danhGia.noiDung || "Học viên chưa để lại nhận xét."}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                    Đánh giá lúc {danhGia.ngayDanhGia || "chưa cập nhật"}
                </p>
            </div>

            <p className="font-bold text-blue-600">{danhGia.monHoc}</p>

            <div className="flex items-center gap-2 lg:justify-end">
                <span className={[
                    "rounded-full px-3 py-1 text-xs font-extrabold",
                    danhGia.soSao >= 4
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700",
                ].join(" ")}>
                    {danhGia.soSao}/5 sao
                </span>
            </div>
        </div>
    );
}

export default DongDanhGia;
