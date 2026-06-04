function PhanTrangHocVien({ meta, trangHienTai, dangTai, chuyenTrang }) {
  const trangCuoi = meta?.last_page ?? 1;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-white/60">
        Trang {meta?.current_page ?? trangHienTai} / {trangCuoi}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={dangTai || trangHienTai <= 1}
          onClick={() => chuyenTrang((trang) => Math.max(trang - 1, 1))}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trước
        </button>
        <button
          type="button"
          disabled={dangTai || trangHienTai >= trangCuoi}
          onClick={() => chuyenTrang((trang) => Math.min(trang + 1, trangCuoi))}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default PhanTrangHocVien;
