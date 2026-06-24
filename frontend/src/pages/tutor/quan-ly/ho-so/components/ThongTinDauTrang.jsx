import { useRef } from "react";
import IconHoSo from "./IconHoSo";
import { layChuCaiDau } from "../utils/dinhDangHoSo";

function ThongTinDauTrang({ tenGiaSu, thongTin, avatar }) {
    const inputAnhRef = useRef(null);

    const xuLyChonAnh = (suKien) => {
        const file = suKien.target.files?.[0];
        avatar.doiAvatar(file);
        suKien.target.value = "";
    };

    return (
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#101d43] to-[#0b1533] shadow-xl shadow-black/15">
            <div className="relative p-5 sm:px-6 sm:py-5">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                    <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-blue-950/40 sm:h-24 sm:w-24 sm:text-3xl">
                            {avatar.avatarUrl ? (
                                <img
                                    src={avatar.avatarUrl}
                                    alt={`Ảnh đại diện của ${tenGiaSu}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                layChuCaiDau(tenGiaSu)
                            )}
                        </div>
                        <input
                            ref={inputAnhRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={xuLyChonAnh}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => inputAnhRef.current?.click()}
                            disabled={avatar.dangTaiLen}
                            aria-label="Đổi ảnh đại diện"
                            title={avatar.dangTaiLen ? "Đang tải ảnh lên..." : "Đổi ảnh đại diện"}
                            className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-4 border-[#101d43] bg-white text-slate-700 shadow-lg transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-wait disabled:opacity-60"
                        >
                            <IconHoSo ten="camera" />
                        </button>
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <h2 className="text-xl font-extrabold sm:text-2xl">{tenGiaSu}</h2>
                            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                                Đã duyệt
                            </span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/55 sm:justify-start">
                            <span className="inline-flex items-center gap-2">
                                <IconHoSo ten="location" />
                                {thongTin.dia_chi || "Chưa cập nhật địa chỉ"}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <IconHoSo ten="star" />
                                {thongTin.so_luong_danh_gia > 0
                                    ? `${Number(thongTin.diem_danh_gia).toFixed(1)} · ${thongTin.so_luong_danh_gia} đánh giá`
                                    : "Chưa có đánh giá"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ThongTinDauTrang;
