import BieuTuong from "./BieuTuong";

function TheThongKe({ nhan, giaTri, phuDe, bieuTuong, mau }) {
    const mauSac = {
        amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        blue: "border-blue-400/20 bg-blue-400/10 text-blue-300",
        emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        red: "border-red-400/20 bg-red-400/10 text-red-300",
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-white/45">
                        {nhan}
                    </p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                        {giaTri}
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
