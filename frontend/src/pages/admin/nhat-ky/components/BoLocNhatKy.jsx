import { BO_LOC_HANH_DONG, BO_LOC_VAI_TRO } from "../constants";

function BoLocNhatKy({
  tuKhoaNhap,
  vaiTro,
  nhomHanhDong,
  setTuKhoaNhap,
  timKiem,
  lamMoiBoLoc,
  xuLyNhanEnter,
  doiVaiTro,
  doiNhomHanhDong,
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_auto_220px_240px_auto]">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-white/45">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={tuKhoaNhap}
            onChange={(event) => setTuKhoaNhap(event.target.value)}
            onKeyDown={xuLyNhanEnter}
            placeholder="Tìm nội dung, người thực hiện, mã đối tượng..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/70"
          />
        </div>

        <button
          type="button"
          onClick={timKiem}
          className="mt-auto inline-flex h-[46px] items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white transition hover:bg-blue-700"
        >
          Tìm kiếm
        </button>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-white/45">
            Vai trò
          </label>
          <select
            value={vaiTro}
            onChange={doiVaiTro}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-blue-400/70"
          >
            {BO_LOC_VAI_TRO.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-white/45">
            Nhóm hành động
          </label>
          <select
            value={nhomHanhDong}
            onChange={doiNhomHanhDong}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-blue-400/70"
          >
            {BO_LOC_HANH_DONG.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={lamMoiBoLoc}
          className="mt-auto inline-flex h-[46px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-extrabold text-white/80 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white"
        >
          Làm mới lọc
        </button>
      </div>
    </section>
  );
}

export default BoLocNhatKy;
