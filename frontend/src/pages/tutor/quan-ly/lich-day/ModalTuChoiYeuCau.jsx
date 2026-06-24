import { useState } from "react";
import {
    LopModal,
    TieuDeModal,
} from "./ModalChiTietLichHoc";

function ModalTuChoiYeuCau({ yeuCau, onDong, onXacNhan }) {
    const [lyDo, setLyDo] = useState("");

    return (
        <LopModal onDong={onDong}>
            <TieuDeModal
                tieuDe="Từ chối yêu cầu"
                phuDe={`${yeuCau.maYeuCau} · ${yeuCau.mon} · ${yeuCau.hocVien}`}
                onDong={onDong}
            />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onXacNhan(yeuCau, lyDo.trim());
                }}
                className="p-6"
            >
                <p className="text-sm leading-6 text-slate-600">
                    Lý do sẽ được gửi cho học viên và quản trị viên. Hãy mô tả
                    ngắn gọn để họ có thể tìm phương án phù hợp khác.
                </p>
                <label className="mt-5 block">
                    <span className="text-sm font-bold text-slate-700">
                        Lý do từ chối <span className="text-red-500">*</span>
                    </span>
                    <textarea
                        value={lyDo}
                        onChange={(event) => setLyDo(event.target.value)}
                        rows="5"
                        maxLength="500"
                        placeholder="Ví dụ: Khung giờ này đang trùng với lớp học hiện tại..."
                        className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <span className="mt-1 block text-right text-xs text-slate-400">
                        {lyDo.length}/500
                    </span>
                </label>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onDong}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={!lyDo.trim()}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Xác nhận từ chối
                    </button>
                </div>
            </form>
        </LopModal>
    );
}

export default ModalTuChoiYeuCau;
