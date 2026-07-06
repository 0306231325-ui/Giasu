function TieuDeNhatKy({ tongSo }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-blue-300">
            Nhật ký hệ thống
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-white">
            Theo dõi lịch sử thao tác
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
            Hiển thị các thao tác quan trọng đã được ghi lại trong hệ thống.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-100">
          Tổng sau lọc: {tongSo || 0}
        </div>
      </div>
    </section>
  );
}

export default TieuDeNhatKy;
