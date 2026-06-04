function BoLocHocVien({ tuKhoa, trangThai, xuLyDoiTuKhoa, xuLyDoiTrangThai }) {
  return (
    <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-white/60">
            Tìm kiếm
          </span>
          <input
            value={tuKhoa}
            onChange={xuLyDoiTuKhoa}
            placeholder="Tên, email hoặc số điện thoại"
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0f24] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-400"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-white/60">
            Trạng thái
          </span>
          <select
            value={trangThai}
            onChange={xuLyDoiTrangThai}
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0f24] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-400"
          >
            <option value="">Tất cả</option>
            <option value="hoatdong">Hoạt động</option>
            <option value="khoa">Đã khóa</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default BoLocHocVien;
