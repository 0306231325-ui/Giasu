import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const lichHocMau = [
    {
        id: 1,
        ma: "LH000001",
        mon: "Toán học",
        giaSu: "Nguyễn Minh Anh",
        ngayHoc: "2026-06-27",
        thu: "Thứ 7",
        gioBatDau: "18:00",
        gioKetThuc: "19:30",
        hinhThuc: "Online",
        diaDiem: "Google Meet",
        trangThai: "cho_xacnhan",
    },
    {
        id: 2,
        ma: "LH000002",
        mon: "Vật lý",
        giaSu: "Trần Quốc Huy",
        ngayHoc: "2026-06-30",
        thu: "Thứ 3",
        gioBatDau: "19:00",
        gioKetThuc: "20:30",
        hinhThuc: "Tại nhà",
        diaDiem: "Quận 5, TP.HCM",
        trangThai: "da_nhan",
    },
    {
        id: 3,
        ma: "LH000003",
        mon: "Tiếng Anh",
        giaSu: "Lê Hoàng Yến",
        ngayHoc: "2026-06-20",
        thu: "Thứ 7",
        gioBatDau: "15:00",
        gioKetThuc: "16:30",
        hinhThuc: "Online",
        diaDiem: "Zoom",
        trangThai: "hoan_thanh",
    },
];

const trangThaiLich = {
    tat_ca: { ten: "Tất cả" },
    cho_xacnhan: {
        ten: "Chờ xác nhận",
        lop: "border-amber-200 bg-amber-50 text-amber-700",
    },
    da_nhan: {
        ten: "Đã nhận",
        lop: "border-sky-200 bg-sky-50 text-sky-700",
    },
    hoan_thanh: {
        ten: "Hoàn thành",
        lop: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    da_huy: {
        ten: "Đã hủy",
        lop: "border-slate-200 bg-slate-100 text-slate-600",
    },
};

function dinhDangNgay(ngay) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(ngay));
}

function NhanTrangThai({ trangThai }) {
    const cauHinh = trangThaiLich[trangThai] || trangThaiLich.cho_xacnhan;

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${cauHinh.lop}`}>
            {cauHinh.ten}
        </span>
    );
}

function LichHocCuaToi() {
    const navigate = useNavigate();
    const { user, loading, isAuthenticated } = useAuth();
    const [tab, setTab] = useState("tat_ca");
    const [danhSachLich, setDanhSachLich] = useState(lichHocMau);
    const [thongBao, setThongBao] = useState("");

    const laHocVien = user?.vai_tro === "hocvien";

    const danhSachDaLoc = useMemo(() => {
        if (tab === "tat_ca") return danhSachLich;
        return danhSachLich.filter((lichHoc) => lichHoc.trangThai === tab);
    }, [danhSachLich, tab]);

    const thongKe = useMemo(
        () => ({
            tat_ca: danhSachLich.length,
            cho_xacnhan: danhSachLich.filter((lichHoc) => lichHoc.trangThai === "cho_xacnhan").length,
            da_nhan: danhSachLich.filter((lichHoc) => lichHoc.trangThai === "da_nhan").length,
            hoan_thanh: danhSachLich.filter((lichHoc) => lichHoc.trangThai === "hoan_thanh").length,
        }),
        [danhSachLich],
    );

    const huyLich = (lichHoc) => {
        const dongY = window.confirm(`Bạn muốn hủy lịch ${lichHoc.ma}?`);
        if (!dongY) return;

        setDanhSachLich((hienTai) =>
            hienTai.map((item) =>
                item.id === lichHoc.id ? { ...item, trangThai: "da_huy" } : item,
            ),
        );
        setThongBao("Đã ghi nhận yêu cầu hủy lịch học.");
    };

    const doiLich = (lichHoc) => {
        setThongBao(`Đã chọn lịch ${lichHoc.ma}. Khi nối API, màn hình này sẽ mở form đổi ngày và giờ học.`);
    };

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-slate-950 px-6">
                <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80">
                    Đang tải lịch học...
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !laHocVien) {
        return (
            <div className="bg-slate-100 px-6 py-16">
                <div className="mx-auto max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-6">
                    <h1 className="text-xl font-bold text-amber-950">Không thể truy cập lịch học</h1>
                    <p className="mt-2 text-sm text-amber-800">Khu vực này chỉ dành cho tài khoản học viên.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mt-5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 px-6 py-10 text-slate-950">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase text-sky-600">Học viên</p>
                        <h1 className="mt-2 text-3xl font-bold">Lịch học của tôi</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Theo dõi các buổi học đã đặt, trạng thái xác nhận và thao tác đổi hoặc hủy lịch khi cần.
                        </p>
                    </div>

                    <Link
                        to="/gia-su"
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                        Đặt lịch mới
                    </Link>
                </div>

                {thongBao && (
                    <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
                        {thongBao}
                    </div>
                )}

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                    {Object.entries(thongKe).map(([key, value]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`rounded-lg border bg-white p-4 text-left shadow-sm transition ${
                                tab === key ? "border-sky-400 ring-4 ring-sky-100" : "border-slate-200 hover:border-sky-200"
                            }`}
                        >
                            <div className="text-2xl font-bold">{value}</div>
                            <div className="mt-1 text-sm font-semibold text-slate-500">{trangThaiLich[key].ten}</div>
                        </button>
                    ))}
                </div>

                <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-lg font-bold">Danh sách lịch học</h2>
                    </div>

                    {danhSachDaLoc.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <p className="text-base font-bold text-slate-900">Chưa có lịch học phù hợp</p>
                            <p className="mt-2 text-sm text-slate-500">Bạn có thể đặt lịch mới hoặc chọn trạng thái khác.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {danhSachDaLoc.map((lichHoc) => (
                                <article key={lichHoc.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-base font-bold text-slate-950">{lichHoc.mon}</h3>
                                            <NhanTrangThai trangThai={lichHoc.trangThai} />
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {lichHoc.ma} · Gia sư {lichHoc.giaSu}
                                        </p>
                                    </div>

                                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-1">
                                        <div>
                                            <span className="font-bold text-slate-900">{lichHoc.thu}, {dinhDangNgay(lichHoc.ngayHoc)}</span>
                                        </div>
                                        <div>
                                            {lichHoc.gioBatDau} - {lichHoc.gioKetThuc} · {lichHoc.hinhThuc}
                                        </div>
                                        <div className="sm:col-span-2 lg:col-span-1">{lichHoc.diaDiem}</div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {lichHoc.trangThai !== "hoan_thanh" && lichHoc.trangThai !== "da_huy" && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => doiLich(lichHoc)}
                                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                                                >
                                                    Đổi lịch
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => huyLich(lichHoc)}
                                                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                                >
                                                    Hủy lịch
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default LichHocCuaToi;
