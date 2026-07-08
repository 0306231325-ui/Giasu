import { useMemo, useState } from "react";
import { dinhDangTien } from "../utils";


function Tooltip({ visible, x, y, nhan, thuNhap, soBuoi }) {
    if (!visible) return null;
    return (
        <div
            className="pointer-events-none fixed z-50"
            style={{ left: x, top: y, transform: "translate(-50%, -110%)" }}
        >
            <div className="min-w-[140px] rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-900 to-blue-800 px-4 py-3 text-center shadow-2xl backdrop-blur-md">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-300/80">
                    {nhan}
                </p>
                <p className="text-[15px] font-extrabold text-white">
                    {dinhDangTien(thuNhap)}
                </p>
                {soBuoi !== undefined && (
                    <p className="mt-1 text-[11px] text-blue-300/60">
                        {soBuoi} buổi học
                    </p>
                )}

                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-blue-800" />
            </div>
        </div>
    );
}


const CHART_H = 220;

function BieuDoThuNhap({ duLieu, dangTai }) {
    const [tooltip, setTooltip] = useState({ visible: false });

    const duLieuCoTien = useMemo(
        () => duLieu.filter((c) => Number(c.thuNhap) > 0 || Number(c.soBuoi) > 0),
        [duLieu],
    );

    const giaTriLonNhat = Math.max(...duLieu.map((c) => Number(c.thuNhap) || 0), 0);
    const mocCaoNhat = giaTriLonNhat || 1;
    const mocY = [mocCaoNhat, mocCaoNhat * 0.75, mocCaoNhat * 0.5, mocCaoNhat * 0.25, 0];

    const handleMouseEnter = (e, cot) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top,
            nhan: cot.nhan,
            thuNhap: Number(cot.thuNhap) || 0,
            soBuoi: cot.soBuoi,
        });
    };

    return (
        <>
            <style>{`
                @keyframes barGrow {
                    from { transform: scaleY(0); opacity: 0; }
                    to   { transform: scaleY(1); opacity: 1; }
                }
                .bar-grow {
                    transform-origin: bottom;
                    animation: barGrow 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
                    animation-delay: var(--bar-delay, 0s);
                    opacity: 0;
                }
            `}</style>

            <Tooltip {...tooltip} />

            <div className="px-5 pb-5 pt-6 sm:px-6">
                <div className="flex gap-4" style={{ height: CHART_H + 36 }}>

                    <div className="flex w-16 shrink-0 flex-col justify-between pb-7 text-right">
                        {mocY.map((v, i) => (
                            <span key={i} className="text-[10px] font-semibold leading-none text-white/30">
                                {v === 0 ? "0đ" : dinhDangTien(v)}
                            </span>
                        ))}
                    </div>


                    <div className="relative min-w-0 flex-1">

                        <div className="pointer-events-none absolute inset-x-0 bottom-7 top-0 flex flex-col justify-between">
                            {mocY.map((_, i) => (
                                <span
                                    key={i}
                                    className={`block border-t ${i === mocY.length - 1 ? "border-white/20" : "border-white/[0.07]"}`}
                                />
                            ))}
                        </div>


                        {dangTai ? (
                            <KhungRong noiDung="Đang tải dữ liệu..." loading />
                        ) : duLieuCoTien.length === 0 ? (
                            <KhungRong noiDung="Chưa có dữ liệu biểu đồ" />
                        ) : (
                            <div
                                className="flex h-full items-end overflow-x-auto pb-7"
                                style={{ gap: duLieu.length > 20 ? 3 : duLieu.length > 12 ? 5 : 8 }}
                            >
                                {duLieu.map((cot, idx) => {
                                    const thuNhap = Number(cot.thuNhap) || 0;
                                    const pct = Math.max(
                                        (thuNhap / mocCaoNhat) * 100,
                                        thuNhap > 0 ? 5 : 0,
                                    );
                                    const hasData = thuNhap > 0;

                                    return (
                                        <div
                                            key={cot.nhan}
                                            className={`group flex flex-1 flex-col items-center justify-end gap-1.5 ${hasData ? "cursor-pointer" : "cursor-default"}`}
                                            style={{
                                                minWidth: duLieu.length > 20 ? 14 : 18,
                                                maxWidth: duLieu.length <= 7 ? 72 : undefined,
                                                height: "100%",
                                            }}
                                            onMouseEnter={(e) => hasData && handleMouseEnter(e, cot)}
                                            onMouseLeave={() => setTooltip({ visible: false })}
                                        >

                                            <div
                                                className="flex w-full items-end"
                                                style={{ height: CHART_H }}
                                            >
                                                {hasData ? (
                                                    <div
                                                        className="bar-grow w-full rounded-t-md transition-[filter] duration-150 group-hover:brightness-125 group-hover:saturate-150"
                                                        style={{
                                                            "--bar-delay": `${Math.min(idx * 0.03, 0.4)}s`,
                                                            height: `${pct}%`,
                                                            minHeight: 6,
                                                            background:
                                                                "linear-gradient(180deg, #60a5fa 0%, #2563eb 55%, #1d4ed8 100%)",
                                                            boxShadow:
                                                                "0 0 14px rgba(59,130,246,0.35), 0 2px 8px rgba(0,0,0,0.3)",
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-0.5 w-full rounded-full bg-white/[0.06]" />
                                                )}
                                            </div>


                                            <span
                                                className={`truncate text-center font-semibold transition-colors duration-150
                                                    ${duLieu.length > 20 ? "text-[9px]" : "text-[10px]"}
                                                    ${hasData ? "text-white/50 group-hover:text-blue-300" : "text-white/20"}`}
                                                style={{ maxWidth: "100%" }}
                                            >
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
        </>
    );
}

function KhungRong({ noiDung, loading }) {
    return (
        <div className="flex h-full items-center justify-center pb-7">
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-7 py-6 text-center">
                <span className="mb-2 block text-2xl">{loading ? "⏳" : "📊"}</span>
                <p className="text-sm font-bold text-white/50">{noiDung}</p>
            </div>
        </div>
    );
}

export default BieuDoThuNhap;
