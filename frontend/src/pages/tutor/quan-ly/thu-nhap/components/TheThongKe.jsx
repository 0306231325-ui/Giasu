import BieuTuong from "./BieuTuong";

function TheThongKe({ tieuDe, giaTri, phuDe, bieuTuong, mau, dangTai }) {
    const mauSac = {
        blue: "bg-blue-500/15 text-blue-300 border-blue-400/20",
        emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/45">{tieuDe}</p>
                    <p className="mt-3 truncate text-2xl font-extrabold tracking-tight text-white">
                        {dangTai ? "..." : giaTri}
                    </p>
                </div>
                <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${mauSac[mau]}`}
                >
                    <BieuTuong ten={bieuTuong} />
                </span>
            </div>
            <p className="mt-3 truncate text-xs text-white/35">{phuDe}</p>
        </div>
    );
}

export default TheThongKe;
