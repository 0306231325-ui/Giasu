function PhanTrangNhatKy({
  dangTai,
  trangHopLe,
  tongSoTrang,
  chuyenTrang,
  veTrangTruoc,
  veTrangSau,
}) {
  return (
    <div className="flex justify-center border-t border-white/10 px-5 py-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={trangHopLe <= 1 || dangTai}
          onClick={veTrangTruoc}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trước
        </button>
        {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map(
          (trang) => (
            <button
              key={trang}
              type="button"
              disabled={dangTai}
              onClick={() => chuyenTrang(trang)}
              className={[
                "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50",
                trangHopLe === trang
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-white/10 text-white/65 hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white",
              ].join(" ")}
            >
              {trang}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={trangHopLe >= tongSoTrang || dangTai}
          onClick={veTrangSau}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default PhanTrangNhatKy;
