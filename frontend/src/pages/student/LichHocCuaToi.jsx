import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const trangThaiGoi = {
    tat_ca: { ten: "Tất cả" },
    cho_xacnhan: {
        ten: "Chờ xác nhận",
        lop: "border-amber-200 bg-amber-50 text-amber-700",
    },
    cho_thanhtoan: {
        ten: "Chờ thanh toán",
        lop: "border-orange-200 bg-orange-50 text-orange-700",
    },
    dang_hoc: {
        ten: "Đang học",
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

const trangThaiBuoi = {
    cho_xacnhan: trangThaiGoi.cho_xacnhan,
    da_nhan: {
        ten: "Đã nhận",
        lop: "border-sky-200 bg-sky-50 text-sky-700",
    },
    hoan_thanh: trangThaiGoi.hoan_thanh,
    da_huy: trangThaiGoi.da_huy,
};

function dinhDangNgay(ngay) {
    if (!ngay) return "";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(ngay));
}

function dinhDangTien(soTien) {
    const giaTri = Number(soTien || 0);
    if (!giaTri) return "Chờ báo giá";

    return `${giaTri.toLocaleString("vi-VN")} đ`;
}

function NhanTrangThai({ trangThai, loai = "goi" }) {
    const cauHinh = loai === "buoi"
        ? trangThaiBuoi[trangThai] || trangThaiBuoi.cho_xacnhan
        : trangThaiGoi[trangThai] || trangThaiGoi.cho_xacnhan;

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${cauHinh.lop}`}>
            {cauHinh.ten}
        </span>
    );
}

function LichHocCuaToi() {
    const navigate = useNavigate();
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const [tab, setTab] = useState("tat_ca");
    const [danhSachGoi, setDanhSachGoi] = useState([]);
    const [goiDangMo, setGoiDangMo] = useState(null);
    const [dangTai, setDangTai] = useState(false);
    const [dangThanhToan, setDangThanhToan] = useState(false);
    const [goiThanhToan, setGoiThanhToan] = useState(null);
    const [formThanhToan, setFormThanhToan] = useState({
        phuong_thuc: "banking",
        ma_giaodich: "",
        noi_dung_thanhtoan: "",
    });
    const [thongBao, setThongBao] = useState("");

    const laHocVien = user?.vai_tro === "hocvien";

    const danhSachDaLoc = useMemo(() => {
        if (tab === "tat_ca") return danhSachGoi;
        return danhSachGoi.filter((goiHoc) => goiHoc.trangThai === tab);
    }, [danhSachGoi, tab]);

    const thongKe = useMemo(
        () => ({
            tat_ca: danhSachGoi.length,
            cho_xacnhan: danhSachGoi.filter((goiHoc) => goiHoc.trangThai === "cho_xacnhan").length,
            cho_thanhtoan: danhSachGoi.filter((goiHoc) => goiHoc.trangThai === "cho_thanhtoan").length,
            dang_hoc: danhSachGoi.filter((goiHoc) => goiHoc.trangThai === "dang_hoc").length,
            hoan_thanh: danhSachGoi.filter((goiHoc) => goiHoc.trangThai === "hoan_thanh").length,
            da_huy: danhSachGoi.filter((goiHoc) => goiHoc.trangThai === "da_huy").length,
        }),
        [danhSachGoi],
    );

    useEffect(() => {
        if (authLoading || !isAuthenticated || !laHocVien) return;

        let cancelled = false;
        const boDem = setTimeout(() => {
            setDangTai(true);

            api.get("/hoc-vien/lich-hoc")
                .then((response) => {
                    if (!cancelled && response.data.success) {
                        setDanhSachGoi(response.data.data || []);
                    }
                })
                .catch((error) => {
                    console.error("Không thể tải gói học của học viên:", error);
                    if (!cancelled) {
                        setThongBao(error.response?.data?.message || "Không thể tải gói học.");
                    }
                })
                .finally(() => {
                    if (!cancelled) setDangTai(false);
                });
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(boDem);
        };
    }, [authLoading, isAuthenticated, laHocVien]);

    const huyGoi = (goiHoc) => {
        const dongY = window.confirm(`Bạn muốn hủy gói ${goiHoc.ma}?`);
        if (!dongY) return;

        setDanhSachGoi((hienTai) =>
            hienTai.map((item) =>
                item.id === goiHoc.id ? { ...item, trangThai: "da_huy", coTheHuy: false } : item,
            ),
        );
        setThongBao("Đã ghi nhận yêu cầu hủy gói học.");
    };

    const moThanhToan = (goiHoc) => {
        setGoiThanhToan(goiHoc);
        setFormThanhToan({
            phuong_thuc: "banking",
            ma_giaodich: "",
            noi_dung_thanhtoan: `Thanh toan ${goiHoc.ma}`,
        });
        setThongBao("");
    };

    const dongThanhToan = () => {
        if (dangThanhToan) return;
        setGoiThanhToan(null);
    };

    const xacNhanThanhToan = async (event) => {
        event.preventDefault();
        if (!goiThanhToan) return;

        setDangThanhToan(true);
        setThongBao("");

        try {
            const response = await api.post(`/hoc-vien/goi-hoc/${goiThanhToan.id}/thanh-toan`, formThanhToan);

            if (response.data.success) {
                const goiMoi = response.data.data;
                setDanhSachGoi((hienTai) =>
                    hienTai.map((item) => (item.id === goiMoi.id ? goiMoi : item)),
                );
                setGoiThanhToan(null);
                setTab("dang_hoc");
                setThongBao(response.data.message || "Thanh toán thành công.");
            }
        } catch (error) {
            console.error("Không thể thanh toán gói học:", error);
            setThongBao(error.response?.data?.message || "Không thể thanh toán gói học.");
        } finally {
            setDangThanhToan(false);
        }
    };

    if (authLoading || dangTai) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-slate-950 px-6">
                <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80">
                    Đang tải gói học...
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !laHocVien) {
        return (
            <div className="bg-slate-100 px-6 py-16">
                <div className="mx-auto max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-6">
                    <h1 className="text-xl font-bold text-amber-950">Không thể truy cập gói học</h1>
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
                        <h1 className="mt-2 text-3xl font-bold">Gói học của tôi</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Theo dõi từng gói học đã đặt, trạng thái xác nhận và các buổi học nằm trong gói.
                        </p>
                    </div>

                    <Link
                        to="/gia-su"
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                        Đặt gói mới
                    </Link>
                </div>

                {thongBao && (
                    <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
                        {thongBao}
                    </div>
                )}

                <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
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
                            <div className="mt-1 text-sm font-semibold text-slate-500">{trangThaiGoi[key].ten}</div>
                        </button>
                    ))}
                </div>

                <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-lg font-bold">Danh sách gói học</h2>
                    </div>

                    {danhSachDaLoc.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <p className="text-base font-bold text-slate-900">Chưa có gói học phù hợp</p>
                            <p className="mt-2 text-sm text-slate-500">Bạn có thể đặt gói mới hoặc chọn trạng thái khác.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {danhSachDaLoc.map((goiHoc) => {
                                const dangMo = goiDangMo === goiHoc.id;

                                return (
                                    <article key={goiHoc.id} className="px-5 py-5">
                                        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-base font-bold text-slate-950">{goiHoc.mon}</h3>
                                                    <NhanTrangThai trangThai={goiHoc.trangThai} />
                                                </div>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {goiHoc.ma} · Gia sư {goiHoc.giaSu}
                                                </p>
                                            </div>

                                            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-1">
                                                <div>
                                                    <span className="font-bold text-slate-900">
                                                        {dinhDangNgay(goiHoc.ngayBatDau)} - {dinhDangNgay(goiHoc.ngayKetThuc)}
                                                    </span>
                                                </div>
                                                <div>
                                                    {goiHoc.soBuoiDaLenLich || goiHoc.soBuoi} / {goiHoc.soBuoi} buổi · {goiHoc.hinhThuc}
                                                </div>
                                                <div className="sm:col-span-2 lg:col-span-1">
                                                    Tổng tiền: {dinhDangTien(goiHoc.tongTien)}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 lg:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setGoiDangMo(dangMo ? null : goiHoc.id)}
                                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                                                >
                                                    {dangMo ? "Ẩn buổi học" : "Xem buổi học"}
                                                </button>
                                                {goiHoc.coTheHuy && (
                                                    <button
                                                        type="button"
                                                        onClick={() => huyGoi(goiHoc)}
                                                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                                    >
                                                        Hủy gói
                                                    </button>
                                                )}
                                                {goiHoc.coTheThanhToan && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moThanhToan(goiHoc)}
                                                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                                                    >
                                                        Thanh toán
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {dangMo && (
                                            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                                                <div className="grid grid-cols-[90px_minmax(0,1fr)_120px] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
                                                    <span>Mã buổi</span>
                                                    <span>Thời gian</span>
                                                    <span>Trạng thái</span>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {(goiHoc.lichHoc || []).map((lichHoc) => (
                                                        <div
                                                            key={lichHoc.id}
                                                            className="grid grid-cols-[90px_minmax(0,1fr)_120px] gap-3 px-4 py-3 text-sm"
                                                        >
                                                            <span className="font-semibold text-slate-700">{lichHoc.ma}</span>
                                                            <span className="text-slate-600">
                                                                {lichHoc.thu}, {dinhDangNgay(lichHoc.ngayHoc)} · {lichHoc.gioBatDau} - {lichHoc.gioKetThuc}
                                                            </span>
                                                            <NhanTrangThai trangThai={lichHoc.trangThai} loai="buoi" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {goiThanhToan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
                    <form
                        onSubmit={xacNhanThanhToan}
                        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold uppercase text-orange-600">Thanh toán gói học</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-950">{goiThanhToan.ma}</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Số tiền cần thanh toán: <span className="font-bold text-slate-900">{dinhDangTien(goiThanhToan.tongTien)}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={dongThanhToan}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Phương thức</span>
                                <select
                                    value={formThanhToan.phuong_thuc}
                                    onChange={(event) => setFormThanhToan((hienTai) => ({ ...hienTai, phuong_thuc: event.target.value }))}
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                                >
                                    <option value="banking">Chuyển khoản ngân hàng</option>
                                    <option value="momo">MoMo</option>
                                    <option value="zalopay">ZaloPay</option>
                                    <option value="tienmat">Tiền mặt</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Mã giao dịch</span>
                                <input
                                    value={formThanhToan.ma_giaodich}
                                    onChange={(event) => setFormThanhToan((hienTai) => ({ ...hienTai, ma_giaodich: event.target.value }))}
                                    placeholder="Nhập mã giao dịch nếu có"
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Nội dung thanh toán</span>
                                <textarea
                                    rows={3}
                                    value={formThanhToan.noi_dung_thanhtoan}
                                    onChange={(event) => setFormThanhToan((hienTai) => ({ ...hienTai, noi_dung_thanhtoan: event.target.value }))}
                                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={dongThanhToan}
                                disabled={dangThanhToan}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={dangThanhToan}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {dangThanhToan ? "Đang xử lý..." : "Xác nhận thanh toán"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default LichHocCuaToi;
