import { useState } from "react";

function DongDanhGia({ danhGia }) {
    const [moChiTiet, setMoChiTiet] = useState(false);

    return (
        <>
            <div className="grid gap-3 border-t border-slate-100 px-5 py-4 text-sm first:border-t-0 sm:px-7 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-center">
                <div>
                    <p className="font-extrabold text-slate-900">{danhGia.maBuoiHoc}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{danhGia.thoiGian}</p>
                </div>

                <div>
                    <p className="font-bold text-slate-800">{danhGia.hocVien}</p>
                </div>

                <div>
                    <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-slate-800">
                        {danhGia.noiDung || "Học viên chưa để lại nhận xét."}
                    </p>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                    <button
                        type="button"
                        onClick={() => setMoChiTiet(true)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        Chi tiết
                    </button>
                </div>
            </div>

            {moChiTiet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <h3 className="text-lg font-extrabold">Chi tiết đánh giá</h3>
                            <button
                                type="button"
                                onClick={() => setMoChiTiet(false)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mã buổi học</p>
                                    <p className="mt-1 font-extrabold text-slate-900">{danhGia.maBuoiHoc}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Học viên</p>
                                    <p className="mt-1 font-extrabold text-slate-900">{danhGia.hocVien}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Môn học</p>
                                    <p className="mt-1 font-bold text-blue-600">{danhGia.monHoc}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Thời gian đánh giá</p>
                                    <p className="mt-1 font-bold text-slate-900">{danhGia.ngayDanhGia || "Chưa cập nhật"}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Đánh giá</p>
                                    <span className={[
                                        "mt-1 inline-block rounded-full px-3 py-1 text-xs font-extrabold",
                                        danhGia.soSao >= 4
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700",
                                    ].join(" ")}>
                                        {danhGia.soSao}/5 sao
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Phản hồi của học viên</p>
                                <div className="rounded-2xl bg-slate-50 p-4 shadow-inner">
                                    <p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-700">
                                        {danhGia.noiDung || "Học viên không để lại nội dung chi tiết."}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setMoChiTiet(false)}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DongDanhGia;
