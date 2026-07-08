import { useEffect, useState } from "react";
import DongDanhGia from "./DongDanhGia";
import TrangThaiBang from "./TrangThaiBang";

const SO_LUONG_TREN_TRANG = 10;

function BangDanhGia({
    boLocDanhGia,
    setBoLocDanhGia,
    ngayDanhGia,
    setNgayDanhGia,
    danhSach,
    dangTai,
}) {
    const [trangHienTai, setTrangHienTai] = useState(1);

    useEffect(() => {
        setTrangHienTai(1);
    }, [danhSach]);

    const tongSoTrang = Math.max(1, Math.ceil(danhSach.length / SO_LUONG_TREN_TRANG));
    const danhSachHienThi = danhSach.slice(
        (trangHienTai - 1) * SO_LUONG_TREN_TRANG,
        trangHienTai * SO_LUONG_TREN_TRANG
    );

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-950">
                        Đánh giá và phản hồi
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Danh sách phản hồi học viên gửi sau buổi học.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={() => {
                            setNgayDanhGia("");
                            setBoLocDanhGia("");
                        }}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Làm mới
                    </button>
                    <input
                        type="date"
                        value={ngayDanhGia}
                        onChange={(e) => setNgayDanhGia(e.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <select
                        value={boLocDanhGia}
                        onChange={(event) => setBoLocDanhGia(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                        <option value="">Tất cả số sao</option>
                        <option value="5">5 sao</option>
                        <option value="4">4 sao</option>
                        <option value="3">3 sao</option>
                        <option value="duoi_3">Dưới 3 sao</option>
                    </select>
                </div>
            </div>

            <div className="hidden grid-cols-[1fr_1fr_1.5fr_auto] gap-4 bg-slate-50 px-7 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:grid">
                <span>Buổi học</span>
                <span>Học viên</span>
                <span>Phản hồi học viên</span>
                <span className="text-right">Hành động</span>
            </div>

            {dangTai ? (
                <div className="flex-1">
                    <TrangThaiBang noiDung="Đang tải phản hồi học viên..." />
                </div>
            ) : danhSach.length === 0 ? (
                <div className="flex-1">
                    <TrangThaiBang
                        noiDung="Chưa có phản hồi từ học viên"
                        moTa="Khi học viên đánh giá sau buổi học hoàn thành, nội dung phản hồi sẽ hiển thị tại đây."
                    />
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto max-h-[520px]">
                        {danhSachHienThi.map((danhGia) => (
                            <DongDanhGia key={danhGia.id} danhGia={danhGia} />
                        ))}
                    </div>
                    {danhSach.length > 0 && (
                        <div className="mt-auto flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTrangHienTai(p => Math.max(1, p - 1))}
                                    disabled={trangHienTai === 1}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <span className="text-xs font-bold text-slate-500">
                                    Trang <span className="text-slate-800">{trangHienTai}</span> / {tongSoTrang}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setTrangHienTai(p => Math.min(tongSoTrang, p + 1))}
                                    disabled={trangHienTai === tongSoTrang}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default BangDanhGia;
