function ModalXacNhan({
    mo = false,
    tieuDe = "Xác nhận thao tác",
    moTa = "Bạn có chắc muốn thực hiện thao tác này?",
    nutHuy = "Hủy",
    nutXacNhan = "Xác nhận",
    bienThe = "primary",
    dangXuLy = false,
    onDong,
    onXacNhan,
}) {
    if (!mo) return null;

    const mauNut =
        bienThe === "danger"
            ? "bg-red-600 hover:bg-red-500"
            : "bg-blue-600 hover:bg-blue-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
                <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="text-xl font-extrabold">{tieuDe}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        {moTa}
                    </p>
                </div>

                <div className="flex justify-end gap-3 p-6">
                    <button
                        type="button"
                        onClick={onDong}
                        disabled={dangXuLy}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {nutHuy}
                    </button>
                    <button
                        type="button"
                        onClick={onXacNhan}
                        disabled={dangXuLy}
                        className={`rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${mauNut}`}
                    >
                        {dangXuLy ? "Đang xử lý..." : nutXacNhan}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalXacNhan;
