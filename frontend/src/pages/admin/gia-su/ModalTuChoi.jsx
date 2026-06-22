function ModalTuChoi({ hoSo, lyDo, onDoiLyDo, onDong }) {
    if (!hoSo) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
                <h2 className="text-xl font-extrabold">Từ chối hồ sơ</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Nhập lý do từ chối hồ sơ của {hoSo.hoTen}. Nội dung này sẽ được gửi cho người đăng ký.
                </p>
                <textarea
                    value={lyDo}
                    onChange={onDoiLyDo}
                    rows={5}
                    placeholder="Ví dụ: Hồ sơ minh chứng chưa rõ ràng..."
                    className="mt-5 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                />
                <div className="mt-5 flex justify-end gap-3">
                    <button type="button" onClick={onDong} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">
                        Hủy
                    </button>
                    <button type="button" disabled={!lyDo.trim()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                        Xác nhận từ chối
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalTuChoi;
