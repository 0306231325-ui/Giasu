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
        moTaBieuDo: "Thu nhập theo ngày trong tháng",
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
    const monCaoNhat = tongQuan.monThuNhapCaoNhat;

    return (
        <div className="mx-auto max-w-7xl pb-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Báo cáo giảng dạy
                    </div>
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

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <TheThongKe
                    tieuDe="Trung bình mỗi buổi"
                    giaTri={dinhDangTien(tongQuan.trungBinhMoiBuoi)}
                    phuDe="Tổng thu nhập / số buổi"
                    bieuTuong="average"
                    mau="violet"
                    dangTai={dangTai}
                />
                <TheThongKe
                    tieuDe="Môn thu nhập cao nhất"
                    giaTri={monCaoNhat?.tenMon || "—"}
                    phuDe={monCaoNhat ? `${monCaoNhat.soBuoi} buổi · ${dinhDangTien(monCaoNhat.tongThuNhap)}` : "Chưa có buổi học hoàn thành"}
                    bieuTuong="star"
                    mau="amber"
                    dangTai={dangTai}
                />
            </div>

            <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#101d43] to-[#0b1533] shadow-2xl shadow-black/20">
                <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div>
                        <h2 className="text-lg font-extrabold">Biểu đồ thu nhập</h2>
                        <p className="mt-1 text-xs text-white/45">
                            {cauHinh.moTaBieuDo}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                        Thu nhập thực nhận
                    </div>
                </div>

                <BieuDoCot duLieu={bieuDo} dangTai={dangTai} />
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/10">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Chi tiết buổi học
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Các buổi học đã hoàn thành trong {cauHinh.nhanThoiGian}.
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

                <div className="hidden grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr] gap-4 bg-slate-50 px-7 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:grid">
                    <span>Thời gian</span>
                    <span>Học viên</span>
                    <span>Môn học</span>
                    <span>Loại buổi</span>
                    <span className="text-right">Thu nhập</span>
                </div>

                {dangTai ? (
                    <TrangThaiBang noiDung="Đang tải dữ liệu thu nhập..." />
                ) : chiTiet.length === 0 ? (
                    <TrangThaiBang noiDung="Chưa có buổi học hoàn thành trong thời gian này." />
                ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                        {chiTiet.map((dong) => (
                            <DongThuNhap key={dong.id} dong={dong} />
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-slate-500">
                        Hiển thị <span className="font-bold text-slate-800">{chiTiet.length}</span>{" "}
                        buổi học
                    </p>
                    <p className="font-bold text-blue-600">
                        Tổng: {dinhDangTien(tongQuan.tongThuNhap)}
                    </p>
                </div>
            </section>

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
        <div className="px-4 pb-6 pt-7 sm:px-7">
            <div className="flex h-72 gap-3 sm:gap-5">
                <div className="flex w-16 shrink-0 flex-col justify-between pb-8 text-right text-[10px] text-white/30">
                    <span>{dinhDangTien(mocCaoNhat)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.75)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.5)}</span>
                    <span>{dinhDangTien(mocCaoNhat * 0.25)}</span>
                    <span>0đ</span>
                </div>

                <div className="relative min-w-0 flex-1">
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[244px] flex-col justify-between">
                        {[1, 2, 3, 4, 5].map((dong) => (
                            <span
                                key={dong}
                                className="block border-t border-dashed border-white/10"
                            />
                        ))}
                    </div>

                    {dangTai ? (
                        <KhungBieuDoRong noiDung="Đang tải dữ liệu biểu đồ..." />
                    ) : duLieuCoTien.length === 0 ? (
                        <KhungBieuDoRong noiDung="Chưa có dữ liệu biểu đồ" />
                    ) : (
                        <div className="relative flex h-full items-end gap-2 overflow-x-auto pb-8">
                            {duLieu.map((cot) => {
                                const thuNhap = Number(cot.thuNhap) || 0;
                                const chieuCao = Math.max((thuNhap / mocCaoNhat) * 100, thuNhap > 0 ? 8 : 0);

                                return (
                                    <div
                                        key={cot.nhan}
                                        className="flex h-full min-w-10 flex-1 flex-col justify-end gap-2"
                                        title={`${cot.nhan}: ${dinhDangTien(thuNhap)}`}
                                    >
                                        <div className="flex h-[244px] items-end">
                                            <div
                                                className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-300 shadow-lg shadow-blue-950/20"
                                                style={{ height: `${chieuCao}%` }}
                                            />
                                        </div>
                                        <span className="truncate text-center text-[10px] font-semibold text-white/40">
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

function DongThuNhap({ dong }) {
    return (
        <div className="grid gap-3 border-t border-slate-100 px-5 py-4 text-sm first:border-t-0 sm:px-7 lg:grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr] lg:items-center">
            <div>
                <p className="font-extrabold text-slate-900">{dong.thoiGian}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{dong.ma}</p>
            </div>
            <p className="font-bold text-slate-700">{dong.hocVien}</p>
            <p className="font-bold text-blue-600">{dong.monHoc}</p>
            <p className="text-slate-500">{dong.loaiBuoi}</p>
            <p className="text-right text-base font-extrabold text-emerald-600">
                {dinhDangTien(dong.thuNhap)}
            </p>
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
