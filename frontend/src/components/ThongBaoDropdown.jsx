import { useEffect, useRef, useState } from "react";

function ThongBaoDropdown({
    tieuDe = "Thông báo",
    moTaRong = "Các cập nhật mới của bạn sẽ hiển thị tại đây.",
    soLuongChuaDoc = 0,
}) {
    const [dangMo, setDangMo] = useState(false);
    const hopThongBaoRef = useRef(null);

    useEffect(() => {
        const dongKhiBamNgoai = (event) => {
            if (
                hopThongBaoRef.current &&
                !hopThongBaoRef.current.contains(event.target)
            ) {
                setDangMo(false);
            }
        };

        document.addEventListener("mousedown", dongKhiBamNgoai);

        return () => {
            document.removeEventListener("mousedown", dongKhiBamNgoai);
        };
    }, []);

    return (
        <div className="relative" ref={hopThongBaoRef}>
            <button
                type="button"
                onClick={() => setDangMo((giaTriHienTai) => !giaTriHienTai)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-blue-400/70 hover:bg-blue-500/15"
                aria-label="Mở thông báo"
                aria-expanded={dangMo}
                aria-haspopup="menu"
            >
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {soLuongChuaDoc > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-[#081027]">
                        {soLuongChuaDoc > 9 ? "9+" : soLuongChuaDoc}
                    </span>
                )}
            </button>

            {dangMo && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1b3d] text-white shadow-2xl"
                >
                    <div className="border-b border-white/10 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-bold">{tieuDe}</h3>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                                {soLuongChuaDoc} mới
                            </span>
                        </div>
                    </div>

                    <div className="px-5 py-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200">
                            <svg
                                className="h-7 w-7"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M4 4h16v16H4z" />
                                <path d="m22 6-10 7L2 6" />
                            </svg>
                        </div>
                        <p className="mt-4 text-sm font-bold text-white">
                            Chưa có thông báo mới
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                            {moTaRong}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ThongBaoDropdown;
