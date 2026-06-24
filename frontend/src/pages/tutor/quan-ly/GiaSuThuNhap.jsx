import { useState } from "react";

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

function GiaSuThuNhap() {
    const [boLoc, setBoLoc] = useState("thang");
    const cauHinh = cauHinhBoLoc[boLoc];

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
                            type={cauHinh.loaiInput}
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

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TheThongKe
                    tieuDe="Tổng thu nhập"
                    giaTri="0đ"
                    phuDe="Chưa có dữ liệu từ backend"
                    bieuTuong="wallet"
                    mau="blue"
                />
                <TheThongKe
                    tieuDe="Buổi đã hoàn thành"
                    giaTri="0"
                    phuDe="Chờ kết nối dữ liệu lịch học"
                    bieuTuong="calendar"
                    mau="emerald"
                />
                <TheThongKe
                    tieuDe="Trung bình mỗi buổi"
                    giaTri="0đ"
                    phuDe="Sẽ tính theo bộ lọc đã chọn"
                    bieuTuong="average"
                    mau="violet"
                />
                <TheThongKe
                    tieuDe="Môn thu nhập cao nhất"
                    giaTri="—"
                    phuDe="Chưa có buổi học hoàn thành"
                    bieuTuong="star"
                    mau="amber"
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

                <BieuDoCot />
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

                <div className="px-5 py-12 text-center sm:px-7">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <BieuTuong ten="wallet" />
                    </div>
                    
                   
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-slate-500">
                        Hiển thị <span className="font-bold text-slate-800">0</span>{" "}
                        buổi học
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

function BieuDoCot() {
    return (
        <div className="px-4 pb-6 pt-7 sm:px-7">
            <div className="flex h-72 gap-3 sm:gap-5">
                <div className="flex w-12 shrink-0 flex-col justify-between pb-7 text-right text-[10px] text-white/30">
                    <span>0đ</span>
                    <span>0đ</span>
                    <span>0đ</span>
                    <span>0đ</span>
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

                    <div className="relative flex h-full items-center justify-center pb-7">
                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-5 text-center">
                            <p className="text-sm font-extrabold text-white">
                                Chưa có dữ liệu biểu đồ
                            </p>
                            
                        </div>
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
