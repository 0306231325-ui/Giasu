import {
  NHAN_TRANG_THAI_BAI_VIET,
  TRANG_THAI_BAI_VIET,
} from "./trangThaiBaiViet";

function DanhSachBaiViet({
  danhSachBaiViet,
  dangTai,
  loi,
  meta,
  tuKhoa,
  locTrangThai,
  trangHienTai,
  doiTuKhoa,
  doiLocTrangThai,
  chuyenTrang,
  navigate,
  chonBaiVietDeSua,
}) {
  return (
    <div className="mt-6">
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <input
          value={tuKhoa}
          onChange={doiTuKhoa}
          className="w-full rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
          placeholder="Tìm theo tiêu đề, tóm tắt hoặc slug"
        />
        <select
          value={locTrangThai}
          onChange={doiLocTrangThai}
          className="w-full rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
        >
          <option value="">Tất cả trạng thái</option>
          {TRANG_THAI_BAI_VIET.map((trangThai) => (
            <option key={trangThai.value} value={trangThai.value}>
              {trangThai.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wide text-white/60">
              <th className="px-4 py-3">Bài viết</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Lượt xem</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {dangTai ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/70">
                  Đang tải danh sách bài viết...
                </td>
              </tr>
            ) : loi ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-200">
                  {loi}
                </td>
              </tr>
            ) : danhSachBaiViet.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/70">
                  Chưa có bài viết phù hợp.
                </td>
              </tr>
            ) : (
              danhSachBaiViet.map((baiViet) => (
                <tr key={baiViet.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      {baiViet.anh_bia ? (
                        <img
                          src={baiViet.anh_bia}
                          alt=""
                          className="h-16 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-24 rounded-lg bg-[#0a0f24]" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-white">
                          {baiViet.tieu_de}
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          /baiviet/{baiViet.slug}
                        </div>
                        <div className="mt-2 line-clamp-2 text-sm text-white/60">
                          {baiViet.tom_tat || "Không có tóm tắt"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                      {NHAN_TRANG_THAI_BAI_VIET[baiViet.trang_thai] ||
                        baiViet.trang_thai}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white/75">
                    {baiViet.luot_xem}
                  </td>
                  <td className="px-4 py-4 text-sm text-white/75">
                    {dinhDangNgay(baiViet.created_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => chonBaiVietDeSua(baiViet)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/baiviet/${baiViet.slug}`)}
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                      >
                        Xem
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-white/60">
          Trang {meta?.current_page ?? trangHienTai} / {meta?.last_page ?? 1}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={dangTai || trangHienTai <= 1}
            onClick={() => chuyenTrang((trang) => Math.max(trang - 1, 1))}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <button
            type="button"
            disabled={dangTai || trangHienTai >= (meta?.last_page ?? 1)}
            onClick={() =>
              chuyenTrang((trang) => Math.min(trang + 1, meta?.last_page ?? 1))
            }
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

function dinhDangNgay(ngay) {
  if (!ngay) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(ngay));
}

export default DanhSachBaiViet;
