import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ngayMai = () => {
    const vnTimeString = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    const date = new Date(vnTimeString.replace(" ", "T"));
    date.setDate(date.getDate() + 1);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const dinhDangNgay = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const bayGioVietNam = () => {
    const vnTimeString = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    return new Date(vnTimeString.replace(" ", "T"));
};

const ngayHomNay = () => dinhDangNgay(bayGioVietNam());

const cacThu = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const thuSangSo = {
    "Thứ 2": 1,
    "Thứ 3": 2,
    "Thứ 4": 3,
    "Thứ 5": 4,
    "Thứ 6": 5,
    "Thứ 7": 6,
    "Chủ nhật": 7,
};

const SO_THU_TOI_DA = 2;
const THOI_LUONG_BUOI_PHUT = 90;
const GIO_BAT_DAU_MIN = "07:00";
const GIO_BAT_DAU_MAX = "19:30";
const GIO_BAT_DAU_MAC_DINH = "07:00";
const GIO_KET_THUC_MAC_DINH = "08:30";

const ngayHocDauTienTheoThu = (danhSachThu) => {
    const danhSachThuSo = danhSachThu
        .map((thu) => thuSangSo[thu])
        .filter(Boolean);

    if (danhSachThuSo.length === 0) return ngayMai();

    const ngayBatDau = new Date(`${ngayMai()}T00:00:00`);
    const tapThu = new Set(danhSachThuSo);

    for (let soNgayThem = 0; soNgayThem < 14; soNgayThem += 1) {
        const ngay = new Date(ngayBatDau);
        ngay.setDate(ngayBatDau.getDate() + soNgayThem);
        const thuIso = ngay.getDay() === 0 ? 7 : ngay.getDay();

        if (tapThu.has(thuIso)) {
            return dinhDangNgay(ngay);
        }
    }

    return ngayMai();
};

const thoiGianSangPhut = (value) => {
    const [gio, phut] = String(value || "").split(":").map(Number);
    if (Number.isNaN(gio) || Number.isNaN(phut)) return null;
    return gio * 60 + phut;
};

const phutSangThoiGian = (tongPhut) => {
    const phutTrongNgay = ((tongPhut % 1440) + 1440) % 1440;
    const gio = Math.floor(phutTrongNgay / 60);
    const phut = phutTrongNgay % 60;
    return `${String(gio).padStart(2, "0")}:${String(phut).padStart(2, "0")}`;
};

const tinhGioKetThuc = (gioBatDau) => {
    const phutBatDau = thoiGianSangPhut(gioBatDau);
    if (phutBatDau === null) return "";
    return phutSangThoiGian(phutBatDau + THOI_LUONG_BUOI_PHUT);
};

const taoDanhSachKhungGio = () => {
    const batDau = thoiGianSangPhut(GIO_BAT_DAU_MIN);
    const ketThuc = thoiGianSangPhut(GIO_BAT_DAU_MAX);
    const danhSach = [];

    for (let phut = batDau; phut <= ketThuc; phut += 30) {
        danhSach.push(phutSangThoiGian(phut));
    }

    return danhSach;
};

const cacKhungGioBatDau = taoDanhSachKhungGio();

const gioiHanGioBatDau = (gioBatDau) => {
    const phutBatDau = thoiGianSangPhut(gioBatDau);
    const phutMin = thoiGianSangPhut(GIO_BAT_DAU_MIN);
    const phutMax = thoiGianSangPhut(GIO_BAT_DAU_MAX);
    if (phutBatDau === null) return gioBatDau;

    if (phutBatDau < phutMin) return GIO_BAT_DAU_MIN;
    if (phutBatDau > phutMax) return GIO_BAT_DAU_MAX;
    return gioBatDau;
};

const hopLeKhoangGioBatDau = (gioBatDau) => {
    const phutBatDau = thoiGianSangPhut(gioBatDau);
    const phutMin = thoiGianSangPhut(GIO_BAT_DAU_MIN);
    const phutMax = thoiGianSangPhut(GIO_BAT_DAU_MAX);

    return phutBatDau !== null && phutBatDau >= phutMin && phutBatDau <= phutMax;
};

const cachNhauDungThoiLuong = (gioBatDau, gioKetThuc) => {
    const phutBatDau = thoiGianSangPhut(gioBatDau);
    const phutKetThuc = thoiGianSangPhut(gioKetThuc);
    if (phutBatDau === null || phutKetThuc === null) return false;

    return phutKetThuc - phutBatDau === THOI_LUONG_BUOI_PHUT;
};

const laThoiDiemHocTuongLai = (ngayHoc, gioBatDau) => {
    if (!ngayHoc || !gioBatDau) return false;

    const homNay = ngayHomNay();
    if (ngayHoc > homNay) return true;
    if (ngayHoc < homNay) return false;

    const bayGio = bayGioVietNam();
    const phutHienTai = bayGio.getHours() * 60 + bayGio.getMinutes();
    const phutBatDau = thoiGianSangPhut(gioBatDau);

    return phutBatDau !== null && phutBatDau > phutHienTai;
};

const goiHocThu = {
    id: "hoc-thu",
    ten: "Buổi học thử",
    soBuoiMoiThang: 1,
    soThang: 1,
    giamGia: 0,
    moTa: "Một buổi để học viên làm quen với gia sư, trao đổi mục tiêu và thử phong cách dạy.",
    phuHop: "Trải nghiệm trước",
};

const dinhDangGia = (giaSu) => {
    const giaTu = Number(giaSu?.gia_tu || 0);
    const giaDen = Number(giaSu?.gia_den || 0);

    if (!giaTu) return "Chờ báo giá";
    if (giaDen > giaTu) {
        return `${giaTu.toLocaleString("vi-VN")} - ${giaDen.toLocaleString("vi-VN")} đ/giờ`;
    }
    return `${giaTu.toLocaleString("vi-VN")} đ/giờ`;
};

const dinhDangTien = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const dinhDangTenMon = (mon) => {
    if (!mon?.lop) return mon?.ten_mon || "";

    const lop = String(mon.lop).trim();
    const lopHienThi = lop.toLowerCase().startsWith("lớp") ? lop : `Lớp ${lop}`;

    return `${mon.ten_mon} - ${lopHienThi}`;
};

const layMucGiaTheoMon = (giaSu, monHocId) => {
    if (!monHocId) return null;

    return (giaSu?.giasu_gias || []).find(
        (mucGia) => String(mucGia.monhoc_id) === String(monHocId),
    ) || null;
};

const tinhTienGoi = (mucGia, goi) => {
    if (!goi) {
        return {
            donGia: 0,
            tongBuoi: 0,
            tongTruocGiam: 0,
            tienGiam: 0,
            tongSauGiam: 0,
        };
    }

    if (goi.id === goiHocThu.id) {
        return {
            donGia: 0,
            tongBuoi: 1,
            tongTruocGiam: 0,
            tienGiam: 0,
            tongSauGiam: 0,
        };
    }

    const donGia = Number(mucGia?.tong_gia || 0);
    const tongBuoi = goi.soBuoiMoiThang * goi.soThang;
    const tongTruocGiam = donGia * tongBuoi * 1.5;
    const tienGiam = Math.round((tongTruocGiam * goi.giamGia) / 100);

    return {
        donGia,
        tongBuoi,
        tongTruocGiam,
        tienGiam,
        tongSauGiam: tongTruocGiam - tienGiam,
    };
};

function ToastThongBao({ message, type = "error", onClose }) {
    if (!message) return null;

    const laThanhCong = type === "success";
    const mau = laThanhCong
        ? {
            border: "border-emerald-300/35",
            text: "text-emerald-50",
            iconBg: "bg-emerald-400/15",
            iconText: "text-emerald-300",
            close: "text-emerald-100/70 hover:bg-white/10 hover:text-white",
        }
        : {
            border: "border-rose-300/35",
            text: "text-rose-50",
            iconBg: "bg-rose-400/15",
            iconText: "text-rose-300",
            close: "text-rose-100/70 hover:bg-white/10 hover:text-white",
        };

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm animate-[toast-slide-in_220ms_ease-out] sm:right-6 sm:top-6">
            <style>
                {"@keyframes toast-slide-in{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}"}
            </style>
            <div className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${mau.border} bg-[#0d1854]/95 px-4 py-3 text-sm ${mau.text} shadow-2xl shadow-slate-950/40 backdrop-blur`}>
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${mau.iconBg} ${mau.iconText}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        {laThanhCong ? (
                            <path d="m8.5 12.5 2.2 2.2 4.8-5.1" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                            <>
                                <path d="m15 9-6 6" strokeLinecap="round" />
                                <path d="m9 9 6 6" strokeLinecap="round" />
                            </>
                        )}
                    </svg>
                </span>
                <div className="min-w-0 flex-1 leading-6">{message}</div>
                <button
                    type="button"
                    onClick={onClose}
                    className={`-mr-1 rounded-full p-1 transition ${mau.close}`}
                    aria-label="Đóng thông báo"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m18 6-12 12" strokeLinecap="round" />
                        <path d="m6 6 12 12" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function ChonGoiHoc() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [giaSus, setGiaSus] = useState([]);
    const [monHocs, setMonHocs] = useState([]);
    const [goiDinhKy, setGoiDinhKy] = useState([]);
    const [goiHocCuaToi, setGoiHocCuaToi] = useState([]);
    const [lichBanGiaSu, setLichBanGiaSu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dangGui, setDangGui] = useState(false);
    const [loaiGoi, setLoaiGoi] = useState("dinh_ky");
    const [goiId, setGoiId] = useState("");
    const [thuHoc, setThuHoc] = useState(["Thứ 2", "Thứ 5"]);
    const [thongBao, setThongBaoRaw] = useState("");
    const [loaiThongBao, setLoaiThongBao] = useState("error");
    const [form, setForm] = useState({
        monhoc_id: "",
        ngay_batdau: ngayMai(),
        gio_batdau: GIO_BAT_DAU_MAC_DINH,
        gio_ketthuc: GIO_KET_THUC_MAC_DINH,
        hinh_thuc_hoc: "online",
        dia_chi_hoc: "",
    });
    const [buoiLinhHoat, setBuoiLinhHoat] = useState([
        { ngay: ngayMai(), gio_batdau: GIO_BAT_DAU_MAC_DINH, gio_ketthuc: GIO_KET_THUC_MAC_DINH },
    ]);
    const setThongBao = useCallback((message, type = "error") => {
        if (message) setLoaiThongBao(type);
        setThongBaoRaw(message);
    }, []);

    useEffect(() => {
        if (!thongBao) return undefined;

        const timer = window.setTimeout(() => setThongBao(""), 4200);
        return () => window.clearTimeout(timer);
    }, [setThongBao, thongBao]);

    const slotTrungDanhSachLichBan = useCallback((danhSachLich, ngay, gioBatDau) => {
        const gioKetThuc = tinhGioKetThuc(gioBatDau);

        return danhSachLich.some((lich) => (
            lich.ngay_hoc === ngay
            && gioBatDau < lich.gio_ketthuc
            && gioKetThuc > lich.gio_batdau
        ));
    }, []);

    const khungGioGiaSuRanhDauTien = useCallback((ngay, danhSachLich) => (
        cacKhungGioBatDau.find((gio) => !slotTrungDanhSachLichBan(danhSachLich, ngay, gio)) || ""
    ), [slotTrungDanhSachLichBan]);

    const dieuChinhBuoiLinhHoatTheoLichBan = useCallback((danhSachBuoi, danhSachLich) => {
        let daThayDoi = false;

        const danhSachMoi = danhSachBuoi.map((buoi, index) => {
            const biTrungGiaSu = slotTrungDanhSachLichBan(danhSachLich, buoi.ngay, buoi.gio_batdau);
            const biTrungBuoiKhac = danhSachBuoi.some((buoiKhac, currentIndex) => (
                currentIndex !== index
                && buoiKhac.ngay === buoi.ngay
                && buoi.gio_batdau < buoiKhac.gio_ketthuc
                && buoi.gio_ketthuc > buoiKhac.gio_batdau
            ));

            if (!biTrungGiaSu && !biTrungBuoiKhac) return buoi;

            const gioRanh = cacKhungGioBatDau.find((gio) => {
                const gioKetThuc = tinhGioKetThuc(gio);
                const trungLichGiaSu = slotTrungDanhSachLichBan(danhSachLich, buoi.ngay, gio);
                const trungBuoiKhac = danhSachBuoi.some((buoiKhac, currentIndex) => (
                    currentIndex !== index
                    && buoiKhac.ngay === buoi.ngay
                    && gio < buoiKhac.gio_ketthuc
                    && gioKetThuc > buoiKhac.gio_batdau
                ));

                return !trungLichGiaSu && !trungBuoiKhac;
            });

            if (!gioRanh || gioRanh === buoi.gio_batdau) return buoi;

            daThayDoi = true;

            return {
                ...buoi,
                gio_batdau: gioRanh,
                gio_ketthuc: tinhGioKetThuc(gioRanh),
            };
        });

        return daThayDoi ? danhSachMoi : danhSachBuoi;
    }, [slotTrungDanhSachLichBan]);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const [giaSuRes, monHocRes, loaiGoiRes] = await Promise.all([
                    api.get("/gia-su"),
                    api.get("/mon-hoc"),
                    api.get("/loai-goi"),
                ]);

                if (cancelled) return;
                if (giaSuRes.data.success) setGiaSus(giaSuRes.data.data.data || []);
                if (monHocRes.data.success) setMonHocs(monHocRes.data.data || []);
                if (loaiGoiRes.data.success) setGoiDinhKy(loaiGoiRes.data.data || []);
            } catch (error) {
                console.error("Không thể tải dữ liệu đặt lịch:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.vai_tro !== "hocvien") {
            const timer = setTimeout(() => setGoiHocCuaToi([]), 0);
            return () => clearTimeout(timer);
        }

        let cancelled = false;

        const fetchGoiHocCuaToi = async () => {
            try {
                const response = await api.get("/hoc-vien/lich-hoc");
                if (!cancelled && response.data.success) {
                    setGoiHocCuaToi(response.data.data || []);
                }
            } catch {
                if (!cancelled) setGoiHocCuaToi([]);
            }
        };

        fetchGoiHocCuaToi();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, user?.vai_tro]);

    useEffect(() => {
        let cancelled = false;

        const fetchLichBan = async () => {
            try {
                const response = await api.get(`/gia-su/${id}/lich-ban`);
                if (!cancelled && response.data.success) {
                    setLichBanGiaSu(response.data.data || []);
                }
            } catch {
                if (!cancelled) setLichBanGiaSu([]);
            }
        };

        if (id) fetchLichBan();

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (
            loaiGoi !== "hoc_thu" ||
            !slotTrungDanhSachLichBan(lichBanGiaSu, form.ngay_batdau, form.gio_batdau)
        ) {
            return undefined;
        }

        const gioBatDau = khungGioGiaSuRanhDauTien(form.ngay_batdau, lichBanGiaSu);

        if (!gioBatDau || gioBatDau === form.gio_batdau) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setForm((prev) => ({
                ...prev,
                gio_batdau: gioBatDau,
                gio_ketthuc: tinhGioKetThuc(gioBatDau),
            }));
        }, 0);

        return () => clearTimeout(timer);
    }, [
        form.gio_batdau,
        form.ngay_batdau,
        khungGioGiaSuRanhDauTien,
        lichBanGiaSu,
        loaiGoi,
        slotTrungDanhSachLichBan,
    ]);

    useEffect(() => {
        if (loaiGoi !== "khong_dinh_ky") return undefined;

        const timer = setTimeout(() => {
            setBuoiLinhHoat((prev) =>
                dieuChinhBuoiLinhHoatTheoLichBan(prev, lichBanGiaSu),
            );
        }, 0);

        return () => clearTimeout(timer);
    }, [dieuChinhBuoiLinhHoatTheoLichBan, lichBanGiaSu, loaiGoi]);

    const giaSu = useMemo(
        () => giaSus.find((item) => String(item.id) === String(id)),
        [giaSus, id],
    );
    const monHocsCoTheDat = useMemo(() => {
        const monTuGiaSu = (giaSu?.giasu_gias || [])
            .map((mucGia) => mucGia.mon_hoc)
            .filter(Boolean);

        const danhSachMon = monTuGiaSu.length > 0 ? monTuGiaSu : monHocs;

        return [...danhSachMon].sort((a, b) => {
            const tenA = (a.ten_mon || "").toLowerCase();
            const tenB = (b.ten_mon || "").toLowerCase();

            if (tenA !== tenB) {
                return tenA.localeCompare(tenB);
            }

            const getLopSo = (lop) => {
                if (!lop) return 999;
                const match = String(lop).match(/\d+/);
                return match ? parseInt(match[0], 10) : 999;
            };

            return getLopSo(a.lop) - getLopSo(b.lop);
        });
    }, [giaSu, monHocs]);
    const monHocDaDatIds = useMemo(() => {
        const trangThaiDangMo = new Set(["cho_xacnhan", "cho_thanhtoan", "dang_hoc"]);

        return new Set(
            goiHocCuaToi
                .filter((goiHoc) => trangThaiDangMo.has(goiHoc.trangThai))
                .map((goiHoc) => String(goiHoc.monHocId || ""))
                .filter(Boolean),
        );
    }, [goiHocCuaToi]);
    const daDangKyHocThu = useMemo(
        () => {
            const trangThaiHocThuDangMo = new Set(["cho_xacnhan", "cho_thanhtoan", "dang_hoc", "hoan_thanh"]);

            return goiHocCuaToi.some((goiHoc) => (
                goiHoc.kieuGoi === "hoc_thu"
                && trangThaiHocThuDangMo.has(goiHoc.trangThai)
            ));
        },
        [goiHocCuaToi],
    );

    const danhSachGoi = loaiGoi === "hoc_thu"
        ? [goiHocThu]
        : goiDinhKy;
    const goiDangChon = danhSachGoi.find((goi) => String(goi.id) === String(goiId));
    const monHocDaChon = monHocsCoTheDat.find((mon) => String(mon.id) === String(form.monhoc_id));
    const mucGiaDangChon = layMucGiaTheoMon(giaSu, form.monhoc_id);
    const tienGoi = tinhTienGoi(mucGiaDangChon, goiDangChon);
    const soBuoi = tienGoi.tongBuoi;
    const tamTinh = tienGoi.tongSauGiam;
    const lopLuoiGoi = danhSachGoi.length === 1
        ? "md:grid-cols-[minmax(0,420px)] md:justify-center"
        : danhSachGoi.length === 2
            ? "md:grid-cols-2"
            : "md:grid-cols-3";

    const doiLoaiGoi = (value) => {
        setLoaiGoi(value);
        setGoiId("");
        datKhungGioMacDinh();
        setThongBao("");
    };

    const datKhungGioMacDinh = () => {
        setForm((prev) => ({
            ...prev,
            gio_batdau: GIO_BAT_DAU_MAC_DINH,
            gio_ketthuc: GIO_KET_THUC_MAC_DINH,
        }));
        setBuoiLinhHoat((prev) =>
            prev.map((buoi, index) => ({
                ...buoi,
                ...(index === 0 ? { gio_batdau: GIO_BAT_DAU_MAC_DINH, gio_ketthuc: GIO_KET_THUC_MAC_DINH } : {}),
            })),
        );
    };

    const khungGioHocThuHopLeDauTien = (ngayHoc) => (
        cacKhungGioBatDau.find((gio) => (
            laThoiDiemHocTuongLai(ngayHoc, gio)
            && !slotTrungLichBan(ngayHoc, gio)
        )) || ""
    );

    const chonGoi = (goi) => {
        setGoiId(goi.id);
        datKhungGioMacDinh();
        setThongBao("");

        if (loaiGoi === "hoc_thu" && (
            !laThoiDiemHocTuongLai(form.ngay_batdau, GIO_BAT_DAU_MAC_DINH)
            || slotTrungLichBan(form.ngay_batdau, GIO_BAT_DAU_MAC_DINH)
        )) {
            const gioBatDau = khungGioHocThuHopLeDauTien(form.ngay_batdau);

            if (gioBatDau && gioBatDau !== GIO_BAT_DAU_MAC_DINH) {
                setForm((prev) => ({
                    ...prev,
                    gio_batdau: gioBatDau,
                    gio_ketthuc: tinhGioKetThuc(gioBatDau),
                }));
            }
        }

        if (loaiGoi === "khong_dinh_ky") {
            const soBuoiMoi = tinhTienGoi(mucGiaDangChon, goi).tongBuoi;
            setBuoiLinhHoat((prev) => {
                const danhSachCanChinh = prev.slice(0, soBuoiMoi);
                return dieuChinhBuoiLinhHoatTheoLichBan(danhSachCanChinh, lichBanGiaSu);
            });
        }
    };

    useEffect(() => {
        if (!form.monhoc_id || !monHocDaDatIds.has(String(form.monhoc_id))) return;

        const timer = setTimeout(() => {
            setForm((prev) => ({ ...prev, monhoc_id: "" }));
            setThongBao("Môn học này đã có gói đang xử lý hoặc đang học. Vui lòng chọn môn khác.");
        }, 0);

        return () => clearTimeout(timer);
    }, [form.monhoc_id, monHocDaDatIds, setThongBao]);

    useEffect(() => {
        if (loaiGoi !== "dinh_ky") return;

        const ngayDauTien = ngayHocDauTienTheoThu(thuHoc);
        const timer = setTimeout(() => {
            setForm((prev) => (
                prev.ngay_batdau === ngayDauTien
                    ? prev
                    : { ...prev, ngay_batdau: ngayDauTien }
            ));
        }, 0);

        return () => clearTimeout(timer);
    }, [loaiGoi, thuHoc]);

    const capNhatForm = (field, value) => {
        setForm((prev) => {
            if (field === "gio_batdau") {
                const gioBatDau = gioiHanGioBatDau(value);
                return { ...prev, gio_batdau: gioBatDau, gio_ketthuc: tinhGioKetThuc(gioBatDau) };
            }

            if (field === "ngay_batdau" && loaiGoi === "hoc_thu") {
                const ngayHoc = value < ngayHomNay() ? ngayHomNay() : value;
                const gioBatDau = (
                    !laThoiDiemHocTuongLai(ngayHoc, prev.gio_batdau)
                    || slotTrungLichBan(ngayHoc, prev.gio_batdau)
                )
                    ? khungGioHocThuHopLeDauTien(ngayHoc)
                    : prev.gio_batdau;

                return { ...prev, ngay_batdau: ngayHoc, gio_batdau: gioBatDau, gio_ketthuc: tinhGioKetThuc(gioBatDau) };
            }

            if (field === "hinh_thuc_hoc") {
                return {
                    ...prev,
                    hinh_thuc_hoc: value,
                    dia_chi_hoc: value === "offline" ? prev.dia_chi_hoc : "",
                };
            }

            return { ...prev, [field]: value };
        });
        setThongBao("");
    };

    const slotTrungLichBan = (ngay, gioBatDau) => slotTrungDanhSachLichBan(lichBanGiaSu, ngay, gioBatDau);

    const slotTrungBuoiDangChon = (ngay, gioBatDau, boQuaIndex = null) => {
        const gioKetThuc = tinhGioKetThuc(gioBatDau);

        return buoiLinhHoat.some((buoi, index) => (
            index !== boQuaIndex
            && buoi.ngay === ngay
            && gioBatDau < buoi.gio_ketthuc
            && gioKetThuc > buoi.gio_batdau
        ));
    };

    const slotBiKhoa = (ngay, gioBatDau, boQuaIndex = null) => (
        slotTrungLichBan(ngay, gioBatDau) || slotTrungBuoiDangChon(ngay, gioBatDau, boQuaIndex)
    );

    const khungGioRanhDauTien = (ngay, boQuaIndex = null) => (
        cacKhungGioBatDau.find((gio) => !slotBiKhoa(ngay, gio, boQuaIndex)) || GIO_BAT_DAU_MIN
    );

    const taoLichDinhKyXemTruoc = (gioBatDau) => {
        const thuHocSo = thuHoc.map((thu) => thuSangSo[thu]).filter(Boolean);
        const lich = [];
        const ngay = new Date(`${form.ngay_batdau}T00:00:00`);

        if (thuHocSo.length === 0 || Number.isNaN(ngay.getTime())) return lich;

        while (lich.length < soBuoi) {
            const thuIso = ngay.getDay() === 0 ? 7 : ngay.getDay();
            if (thuHocSo.includes(thuIso)) {
                lich.push({
                    ngay: dinhDangNgay(ngay),
                    gio_batdau: gioBatDau,
                    gio_ketthuc: tinhGioKetThuc(gioBatDau),
                });
            }

            ngay.setDate(ngay.getDate() + 1);
        }

        return lich;
    };

    const lichTrungDinhKy = (gioBatDau) => (
        taoLichDinhKyXemTruoc(gioBatDau)
            .filter((buoi) => slotTrungLichBan(buoi.ngay, buoi.gio_batdau))
    );

    const khungGioDinhKyBiKhoa = (gioBatDau) => lichTrungDinhKy(gioBatDau).length > 0;

    const toggleThu = (thu) => {
        setThuHoc((prev) => {
            if (prev.includes(thu)) return prev.filter((item) => item !== thu);
            if (prev.length >= SO_THU_TOI_DA) return prev;
            return [...prev, thu];
        });
        setThongBao("");
    };

    const capNhatBuoi = (index, field, value) => {
        if (field === "ngay") {
            const soBuoiTrongNgay = buoiLinhHoat.filter((buoi, i) => i !== index && buoi.ngay === value).length;
            if (soBuoiTrongNgay >= 2) {
                setThongBao("Một ngày tối đa chỉ được chọn 2 buổi học. Vui lòng chọn ngày khác.");
                return;
            }
        }

        setBuoiLinhHoat((prev) =>
            prev.map((buoi, currentIndex) =>
                currentIndex === index
                    ? (() => {
                        if (field === "ngay") {
                            const gioBatDau = slotBiKhoa(value, buoi.gio_batdau, index)
                                ? khungGioRanhDauTien(value, index)
                                : buoi.gio_batdau;

                            return { ...buoi, ngay: value, gio_batdau: gioBatDau, gio_ketthuc: tinhGioKetThuc(gioBatDau) };
                        }

                        const gioBatDau = field === "gio_batdau" ? gioiHanGioBatDau(value) : buoi.gio_batdau;

                        return {
                            ...buoi,
                            [field]: field === "gio_batdau" ? gioBatDau : value,
                            ...(field === "gio_batdau" ? { gio_ketthuc: tinhGioKetThuc(gioBatDau) } : {}),
                        };
                    })()
                    : buoi,
            ),
        );
        setThongBao("");
    };

    const themBuoiLinhHoat = () => {
        setBuoiLinhHoat((prev) => {
            if (prev.length >= soBuoi) return prev;

            let count = 1;
            let ngayMoi = ngayMai();
            let gioBatDau;

            while (true) {
                const vnTimeString = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
                const d = new Date(vnTimeString.replace(" ", "T"));
                d.setDate(d.getDate() + count);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                ngayMoi = `${yyyy}-${mm}-${dd}`;

                if (prev.filter((b) => b.ngay === ngayMoi).length < 2) {
                    gioBatDau = cacKhungGioBatDau.find((gio) => {
                        const gioKetThuc = tinhGioKetThuc(gio);
                        const trungLichGiaSu = slotTrungLichBan(ngayMoi, gio);
                        const trungBuoiDangChon = prev.some((buoi) => (
                            buoi.ngay === ngayMoi
                            && gio < buoi.gio_ketthuc
                            && gioKetThuc > buoi.gio_batdau
                        ));

                        return !trungLichGiaSu && !trungBuoiDangChon;
                    }) || GIO_BAT_DAU_MIN;
                    break;
                }

                count++;
            }

            return [
                ...prev,
                { ngay: ngayMoi, gio_batdau: gioBatDau, gio_ketthuc: tinhGioKetThuc(gioBatDau) },
            ];
        });
        setThongBao("");
    };

    const xoaBuoiLinhHoat = (index) => {
        setBuoiLinhHoat((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setThongBao("");

        if (!isAuthenticated) {
            setThongBao("Bạn cần đăng nhập tài khoản học viên trước khi đặt lịch.");
            return;
        }

        if (user?.vai_tro !== "hocvien") {
            setThongBao("Chức năng đặt lịch dành cho tài khoản học viên.");
            return;
        }

        if (loaiGoi === "hoc_thu" && daDangKyHocThu) {
            setThongBao("Bạn đã đăng ký gói học thử trước đó. Vui lòng chọn gói định kỳ hoặc không định kỳ.");
            return;
        }

        if (!form.monhoc_id) {
            setThongBao("Vui lòng chọn môn học.");
            return;
        }

        if (monHocDaDatIds.has(String(form.monhoc_id))) {
            setThongBao("Môn học này đã có gói đang xử lý hoặc đang học. Vui lòng chọn môn khác.");
            return;
        }

        if (danhSachGoi.length === 0) {
            setThongBao("Chưa có dữ liệu gói học. Vui lòng chạy seeder loại gói.");
            return;
        }

        if (!goiDangChon) {
            setThongBao("Vui lòng chọn một gói học trước khi gửi yêu cầu.");
            return;
        }

        const buoiLinhHoatGui = buoiLinhHoat.map((buoi) => {
            const gioBatDau = gioiHanGioBatDau(buoi.gio_batdau);

            return {
                ngay: buoi.ngay,
                gio_batdau: gioBatDau,
                gio_ketthuc: tinhGioKetThuc(gioBatDau),
            };
        });

        if (loaiGoi === "dinh_ky" && thuHoc.length === 0) {
            setThongBao("Vui lòng chọn ít nhất một thứ học cố định.");
            return;
        }

        if (loaiGoi === "dinh_ky" && thuHoc.length > SO_THU_TOI_DA) {
            setThongBao(`Chỉ được chọn tối đa ${SO_THU_TOI_DA} thứ học cố định.`);
            return;
        }

        if (loaiGoi === "dinh_ky" && !hopLeKhoangGioBatDau(form.gio_batdau)) {
            setThongBao(`Giờ bắt đầu phải trong khoảng ${GIO_BAT_DAU_MIN} - ${GIO_BAT_DAU_MAX}.`);
            return;
        }

        if (loaiGoi === "dinh_ky" && !cachNhauDungThoiLuong(form.gio_batdau, form.gio_ketthuc)) {
            setThongBao("Giờ kết thúc phải cách giờ bắt đầu đúng 1 giờ 30 phút.");
            return;
        }

        if (loaiGoi === "dinh_ky") {
            const buoiTrung = lichTrungDinhKy(form.gio_batdau)[0];
            if (buoiTrung) {
                setThongBao(`Khung giờ ${buoiTrung.ngay} ${buoiTrung.gio_batdau} - ${buoiTrung.gio_ketthuc} đã có lịch của gia sư. Vui lòng chọn giờ khác.`);
                return;
            }
        }

        if (loaiGoi === "hoc_thu" && !hopLeKhoangGioBatDau(form.gio_batdau)) {
            setThongBao(`Giờ bắt đầu phải trong khoảng ${GIO_BAT_DAU_MIN} - ${GIO_BAT_DAU_MAX}.`);
            return;
        }

        if (loaiGoi === "hoc_thu" && !cachNhauDungThoiLuong(form.gio_batdau, form.gio_ketthuc)) {
            setThongBao("Buổi học thử phải kéo dài đúng 1 giờ 30 phút.");
            return;
        }

        if (loaiGoi === "hoc_thu" && !laThoiDiemHocTuongLai(form.ngay_batdau, form.gio_batdau)) {
            setThongBao("Vui lòng chọn ngày và giờ học thử chưa diễn ra.");
            return;
        }

        if (loaiGoi === "hoc_thu" && slotTrungLichBan(form.ngay_batdau, form.gio_batdau)) {
            setThongBao("Khung giờ học thử này đã có lịch. Vui lòng chọn khung giờ khác.");
            return;
        }

        if (loaiGoi === "khong_dinh_ky" && buoiLinhHoat.length === 0) {
            setThongBao("Vui lòng thêm ít nhất một buổi học.");
            return;
        }

        if (loaiGoi === "khong_dinh_ky" && buoiLinhHoat.length !== soBuoi) {
            setThongBao(`Gói này có ${soBuoi} buổi. Vui lòng chọn đủ ${soBuoi} buổi học.`);
            return;
        }

        if (loaiGoi === "khong_dinh_ky" && buoiLinhHoatGui.some((buoi) => !hopLeKhoangGioBatDau(buoi.gio_batdau))) {
            setThongBao(`Giờ bắt đầu phải trong khoảng ${GIO_BAT_DAU_MIN} - ${GIO_BAT_DAU_MAX}.`);
            return;
        }

        if (loaiGoi === "khong_dinh_ky" && buoiLinhHoatGui.some((buoi) => !cachNhauDungThoiLuong(buoi.gio_batdau, buoi.gio_ketthuc))) {
            setThongBao("Mỗi buổi học phải kéo dài đúng 1 giờ 30 phút.");
            return;
        }

        if (loaiGoi === "khong_dinh_ky" && buoiLinhHoatGui.some((buoi, index) => slotBiKhoa(buoi.ngay, buoi.gio_batdau, index))) {
            setThongBao("Có buổi học bị trùng lịch hoặc trùng khung giờ vừa chọn. Vui lòng chọn lại.");
            return;
        }

        if (form.hinh_thuc_hoc === "offline" && !form.dia_chi_hoc.trim()) {
            setThongBao("Vui lòng nhập địa chỉ học tại nhà.");
            return;
        }

        setDangGui(true);

        try {
            const response = await api.post(`/gia-su/${giaSu.id}/goi-hoc`, {
                monhoc_id: form.monhoc_id,
                loai_goi: loaiGoi,
                loai_goi_id: loaiGoi !== "hoc_thu" ? goiDangChon.id : null,
                goi_id: goiDangChon.id,
                ten_goi: goiDangChon.ten,
                so_thang: goiDangChon.soThang,
                so_buoi: soBuoi,
                giam_gia: goiDangChon.giamGia,
                ngay_batdau: form.ngay_batdau,
                gio_batdau: form.gio_batdau,
                gio_ketthuc: form.gio_ketthuc,
                thu_hoc: loaiGoi === "dinh_ky" ? thuHoc.map((thu) => thuSangSo[thu]).filter(Boolean) : [],
                buoi_linh_hoat: loaiGoi === "khong_dinh_ky" ? buoiLinhHoatGui : [],
                hinh_thuc_hoc: form.hinh_thuc_hoc,
                dia_chi_hoc: form.hinh_thuc_hoc === "offline" ? form.dia_chi_hoc.trim() : "",
            });

            if (response.data.success) {
                const maGoi = response.data.data?.ma;
                setGoiHocCuaToi((prev) => [
                    ...prev,
                    {
                        id: response.data.data?.id || `moi-${Date.now()}`,
                        monHocId: form.monhoc_id,
                        kieuGoi: loaiGoi,
                        trangThai: "cho_xacnhan",
                    },
                ]);
                if (loaiGoi === "hoc_thu") {
                    setLoaiGoi("dinh_ky");
                    setGoiId("");
                }
                setForm((prev) => ({ ...prev, monhoc_id: "" }));
                setThongBao(`${response.data.message}${maGoi ? ` Mã gói học: ${maGoi}.` : ""}`, "success");
            }
        } catch (error) {
            console.error("Không thể gửi yêu cầu đặt lịch:", error);
            setThongBao(
                error.response?.data?.message
                || "Không thể gửi yêu cầu đặt lịch. Vui lòng kiểm tra lại thông tin.",
            );
        } finally {
            setDangGui(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-[#07122f] px-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
                    Đang tải dữ liệu đặt lịch...
                </div>
            </div>
        );
    }

    if (!giaSu) {
        return (
            <div className="min-h-[65vh] bg-[#07122f] px-6 py-12 text-white">
                <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0d1854] p-8 text-center">
                    <h1 className="text-2xl font-extrabold">Không tìm thấy gia sư</h1>
                    <p className="mt-2 text-sm text-slate-300">Bạn cần chọn một gia sư trước khi đặt lịch.</p>
                    <Link to="/gia-su" className="mt-6 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastThongBao message={thongBao} type={loaiThongBao} onClose={() => setThongBao("")} />
            <div className="min-h-screen bg-[#07122f] text-white">
                <section className="border-b border-white/10 bg-[#09173a]">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Link to={`/gia-su/${giaSu.id}`} className="text-sm font-semibold text-blue-300 hover:text-blue-200">
                                Quay lại chi tiết gia sư
                            </Link>
                            <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
                                Chọn gói và đặt lịch học
                            </h1>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                            <div className="text-sm text-slate-300">Gia sư</div>
                            <div className="mt-1 text-lg font-extrabold">{giaSu.user?.ho_ten || "Gia sư"}</div>
                            <div className="mt-1 text-sm font-semibold text-blue-300">{dinhDangGia(giaSu)}</div>
                        </div>
                    </div>
                </section>

                <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                            <h2 className="text-xl font-extrabold">1. Chọn môn và gói học</h2>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Môn học</span>
                                    <select
                                        value={form.monhoc_id}
                                        onChange={(event) => capNhatForm("monhoc_id", event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                    >
                                        <option value="">Chọn môn học</option>
                                        {monHocsCoTheDat.map((mon) => {
                                            const daDatMon = monHocDaDatIds.has(String(mon.id));

                                            return (
                                                <option
                                                    key={mon.id}
                                                    value={mon.id}
                                                    disabled={daDatMon}
                                                    className={daDatMon ? "bg-slate-900 text-slate-500" : ""}
                                                >
                                                    {dinhDangTenMon(mon)}{daDatMon ? " - đã đặt" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {monHocDaDatIds.size > 0 && (
                                        <p className="mt-2 text-xs font-medium text-slate-400">
                                            Môn đã có gói đang xử lý hoặc đang học sẽ bị khóa riêng với tài khoản của bạn.
                                        </p>
                                    )}
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Hình thức học</span>
                                    <select
                                        value={form.hinh_thuc_hoc}
                                        onChange={(event) => capNhatForm("hinh_thuc_hoc", event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                    >
                                        <option value="online">Online</option>
                                        <option value="offline">Tại nhà</option>
                                    </select>
                                    {form.hinh_thuc_hoc === "online" && (
                                        <p className="mt-2 text-xs font-medium text-blue-400">
                                            * Link lớp học sẽ được gia sư cập nhật trước khi bắt đầu buổi học.
                                        </p>
                                    )}
                                </label>
                            </div>

                            <div className={`mt-5 grid ${daDangKyHocThu ? "grid-cols-2" : "grid-cols-3"} gap-2 rounded-2xl bg-[#07122f] p-2`}>
                                {!daDangKyHocThu && (
                                    <button
                                        type="button"
                                        onClick={() => doiLoaiGoi("hoc_thu")}
                                        className={[
                                            "rounded-xl px-4 py-3 text-sm font-bold transition",
                                            loaiGoi === "hoc_thu" ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/5",
                                        ].join(" ")}
                                    >
                                        Học thử
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => doiLoaiGoi("dinh_ky")}
                                    className={[
                                        "rounded-xl px-4 py-3 text-sm font-bold transition",
                                        loaiGoi === "dinh_ky" ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/5",
                                    ].join(" ")}
                                >
                                    Định kỳ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => doiLoaiGoi("khong_dinh_ky")}
                                    className={[
                                        "rounded-xl px-4 py-3 text-sm font-bold transition",
                                        loaiGoi === "khong_dinh_ky" ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/5",
                                    ].join(" ")}
                                >
                                    Không định kỳ
                                </button>
                            </div>

                            {loaiGoi === "hoc_thu" && (
                                <button
                                    type="button"
                                    onClick={() => chonGoi(goiHocThu)}
                                    className={[
                                        "mt-5 w-full rounded-2xl border p-5 text-left transition",
                                        String(goiId) === String(goiHocThu.id)
                                            ? "border-blue-400 bg-blue-500/15"
                                            : "border-white/10 bg-white/[0.03] hover:border-white/25",
                                    ].join(" ")}
                                >
                                    <div>
                                        <span className="w-fit rounded-full bg-blue-300/15 px-3 py-1 text-xs font-bold text-blue-100">
                                            Trải nghiệm trước
                                        </span>
                                        <h3 className="mt-4 text-2xl font-extrabold text-white">Buổi học thử</h3>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                            Một buổi để học viên làm quen với gia sư, trao đổi mục tiêu học tập và thử phong cách dạy trước khi chọn gói dài hơn.
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
                                            <span className="rounded-full bg-white/10 px-3 py-1">1 buổi</span>
                                            <span className="rounded-full bg-white/10 px-3 py-1">90 phút</span>
                                            <span className="rounded-full bg-white/10 px-3 py-1">Chọn 1 ngày học</span>
                                        </div>
                                    </div>
                                    <div className="mt-5 text-sm font-bold text-white">
                                        {String(goiId) === String(goiHocThu.id) ? "Đang chọn" : "Chọn gói này"}
                                    </div>
                                    <div className="hidden">
                                        <div className="text-sm font-semibold text-slate-300">Gói học thử</div>
                                        <div className="mt-2 text-3xl font-extrabold text-blue-300">1</div>
                                        <div className="text-sm font-semibold text-slate-200">buổi học</div>
                                        <div className="mt-5 text-sm font-bold text-white">Đang chọn</div>
                                    </div>
                                </button>
                            )}

                            <div className={`${loaiGoi === "hoc_thu" ? "hidden" : "grid"} mt-5 gap-4 ${lopLuoiGoi}`}>
                                {danhSachGoi.map((goi) => (
                                    <button
                                        key={goi.id}
                                        type="button"
                                        onClick={() => chonGoi(goi)}
                                        className={[
                                            "flex min-h-56 flex-col rounded-2xl border p-5 text-left transition",
                                            String(goiId) === String(goi.id)
                                                ? "border-blue-400 bg-blue-500/15"
                                                : "border-white/10 bg-white/[0.03] hover:border-white/25",
                                        ].join(" ")}
                                    >
                                        <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                                            {goi.phuHop}
                                        </span>
                                        <h3 className="mt-4 text-xl font-extrabold">{goi.ten}</h3>
                                        <div className="mt-2 text-3xl font-extrabold text-blue-300">
                                            {goi.soThang}
                                            <span className="ml-1 text-sm font-semibold text-slate-300">tháng</span>
                                        </div>
                                        <div className="mt-2 text-sm font-semibold text-slate-200">
                                            {goi.soBuoiMoiThang} buổi/tháng
                                        </div>
                                        {goi.giamGia > 0 && (
                                            <div className="mt-3 w-fit rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                                                Giảm {goi.giamGia}%
                                            </div>
                                        )}
                                        <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{goi.moTa}</p>
                                        <span className="mt-5 text-sm font-bold text-white">
                                            {String(goiId) === String(goi.id) ? "Đang chọn" : "Chọn gói này"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                            <h2 className="text-xl font-extrabold">2. Chọn lịch học</h2>

                            {loaiGoi === "dinh_ky" ? (
                                <div className="mt-5 space-y-5">
                                    <div>
                                        <div className="mb-2 text-sm font-semibold text-slate-200">Thứ học cố định</div>
                                        <p className="mb-3 text-xs font-medium text-blue-200">
                                            Chọn tối đa 2 thứ học cố định trong tuần.
                                        </p>
                                        <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
                                            {cacThu.map((thu) => {
                                                const daChon = thuHoc.includes(thu);
                                                const biKhoa = !daChon && thuHoc.length >= SO_THU_TOI_DA;

                                                return (
                                                    <button
                                                        key={thu}
                                                        type="button"
                                                        onClick={() => toggleThu(thu)}
                                                        disabled={biKhoa}
                                                        className={[
                                                            "rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
                                                            daChon
                                                                ? "border-blue-400 bg-blue-500/20 text-white"
                                                                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25",
                                                        ].join(" ")}
                                                    >
                                                        {thu}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-200">Ngày bắt đầu</span>
                                        <input
                                            type="date"
                                            value={form.ngay_batdau}
                                            readOnly
                                            tabIndex={-1}
                                            className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white/80 outline-none transition focus:border-blue-400 md:w-64"
                                        />
                                        <p className="mt-2 text-xs font-medium text-blue-200">
                                            Tự sinh theo ngày học đầu tiên gần nhất trong các thứ đã chọn.
                                        </p>
                                    </label>

                                    <div className="space-y-3">
                                        <p className="text-xs font-medium leading-5 text-blue-200">
                                            Khung giờ học: bắt đầu từ 07:00 đến 19:30, mỗi buổi kéo dài 1 giờ 30 phút và kết thúc muộn nhất lúc 21:00.
                                        </p>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-200">Giờ bắt đầu</span>
                                                <select
                                                    value={form.gio_batdau}
                                                    onChange={(event) => capNhatForm("gio_batdau", event.target.value)}
                                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                                >
                                                    {cacKhungGioBatDau.map((gio) => {
                                                        const biKhoa = khungGioDinhKyBiKhoa(gio);
                                                        return (
                                                            <option key={gio} value={gio} disabled={biKhoa}>
                                                                {gio}{biKhoa ? " - đã có lịch" : ""}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                {lichTrungDinhKy(form.gio_batdau)[0] && (
                                                    <p className="mt-2 text-xs font-medium leading-5 text-amber-200">
                                                        Khung giờ này đã có lịch ngày {lichTrungDinhKy(form.gio_batdau)[0].ngay}. Vui lòng chọn giờ khác.
                                                    </p>
                                                )}
                                            </label>
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-200">Giờ kết thúc</span>
                                                <input
                                                    type="text"
                                                    value={form.gio_ketthuc}
                                                    readOnly
                                                    tabIndex={-1}
                                                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white/80 outline-none transition focus:border-blue-400"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : loaiGoi === "hoc_thu" ? (
                                <div className="mt-5 space-y-5">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-200">Ngày học thử</span>
                                        <input
                                            type="date"
                                            value={form.ngay_batdau}
                                            min={ngayHomNay()}
                                            onChange={(event) => capNhatForm("ngay_batdau", event.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 md:w-64"
                                        />
                                    </label>

                                    <div className="space-y-3">
                                        <p className="text-xs font-medium leading-5 text-blue-200">
                                            Buổi học thử kéo dài 1 giờ 30 phút. Giờ bắt đầu từ 07:00 đến 19:30 và kết thúc muộn nhất lúc 21:00.
                                        </p>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-200">Giờ bắt đầu</span>
                                                <select
                                                    value={form.gio_batdau}
                                                    onChange={(event) => capNhatForm("gio_batdau", event.target.value)}
                                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                                >
                                                    {cacKhungGioBatDau.map((gio) => {
                                                        const daQuaGio = !laThoiDiemHocTuongLai(form.ngay_batdau, gio);
                                                        const biKhoa = daQuaGio || slotTrungLichBan(form.ngay_batdau, gio);

                                                        return (
                                                            <option key={gio} value={gio} disabled={biKhoa}>
                                                                {gio}{daQuaGio ? " - đã qua giờ" : slotTrungLichBan(form.ngay_batdau, gio) ? " - trùng lịch gia sư" : ""}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </label>
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-200">Giờ kết thúc</span>
                                                <input
                                                    type="text"
                                                    value={form.gio_ketthuc}
                                                    readOnly
                                                    tabIndex={-1}
                                                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white/80 outline-none transition focus:border-blue-400"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    <p className="text-xs font-medium text-blue-200">
                                        Mỗi buổi học chọn giờ bắt đầu từ 07:00 đến 19:30, kéo dài 1 giờ 30 phút và kết thúc muộn nhất lúc 21:00.
                                    </p>
                                    <div className="flex justify-end">
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                                            {buoiLinhHoat.length}/{soBuoi} buổi
                                        </span>
                                    </div>
                                    {buoiLinhHoat.map((buoi, index) => (
                                        <div key={`${buoi.ngay}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                                            <input
                                                type="date"
                                                value={buoi.ngay}
                                                onChange={(event) => capNhatBuoi(index, "ngay", event.target.value)}
                                                className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                            />
                                            <select
                                                value={buoi.gio_batdau}
                                                onChange={(event) => capNhatBuoi(index, "gio_batdau", event.target.value)}
                                                className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                            >
                                                {cacKhungGioBatDau.map((gio) => {
                                                    const trungLichGiaSu = slotTrungLichBan(buoi.ngay, gio);
                                                    const trungBuoiDaChon = slotTrungBuoiDangChon(buoi.ngay, gio, index);
                                                    const biKhoa = trungLichGiaSu || trungBuoiDaChon;

                                                    return (
                                                        <option key={gio} value={gio} disabled={biKhoa}>
                                                            {gio}{trungLichGiaSu ? " - trùng lịch gia sư" : trungBuoiDaChon ? " - trùng buổi đã chọn" : ""}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <input
                                                type="text"
                                                value={buoi.gio_ketthuc}
                                                readOnly
                                                tabIndex={-1}
                                                className="cursor-not-allowed rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white/80 outline-none transition focus:border-blue-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => xoaBuoiLinhHoat(index)}
                                                disabled={buoiLinhHoat.length === 1}
                                                className="rounded-xl border border-red-300/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={themBuoiLinhHoat}
                                        disabled={buoiLinhHoat.length >= soBuoi}
                                        className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Thêm buổi học
                                    </button>
                                </div>
                            )}
                        </section>

                        {form.hinh_thuc_hoc === "offline" && (
                            <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                                <h2 className="text-xl font-extrabold">3. Địa chỉ học</h2>
                                <input
                                    value={form.dia_chi_hoc}
                                    onChange={(event) => capNhatForm("dia_chi_hoc", event.target.value)}
                                    placeholder="Nhập địa chỉ học tại nhà"
                                    className="mt-5 w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400"
                                />
                            </section>
                        )}

                        <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                            <button
                                type="submit"
                                disabled={dangGui}
                                className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {dangGui ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt lịch"}
                            </button>
                        </section>
                    </form>

                    <aside className="h-fit rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <h2 className="text-lg font-extrabold">Tóm tắt</h2>
                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Gia sư</span>
                                <span className="text-right font-semibold">{giaSu.user?.ho_ten || "Gia sư"}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Môn học</span>
                                <span className="text-right font-semibold">{monHocDaChon ? dinhDangTenMon(monHocDaChon) : "Chưa chọn"}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Loại gói</span>
                                <span className="text-right font-semibold">
                                    {loaiGoi === "hoc_thu" ? "Học thử" : loaiGoi === "dinh_ky" ? "Định kỳ" : "Không định kỳ"}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Gói</span>
                                <span className="text-right font-semibold">{goiDangChon?.ten || "Chưa chọn"}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Số buổi</span>
                                <span className="text-right font-semibold">{soBuoi} buổi</span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Giảm giá</span>
                                <span className="text-right font-semibold">
                                    {(goiDangChon?.giamGia || 0) > 0 ? `${goiDangChon.giamGia}%` : "Không có"}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Trước giảm</span>
                                <div className="flex flex-col text-right">
                                    <span className="font-semibold">
                                        {loaiGoi === "hoc_thu"
                                            ? "0 đ"
                                            : tienGoi.tongTruocGiam
                                                ? `${tienGoi.tongTruocGiam.toLocaleString("vi-VN")} đ`
                                                : "Chờ báo giá"}
                                    </span>
                                    {tienGoi.tongTruocGiam > 0 && (
                                        <div className="mt-1 space-y-1 text-xs text-slate-400">
                                            <div>({dinhDangTien(tienGoi.donGia)} x {soBuoi} buổi x 1.5 giờ.)</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {tienGoi.tienGiam > 0 && (
                                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                    <span className="text-slate-400">Tiết kiệm</span>
                                    <span className="text-right font-semibold text-emerald-300">
                                        {tienGoi.tienGiam.toLocaleString("vi-VN")} đ
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Lịch</span>
                                <span className="text-right font-semibold">
                                    {loaiGoi === "hoc_thu"
                                        ? `${form.ngay_batdau} ${form.gio_batdau} - ${form.gio_ketthuc}`
                                        : loaiGoi === "dinh_ky"
                                            ? thuHoc.join(", ") || "Chưa chọn"
                                            : "Chọn từng buổi"}
                                </span>
                            </div>
                            <div className="rounded-2xl bg-white/5 p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Tạm tính
                                </div>
                                <div className="mt-2 text-2xl font-extrabold text-blue-300">
                                    {loaiGoi === "hoc_thu" ? "0 đ" : tamTinh ? `${tamTinh.toLocaleString("vi-VN")} đ` : "Chờ báo giá"}
                                </div>
                                {loaiGoi !== "hoc_thu" && tienGoi.donGia > 0 && (
                                    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs text-slate-300">
                                        <div className="mb-2 font-semibold text-slate-200">Cách tính đơn giá/giờ</div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between gap-3">
                                                <span>Giá môn</span>
                                                <span className="font-semibold text-slate-100">{dinhDangTien(mucGiaDangChon?.gia_mon)}</span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span>Cộng trình độ</span>
                                                <span className="font-semibold text-slate-100">{dinhDangTien(mucGiaDangChon?.gia_cong_trinh_do)}</span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span>Cộng kinh nghiệm</span>
                                                <span className="font-semibold text-slate-100">{dinhDangTien(mucGiaDangChon?.gia_cong_kinh_nghiem)}</span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span>Cộng hệ số giá</span>
                                                <span className="font-semibold text-slate-100">{dinhDangTien(mucGiaDangChon?.gia_cong_them)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-between gap-3 border-t border-white/10 pt-2 font-bold text-blue-200">
                                            <span>Đơn giá/giờ</span>
                                            <span>{dinhDangTien(tienGoi.donGia)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </>
    );
}

export default ChonGoiHoc;
