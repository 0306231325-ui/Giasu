import { useState } from "react";
import ChiTietYeuCauDatGoi from "./ChiTietYeuCauDatGoi";

function TabDanhSachGoiHoc({ danhSachDaLoc, onXuLyHanhDong }) {
    const [trangHienTai, setTrangHienTai] = useState(1);
    const [yeuCauDangXem, setYeuCauDangXem] = useState(null);
    const soLuongMoiTrang = 10;

    const tongSoTrang = Math.ceil(danhSachDaLoc.length / soLuongMoiTrang);
    const chiSoBatDau = (trangHienTai - 1) * soLuongMoiTrang;
    const danhSachHienThi = danhSachDaLoc.slice(chiSoBatDau, chiSoBatDau + soLuongMoiTrang);

    const dongModal = () => setYeuCauDangXem(null);

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/80">
                        <thead className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase text-white/60">
                            <tr>
                                <th className="px-4 py-3">Mã gói</th>
                                <th className="px-4 py-3">Học viên</th>
                                <th className="px-4 py-3">Gia sư</th>
                                <th className="px-4 py-3">Môn học</th>
                                <th className="px-4 py-3">Tổng tiền</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {danhSachHienThi.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-white/45">
                                        Không có gói học nào.
                                    </td>
                                </tr>
                            ) : (
                                danhSachHienThi.map((yeuCau) => (
                                    <tr key={yeuCau.id} className="transition hover:bg-white/5">
                                        <td className="px-4 py-4 font-semibold text-white">
                                            {yeuCau.ma}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-white">{yeuCau.hocVien}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-white">{yeuCau.giaSu}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {yeuCau.mon} <span className="text-white/50">({yeuCau.capHoc})</span>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-amber-400">
                                            {yeuCau.tongTien}
                                        </td>
                                        <td className="px-4 py-4">
                                            {yeuCau.trangThai === "hoan_thanh" ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-400">
                                                    Đã hoàn thành
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">
                                                    Đang học
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setYeuCauDangXem(yeuCau)}
                                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500"
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Phân trang */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-white/60">
                    Hiển thị {chiSoBatDau + 1} đến {Math.min(chiSoBatDau + soLuongMoiTrang, danhSachDaLoc.length)} trong tổng số {danhSachDaLoc.length}
                </div>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setTrangHienTai((p) => Math.max(1, p - 1))}
                        disabled={trangHienTai === 1}
                        className="rounded-lg border border-white/10 bg-[#0a0f24] px-3 py-1.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                        Trước
                    </button>
                    {Array.from({ length: Math.max(1, tongSoTrang) }).map((_, i) => (
                        <button
                            key={i + 1}
                            type="button"
                            onClick={() => setTrangHienTai(i + 1)}
                            className={[
                                "rounded-lg px-3 py-1.5 text-sm font-bold transition",
                                trangHienTai === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "border border-white/10 bg-[#0a0f24] text-white hover:bg-white/10",
                            ].join(" ")}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setTrangHienTai((p) => Math.min(Math.max(1, tongSoTrang), p + 1))}
                        disabled={trangHienTai === Math.max(1, tongSoTrang)}
                        className="rounded-lg border border-white/10 bg-[#0a0f24] px-3 py-1.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            </div>

            {/* Modal Chi Tiết */}
            {yeuCauDangXem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
                    <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h2 className="text-xl font-extrabold text-slate-800">
                                Chi tiết gói học: {yeuCauDangXem.ma}
                            </h2>
                            <button
                                type="button"
                                onClick={dongModal}
                                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            {/* Dùng chung component chi tiết */}
                            <ChiTietYeuCauDatGoi
                                yeuCau={yeuCauDangXem}
                                onThucHien={onXuLyHanhDong}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TabDanhSachGoiHoc;
