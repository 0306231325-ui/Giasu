import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../../services/api";

const boLocTrangThai = [
    { value: "cho_duyet", label: "Chờ duyệt" },
    { value: "da_duyet", label: "Đã duyệt" },
    { value: "tu_choi", label: "Đã từ chối" },
];

const boLocLoai = [
    { value: "tat_ca", label: "Tất cả loại" },
    { value: "bang_cap", label: "Bằng cấp/chứng chỉ" },
    { value: "mon_day", label: "Môn dạy & giá" },
];

const nhanLoai = {
    bang_cap: "Bằng cấp/chứng chỉ",
    mon_day: "Môn dạy & giá",
};

const cauHinhTrangThai = {
    cho_duyet: "border-amber-300/30 bg-amber-300/10 text-amber-300",
    da_duyet: "border-emerald-300/30 bg-emerald-300/10 text-emerald-300",
    tu_choi: "border-red-300/30 bg-red-300/10 text-red-300",
};

const tenTrangThai = {
    cho_duyet: "Chờ duyệt",
    da_duyet: "Đã duyệt",
    tu_choi: "Từ chối",
};

function YeuCauChuyenMon() {
    const [trangThaiDangChon, setTrangThaiDangChon] = useState("cho_duyet");
    const [loaiDangChon, setLoaiDangChon] = useState("tat_ca");
    const [tuKhoaNhap, setTuKhoaNhap] = useState("");
    const [tuKhoa, setTuKhoa] = useState("");
    const [danhSachHienThi, setDanhSachHienThi] = useState([]);
    const [yeuCauDangChon, setYeuCauDangChon] = useState(null);
    const [thongKe, setThongKe] = useState({ choDuyet: 0, daDuyet: 0, tuChoi: 0 });
    const [dangTai, setDangTai] = useState(false);
    const [dangXuLy, setDangXuLy] = useState(false);
    const [thongBao, setThongBao] = useState("");
    const boDemThongBao = useRef(null);

    const hienThongBao = useCallback((noiDung) => {
        if (boDemThongBao.current) {
            clearTimeout(boDemThongBao.current);
        }

        setThongBao(noiDung);
        boDemThongBao.current = setTimeout(() => {
            setThongBao("");
            boDemThongBao.current = null;
        }, 3000);
    }, []);

    const taiDanhSach = useCallback(async (boLoc = {}) => {
        const trangThai = boLoc.trangThai ?? trangThaiDangChon;
        const loai = boLoc.loai ?? loaiDangChon;
        const q = boLoc.tuKhoa ?? tuKhoa;

        setDangTai(true);
        try {
            const response = await api.get("/admin/gia-su/yeu-cau-chuyen-mon", {
                params: {
                    trang_thai: trangThai,
                    loai,
                    q: q || undefined,
                },
            });

            const danhSach = response.data?.data?.yeuCau ?? [];
            setDanhSachHienThi(danhSach);
            setThongKe(response.data?.data?.thongKe ?? { choDuyet: 0, daDuyet: 0, tuChoi: 0 });
            setYeuCauDangChon((yeuCauHienTai) => (
                danhSach.find((yeuCau) => yeuCau.id === yeuCauHienTai?.id && yeuCau.loai === yeuCauHienTai?.loai)
                ?? danhSach[0]
                ?? null
            ));
        } catch (error) {
            setDanhSachHienThi([]);
            setYeuCauDangChon(null);
            hienThongBao(error.response?.data?.message || "Không thể tải yêu cầu chuyên môn.");
        } finally {
            setDangTai(false);
        }
    }, [hienThongBao, loaiDangChon, trangThaiDangChon, tuKhoa]);

    useEffect(() => {
        const boDem = setTimeout(() => {
            taiDanhSach();
        }, 0);

        return () => clearTimeout(boDem);
    }, [taiDanhSach]);

    useEffect(() => {
        return () => {
            if (boDemThongBao.current) {
                clearTimeout(boDemThongBao.current);
            }
        };
    }, []);

    const timKiemYeuCau = () => {
        setTuKhoa(tuKhoaNhap);
    };

    const lamMoiBoLoc = () => {
        setTuKhoaNhap("");
        setTuKhoa("");
        setTrangThaiDangChon("cho_duyet");
        setLoaiDangChon("tat_ca");
        taiDanhSach({ trangThai: "cho_duyet", loai: "tat_ca", tuKhoa: "" });
    };

    const xuLyYeuCau = async (hanhDong) => {
        if (!yeuCauDangChon || dangXuLy) return;

        let lyDo = "";
        if (hanhDong === "tu_choi") {
            lyDo = window.prompt("Nhập lý do từ chối yêu cầu này:")?.trim() ?? "";
            if (!lyDo) return;
        }

        setDangXuLy(true);
        try {
            const response = await api.patch(
                `/admin/gia-su/yeu-cau-chuyen-mon/${yeuCauDangChon.loai}/${yeuCauDangChon.id}`,
                {
                    hanh_dong: hanhDong,
                    ly_do: lyDo || undefined,
                },
            );

            hienThongBao(response.data?.message || "Đã xử lý yêu cầu.");
            await taiDanhSach();
        } catch (error) {
            hienThongBao(error.response?.data?.message || "Không thể xử lý yêu cầu.");
        } finally {
            setDangXuLy(false);
        }
    };

    const xemTaiLieu = async () => {
        if (!yeuCauDangChon?.urlXem) return;

        try {
            const response = await api.get(yeuCauDangChon.urlXem, {
                responseType: "blob",
            });
            const duongDanTam = URL.createObjectURL(response.data);
            window.open(duongDanTam, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(duongDanTam), 60_000);
        } catch (error) {
            hienThongBao(error.response?.data?.message || "Không thể mở file minh chứng.");
        }
    };

    const coTheXuLy = yeuCauDangChon?.trangThai === "cho_duyet";

    return (
        <div className="mt-5 grid gap-5 xl:grid-cols-[460px_minmax(0,1fr)] 2xl:grid-cols-[500px_minmax(0,1fr)]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="border-b border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-lg font-extrabold text-white">Yêu cầu chuyên môn</p>
                            <p className="mt-1 text-sm text-white/50">
                                Duyệt các yêu cầu thêm bằng cấp/chứng chỉ và môn dạy của gia sư.
                            </p>
                        </div>
                        <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-400/15 px-3.5 py-1.5 text-xs font-extrabold text-amber-300">
                            {thongKe.choDuyet} chờ duyệt
                        </span>
                    </div>
                </div>

                <div className="space-y-4 border-b border-white/10 p-4">
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <input
                            value={tuKhoaNhap}
                            onChange={(event) => setTuKhoaNhap(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    timKiemYeuCau();
                                }
                            }}
                            placeholder="Tìm mã, tên gia sư, email..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/60"
                        />
                        <button
                            type="button"
                            onClick={timKiemYeuCau}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-500"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <label className="block">
                            <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white/35">
                                Trạng thái
                            </span>
                            <select
                                value={trangThaiDangChon}
                                onChange={(event) => setTrangThaiDangChon(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-extrabold text-white outline-none transition focus:border-blue-400/60"
                            >
                                {boLocTrangThai.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white/35">
                                Loại yêu cầu
                            </span>
                            <select
                                value={loaiDangChon}
                                onChange={(event) => setLoaiDangChon(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-extrabold text-white outline-none transition focus:border-blue-400/60"
                            >
                                {boLocLoai.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={lamMoiBoLoc}
                                disabled={dangTai}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:border-blue-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Làm mới lọc
                            </button>
                        </div>
                    </div>
                </div>

                {thongBao && (
                    <div className="mx-4 mt-4 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100">
                        {thongBao}
                    </div>
                )}

                <div className="max-h-[620px] space-y-3 overflow-y-auto p-4">
                    {dangTai && (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm font-semibold text-white/45">
                            Đang tải yêu cầu...
                        </div>
                    )}

                    {!dangTai && danhSachHienThi.map((yeuCau) => (
                        <button
                            key={`${yeuCau.loai}-${yeuCau.id}`}
                            type="button"
                            onClick={() => setYeuCauDangChon(yeuCau)}
                            className={[
                                "w-full rounded-2xl border p-4 text-left transition",
                                yeuCauDangChon?.id === yeuCau.id && yeuCauDangChon?.loai === yeuCau.loai
                                    ? "border-blue-400/60 bg-blue-600/20"
                                    : "border-white/10 bg-slate-950/35 hover:border-blue-400/30 hover:bg-white/8",
                            ].join(" ")}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wide text-white/35">
                                        {yeuCau.ma} · {yeuCau.loaiText || nhanLoai[yeuCau.loai]}
                                    </p>
                                    <p className="mt-2 text-base font-extrabold text-white">
                                        {yeuCau.tieuDe}
                                    </p>
                                </div>
                                <TrangThai trangThai={yeuCau.trangThai} />
                            </div>
                            <p className="mt-3 text-sm font-bold text-white/75">{yeuCau.giaSu}</p>
                            <p className="mt-1 text-xs font-semibold text-white/35">
                                {yeuCau.email} · {yeuCau.ngayGui}
                            </p>
                        </button>
                    ))}

                    {!dangTai && danhSachHienThi.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm font-semibold text-white/45">
                            Không có yêu cầu phù hợp bộ lọc.
                        </div>
                    )}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
                {yeuCauDangChon ? (
                    <>
                        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
                                    {yeuCauDangChon.ma} · {yeuCauDangChon.loaiText || nhanLoai[yeuCauDangChon.loai]}
                                </p>
                                <h2 className="mt-2 text-2xl font-extrabold">
                                    {yeuCauDangChon.tieuDe}
                                </h2>
                                <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-500">
                                    {yeuCauDangChon.moTa}
                                </p>
                            </div>
                            <TrangThai trangThai={yeuCauDangChon.trangThai} nenSang />
                        </div>

                        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-slate-200">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <p className="text-lg font-extrabold">Thông tin yêu cầu</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-500">
                                            Dữ liệu lấy từ bảng {yeuCauDangChon.loai === "bang_cap" ? "bằng cấp/chứng chỉ" : "môn dạy và giá"}.
                                        </p>
                                    </div>
                                    <div className="grid gap-3 p-5 md:grid-cols-2">
                                        {(yeuCauDangChon.thongTin ?? []).map(([nhan, giaTri]) => (
                                            <div
                                                key={nhan}
                                                className="rounded-xl bg-slate-50 px-4 py-3"
                                            >
                                                <p className="text-xs font-extrabold uppercase text-slate-400">
                                                    {nhan}
                                                </p>
                                                <p className="mt-1 text-sm font-extrabold text-slate-800">
                                                    {giaTri}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                                    <p className="font-extrabold text-blue-700">
                                        Cách xử lý khi duyệt
                                    </p>
                                    <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600">
                                        {(yeuCauDangChon.anhHuong ?? []).map((noiDung) => (
                                            <li key={noiDung} className="flex gap-2">
                                                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                                <span>{noiDung}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {yeuCauDangChon.lyDo && (
                                    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
                                        <p className="font-extrabold text-red-700">Lý do từ chối</p>
                                        <p className="mt-2 text-sm font-semibold text-red-600">
                                            {yeuCauDangChon.lyDo}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 p-5">
                                    <p className="text-sm font-extrabold uppercase text-slate-400">
                                        Gia sư gửi yêu cầu
                                    </p>
                                    <p className="mt-3 text-xl font-extrabold">
                                        {yeuCauDangChon.giaSu}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                        {yeuCauDangChon.email}
                                    </p>
                                    <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                                        Gửi lúc: {yeuCauDangChon.ngayGui}
                                    </p>
                                    {yeuCauDangChon.urlXem && (
                                        <button
                                            type="button"
                                            onClick={xemTaiLieu}
                                            className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-600 transition hover:bg-blue-100"
                                        >
                                            Xem file minh chứng
                                        </button>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-5">
                                    <p className="font-extrabold">Thao tác xử lý</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                        Chỉ yêu cầu chờ duyệt mới được xử lý.
                                    </p>
                                    <div className="mt-4 grid gap-3">
                                        <button
                                            type="button"
                                            disabled={!coTheXuLy || dangXuLy}
                                            onClick={() => xuLyYeuCau("duyet")}
                                            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {dangXuLy ? "Đang xử lý..." : "Duyệt yêu cầu"}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!coTheXuLy || dangXuLy}
                                            onClick={() => xuLyYeuCau("tu_choi")}
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                ) : (
                    <div className="flex min-h-[520px] items-center justify-center text-sm font-semibold text-slate-500">
                        Chọn một yêu cầu bên trái để xem chi tiết.
                    </div>
                )}
            </section>
        </div>
    );
}

function TrangThai({ trangThai, nenSang = false }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold",
                cauHinhTrangThai[trangThai],
                nenSang ? "bg-opacity-100" : "",
            ].join(" ")}
        >
            {tenTrangThai[trangThai]}
        </span>
    );
}

export default YeuCauChuyenMon;
