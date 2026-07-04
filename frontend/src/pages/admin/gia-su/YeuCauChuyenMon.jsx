import { useCallback, useEffect, useRef, useState } from "react";
import ModalNhapLyDo from "../../../components/ModalNhapLyDo";
import ModalXemTaiLieu from "../../../components/ModalXemTaiLieu";
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

const cauHinhTrangThaiBangCap = {
    cho_duyet: "bg-amber-50 text-amber-700",
    da_duyet: "bg-emerald-50 text-emerald-700",
    tu_choi: "bg-red-50 text-red-700",
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
    const [taiLieuDangXem, setTaiLieuDangXem] = useState(null);
    const [dangMoTuChoi, setDangMoTuChoi] = useState(false);
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

    const xuLyYeuCau = async (hanhDong, lyDo = "") => {
        if (!yeuCauDangChon || dangXuLy) return false;

        const lyDoDaNhap = lyDo.trim();
        if (hanhDong === "tu_choi" && !lyDoDaNhap) return false;

        setDangXuLy(true);
        try {
            const response = await api.patch(
                `/admin/gia-su/yeu-cau-chuyen-mon/${yeuCauDangChon.loai}/${yeuCauDangChon.id}`,
                {
                    hanh_dong: hanhDong,
                    ly_do: lyDoDaNhap || undefined,
                },
            );

            hienThongBao(response.data?.message || "Đã xử lý yêu cầu.");
            await taiDanhSach();
            return true;
        } catch (error) {
            hienThongBao(error.response?.data?.message || "Không thể xử lý yêu cầu.");
            return false;
        } finally {
            setDangXuLy(false);
        }
    };

    const xacNhanTuChoi = async (lyDo) => {
        const thanhCong = await xuLyYeuCau("tu_choi", lyDo);
        if (thanhCong) setDangMoTuChoi(false);
    };

    const xemTaiLieu = (taiLieu) => {
        if (!taiLieu?.urlXem) return;
        setTaiLieuDangXem(taiLieu);
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
                        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">
                                    {yeuCauDangChon.ma} · {yeuCauDangChon.loaiText || nhanLoai[yeuCauDangChon.loai]}
                                </p>
                                <h2 className="mt-1.5 text-xl font-extrabold">
                                    {yeuCauDangChon.tieuDe}
                                </h2>
                                <p className="mt-1 max-w-3xl text-xs font-semibold text-slate-500">
                                    {yeuCauDangChon.moTa}
                                </p>
                            </div>
                            <TrangThai trangThai={yeuCauDangChon.trangThai} nenSang />
                        </div>

                        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_310px]">
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200">
                                    <div className="border-b border-slate-200 px-4 py-3">
                                        <p className="text-base font-extrabold">Thông tin yêu cầu</p>
                                        <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                            Dữ liệu lấy từ bảng {yeuCauDangChon.loai === "bang_cap" ? "bằng cấp/chứng chỉ" : "môn dạy và giá"}.
                                        </p>
                                    </div>
                                    <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {(yeuCauDangChon.thongTin ?? []).map(([nhan, giaTri]) => (
                                            <div
                                                key={nhan}
                                                className="rounded-xl bg-slate-50 px-3 py-2.5"
                                            >
                                                <p className="text-[11px] font-extrabold uppercase text-slate-400">
                                                    {nhan}
                                                </p>
                                                <p className="mt-1 text-sm font-extrabold text-slate-800">
                                                    {giaTri}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                    <p className="text-sm font-extrabold text-blue-700">
                                        Cách xử lý khi duyệt
                                    </p>
                                    <ul className="mt-2 space-y-1.5 text-xs font-semibold leading-5 text-slate-600">
                                        {(yeuCauDangChon.anhHuong ?? []).map((noiDung) => (
                                            <li key={noiDung} className="flex gap-2">
                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                                <span>{noiDung}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {yeuCauDangChon.lyDo && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                                        <p className="text-sm font-extrabold text-red-700">Lý do từ chối</p>
                                        <p className="mt-1 text-xs font-semibold text-red-600">
                                            {yeuCauDangChon.lyDo}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-3">
                                <div className="rounded-2xl border border-slate-200 p-4">
                                    <p className="text-xs font-extrabold uppercase text-slate-400">
                                        Gia sư gửi yêu cầu
                                    </p>
                                    <p className="mt-2 text-lg font-extrabold">
                                        {yeuCauDangChon.giaSu}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        {yeuCauDangChon.email}
                                    </p>
                                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                                        Gửi lúc: {yeuCauDangChon.ngayGui}
                                    </p>
                                    {yeuCauDangChon.urlXem && (
                                        <button
                                            type="button"
                                            onClick={() => xemTaiLieu({
                                                tieuDe: yeuCauDangChon.tieuDe,
                                                ten: yeuCauDangChon.tieuDe,
                                                urlXem: yeuCauDangChon.urlXem,
                                            })}
                                            className="mt-2 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600 transition hover:bg-blue-100"
                                        >
                                            Xem file minh chứng
                                        </button>
                                    )}
                                </div>

                                {yeuCauDangChon.loai === "mon_day" && (
                                    <div className="rounded-2xl border border-slate-200 p-4">
                                        <p className="text-base font-extrabold">Hồ sơ xác minh</p>
                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                            Admin xem các bằng cấp/chứng chỉ này để quyết định duyệt môn dạy.
                                        </p>

                                        <div className="mt-3 max-h-[300px] space-y-2 overflow-y-scroll pr-1">
                                            {(yeuCauDangChon.bangCapGiaSu ?? []).length === 0 ? (
                                                <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs font-bold text-slate-400">
                                                    Gia sư chưa có hồ sơ xác minh.
                                                </p>
                                            ) : (
                                                yeuCauDangChon.bangCapGiaSu.map((taiLieu) => (
                                                    <div key={taiLieu.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-extrabold text-slate-900">{taiLieu.ten}</p>
                                                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                                                    {taiLieu.loai} · {taiLieu.trinhDo}
                                                                </p>
                                                            </div>
                                                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${cauHinhTrangThaiBangCap[taiLieu.trangThai] || "bg-slate-100 text-slate-600"}`}>
                                                                {tenTrangThai[taiLieu.trangThai] || "Chưa rõ"}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-xs font-semibold text-slate-500">
                                                            {taiLieu.chuyenNganh} · {taiLieu.donVi}
                                                        </p>
                                                        {taiLieu.lyDo && (
                                                            <p className="mt-2 rounded-md bg-red-50 px-2 py-1.5 text-[11px] font-semibold text-red-600">
                                                                Lý do từ chối: {taiLieu.lyDo}
                                                            </p>
                                                        )}
                                                        {taiLieu.urlXem && (
                                                            <button
                                                                type="button"
                                                                onClick={() => xemTaiLieu({
                                                                    ...taiLieu,
                                                                    tieuDe: taiLieu.ten,
                                                                })}
                                                                className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-600 transition hover:bg-blue-100"
                                                            >
                                                                Xem tài liệu
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-slate-200 p-4">
                                    <p className="text-base font-extrabold">Thao tác xử lý</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        Chỉ yêu cầu chờ duyệt mới được xử lý.
                                    </p>
                                    <div className="mt-3 grid gap-2">
                                        <button
                                            type="button"
                                            disabled={!coTheXuLy || dangXuLy}
                                            onClick={() => xuLyYeuCau("duyet")}
                                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {dangXuLy ? "Đang xử lý..." : "Duyệt yêu cầu"}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!coTheXuLy || dangXuLy}
                                            onClick={() => setDangMoTuChoi(true)}
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-extrabold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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

            <ModalXemTaiLieu
                taiLieu={taiLieuDangXem}
                onDong={() => setTaiLieuDangXem(null)}
                onLoi={hienThongBao}
            />

            <ModalNhapLyDo
                mo={dangMoTuChoi}
                tieuDe="Từ chối yêu cầu chuyên môn"
                moTa={`Nhập lý do từ chối yêu cầu "${yeuCauDangChon?.tieuDe || "đang chọn"}". Nội dung này sẽ được gửi cho gia sư.`}
                placeholder="Ví dụ: Hồ sơ minh chứng chưa phù hợp với môn đăng ký..."
                nutXacNhan="Xác nhận từ chối"
                dangXuLy={dangXuLy}
                onDong={() => setDangMoTuChoi(false)}
                onXacNhan={xacNhanTuChoi}
            />
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
