import { useState } from "react";

function GiaSuTheoDoiHoatDong() {
    const [boLocDanhGia, setBoLocDanhGia] = useState("");
    const [boLocThoiGian, setBoLocThoiGian] = useState("tat_ca");

    return (
        <div className="mx-auto max-w-7xl pb-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Theo dõi hoạt động
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                        Xem lại đánh giá, phản hồi của học viên sau các buổi học
                        đã hoàn thành để theo dõi chất lượng giảng dạy.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                    {[
                        ["tat_ca", "Tất cả"],
                        ["7_ngay", "7 ngày"],
                        ["30_ngay", "30 ngày"],
                        ["nam_nay", "Năm nay"],
                    ].map(([giaTri, nhan]) => (
                        <button
                            key={giaTri}
                            type="button"
                            onClick={() => setBoLocThoiGian(giaTri)}
                            className={[
                                "rounded-xl px-4 py-2 text-sm font-bold transition",
                                boLocThoiGian === giaTri
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                    : "text-white/55 hover:bg-white/5 hover:text-white",
                            ].join(" ")}
                        >
                            {nhan}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TheThongKe
                    nhan="Điểm trung bình"
                    giaTri="—"
                    phuDe="Chưa có đánh giá"
                    bieuTuong="star"
                    mau="amber"
                />
                <TheThongKe
                    nhan="Tổng phản hồi"
                    giaTri="0"
                    phuDe="Từ học viên"
                    bieuTuong="message"
                    mau="blue"
                />
                <TheThongKe
                    nhan="Đánh giá tích cực"
                    giaTri="0"
                    phuDe="Từ 4 sao trở lên"
                    bieuTuong="check"
                    mau="emerald"
                />
                <TheThongKe
                    nhan="Đánh giá tiêu cực"
                    giaTri="0"
                    phuDe="Dưới 4 sao hoặc có góp ý"
                    bieuTuong="alert"
                    mau="red"
                />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/10">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-950">
                                Đánh giá và phản hồi
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Danh sách phản hồi học viên gửi sau buổi học.
                            </p>
                        </div>
                        <select
                            value={boLocDanhGia}
                            onChange={(event) =>
                                setBoLocDanhGia(event.target.value)
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="">Tất cả số sao</option>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="duoi_3">Dưới 3 sao</option>
                        </select>
                    </div>

                    <div className="hidden grid-cols-[1fr_1.15fr_0.8fr_0.7fr] gap-4 bg-slate-50 px-7 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:grid">
                        <span>Buổi học</span>
                        <span>Phản hồi học viên</span>
                        <span>Môn học</span>
                        <span className="text-right">Đánh giá</span>
                    </div>

                    <TrangThaiRong />
                </section>

                <aside className="space-y-5">
                    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-extrabold">
                                    Phân bố đánh giá
                                </h2>
                                <p className="mt-1 text-xs text-white/40">
                                    Tỷ lệ sao từ phản hồi học viên.
                                </p>
                            </div>
                            <span className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
                                <BieuTuong ten="star" />
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {[5, 4, 3, 2, 1].map((soSao) => (
                                <div
                                    key={soSao}
                                    className="grid grid-cols-[48px_minmax(0,1fr)_32px] items-center gap-3 text-sm"
                                >
                                    <span className="font-bold text-white/70">
                                        {soSao} sao
                                    </span>
                                    <span className="h-2 overflow-hidden rounded-full bg-white/10">
                                        <span className="block h-full w-0 rounded-full bg-amber-400" />
                                    </span>
                                    <span className="text-right text-white/35">
                                        0
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5 text-blue-100">
                        <div className="flex gap-3">
                            <span className="mt-0.5 shrink-0 text-blue-200">
                                <BieuTuong ten="info" />
                            </span>
                            <div>
                                <h3 className="font-extrabold">
                                    Thu Thập Ý Kiến Của Các Học Viên!
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-blue-100/75">
                                   Cùng Cải Thiện Nhé 
                                </p>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function TheThongKe({ nhan, giaTri, phuDe, bieuTuong, mau }) {
    const mauSac = {
        amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        blue: "border-blue-400/20 bg-blue-400/10 text-blue-300",
        emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        red: "border-red-400/20 bg-red-400/10 text-red-300",
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-white/45">
                        {nhan}
                    </p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
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

function TrangThaiRong() {
    return (
        <div className="px-5 py-14 text-center sm:px-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BieuTuong ten="message" />
            </div>
            <p className="mt-4 text-sm font-extrabold text-slate-800">
                Chưa có phản hồi từ học viên
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Khi học viên đánh giá sau buổi
                học hoàn thành, nội dung phản hồi sẽ hiển thị tại đây.
            </p>
        </div>
    );
}

function BieuTuong({ ten }) {
    const duongNet = {
        star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
        message: <><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 1 1 21 12Z" /><path d="M8 11h8M8 15h5" /></>,
        check: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>,
        alert: <><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
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

export default GiaSuTheoDoiHoatDong;
