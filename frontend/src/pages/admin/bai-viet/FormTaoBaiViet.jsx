import { TRANG_THAI_BAI_VIET } from "./trangThaiBaiViet";

function FormTaoBaiViet({
  form,
  anhXemTruoc,
  dangLuu,
  loi,
  thongBao,
  capNhatForm,
  chonAnhBia,
  taoBaiViet,
}) {
  return (
    <form
      onSubmit={taoBaiViet}
      className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="block text-sm font-semibold text-white/90">
            Tiêu đề
          </label>
          <input
            name="tieu_de"
            value={form.tieu_de}
            onChange={capNhatForm}
            required
            maxLength={255}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
            placeholder="Nhập tiêu đề bài viết"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="block text-sm font-semibold text-white/90">
            Tóm tắt
          </label>
          <textarea
            name="tom_tat"
            value={form.tom_tat}
            onChange={capNhatForm}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
            placeholder="Nội dung ngắn hiển thị ngoài danh sách"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="block text-sm font-semibold text-white/90">
            Nội dung
          </label>
          <textarea
            name="noi_dung"
            value={form.noi_dung}
            onChange={capNhatForm}
            required
            rows={12}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
            placeholder="Nhập nội dung bài viết"
          />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="block text-sm font-semibold text-white/90">
            Trạng thái
          </label>
          <select
            name="trang_thai"
            value={form.trang_thai}
            onChange={capNhatForm}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
          >
            {TRANG_THAI_BAI_VIET.map((trangThai) => (
              <option key={trangThai.value} value={trangThai.value}>
                {trangThai.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="block text-sm font-semibold text-white/90">
            Ảnh bìa
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={chonAnhBia}
            className="mt-2 w-full text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
          />

          {anhXemTruoc ? (
            <img
              src={anhXemTruoc}
              alt="Ảnh bìa xem trước"
              className="mt-4 aspect-video w-full rounded-xl object-cover"
            />
          ) : (
            <div className="mt-4 aspect-video w-full rounded-xl border border-dashed border-white/20 bg-[#0a0f24]" />
          )}
        </div>

        {loi ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {loi}
          </div>
        ) : null}

        {thongBao ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {thongBao}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={dangLuu}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {dangLuu ? "Đang lưu..." : "Tạo bài viết"}
        </button>
      </aside>
    </form>
  );
}

export default FormTaoBaiViet;
