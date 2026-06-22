import IconAdminGiaSu from "./IconAdminGiaSu";

function DanhSachChoDuyet({
    danhSach,
    hoSoDangChon,
    tuKhoa,
    onDoiTuKhoa,
    onChon,
}) {
    return (
        <aside className="overflow-hidden rounded-2xl border border-white/10 bg-[#101832]">
            <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-extrabold">Hồ sơ chờ duyệt</h2>
                        <p className="mt-1 text-xs text-white/45">
                            {danhSach.length} hồ sơ cần xem xét
                        </p>
                    </div>
                    <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300">
                        {danhSach.length}
                    </span>
                </div>
                <label className="relative mt-4 block">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/35">
                        <IconAdminGiaSu ten="search" className="h-4 w-4" />
                    </span>
                    <input
                        type="search"
                        value={tuKhoa}
                        onChange={onDoiTuKhoa}
                        placeholder="Tìm tên, email..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400"
                    />
                </label>
            </div>

            <div className="max-h-[760px] overflow-y-auto p-2 [scrollbar-width:thin]">
                {danhSach.map((hoSo) => {
                    const dangChon = hoSo.id === hoSoDangChon?.id;
                    return (
                        <button
                            key={hoSo.id}
                            type="button"
                            onClick={() => onChon(hoSo)}
                            className={[
                                "w-full rounded-xl border p-3 text-left transition",
                                dangChon
                                    ? "border-blue-400/40 bg-blue-500/15"
                                    : "border-transparent hover:border-white/10 hover:bg-white/5",
                            ].join(" ")}
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-extrabold">
                                    {layChuCaiDau(hoSo.hoTen)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-white">
                                        {hoSo.hoTen}
                                    </p>
                                    <p className="mt-1 truncate text-xs text-white/45">
                                        {hoSo.email}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
                                        <IconAdminGiaSu ten="clock" className="h-3.5 w-3.5" />
                                        {hoSo.ngayGui}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

function layChuCaiDau(hoTen) {
    return hoTen
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((tu) => tu.charAt(0).toUpperCase())
        .join("");
}

export default DanhSachChoDuyet;
