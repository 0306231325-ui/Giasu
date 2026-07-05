import { useCallback, useEffect, useMemo, useState } from "react";
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

const trangThaiThanhToan = {
    cho_thanhtoan: {
        ten: "Chờ duyệt",
        lop: "border-amber-200 bg-amber-50 text-amber-700",
    },
    da_thanhtoan: {
        ten: "Đã thanh toán",
        lop: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    that_bai: {
        ten: "Thất bại",
        lop: "border-red-200 bg-red-50 text-red-700",
    },
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

function dinhDangMonVaLop(goiHoc) {
    const mon = goiHoc.mon || "Môn học";
    const lop = String(goiHoc.lop || "").trim();

    if (!lop) return mon;

    const lopHienThi = lop.toLowerCase().startsWith("lớp") ? lop : `Lớp ${lop}`;

    return `${mon} - ${lopHienThi}`;
}

function nhanLoaiGoi(goiHoc) {
    if (goiHoc.loaiGoi) return goiHoc.loaiGoi;
    if (goiHoc.hocDinhKy) return "Gói học định kỳ";

    return Number(goiHoc.soBuoi) === 1 ? "Gói học thử" : "Gói học không định kỳ";
}

function layThongDiepLoi(error, fallback) {
    const duLieu = error.response?.data;
    const loiDauTien = duLieu?.errors ? Object.values(duLieu.errors)[0]?.[0] : null;
    const thongDiep = loiDauTien || duLieu?.message || fallback;

    return String(thongDiep)
        .replace("The ly do field is required.", "Vui lòng nhập lý do đổi buổi.")
        .replace("The ngay hoc field is required.", "Vui lòng chọn ngày học mới.")
        .replace("The gio batdau field is required.", "Vui lòng chọn giờ bắt đầu.")
        .replace("The gio ketthuc field is required.", "Vui lòng chọn giờ kết thúc.")
        .replace("The anh minh chung field is required.", "Vui lòng tải ảnh minh chứng giao dịch.")
        .replace("The anh minh chung must be an image.", "Minh chứng giao dịch phải là hình ảnh.")
        .replace("The anh minh chung must not be greater than 4096 kilobytes.", "Ảnh minh chứng không được vượt quá 4MB.")
        .replace("The ghi chu field is required when trang thai is baovan de.", "Vui lòng nhập nội dung vấn đề.");
}

const ngayHomNay = () => {
    const vnTimeString = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    return vnTimeString.slice(0, 10);
};

const taoDanhSachKhungGio = () => {
    const danhSach = [];
    for (let h = 7; h <= 21; h++) {
        danhSach.push(`${String(h).padStart(2, "0")}:00`);
        if (h < 21) {
            danhSach.push(`${String(h).padStart(2, "0")}:30`);
        }
    }
    return danhSach;
};
const cacKhungGio = taoDanhSachKhungGio();

const taoMaGiaoDich = (maGoi) => `GD${Date.now()}${String(maGoi || "").replace(/\D/g, "").slice(-6)}`;
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

function layUrlMinhChung(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;

    return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
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

function NhanTrangThaiThanhToan({ trangThai }) {
    const cauHinh = trangThaiThanhToan[trangThai] || trangThaiThanhToan.cho_thanhtoan;

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${cauHinh.lop}`}>
            {cauHinh.ten}
        </span>
    );
}

function LichHocCuaToi() {
    const navigate = useNavigate();
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const [manHinh, setManHinh] = useState("goi_hoc");
    const [tab, setTab] = useState("tat_ca");
    const [danhSachGoi, setDanhSachGoi] = useState([]);
    const [lichSuThanhToan, setLichSuThanhToan] = useState([]);
    const [goiDangMo, setGoiDangMo] = useState(null);
    const [dangTai, setDangTai] = useState(false);
    const [dangThanhToan, setDangThanhToan] = useState(false);
    const [goiThanhToan, setGoiThanhToan] = useState(null);
    const [dangHuyGoiId, setDangHuyGoiId] = useState(null);
    const [formThanhToan, setFormThanhToan] = useState({
        phuong_thuc: "banking",
        ma_giaodich: "",
        noi_dung_thanhtoan: "",
        anh_minh_chung: null,
    });
    const [chiTietBuoi, setChiTietBuoi] = useState(null);
    const [dangGuiDanhGia, setDangGuiDanhGia] = useState(false);
    const [dangGuiDoiBuoi, setDangGuiDoiBuoi] = useState(false);
    const [dangGuiXacNhanBuoi, setDangGuiXacNhanBuoi] = useState(false);
    const [formDanhGia, setFormDanhGia] = useState({
        so_sao: 5,
        noi_dung: "",
    });
    const [formXacNhanBuoi, setFormXacNhanBuoi] = useState({
        trang_thai: "daxacnhan",
        ghi_chu: "",
    });
    const [formDoiBuoi, setFormDoiBuoi] = useState({
        ngay_hoc: ngayHomNay(),
        gio_batdau: "18:00",
        gio_ketthuc: "19:30",
        ly_do: "",
    });
    const [thongBao, setThongBao] = useState("");

    const laHocVien = user?.vai_tro === "hocvien";

    const taiLichSuThanhToan = useCallback(async () => {
        const response = await api.get("/hoc-vien/thanh-toan");
        if (response.data.success) {
            setLichSuThanhToan(response.data.data || []);
        }
    }, []);

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

    const thongKeThanhToan = useMemo(
        () => ({
            tat_ca: lichSuThanhToan.length,
            da_thanhtoan: lichSuThanhToan.filter((item) => item.trangThai === "da_thanhtoan").length,
            cho_thanhtoan: lichSuThanhToan.filter((item) => item.trangThai === "cho_thanhtoan").length,
            that_bai: lichSuThanhToan.filter((item) => item.trangThai === "that_bai").length,
            tongDaThanhToan: lichSuThanhToan
                .filter((item) => item.trangThai === "da_thanhtoan")
                .reduce((tong, item) => tong + Number(item.soTien || 0), 0),
        }),
        [lichSuThanhToan],
    );

    useEffect(() => {
        if (authLoading || !isAuthenticated || !laHocVien) return;

        let cancelled = false;
        const boDem = setTimeout(() => {
            setDangTai(true);

            Promise.all([
                api.get("/hoc-vien/lich-hoc"),
                api.get("/hoc-vien/thanh-toan"),
            ])
                .then(([lichHocResponse, thanhToanResponse]) => {
                    if (cancelled) return;

                    if (lichHocResponse.data.success) {
                        setDanhSachGoi(lichHocResponse.data.data || []);
                    }

                    if (thanhToanResponse.data.success) {
                        setLichSuThanhToan(thanhToanResponse.data.data || []);
                    }
                })
                .catch((error) => {
                    console.error("Không thể tải gói học của học viên:", error);
                    if (!cancelled) {
                        setThongBao(layThongDiepLoi(error, "Không thể tải lịch học."));
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

    useEffect(() => {
        if (!thongBao) return;

        const boDem = setTimeout(() => {
            setThongBao("");
        }, 3000);

        return () => clearTimeout(boDem);
    }, [thongBao]);

    const huyGoi = async (goiHoc) => {
        const dongY = window.confirm(`Bạn muốn hủy gói ${goiHoc.ma}?`);
        if (!dongY) return;

        setDangHuyGoiId(goiHoc.id);
        setThongBao("");

        try {
            const response = await api.patch(`/hoc-vien/goi-hoc/${goiHoc.id}/huy`);
            const goiMoi = response.data.data;

            setDanhSachGoi((hienTai) =>
                hienTai.map((item) =>
                    item.id === goiHoc.id ? goiMoi : item,
                ),
            );
            setThongBao(response.data.message || "Da huy goi hoc.");
        } catch (error) {
            console.error("Khong the huy goi hoc:", error);
            setThongBao(layThongDiepLoi(error, "Khong the huy goi hoc."));
        } finally {
            setDangHuyGoiId(null);
        }
    };

    /*

        setDanhSachGoi((hienTai) =>
            hienTai.map((item) =>
                item.id === goiHoc.id ? { ...item, trangThai: "da_huy", coTheHuy: false } : item,
            ),
        );
        setThongBao("Đã ghi nhận yêu cầu hủy gói học.");
    };

    */

    const moThanhToan = (goiHoc) => {
        setGoiThanhToan(goiHoc);
        setFormThanhToan({
            phuong_thuc: "banking",
            ma_giaodich: taoMaGiaoDich(goiHoc.ma),
            noi_dung_thanhtoan: `Thanh toan ${goiHoc.ma}`,
            anh_minh_chung: null,
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
            const duLieuGui = new FormData();
            duLieuGui.append("phuong_thuc", formThanhToan.phuong_thuc);
            duLieuGui.append("ma_giaodich", formThanhToan.ma_giaodich);
            duLieuGui.append("noi_dung_thanhtoan", formThanhToan.noi_dung_thanhtoan);

            if (formThanhToan.anh_minh_chung) {
                duLieuGui.append("anh_minh_chung", formThanhToan.anh_minh_chung);
            }

            const response = await api.post(`/hoc-vien/goi-hoc/${goiThanhToan.id}/thanh-toan`, duLieuGui, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                const goiMoi = response.data.data;
                setDanhSachGoi((hienTai) =>
                    hienTai.map((item) => (item.id === goiMoi.id ? goiMoi : item)),
                );
                await taiLichSuThanhToan();
                setGoiThanhToan(null);
                setTab("cho_thanhtoan");
                setManHinh("thanh_toan");
                setThongBao(response.data.message || "Thanh toán thành công.");
            }
        } catch (error) {
            console.error("Không thể thanh toán gói học:", error);
            setThongBao(layThongDiepLoi(error, "Không thể thanh toán gói học."));
        } finally {
            setDangThanhToan(false);
        }
    };

    const capNhatBuoiHoc = (lichHocId, capNhat) => {
        setDanhSachGoi((hienTai) =>
            hienTai.map((goiHoc) => ({
                ...goiHoc,
                lichHoc: (goiHoc.lichHoc || []).map((lichHoc) =>
                    lichHoc.id === lichHocId ? { ...lichHoc, ...capNhat } : lichHoc,
                ),
            })),
        );
        setChiTietBuoi((hienTai) =>
            hienTai?.lichHoc?.id === lichHocId
                ? { ...hienTai, lichHoc: { ...hienTai.lichHoc, ...capNhat } }
                : hienTai,
        );
    };

    const moChiTietBuoi = (goiHoc, lichHoc) => {
        setChiTietBuoi({ goiHoc, lichHoc });
        setFormDanhGia({
            so_sao: lichHoc.danhGia?.soSao || 5,
            noi_dung: lichHoc.danhGia?.noiDung || "",
        });
        setFormDoiBuoi({
            ngay_hoc: lichHoc.ngayHoc || ngayHomNay(),
            gio_batdau: lichHoc.gioBatDau || "18:00",
            gio_ketthuc: lichHoc.gioKetThuc || "19:30",
            ly_do: "",
        });
        setFormXacNhanBuoi({
            trang_thai: "daxacnhan",
            ghi_chu: "",
        });
        setThongBao("");
    };

    const guiDanhGia = async (event) => {
        event.preventDefault();
        if (!chiTietBuoi) return;

        setDangGuiDanhGia(true);
        setThongBao("");

        try {
            const response = await api.post(`/hoc-vien/lich-hoc/${chiTietBuoi.lichHoc.id}/danh-gia`, formDanhGia);

            if (response.data.success) {
                capNhatBuoiHoc(chiTietBuoi.lichHoc.id, { danhGia: response.data.data });
                setThongBao(response.data.message || "Đã lưu đánh giá.");
            }
        } catch (error) {
            console.error("Không thể gửi đánh giá:", error);
            setThongBao(layThongDiepLoi(error, "Không thể gửi đánh giá."));
        } finally {
            setDangGuiDanhGia(false);
        }
    };

    const guiYeuCauDoiBuoi = async (event) => {
        event.preventDefault();
        if (!chiTietBuoi) return;

        setDangGuiDoiBuoi(true);
        setThongBao("");

        try {
            const response = await api.post(`/hoc-vien/lich-hoc/${chiTietBuoi.lichHoc.id}/doi-buoi`, formDoiBuoi);

            if (response.data.success) {
                capNhatBuoiHoc(chiTietBuoi.lichHoc.id, {
                    yeuCauDoiBuoi: response.data.data,
                    coTheDoiBuoi: false,
                });
                setFormDoiBuoi((hienTai) => ({ ...hienTai, ly_do: "" }));
                setThongBao(response.data.message || "Đã gửi yêu cầu đổi buổi.");
            }
        } catch (error) {
            console.error("Không thể gửi yêu cầu đổi buổi:", error);
            setThongBao(layThongDiepLoi(error, "Không thể gửi yêu cầu đổi buổi."));
        } finally {
            setDangGuiDoiBuoi(false);
        }
    };

    const guiXacNhanBuoiHoc = async (event) => {
        event.preventDefault();
        if (!chiTietBuoi) return;

        setDangGuiXacNhanBuoi(true);
        setThongBao("");

        try {
            const response = await api.post(
                `/hoc-vien/lich-hoc/${chiTietBuoi.lichHoc.id}/xac-nhan-hoan-thanh`,
                formXacNhanBuoi,
            );

            if (response.data.success) {
                capNhatBuoiHoc(chiTietBuoi.lichHoc.id, response.data.data);
                setFormXacNhanBuoi({ trang_thai: "daxacnhan", ghi_chu: "" });
                setThongBao(response.data.message || "Đã xác nhận buổi học.");
            }
        } catch (error) {
            console.error("Không thể xác nhận buổi học:", error);
            setThongBao(layThongDiepLoi(error, "Không thể xác nhận buổi học."));
        } finally {
            setDangGuiXacNhanBuoi(false);
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
                        <h1 className="mt-2 text-3xl font-bold">Lịch học của tôi</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Theo dõi các buổi học đã đặt, trạng thái thanh toán, đánh giá và yêu cầu đổi lịch.
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

                <div className="mt-8 grid gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-2">
                    {[
                        { key: "goi_hoc", label: "Gói học" },
                        { key: "thanh_toan", label: "Lịch sử thanh toán" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setManHinh(item.key)}
                            className={`rounded-md px-4 py-3 text-sm font-bold transition ${
                                manHinh === item.key ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {manHinh === "goi_hoc" ? (
                    <>
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
                                                    <h3 className="text-base font-bold text-slate-950">{dinhDangMonVaLop(goiHoc)}</h3>
                                                    <NhanTrangThai trangThai={goiHoc.trangThai} />
                                                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                                                        {nhanLoaiGoi(goiHoc)}
                                                    </span>
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
                                                        disabled={dangHuyGoiId === goiHoc.id}
                                                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                                                <div className="grid grid-cols-[90px_minmax(0,1fr)_120px_90px] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
                                                    <span>Mã buổi</span>
                                                    <span>Thời gian</span>
                                                    <span>Trạng thái</span>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {(goiHoc.lichHoc || []).map((lichHoc) => (
                                                        <div
                                                            key={lichHoc.id}
                                                            className="grid grid-cols-[90px_minmax(0,1fr)_120px_90px] gap-3 px-4 py-3 text-sm"
                                                        >
                                                            <span className="font-semibold text-slate-700">{lichHoc.ma}</span>
                                                            <span className="text-slate-600">
                                                                {lichHoc.thu}, {dinhDangNgay(lichHoc.ngayHoc)} · {lichHoc.gioBatDau} - {lichHoc.gioKetThuc}
                                                            </span>
                                                            <NhanTrangThai trangThai={lichHoc.trangThai} loai="buoi" />
                                                            <button
                                                                type="button"
                                                                onClick={() => moChiTietBuoi(goiHoc, lichHoc)}
                                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                                                            >
                                                                Chi tiết
                                                            </button>
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
                    </>
                ) : (
                    <LichSuThanhToan
                        danhSach={lichSuThanhToan}
                        thongKe={thongKeThanhToan}
                    />
                )}
            </div>

            {chiTietBuoi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
                    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase text-sky-600">Chi tiết buổi học</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-950">
                                    {chiTietBuoi.lichHoc.ma} · {dinhDangMonVaLop(chiTietBuoi.goiHoc)}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Gia sư {chiTietBuoi.goiHoc.giaSu} · Gói {chiTietBuoi.goiHoc.ma}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setChiTietBuoi(null)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_1fr]">
                            <section className="rounded-lg border border-slate-200 p-4">
                                <h3 className="text-base font-bold text-slate-950">Thông tin buổi học</h3>
                                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                    <ThongTinBuoi label="Ngày học" value={`${chiTietBuoi.lichHoc.thu}, ${dinhDangNgay(chiTietBuoi.lichHoc.ngayHoc)}`} />
                                    <ThongTinBuoi label="Khung giờ" value={`${chiTietBuoi.lichHoc.gioBatDau} - ${chiTietBuoi.lichHoc.gioKetThuc}`} />
                                    <ThongTinBuoi label="Hình thức" value={chiTietBuoi.lichHoc.hinhThuc} />
                                    <ThongTinBuoi label="Địa điểm" value={chiTietBuoi.lichHoc.diaDiem} />
                                    <ThongTinBuoi label="Loại buổi" value={chiTietBuoi.lichHoc.loaiBuoi || "Học thường"} />
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400">Trạng thái</p>
                                        <div className="mt-1.5"><NhanTrangThai trangThai={chiTietBuoi.lichHoc.trangThai} loai="buoi" /></div>
                                    </div>
                                </div>
                                {chiTietBuoi.lichHoc.ghiChu && (
                                    <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                        {chiTietBuoi.lichHoc.ghiChu}
                                    </p>
                                )}
                            </section>

                            <section className="rounded-lg border border-slate-200 p-4">
                                <h3 className="text-base font-bold text-slate-950">Xác nhận buổi học</h3>

                                {(chiTietBuoi.lichHoc.hocVienXacNhan?.trangThai || chiTietBuoi.lichHoc.giaSuXacNhan?.trangThai) && (
                                    <div className="mt-3 grid gap-2 text-sm">
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                            <p className="font-bold text-slate-800">
                                                Học viên: {nhanTrangThaiXacNhan(chiTietBuoi.lichHoc.hocVienXacNhan?.trangThai)}
                                            </p>
                                            {chiTietBuoi.lichHoc.hocVienXacNhan?.thoiGian && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {chiTietBuoi.lichHoc.hocVienXacNhan.thoiGian}
                                                </p>
                                            )}
                                            {chiTietBuoi.lichHoc.hocVienXacNhan?.ghiChu && (
                                                <p className="mt-1 text-slate-600">{chiTietBuoi.lichHoc.hocVienXacNhan.ghiChu}</p>
                                            )}
                                        </div>
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                            <p className="font-bold text-slate-800">
                                                Gia sư: {nhanTrangThaiXacNhan(chiTietBuoi.lichHoc.giaSuXacNhan?.trangThai)}
                                            </p>
                                            {chiTietBuoi.lichHoc.giaSuXacNhan?.thoiGian && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {chiTietBuoi.lichHoc.giaSuXacNhan.thoiGian}
                                                </p>
                                            )}
                                            {chiTietBuoi.lichHoc.giaSuXacNhan?.ghiChu && (
                                                <p className="mt-1 text-slate-600">{chiTietBuoi.lichHoc.giaSuXacNhan.ghiChu}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {chiTietBuoi.lichHoc.coTheXacNhanHoanThanh ? (
                                    <form onSubmit={guiXacNhanBuoiHoc} className="mt-4 space-y-3">
                                        <div className="grid gap-2">
                                            <label className={[
                                                "cursor-pointer rounded-lg border px-3 py-3 transition",
                                                formXacNhanBuoi.trang_thai === "daxacnhan"
                                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200",
                                            ].join(" ")}>
                                                <input
                                                    type="radio"
                                                    name="xac_nhan_buoi_hoc"
                                                    value="daxacnhan"
                                                    checked={formXacNhanBuoi.trang_thai === "daxacnhan"}
                                                    onChange={(event) => setFormXacNhanBuoi((hienTai) => ({
                                                        ...hienTai,
                                                        trang_thai: event.target.value,
                                                        ghi_chu: "",
                                                    }))}
                                                    className="sr-only"
                                                />
                                                <span className="block text-sm font-bold">Đã học xong</span>
                                                <span className="mt-1 block text-xs">Buổi học diễn ra bình thường.</span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={dangGuiXacNhanBuoi}
                                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {dangGuiXacNhanBuoi ? "Đang gửi..." : "Gửi xác nhận"}
                                        </button>
                                    </form>
                                ) : (
                                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                        {chiTietBuoi.lichHoc.daToiGioBatDau
                                            ? "Buổi học này chưa cần hoặc đã được bạn xác nhận."
                                            : "Khi buổi học bắt đầu, bạn có thể xác nhận đã học tại đây."}
                                    </p>
                                )}
                            </section>

                            <section className="rounded-lg border border-slate-200 p-4">
                                <h3 className="text-base font-bold text-slate-950">Đánh giá buổi học</h3>
                                {chiTietBuoi.lichHoc.danhGia && (
                                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                        <p className="font-bold">
                                            Đã đánh giá {chiTietBuoi.lichHoc.danhGia.soSao}/5 sao
                                        </p>
                                        {chiTietBuoi.lichHoc.danhGia.noiDung && (
                                            <p className="mt-1">{chiTietBuoi.lichHoc.danhGia.noiDung}</p>
                                        )}
                                    </div>
                                )}

                                <form onSubmit={guiDanhGia} className="mt-4 space-y-3">
                                    <div>
                                        <p className="mb-2 text-sm font-semibold text-slate-700">Số sao</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((sao) => (
                                                <button
                                                    key={sao}
                                                    type="button"
                                                    onClick={() => setFormDanhGia((hienTai) => ({ ...hienTai, so_sao: sao }))}
                                                    disabled={!chiTietBuoi.lichHoc.coTheDanhGia}
                                                    className={[
                                                        "h-10 w-10 rounded-lg border text-lg font-black transition disabled:cursor-not-allowed disabled:opacity-50",
                                                        formDanhGia.so_sao >= sao
                                                            ? "border-amber-300 bg-amber-100 text-amber-600"
                                                            : "border-slate-200 text-slate-300 hover:border-amber-200",
                                                    ].join(" ")}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={formDanhGia.noi_dung}
                                        onChange={(event) => setFormDanhGia((hienTai) => ({ ...hienTai, noi_dung: event.target.value }))}
                                        disabled={!chiTietBuoi.lichHoc.coTheDanhGia}
                                        placeholder="Nhận xét về buổi học"
                                        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chiTietBuoi.lichHoc.coTheDanhGia || dangGuiDanhGia}
                                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {dangGuiDanhGia ? "Đang lưu..." : "Lưu đánh giá"}
                                    </button>
                                    {!chiTietBuoi.lichHoc.coTheDanhGia && (
                                        <p className="text-xs font-semibold text-slate-500">
                                            Chỉ có thể đánh giá sau khi buổi học hoàn thành.
                                        </p>
                                    )}
                                </form>
                            </section>

                            <section className="rounded-lg border border-slate-200 p-4 lg:col-span-2">
                                <h3 className="text-base font-bold text-slate-950">Yêu cầu đổi buổi học</h3>
                                {chiTietBuoi.lichHoc.yeuCauDoiBuoi && (
                                    <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                                        <p className="font-bold">
                                            Yêu cầu hiện tại: {nhanTrangThaiYeuCau(chiTietBuoi.lichHoc.yeuCauDoiBuoi.trangThai)}
                                        </p>
                                        <p className="mt-1">
                                            Đổi sang {dinhDangNgay(chiTietBuoi.lichHoc.yeuCauDoiBuoi.ngayHoc)} · {chiTietBuoi.lichHoc.yeuCauDoiBuoi.gioBatDau} - {chiTietBuoi.lichHoc.yeuCauDoiBuoi.gioKetThuc}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={guiYeuCauDoiBuoi} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">Ngày mới</span>
                                        <input
                                            type="date"
                                            min={ngayHomNay()}
                                            value={formDoiBuoi.ngay_hoc}
                                            onChange={(event) => setFormDoiBuoi((hienTai) => ({ ...hienTai, ngay_hoc: event.target.value }))}
                                            disabled={!chiTietBuoi.lichHoc.coTheDoiBuoi}
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">Giờ bắt đầu</span>
                                        <select
                                            value={formDoiBuoi.gio_batdau}
                                            onChange={(event) => setFormDoiBuoi((hienTai) => ({ ...hienTai, gio_batdau: event.target.value }))}
                                            disabled={!chiTietBuoi.lichHoc.coTheDoiBuoi}
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {cacKhungGio.map((gio) => (
                                                <option key={gio} value={gio}>{gio}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">Giờ kết thúc</span>
                                        <select
                                            value={formDoiBuoi.gio_ketthuc}
                                            onChange={(event) => setFormDoiBuoi((hienTai) => ({ ...hienTai, gio_ketthuc: event.target.value }))}
                                            disabled={!chiTietBuoi.lichHoc.coTheDoiBuoi}
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {cacKhungGio.map((gio) => (
                                                <option key={gio} value={gio}>{gio}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="block md:col-span-3">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">Lý do đổi buổi</span>
                                        <textarea
                                            rows={3}
                                            value={formDoiBuoi.ly_do}
                                            onChange={(event) => setFormDoiBuoi((hienTai) => ({ ...hienTai, ly_do: event.target.value }))}
                                            disabled={!chiTietBuoi.lichHoc.coTheDoiBuoi}
                                            placeholder="Ví dụ: em bận lịch kiểm tra, muốn chuyển sang buổi khác"
                                            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                        />
                                    </label>
                                    <div className="md:col-span-3">
                                        <button
                                            type="submit"
                                            disabled={!chiTietBuoi.lichHoc.coTheDoiBuoi || dangGuiDoiBuoi}
                                            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {dangGuiDoiBuoi ? "Đang gửi..." : "Gửi yêu cầu đổi buổi"}
                                        </button>
                                        {!chiTietBuoi.lichHoc.coTheDoiBuoi && (
                                            <p className="mt-2 text-xs font-semibold text-slate-500">
                                                Buổi học này không thể gửi thêm yêu cầu đổi lịch lúc này.
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            )}

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
                                <div className="mb-4">
                                    <span className="mb-2 block text-sm font-semibold text-slate-700">Ảnh minh chứng giao dịch</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        required
                                        onChange={(event) => setFormThanhToan((hienTai) => ({
                                            ...hienTai,
                                            anh_minh_chung: event.target.files?.[0] || null,
                                        }))}
                                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-orange-700 hover:file:bg-orange-200"
                                    />
                                    <p className="mt-2 text-xs font-semibold text-slate-500">
                                        Chụp màn hình chuyển khoản hoặc hóa đơn thanh toán, tối đa 4MB.
                                    </p>
                                </div>
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

function LichSuThanhToan({ danhSach, thongKe }) {
    return (
        <div className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TheThanhToan tieuDe="Tất cả giao dịch" giaTri={thongKe.tat_ca} moTa="Toàn bộ lịch sử gửi thanh toán" />
                <TheThanhToan tieuDe="Đã thanh toán" giaTri={thongKe.da_thanhtoan} moTa={dinhDangTien(thongKe.tongDaThanhToan)} noiBat />
                <TheThanhToan tieuDe="Chờ duyệt" giaTri={thongKe.cho_thanhtoan} moTa="Admin đang kiểm tra minh chứng" />
                <TheThanhToan tieuDe="Thất bại" giaTri={thongKe.that_bai} moTa="Cần gửi lại nếu gói còn chờ thanh toán" />
            </div>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-lg font-bold">Lịch sử thanh toán</h2>
                    <p className="mt-1 text-sm text-slate-500">Theo dõi các giao dịch đã gửi và trạng thái xét duyệt của admin.</p>
                </div>

                {danhSach.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="text-base font-bold text-slate-900">Chưa có giao dịch thanh toán</p>
                        <p className="mt-2 text-sm text-slate-500">Khi bạn gửi minh chứng thanh toán, giao dịch sẽ hiển thị tại đây.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Gói học</th>
                                    <th className="px-5 py-3">Thanh toán</th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                    <th className="px-5 py-3">Minh chứng</th>
                                    <th className="px-5 py-3 text-right">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {danhSach.map((item) => (
                                    <tr key={item.id} className="align-top hover:bg-slate-50/70">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-950">{item.maGoi}</div>
                                            <div className="mt-1 text-sm font-semibold text-slate-700">{item.goiHoc?.monHoc || "Môn học"}</div>
                                            <div className="mt-1 text-xs text-slate-500">Gia sư {item.goiHoc?.giaSu || "Chưa cập nhật"}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800">{item.phuongThuc}</div>
                                            <div className="mt-1 text-xs text-slate-500">{item.ngayThanhToan || "Chưa có ngày"}</div>
                                            <div className="mt-1 text-xs text-slate-500">Mã GD: {item.maGiaoDich || "Chưa cập nhật"}</div>
                                            {item.noiDung && (
                                                <div className="mt-2 max-w-xs rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                                    {item.noiDung}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <NhanTrangThaiThanhToan trangThai={item.trangThai} />
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.anhMinhChung ? (
                                                <a
                                                    href={layUrlMinhChung(item.anhMinhChung)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
                                                >
                                                    Xem ảnh
                                                </a>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-400">Không có</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right text-base font-extrabold text-slate-950">
                                            {item.soTienText || dinhDangTien(item.soTien)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function TheThanhToan({ tieuDe, giaTri, moTa, noiBat }) {
    return (
        <section className={`rounded-lg border p-4 shadow-sm ${noiBat ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
            <div className={`text-sm font-bold ${noiBat ? "text-emerald-700" : "text-slate-500"}`}>{tieuDe}</div>
            <div className="mt-3 text-2xl font-bold text-slate-950">{giaTri}</div>
            <div className={`mt-1 text-xs font-semibold ${noiBat ? "text-emerald-700" : "text-slate-400"}`}>{moTa}</div>
        </section>
    );
}

function ThongTinBuoi({ label, value }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-800">{value || "Chưa cập nhật"}</p>
        </div>
    );
}

function nhanTrangThaiYeuCau(trangThai) {
    return {
        cho_duyet: "Chờ duyệt",
        da_duyet: "Đã duyệt",
        tu_choi: "Từ chối",
    }[trangThai] || "Chưa cập nhật";
}

function nhanTrangThaiXacNhan(trangThai) {
    return {
        daxacnhan: "Đã xác nhận",
        baovan_de: "Báo vấn đề",
    }[trangThai] || "Chưa xác nhận";
}

export default LichHocCuaToi;

