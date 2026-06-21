import { useState } from "react";

const duLieuTheoBoLoc = {
    ngay: {
        nhanThoiGian: "19 tháng 06, 2026",
        loaiInput: "date",
        giaTriInput: "2026-06-19",
        tongThuNhap: "1.180.000đ",
        soBuoi: "4",
        trungBinh: "295.000đ",
        monNoiBat: "Toán học",
        moTaBieuDo: "Thu nhập theo từng buổi trong ngày",
        cot: [
            { nhan: "08:00", giaTri: 220000 },
            { nhan: "10:00", giaTri: 280000 },
            { nhan: "14:00", giaTri: 320000 },
            { nhan: "19:00", giaTri: 360000 },
        ],
    },
    thang: {
        nhanThoiGian: "Tháng 06, 2026",
        loaiInput: "month",
        giaTriInput: "2026-06",
        tongThuNhap: "8.650.000đ",
        soBuoi: "29",
        trungBinh: "298.000đ",
        monNoiBat: "Toán học",
        moTaBieuDo: "Thu nhập theo ngày trong tháng",
        cot: [
            { nhan: "01", giaTri: 680000 },
            { nhan: "04", giaTri: 950000 },
            { nhan: "07", giaTri: 520000 },
            { nhan: "10", giaTri: 1250000 },
            { nhan: "13", giaTri: 840000 },
            { nhan: "16", giaTri: 1080000 },
            { nhan: "19", giaTri: 1180000 },
            { nhan: "22", giaTri: 760000 },
            { nhan: "25", giaTri: 930000 },
            { nhan: "28", giaTri: 460000 },
        ],
    },
    nam: {
        nhanThoiGian: "Năm 2026",
        loaiInput: "number",
        giaTriInput: "2026",
        tongThuNhap: "48.720.000đ",
        soBuoi: "164",
        trungBinh: "297.000đ",
        monNoiBat: "Toán học",
        moTaBieuDo: "Thu nhập theo từng tháng trong năm",
        cot: [
            { nhan: "T1", giaTri: 2900000 },
            { nhan: "T2", giaTri: 3250000 },
            { nhan: "T3", giaTri: 4100000 },
            { nhan: "T4", giaTri: 3680000 },
            { nhan: "T5", giaTri: 4420000 },
            { nhan: "T6", giaTri: 8650000 },
            { nhan: "T7", giaTri: 5300000 },
            { nhan: "T8", giaTri: 4750000 },
            { nhan: "T9", giaTri: 3910000 },
            { nhan: "T10", giaTri: 3300000 },
            { nhan: "T11", giaTri: 2550000 },
            { nhan: "T12", giaTri: 3610000 },
        ],
    },
};

const cacBuoiHoc = [
    {
        id: 1,
        ngay: "19/06/2026",
        gio: "19:00 – 20:30",
        hocVien: "Nguyễn Hoàng Nam",
        mon: "Toán học",
        capHoc: "THPT",
        loaiBuoi: "Buổi chính",
        soTien: "360.000đ",
    },
    {
        id: 2,
        ngay: "19/06/2026",
        gio: "14:00 – 15:30",
        hocVien: "Trần Minh Thư",
        mon: "Vật lý",
        capHoc: "THPT",
        loaiBuoi: "Buổi chính",
        soTien: "320.000đ",
    },
    {
        id: 3,
        ngay: "19/06/2026",
        gio: "10:00 – 11:00",
        hocVien: "Lê Quốc Bảo",
        mon: "Toán học",
        capHoc: "THCS",
        loaiBuoi: "Học bù",
        soTien: "280.000đ",
    },
    {
        id: 4,
        ngay: "19/06/2026",
        gio: "08:00 – 09:00",
        hocVien: "Phạm Gia Hân",
        mon: "Toán học",
        capHoc: "THCS",
        loaiBuoi: "Buổi chính",
        soTien: "220.000đ",
    },
];

function GiaSuThuNhap() {
    const [boLoc, setBoLoc] = useState("thang");
    const duLieu = duLieuTheoBoLoc[boLoc];

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
                                onClick={() => setBoLoc(giaTri)}
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
                            key={duLieu.giaTriInput}
                            type={duLieu.loaiInput}
                            defaultValue={duLieu.giaTriInput}
                            min={boLoc === "nam" ? "2020" : undefined}
                            max={boLoc === "nam" ? "2030" : undefined}
                            className="h-11 w-full rounded-xl border border-white/10 bg-[#101a39] px-4 text-sm font-semibold text-white outline-none transition focus:border-blue-400 sm:w-48"
                        />
                    </label>
                </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TheThongKe
                    tieuDe="Tổng thu nhập"
                    giaTri={duLieu.tongThuNhap}
                    phuDe={duLieu.nhanThoiGian}
                    bieuTuong="wallet"
                    mau="blue"
                />
                <TheThongKe
                    tieuDe="Buổi đã hoàn thành"
                    giaTri={duLieu.soBuoi}
                    phuDe="Chỉ tính buổi hoàn thành"
                    bieuTuong="calendar"
                    mau="emerald"
                />
                <TheThongKe
                    tieuDe="Trung bình mỗi buổi"
                    giaTri={duLieu.trungBinh}
                    phuDe="Dựa trên khoảng đã chọn"
                    bieuTuong="average"
                    mau="violet"
                />
                <TheThongKe
                    tieuDe="Môn thu nhập cao nhất"
                    giaTri={duLieu.monNoiBat}
                    phuDe="Chiếm khoảng 58% thu nhập"
                    bieuTuong="star"
                    mau="amber"
                />
            </div>

            <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#101d43] to-[#0b1533] shadow-2xl shadow-black/20">
                <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div>
                        <h2 className="text-lg font-extrabold">Biểu đồ thu nhập</h2>
                        <p className="mt-1 text-xs text-white/45">
                            {duLieu.moTaBieuDo}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                        Thu nhập thực nhận
                    </div>
                </div>

                <BieuDoCot cacCot={duLieu.cot} />
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/10">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Chi tiết buổi học
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Các buổi học đã hoàn thành trong {duLieu.nhanThoiGian.toLowerCase()}.
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

                <div>
                    {cacBuoiHoc.map((buoiHoc) => (
                        <DongBuoiHoc key={buoiHoc.id} buoiHoc={buoiHoc} />
                    ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-slate-500">
                        Hiển thị <span className="font-bold text-slate-800">4</span>{" "}
                        buổi học gần nhất
                    </p>
                    <button
                        type="button"
                        className="font-bold text-blue-600 transition hover:text-blue-700"
                    >
                        Xem tất cả buổi học
                    </button>
                </div>
            </section>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-100">
                <span className="mt-0.5 shrink-0 text-blue-300">
                    <BieuTuong ten="info" />
                </span>
                <p className="leading-6">
                    Thu nhập chỉ được ghi nhận từ những buổi học đã hoàn thành.
                    Các buổi bị hủy hoặc chưa diễn ra không được tính vào báo cáo.
                </p>
            </div>
        </div>
    );
}

function BieuDoCot({ cacCot }) {
    const giaTriLonNhat = Math.max(...cacCot.map((cot) => cot.giaTri));

    return (
        <div className="px-4 pb-6 pt-7 sm:px-7">
            <div className="flex h-72 gap-3 sm:gap-5">
                <div className="flex w-12 shrink-0 flex-col justify-between pb-7 text-right text-[10px] text-white/30">
                    <span>{dinhDangTrucTien(giaTriLonNhat)}</span>
                    <span>{dinhDangTrucTien(giaTriLonNhat * 0.75)}</span>
                    <span>{dinhDangTrucTien(giaTriLonNhat * 0.5)}</span>
                    <span>{dinhDangTrucTien(giaTriLonNhat * 0.25)}</span>
                    <span>0</span>
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

                    <div className="relative flex h-full items-end justify-around gap-2 overflow-x-auto pb-7">
                        {cacCot.map((cot) => {
                            const chieuCao = Math.max(
                                8,
                                (cot.giaTri / giaTriLonNhat) * 100,
                            );

                            return (
                                <div
                                    key={cot.nhan}
                                    className="group flex h-full min-w-8 flex-1 flex-col items-center justify-end"
                                >
                                    <div className="relative flex h-[244px] w-full items-end justify-center">
                                        <div
                                            className="relative w-full max-w-11 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 shadow-lg shadow-blue-950/30 transition duration-300 group-hover:from-blue-500 group-hover:to-cyan-300"
                                            style={{ height: `${chieuCao}%` }}
                                        >
                                            <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-800 shadow-lg group-hover:block">
                                                {Number(cot.giaTri).toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                    </div>
                                    <span className="mt-2 text-[10px] font-semibold text-white/45 sm:text-xs">
                                        {cot.nhan}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TheThongKe({ tieuDe, giaTri, phuDe, bieuTuong, mau }) {
    const mauSac = {
        blue: "bg-blue-500/15 text-blue-300 border-blue-400/20",
        emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
        violet: "bg-violet-500/15 text-violet-300 border-violet-400/20",
        amber: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-white/45">{tieuDe}</p>
                    <p className="mt-3 text-2xl font-extrabold tracking-tight text-white">
                        {giaTri}
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

function DongBuoiHoc({ buoiHoc }) {
    return (
        <div className="grid gap-4 border-t border-slate-100 px-5 py-5 first:border-t-0 lg:grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr] lg:items-center lg:px-7">
            <div>
                <p className="text-sm font-bold text-slate-900">{buoiHoc.ngay}</p>
                <p className="mt-1 text-xs text-slate-500">{buoiHoc.gio}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-600">
                    {layChuCaiDau(buoiHoc.hocVien)}
                </span>
                <p className="text-sm font-semibold text-slate-800">
                    {buoiHoc.hocVien}
                </p>
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">{buoiHoc.mon}</p>
                <p className="mt-1 text-xs text-slate-500">{buoiHoc.capHoc}</p>
            </div>
            <div>
                <span
                    className={[
                        "inline-flex rounded-full px-3 py-1.5 text-xs font-bold",
                        buoiHoc.loaiBuoi === "Học bù"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700",
                    ].join(" ")}
                >
                    {buoiHoc.loaiBuoi}
                </span>
            </div>
            <p className="text-lg font-extrabold text-blue-600 lg:text-right">
                {buoiHoc.soTien}
            </p>
        </div>
    );
}

function dinhDangTrucTien(giaTri) {
    if (giaTri >= 1000000) {
        return `${(giaTri / 1000000).toFixed(1).replace(".0", "")}tr`;
    }

    return `${Math.round(giaTri / 1000)}k`;
}

function layChuCaiDau(hoTen) {
    return hoTen
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((tu) => tu.charAt(0).toUpperCase())
        .join("");
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
