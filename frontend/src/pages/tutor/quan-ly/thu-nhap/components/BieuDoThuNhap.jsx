import { useMemo } from "react";
import { dinhDangTien } from "../utils";

function BieuDoThuNhap({ duLieu, dangTai }) {
    const duLieuCoTien = useMemo(
        () => duLieu.filter((cot) => Number(cot.thuNhap) > 0 || Number(cot.soBuoi) > 0),
        [duLieu],
    );
    const giaTriLonNhat = Math.max(...duLieu.map((cot) => Number(cot.thuNhap) || 0), 0);
    const mocCaoNhat = giaTriLonNhat || 1;

    return (
        <div className="px-4 pb-5 pt-6 sm:px-6">
            <div className="flex h-64 gap-3 sm:gap-5">
                <div className="flex w-16 shrink-0 flex-col justify-between pb-8 text-right text-[10px] text-white/35">
                    <span>{dinhDangTien(mocCaoNhat)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.75)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.5)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.25)}</span>
                    <span>0đ</span>
                </div>

                <div className="relative min-w-0 flex-1">
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[220px] flex-col justify-between">
                        {[1, 2, 3, 4, 5].map((dong) => (
                            <span
                                key={dong}
                                className="block border-t border-white/10"
                            />
                        ))}
                    </div>

                    {dangTai ? (
                        <KhungBieuDoRong noiDung="Đang tải dữ liệu biểu đồ..." />
                    ) : duLieuCoTien.length === 0 ? (
                        <KhungBieuDoRong noiDung="Chưa có dữ liệu biểu đồ" />
                    ) : (
                        <div className="relative flex h-full items-end gap-3 overflow-x-auto pb-8">
                            {duLieu.map((cot) => {
                                const thuNhap = Number(cot.thuNhap) || 0;
                                const chieuCao = Math.max((thuNhap / mocCaoNhat) * 100, thuNhap > 0 ? 8 : 0);

                                return (
                                    <div
                                        key={cot.nhan}
                                        className="flex h-full min-w-10 flex-1 flex-col justify-end gap-2"
                                        title={`${cot.nhan}: ${dinhDangTien(thuNhap)}`}
                                    >
                                        <div className="flex h-[220px] items-end">
                                            <div
                                                className="w-full rounded-t-lg bg-blue-500"
                                                style={{ height: `${chieuCao}%` }}
                                            />
                                        </div>
                                        <span className="truncate text-center text-[10px] font-semibold text-white/50">
                                            {cot.nhan}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KhungBieuDoRong({ noiDung }) {
    return (
        <div className="relative flex h-full items-center justify-center pb-7">
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-5 text-center">
                <p className="text-sm font-extrabold text-white">{noiDung}</p>
            </div>
        </div>
    );
}

export default BieuDoThuNhap;
