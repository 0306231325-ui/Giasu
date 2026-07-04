import { useState } from "react";

function NoiDungModalNhapLyDo({
    tieuDe = "Nhập lý do",
    moTa = "Vui lòng nhập lý do để tiếp tục xử lý.",
    placeholder = "Nhập lý do...",
    nutXacNhan = "Xác nhận",
    dangXuLy = false,
    onDong,
    onXacNhan,
}) {
    const [lyDo, setLyDo] = useState("");
    const lyDoDaNhap = lyDo.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
                <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="text-xl font-extrabold">{tieuDe}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        {moTa}
                    </p>
                </div>

                <div className="p-6">
                    <textarea
                        value={lyDo}
                        onChange={(event) => setLyDo(event.target.value)}
                        rows={5}
                        autoFocus
                        placeholder={placeholder}
                        disabled={dangXuLy}
                        className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />

                    <div className="mt-5 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onDong}
                            disabled={dangXuLy}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={() => onXacNhan?.(lyDoDaNhap)}
                            disabled={dangXuLy || !lyDoDaNhap}
                            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {dangXuLy ? "Đang xử lý..." : nutXacNhan}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModalNhapLyDo({ mo = false, ...props }) {
    if (!mo) return null;
    return <NoiDungModalNhapLyDo {...props} />;
}

export default ModalNhapLyDo;
