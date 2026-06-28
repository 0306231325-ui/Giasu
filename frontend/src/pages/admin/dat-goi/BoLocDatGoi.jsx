import IconAdminGiaSu from "../gia-su/IconAdminGiaSu";

function BoLocDatGoi({
    boLocTrangThai,
    boLocPhanHoi,
    tuKhoa,
    soKetQua,
    onDoiTuKhoa,
    onDoiPhanHoi,
}) {
    return (
        <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[minmax(0,1fr)_240px_140px]">
            <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-white/45">
                    Tìm kiếm
                </span>
                <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/30">
                        <IconAdminGiaSu ten="search" className="h-4 w-4" />
                    </span>
                    <input
                        type="search"
                        value={tuKhoa}
                        onChange={(event) => onDoiTuKhoa(event.target.value)}
                        placeholder="Mã yêu cầu, học viên, gia sư, môn học..."
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f24] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400"
                    />
                </div>
            </label>

            <label className={boLocTrangThai === "da_phan_hoi" ? "block" : "block opacity-50"}>
                <span className="text-xs font-bold uppercase tracking-wide text-white/45">
                    Kết quả phản hồi
                </span>
                <select
                    value={boLocPhanHoi}
                    disabled={boLocTrangThai !== "da_phan_hoi"}
                    onChange={(event) => onDoiPhanHoi(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400 disabled:cursor-not-allowed"
                >
                    <option value="">Tất cả phản hồi</option>
                    <option value="dong_y">Đồng ý</option>
                    <option value="tu_choi">Từ chối</option>
                </select>
            </label>

            <div className="rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-white/35">
                    Kết quả
                </p>
                <p className="mt-1 text-xl font-extrabold text-white">
                    {soKetQua}
                </p>
            </div>
        </div>
    );
}

export default BoLocDatGoi;
