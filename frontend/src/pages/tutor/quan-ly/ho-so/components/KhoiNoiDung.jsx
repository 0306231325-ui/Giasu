import IconHoSo from "./IconHoSo";

function KhoiNoiDung({
    bieuTuong,
    tieuDe,
    moTa,
    hanhDong,
    onHanhDong,
    voHieuHoaHanhDong = false,
    noiBat = false,
    children,
}) {
    const laHanhDongThem =
        hanhDong === "Thêm môn dạy" || hanhDong === "Thêm tài liệu";

    return (
        <section
            className={[
                "overflow-hidden rounded-2xl border bg-white text-slate-900",
                noiBat ? "border-blue-200" : "border-slate-200",
            ].join(" ")}
        >
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${noiBat ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                        <IconHoSo ten={bieuTuong} />
                    </span>
                    <div>
                        <h2 className="font-extrabold text-slate-950">{tieuDe}</h2>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{moTa}</p>
                    </div>
                </div>
                {hanhDong && (
                    <button
                        type="button"
                        onClick={onHanhDong}
                        disabled={voHieuHoaHanhDong}
                        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
                    >
                        <IconHoSo ten={laHanhDongThem ? "plus" : "edit"} />
                        {hanhDong}
                    </button>
                )}
            </div>
            <div className="p-4">{children}</div>
        </section>
    );
}

export default KhoiNoiDung;
