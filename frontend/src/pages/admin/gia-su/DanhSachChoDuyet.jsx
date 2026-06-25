import IconAdminGiaSu from "./IconAdminGiaSu";

function DanhSachChoDuyet({
    danhSach,
    hoSoDangChon,
    tuKhoa,
    dangTai,
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
                {dangTai && (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm font-semibold text-white/60">
                        Đang tải hồ sơ...
                    </div>
                )}

                {!dangTai && danhSach.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-8 text-center">
                        <p className="text-sm font-bold text-white">Không có hồ sơ chờ duyệt</p>
                        <p className="mt-1 text-xs text-white/45">
                            Hồ sơ đăng ký mới sẽ hiển thị tại đây.
                        </p>
                    </div>
                )}

                {danhSach.map((hoSo) => {
                    const dangChon = hoSo.id === hoSoDangChon?.id;
                    const avatarUrl = layAvatarUrl(hoSo);

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
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={`Ảnh chân dung của ${hoSo.hoTen}`}
                                        className="h-10 w-10 shrink-0 rounded-xl object-cover"
                                    />
                                ) : (
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-extrabold">
                                        {layChuCaiDau(hoSo.hoTen)}
                                    </span>
                                )}
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

function layAvatarUrl(hoSo) {
    const duongDan = hoSo?.avatarUrl || hoSo?.avatar;

    if (!duongDan) return "";
    if (/^https?:\/\//i.test(duongDan)) return duongDan;

    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    const publicBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

    return `${publicBaseUrl}/${String(duongDan).replace(/^\/+/, "")}`;
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
