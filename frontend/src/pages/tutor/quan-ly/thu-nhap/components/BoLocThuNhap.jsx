import BieuTuong from "./BieuTuong";

function BoLocThuNhap({ boLoc, cauHinh, giaTriBoLoc, doiBoLoc, setGiaTriBoLoc }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 rounded-xl bg-black/20 p-1">
                {[
                    ["ngay", "Ngày"],
                    ["thang", "Tháng"],
                    ["nam", "Năm"],
                ].map(([giaTri, nhan]) => (
                    <button
                        key={giaTri}
                        type="button"
                        onClick={() => doiBoLoc(giaTri)}
                        className={[
                            "rounded-lg px-4 py-2 text-sm font-bold transition",
                            boLoc === giaTri
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                : "text-white/55 hover:text-white",
                        ].join(" ")}
                    >
                        {nhan}
                    </button>
                ))}
            </div>

            <label className="relative">
                <span className="sr-only">Chọn thời gian</span>
                <input
                    type={cauHinh.loaiInput}
                    value={giaTriBoLoc}
                    onChange={(event) => setGiaTriBoLoc(event.target.value)}
                    min={boLoc === "nam" ? "2020" : undefined}
                    max={boLoc === "nam" ? "2030" : undefined}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#101a39] px-4 pr-11 text-sm font-semibold text-white outline-none transition [color-scheme:dark] focus:border-blue-400 sm:w-48 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-11 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white">
                    <BieuTuong ten="calendar" />
                </span>
            </label>
        </div>
    );
}

export default BoLocThuNhap;
