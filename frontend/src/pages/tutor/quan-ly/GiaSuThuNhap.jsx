import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

const cauHinhBoLoc = {
    ngay: {
        nhanThoiGian: "ngày đã chọn",
        loaiInput: "date",
        moTaBieuDo: "Thu nhập theo từng buổi trong ngày",
    },
    thang: {
        nhanThoiGian: "tháng đã chọn",
        loaiInput: "month",
        moTaBieuDo: "Thu nhập theo từng tuần trong tháng",
    },
    nam: {
        nhanThoiGian: "năm đã chọn",
        loaiInput: "number",
        moTaBieuDo: "Thu nhập theo từng tháng trong năm",
    },
};

const homNay = new Date();
const giaTriMacDinh = {
    ngay: homNay.toISOString().slice(0, 10),
    thang: homNay.toISOString().slice(0, 7),
    nam: String(homNay.getFullYear()),
};

const duLieuRong = {
    boLoc: {},
    tongQuan: {
        tongThuNhap: 0,
        soBuoiHoanThanh: 0,
        trungBinhMoiBuoi: 0,
        monThuNhapCaoNhat: null,
    },
    bieuDo: [],
    chiTiet: [],
};

function GiaSuThuNhap() {
    const [boLoc, setBoLoc] = useState("thang");
    const [giaTriBoLoc, setGiaTriBoLoc] = useState(giaTriMacDinh.thang);
    const [duLieu, setDuLieu] = useState(duLieuRong);
    const [dangTai, setDangTai] = useState(false);
    const [loi, setLoi] = useState("");
    const [chiTietDangXem, setChiTietDangXem] = useState(null);
    const cauHinh = cauHinhBoLoc[boLoc];

    const doiBoLoc = (giaTri) => {
        setBoLoc(giaTri);
        setGiaTriBoLoc(giaTriMacDinh[giaTri]);
    };

    useEffect(() => {
        let daHuy = false;

        const taiThuNhap = async () => {
            setDangTai(true);
            setLoi("");

            try {
                const response = await api.get("/gia-su/thu-nhap", {
                    params: {
                        loai: boLoc,
                        gia_tri: giaTriBoLoc,
                    },
                });

                if (!daHuy) {
                    setDuLieu(response.data.data || duLieuRong);
                }
            } catch (error) {
                if (!daHuy) {
                    console.error("Không thể tải thu nhập gia sư:", error);
                    setDuLieu(duLieuRong);
                    setLoi(error.response?.data?.message || "Không thể tải dữ liệu thu nhập.");
                }
            } finally {
                if (!daHuy) {
                    setDangTai(false);
                }
            }
        };

        taiThuNhap();

        return () => {
            daHuy = true;
        };
    }, [boLoc, giaTriBoLoc]);

    const tongQuan = duLieu.tongQuan || duLieuRong.tongQuan;
    const chiTiet = duLieu.chiTiet || [];
    const bieuDo = duLieu.bieuDo || [];

    return (
        <div className="mx-auto max-w-7xl pb-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Thu nhập
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                        Theo dõi thu nhập từ các buổi học đã hoàn thành theo ngày,
                        tháng hoặc năm.
                    </p>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 sm:flex-row sm:items-center">
                    <div className="grid grid-cols-3 rounded-xl bg-black/20 p-1">
                        {[
                            ["ngay", "Ngày"],
                            ["thang", "Tháng"],
                            ["nam", "Năm"],
                        ].map(([giaTri, nhan]) => (
                            <button
                                key={giaTri}
                                type="button"
                                onClick={() => doiBoLoc(giaTri)}
                                className={[
                                    "rounded-lg px-4 py-2 text-sm font-bold transition",
                                    boLoc === giaTri
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                        : "text-white/55 hover:text-white",
                                ].join(" ")}
                            >
                                {nhan}
                            </button>
                        ))}
                    </div>

                    <label className="relative">
                        <span className="sr-only">Chọn thời gian</span>
                        <input
                            type={cauHinh.loaiInput}
                            value={giaTriBoLoc}
                            onChange={(event) => setGiaTriBoLoc(event.target.value)}
                            min={boLoc === "nam" ? "2020" : undefined}
                            max={boLoc === "nam" ? "2030" : undefined}
                            className="h-11 w-full rounded-xl border border-white/10 bg-[#101a39] px-4 pr-11 text-sm font-semibold text-white outline-none transition [color-scheme:dark] focus:border-blue-400 sm:w-48 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-11 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white">
                            <BieuTuong ten="calendar" />
                        </span>
                    </label>
                </div>
            </div>

            {loi && (
                <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                    {loi}
                </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TheThongKe
                    tieuDe="Tổng thu nhập"
                    giaTri={dinhDangTien(tongQuan.tongThuNhap)}
                    phuDe={`Trong ${duLieu.boLoc?.nhanThoiGian || cauHinh.nhanThoiGian}`}
                    bieuTuong="wallet"
                    mau="blue"
                    dangTai={dangTai}
                />
                <TheThongKe
                    tieuDe="Buổi đã hoàn thành"
                    giaTri={tongQuan.soBuoiHoanThanh}
                    phuDe="Chỉ tính buổi trạng thái hoàn thành"
                    bieuTuong="calendar"
                    mau="emerald"
                    dangTai={dangTai}
                />
            </div>

            <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#111b3a]">
                <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-extrabold">Biểu đồ thu nhập</h2>
                        <p className="mt-1 text-xs text-white/45">
                            {cauHinh.moTaBieuDo}
                        </p>
                    </div>
                </div>

                <BieuDoCot duLieu={bieuDo} dangTai={dangTai} />
            </section>

            <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/10">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Bảng tính thu nhập
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Chỉ hiển thị các buổi học đã hoàn thành trong {cauHinh.nhanThoiGian}.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:self-center"
                    >
                        <BieuTuong ten="download" />
                        Xuất báo cáo
                    </button>
                </div>

                <div className="hidden grid-cols-[0.9fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 bg-slate-50 px-6 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:grid">
                    <span>Mã buổi</span>
                    <span>Ngày học</span>
                    <span className="text-right">Tiền học</span>
                    <span className="text-right">Hoa hồng</span>
                    <span className="text-right">Gia sư nhận</span>
                    <span className="text-right">Chi tiết</span>
                </div>

                {dangTai ? (
                    <TrangThaiBang noiDung="Đang tải dữ liệu thu nhập..." />
                ) : chiTiet.length === 0 ? (
                    <TrangThaiBang noiDung="Chưa có buổi học hoàn thành trong thời gian này." />
                ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                        {chiTiet.map((dong) => (
                            <DongThuNhap
                                key={dong.id}
                                dong={dong}
                                onXemChiTiet={() => setChiTietDangXem(dong)}
                            />
                        ))}
                    </div>
                )}

            </section>

            {chiTietDangXem && (
                <ModalChiTietThuNhap
                    dong={chiTietDangXem}
                    onDong={() => setChiTietDangXem(null)}
                />
            )}

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-100">
                <span className="mt-0.5 shrink-0 text-blue-300">
                    <BieuTuong ten="info" />
                </span>
                <p className="leading-6">
                    Thu nhập chỉ được ghi nhận từ những buổi học đã hoàn thành.
                    Hệ thống lấy số tiền từ cột <span className="font-bold">tien_giasu_nhan</span>;
                    nếu dữ liệu cũ chưa có tiền nhận thì tạm tính bằng tiền học trừ phí hoa hồng.
                </p>
            </div>
        </div>
    );
}

function BieuDoCot({ duLieu, dangTai }) {
    const duLieuCoTien = useMemo(
        () => duLieu.filter((cot) => Number(cot.thuNhap) > 0 || Number(cot.soBuoi) > 0),
        [duLieu],
    );
    const giaTriLonNhat = Math.max(...duLieu.map((cot) => Number(cot.thuNhap) || 0), 0);
    const mocCaoNhat = giaTriLonNhat || 1;

    return (
        <div className="px-4 pb-5 pt-6 sm:px-6">
            <div className="flex h-64 gap-3 sm:gap-5">
                <div className="flex w-16 shrink-0 flex-col justify-between pb-8 text-right text-[10px] text-white/35">
                    <span>{dinhDangTien(mocCaoNhat)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.75)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.5)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.25)}</span>
                    <span>0đ</span>
                </div>

                <div className="relative min-w-0 flex-1">
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[220px] flex-col justify-between">
                        {[1, 2, 3, 4, 5].map((dong) => (
                            <span
                                key={dong}
                                className="block border-t border-white/10"
                            />
                        ))}
                    </div>

                    {dangTai ? (
                        <KhungBieuDoRong noiDung="Đang tải dữ liệu biểu đồ..." />
                    ) : duLieuCoTien.length === 0 ? (
                        <KhungBieuDoRong noiDung="Chưa có dữ liệu biểu đồ" />
                    ) : (
                        <div className="relative flex h-full items-end gap-3 overflow-x-auto pb-8">
                            {duLieu.map((cot) => {
                                const thuNhap = Number(cot.thuNhap) || 0;
                                const chieuCao = Math.max((thuNhap / mocCaoNhat) * 100, thuNhap > 0 ? 8 : 0);

                                return (
                                    <div
                                        key={cot.nhan}
                                        className="flex h-full min-w-10 flex-1 flex-col justify-end gap-2"
                                        title={`${cot.nhan}: ${dinhDangTien(thuNhap)}`}
                                    >
                                        <div className="flex h-[220px] items-end">
                                            <div
                                                className="w-full rounded-t-lg bg-blue-500"
                                                style={{ height: `${chieuCao}%` }}
                                            />
                                        </div>
                                        <span className="truncate text-center text-[10px] font-semibold text-white/50">
                                            {cot.nhan}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KhungBieuDoRong({ noiDung }) {
    return (
        <div className="relative flex h-full items-center justify-center pb-7">
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-5 text-center">
                <p className="text-sm font-extrabold text-white">{noiDung}</p>
            </div>
        </div>
    );
}

function DongThuNhap({ dong, onXemChiTiet }) {
    const [ngayHoc] = String(dong.thoiGian || "").split(" · ");

    return (
        <div className="grid gap-3 border-t border-slate-100 px-5 py-4 text-sm first:border-t-0 sm:px-7 lg:grid-cols-[0.9fr_1fr_1fr_1fr_1fr_0.8fr] lg:items-center">
            <div>
                <p className="font-extrabold text-slate-900">{dong.ma}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 lg:hidden">{ngayHoc}</p>
            </div>
            <p className="hidden font-bold text-slate-700 lg:block">{ngayHoc}</p>
            <p className="flex items-center justify-between gap-3 font-bold text-slate-700 lg:block lg:text-right">
                <span className="text-xs uppercase tracking-wider text-slate-400 lg:hidden">Tiền học</span>
                {dinhDangTien(dong.tienHoc)}
            </p>
            <p className="flex items-center justify-between gap-3 font-bold text-rose-500 lg:block lg:text-right">
                <span className="text-xs uppercase tracking-wider text-slate-400 lg:hidden">Hoa hồng</span>
                -{dinhDangTien(dong.phiHoaHong)}
            </p>
            <p className="text-right text-base font-extrabold text-emerald-600">
                {dinhDangTien(dong.thuNhap)}
            </p>
            <button
                type="button"
                onClick={onXemChiTiet}
                className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-extrabold text-blue-600 transition hover:bg-blue-50 lg:justify-self-end"
            >
                Xem chi tiết
            </button>
        </div>
    );
}

function ModalChiTietThuNhap({ dong, onDong }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-500">
                            Chi tiết buổi học
                        </p>
                        <h3 className="mt-2 text-xl font-extrabold">{dong.ma}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onDong}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>

                <div className="grid gap-3 px-6 py-5 text-sm sm:grid-cols-2">
                    <DongChiTiet label="Thời gian" value={dong.thoiGian} />
                    <DongChiTiet label="Loại buổi" value={dong.loaiBuoi} />
                    <DongChiTiet label="Học viên" value={dong.hocVien} />
                    <DongChiTiet label="Môn học" value={dong.monHoc} />
                    <DongChiTiet label="Tiền học" value={dinhDangTien(dong.tienHoc)} />
                    <DongChiTiet label="Phí hoa hồng" value={`-${dinhDangTien(dong.phiHoaHong)}`} />
                </div>

                <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4">
                        <span className="text-sm font-bold text-slate-500">Gia sư thực nhận</span>
                        <span className="text-xl font-extrabold text-emerald-600">
                            {dinhDangTien(dong.thuNhap)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DongChiTiet({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 font-bold text-slate-800">{value || "-"}</p>
        </div>
    );
}

function TrangThaiBang({ noiDung }) {
    return (
        <div className="px-5 py-12 text-center sm:px-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BieuTuong ten="wallet" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-500">{noiDung}</p>
        </div>
    );
}

function TheThongKe({ tieuDe, giaTri, phuDe, bieuTuong, mau, dangTai }) {
    const mauSac = {
        blue: "bg-blue-500/15 text-blue-300 border-blue-400/20",
        emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
        violet: "bg-violet-500/15 text-violet-300 border-violet-400/20",
        amber: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/45">{tieuDe}</p>
                    <p className="mt-3 truncate text-2xl font-extrabold tracking-tight text-white">
                        {dangTai ? "..." : giaTri}
                    </p>
                </div>
                <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${mauSac[mau]}`}
                >
                    <BieuTuong ten={bieuTuong} />
                </span>
            </div>
            <p className="mt-3 truncate text-xs text-white/35">{phuDe}</p>
        </div>
    );
}

function dinhDangTien(giaTri) {
    return `${Math.round(Number(giaTri) || 0).toLocaleString("vi-VN")}đ`;
}

function BieuTuong({ ten }) {
    const duongNet = {
        wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" /><path d="M15 11h7v4h-7a2 2 0 0 1 0-4Z" /></>,
        calendar: <><path d="M4 5h16v16H4zM8 2v6M16 2v6M4 10h16" /><path d="m9 15 2 2 4-4" /></>,
        average: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M2 19h22" /></>,
        star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
        download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
        info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
        >
            {duongNet[ten]}
        </svg>
    );
}

export default GiaSuThuNhap;
