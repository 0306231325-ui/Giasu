import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ModalXemTaiLieu from "../../components/ModalXemTaiLieu";
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
        ten: "Gói đã hủy",
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
    da_huy: {
        ten: "Đã hủy",
        lop: "border-slate-200 bg-slate-100 text-slate-600",
    },
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
    if (soTien === null || soTien === undefined || soTien === "") return "Chờ báo giá";

    const giaTri = Number(soTien);
    if (Number.isNaN(giaTri)) return "Chờ báo giá";

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

function laGoiHocThu(goiHoc, lichHoc = {}) {
    const kieuGoi = String(goiHoc?.kieuGoi || lichHoc?.kieuGoi || "").toLowerCase();
    const loaiGoi = String(goiHoc?.loaiGoi || lichHoc?.loaiGoi || "").toLowerCase();

    return kieuGoi === "hoc_thu" || loaiGoi.includes("học thử") || loaiGoi.includes("hoc thu");
}

function laBuoiOnline(lichHoc = {}) {
    const hinhThuc = String(lichHoc.hinhThuc || lichHoc.hinhThucHoc || "").toLowerCase();

    return hinhThuc.includes("online")
        || hinhThuc.includes("trực tuyến")
        || hinhThuc.includes("truc tuyen");
}

function laBuoiHocBu(lichHoc = {}) {
    if (lichHoc.daDoiLich || lichHoc.thongTinDoiLich) return true;
    const loaiBuoi = String(lichHoc.loaiBuoi || "").toLowerCase();
    return loaiBuoi.includes("bù") || loaiBuoi.includes("bu");
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
        .replace("The ghi chu field is required when trang thai is baovan de.", "Vui lòng nhập nội dung vấn đề.")
        .replace("The ly do must not be greater than 50 characters.", "Lý do đổi buổi không được vượt quá 50 ký tự.");
}

const ngayHomNay = () => {
    const vnTimeString = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    return vnTimeString.slice(0, 10);
};

const taoDanhSachKhungGio = () => {
    const danhSach = [];
    for (let h = 7; h <= 20; h++) {
        danhSach.push(`${String(h).padStart(2, "0")}:00`);
        danhSach.push(`${String(h).padStart(2, "0")}:30`);
    }
    return danhSach;
};
const cacKhungGio = taoDanhSachKhungGio();
const SO_KY_TU_TOI_DA_LY_DO_DOI_BUOI = 50;

const congPhutVaoGio = (gio, soPhut) => {
    const [gioBatDau, phutBatDau] = String(gio || "00:00").split(":").map(Number);
    const tongPhut = gioBatDau * 60 + phutBatDau + soPhut;
    const gioKetThuc = Math.floor(tongPhut / 60);
    const phutKetThuc = tongPhut % 60;

    return `${String(gioKetThuc).padStart(2, "0")}:${String(phutKetThuc).padStart(2, "0")}`;
};

const doiGioSangPhut = (gio) => {
    const [gioSo, phutSo] = String(gio || "00:00").split(":").map(Number);
    return gioSo * 60 + phutSo;
};

const khungGioBiTrung = (gioBatDau, danhSachLichBan = []) => {
    const batDau = doiGioSangPhut(gioBatDau);
    const ketThuc = doiGioSangPhut(congPhutVaoGio(gioBatDau, 90));

    return danhSachLichBan.some((lichBan) => {
        const batDauBan = doiGioSangPhut(lichBan.gio_batdau || lichBan.gioBatDau);
        const ketThucBan = doiGioSangPhut(lichBan.gio_ketthuc || lichBan.gioKetThuc);

        return batDau < ketThucBan && ketThuc > batDauBan;
    });
};

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
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const toast = useToast();
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
    const [moFormDoiBuoi, setMoFormDoiBuoi] = useState(false);
    const [moChiTietDoiBuoi, setMoChiTietDoiBuoi] = useState(false);
    const [moFormDanhGia, setMoFormDanhGia] = useState(false);
    const [lichBanDoiBuoi, setLichBanDoiBuoi] = useState([]);
    const [dangTaiLichBanDoiBuoi, setDangTaiLichBanDoiBuoi] = useState(false);
    const [taiLieuDangXem, setTaiLieuDangXem] = useState(null);
    const setThongBao = useCallback((noiDung, loai = "error") => {
        if (!noiDung) return;

        if (loai === "success") {
            toast.success(noiDung);
            return;
        }

        toast.error(noiDung);
    }, [toast]);

    const laHocVien = user?.vai_tro === "hocvien";

    const taiLichSuThanhToan = useCallback(async () => {
        const response = await api.get("/hoc-vien/thanh-toan");
        if (response.data.success) {
            setLichSuThanhToan(response.data.data || []);
        }
    }, []);

    const moAnhMinhChung = useCallback((item) => {
        if (!item?.anhMinhChung) return;

        setTaiLieuDangXem({
            tieuDe: `Minh chứng thanh toán ${item.maGoi || ""}`.trim(),
            tenFile: String(item.anhMinhChung).split("/").pop() || "minh-chung-thanh-toan",
            urlTrucTiep: layUrlMinhChung(item.anhMinhChung),
        });
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
    }, [authLoading, isAuthenticated, laHocVien, setThongBao]);

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
            setThongBao(response.data.message || "Đã hủy gói học.", "success");
        } catch (error) {
            console.error("Khong the huy goi hoc:", error);
            setThongBao(layThongDiepLoi(error, "Khong the huy goi hoc."));
        } finally {
            setDangHuyGoiId(null);
        }
    };

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
                setThongBao(response.data.message || "Thanh toán thành công.", "success");
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

    const moChiTietBuoi = useCallback((goiHoc, lichHoc) => {
        setChiTietBuoi({ goiHoc, lichHoc });
        setMoFormDoiBuoi(false);
        setMoChiTietDoiBuoi(false);
        setMoFormDanhGia(false);
        setFormDanhGia({
            so_sao: lichHoc.danhGia?.soSao || 5,
            noi_dung: lichHoc.danhGia?.noiDung || "",
        });
        setFormDoiBuoi({
            ngay_hoc: lichHoc.ngayHoc || ngayHomNay(),
            gio_batdau: lichHoc.gioBatDau || "18:00",
            gio_ketthuc: congPhutVaoGio(lichHoc.gioBatDau || "18:00", 90),
            ly_do: "",
        });
        setFormXacNhanBuoi({
            trang_thai: "daxacnhan",
            ghi_chu: "",
        });
        setThongBao("");
    }, [setThongBao]);

    useEffect(() => {
        const moLichHocId = searchParams.get("mo_lich_hoc");
        if (moLichHocId) {
            api.get("/hoc-vien/lich-hoc")
                .then((response) => {
                    if (response.data?.success) {
                        const dsGoiMoi = response.data.data || [];
                        setDanhSachGoi(dsGoiMoi);
                        for (const goi of dsGoiMoi) {
                            const lichHocFound = (goi.lichHoc || []).find((lh) => lh.id === Number(moLichHocId));
                            if (lichHocFound) {
                                moChiTietBuoi(goi, lichHocFound);
                                setGoiDangMo(goi.id);
                                break;
                            }
                        }
                    }
                })
                .catch(console.error)
                .finally(() => {
                    setSearchParams({}, { replace: true });
                });
        }
    }, [searchParams, setSearchParams, moChiTietBuoi]);

    useEffect(() => {
        const lichHocId = chiTietBuoi?.lichHoc?.id;
        if (!lichHocId || !chiTietBuoi?.lichHoc?.coTheDoiBuoi || !moFormDoiBuoi || !formDoiBuoi.ngay_hoc) {
            setLichBanDoiBuoi([]);
            return undefined;
        }

        let dangHieuLuc = true;
        setDangTaiLichBanDoiBuoi(true);

        api.get(`/hoc-vien/lich-hoc/${lichHocId}/khoang-thoi-gian-ban`, {
            params: { ngay_hoc: formDoiBuoi.ngay_hoc },
        })
            .then((response) => {
                if (!dangHieuLuc) return;
                setLichBanDoiBuoi(response.data.success ? response.data.data || [] : []);
            })
            .catch(() => {
                if (dangHieuLuc) setLichBanDoiBuoi([]);
            })
            .finally(() => {
                if (dangHieuLuc) setDangTaiLichBanDoiBuoi(false);
            });

        return () => {
            dangHieuLuc = false;
        };
    }, [chiTietBuoi?.lichHoc?.id, chiTietBuoi?.lichHoc?.coTheDoiBuoi, moFormDoiBuoi, formDoiBuoi.ngay_hoc]);

    const guiDanhGia = async (event) => {
        event.preventDefault();
        if (!chiTietBuoi) return;

        setDangGuiDanhGia(true);
        setThongBao("");

        try {
            const response = await api.post(`/hoc-vien/lich-hoc/${chiTietBuoi.lichHoc.id}/danh-gia`, formDanhGia);

            if (response.data.success) {
                capNhatBuoiHoc(chiTietBuoi.lichHoc.id, {
                    danhGia: response.data.data,
                    coTheDanhGia: false,
                });
                setMoFormDanhGia(false);
                setThongBao(response.data.message || "Đã lưu đánh giá.", "success");
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
            const duLieuDoiBuoi = {
                ...formDoiBuoi,
                gio_ketthuc: congPhutVaoGio(formDoiBuoi.gio_batdau, 90),
            };
            const response = await api.post(`/hoc-vien/lich-hoc/${chiTietBuoi.lichHoc.id}/doi-buoi`, duLieuDoiBuoi);

            if (response.data.success) {
                capNhatBuoiHoc(chiTietBuoi.lichHoc.id, {
                    yeuCauDoiBuoi: response.data.data,
                    coTheDoiBuoi: false,
                });
                setFormDoiBuoi((hienTai) => ({ ...hienTai, ly_do: "" }));
                setMoFormDoiBuoi(false);
                setMoChiTietDoiBuoi(false);
                setThongBao(response.data.message || "Đã gửi yêu cầu đổi buổi.", "success");
            }
        } catch (error) {
            console.error("Không thể gửi yêu cầu đổi buổi:", error);
            setThongBao(layThongDiepLoi(error, "Không thể gửi yêu cầu đổi buổi."));
        } finally {
            setDangGuiDoiBuoi(false);
        }
    };

    const phanHoiYeuCauHocBu = async (phanHoi) => {
        if (!chiTietBuoi) return;

        setThongBao("");
        try {
            const response = await api.post(`/hoc-vien/lich-hoc/${chiTietBuoi.lichHoc.id}/phan-hoi-hoc-bu`, { phan_hoi: phanHoi });

            if (response.data.success) {
                // If the student accepts, the backend creates a new lesson and cancels this one
                // If they reject, the yeu_cau is updated to hoc_vien_tu_choi
                // A quick way is to trigger a refetch of the list or update local state
                // Since this component might need to refetch the whole package to get the new lesson, let's just trigger a reload or update the current lesson's request status
                if (phanHoi === "tu_choi") {
                    capNhatBuoiHoc(chiTietBuoi.lichHoc.id, {
                        yeuCauDoiBuoi: {
                            ...chiTietBuoi.lichHoc.yeuCauDoiBuoi,
                            trangThai: "hoc_vien_tu_choi"
                        }
                    });
                } else {
                    // It's accepted, the original lesson is now cancelled. We can update local state.
                    capNhatBuoiHoc(chiTietBuoi.lichHoc.id, {
                        trangThai: "da_huy",
                        yeuCauDoiBuoi: {
                            ...chiTietBuoi.lichHoc.yeuCauDoiBuoi,
                            trangThai: "da_duyet"
                        }
                    });
                    // Ideal would be to refetch data to see the new scheduled lesson.
                    // For now, updating state is enough.
                }
                setThongBao(response.data.message || "Đã phản hồi yêu cầu học bù.", "success");
            }
        } catch (error) {
            console.error("Không thể phản hồi yêu cầu học bù:", error);
            setThongBao(layThongDiepLoi(error, "Không thể phản hồi yêu cầu học bù."));
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
                capNhatBuoiHoc(chiTietBuoi.lichHoc.id, {
                    ...response.data.data,
                    coTheXacNhanHoanThanh: false,
                    hocVienXacNhan: {
                        ...(response.data.data?.hocVienXacNhan || {}),
                        trangThai: formXacNhanBuoi.trang_thai,
                    },
                });
                setFormXacNhanBuoi({ trang_thai: "daxacnhan", ghi_chu: "" });
                setThongBao(response.data.message || "Đã xác nhận buổi học.", "success");
            }
        } catch (error) {
            console.error("Không thể xác nhận buổi học:", error);
            setThongBao(layThongDiepLoi(error, "Không thể xác nhận buổi học."));
        } finally {
            setDangGuiXacNhanBuoi(false);
        }
    };

    const yeuCauDoiBuoiDangMo = chiTietBuoi?.lichHoc?.yeuCauDoiBuoi || null;

    const yeuCauHocBuTuGiaSu = yeuCauDoiBuoiDangMo?.trangThai === 'cho_hoc_vien_xac_nhan' ? yeuCauDoiBuoiDangMo : null;

    const laBuoiHocThuDangXem = chiTietBuoi ? laGoiHocThu(chiTietBuoi.goiHoc, chiTietBuoi.lichHoc) : false;
    const thongTinDoiLichThanhCong = chiTietBuoi?.lichHoc?.thongTinDoiLich || null;
    const daDoiLichThanhCong = Boolean(chiTietBuoi?.lichHoc?.daDoiLich || thongTinDoiLichThanhCong);
    const chiTietDoiBuoiDangXem = daDoiLichThanhCong
        ? {
            tieuDe: "Chi tiết đổi buổi",
            trangThai: "Đã đổi buổi",
            lopTrangThai: "bg-emerald-50 text-emerald-700",
            ngayHocText: thongTinDoiLichThanhCong?.ngayHocText || dinhDangNgay(chiTietBuoi?.lichHoc?.ngayHoc),
            gioBatDau: chiTietBuoi?.lichHoc?.gioBatDau,
            gioKetThuc: chiTietBuoi?.lichHoc?.gioKetThuc,
            khungGio: thongTinDoiLichThanhCong?.khungGio,
            lyDo: thongTinDoiLichThanhCong?.lyDo,
        }
        : yeuCauDoiBuoiDangMo
            ? {
                tieuDe: "Chi tiết yêu cầu đổi lịch học",
                trangThai: nhanTrangThaiYeuCau(yeuCauDoiBuoiDangMo.trangThai),
                lopTrangThai: "bg-sky-50 text-sky-700",
                ngayHocText: yeuCauDoiBuoiDangMo.ngayHocText || dinhDangNgay(yeuCauDoiBuoiDangMo.ngayHoc),
                gioBatDau: yeuCauDoiBuoiDangMo.gioBatDau,
                gioKetThuc: yeuCauDoiBuoiDangMo.gioKetThuc,
                khungGio: yeuCauDoiBuoiDangMo.khungGio,
                lyDo: yeuCauDoiBuoiDangMo.lyDo,
            }
            : null;
    const hocVienDaXacNhanHoanThanh = Boolean(
        chiTietBuoi?.lichHoc?.xacNhan?.hocVienDaXacNhan
        || chiTietBuoi?.lichHoc?.hocVienXacNhan?.trangThai === "daxacnhan",
    );
    const daCoDanhGia = Boolean(chiTietBuoi?.lichHoc?.danhGia);
    const coTheMoDanhGia = Boolean(chiTietBuoi?.lichHoc?.coTheDanhGia) || daCoDanhGia;
    const hienThiKhoiDoiBuoi = !laBuoiHocThuDangXem
        && !laBuoiHocBu(chiTietBuoi?.lichHoc)
        && Boolean(chiTietBuoi?.lichHoc?.coTheDoiBuoi || yeuCauDoiBuoiDangMo || daDoiLichThanhCong);
    const gioDoiBuoiDangChonBiTrung = khungGioBiTrung(formDoiBuoi.gio_batdau, lichBanDoiBuoi);

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

                <div className="mt-8 grid gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-2">
                    {[
                        { key: "goi_hoc", label: "Gói học" },
                        { key: "thanh_toan", label: "Lịch sử thanh toán" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setManHinh(item.key)}
                            className={`rounded-md px-4 py-3 text-sm font-bold transition ${manHinh === item.key ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
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
                                    className={`rounded-lg border bg-white p-4 text-left shadow-sm transition ${tab === key ? "border-sky-400 ring-4 ring-sky-100" : "border-slate-200 hover:border-sky-200"
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
                                                        <div className="grid grid-cols-[minmax(0,1fr)_120px_90px] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
                                                            <span>Thời gian</span>
                                                            <span>Trạng thái</span>
                                                        </div>
                                                        <div className="divide-y divide-slate-100">
                                                            {(goiHoc.lichHoc || []).map((lichHoc) => (
                                                                <div
                                                                    key={lichHoc.id}
                                                                    className="grid grid-cols-[minmax(0,1fr)_120px_90px] gap-3 px-4 py-3 text-sm"
                                                                >
                                                                    <span className="text-slate-600 flex flex-wrap items-center gap-1.5">
                                                                        <span>{lichHoc.thu}, {dinhDangNgay(lichHoc.ngayHoc)} · {lichHoc.gioBatDau} - {lichHoc.gioKetThuc}</span>
                                                                        {laBuoiHocBu(lichHoc) && (
                                                                            <span className="inline-flex rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                                                                                Lịch thay đổi
                                                                            </span>
                                                                        )}
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
                        onXemMinhChung={moAnhMinhChung}
                    />
                )}
            </div>

            <ModalXemTaiLieu
                taiLieu={taiLieuDangXem}
                onDong={() => setTaiLieuDangXem(null)}
                onLoi={(noiDung) => setThongBao(noiDung)}
            />

            {chiTietBuoi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/70 bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.32)]">
                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-white via-sky-50/80 to-white px-6 py-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-sm font-bold uppercase text-sky-600">Chi tiết buổi học</p>
                                        <NhanTrangThai trangThai={chiTietBuoi.lichHoc.trangThai} loai="buoi" />
                                    </div>
                                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                                        {dinhDangMonVaLop(chiTietBuoi.goiHoc)}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Gia sư {chiTietBuoi.goiHoc.giaSu} · Gói {chiTietBuoi.goiHoc.ma}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={!coTheMoDanhGia}
                                        onClick={() => {
                                            if (coTheMoDanhGia) setMoFormDanhGia(true);
                                        }}
                                        className="h-10 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 hover:shadow disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                    >
                                        {daCoDanhGia ? "Xem đánh giá" : "Đánh giá"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMoFormDoiBuoi(false);
                                            setMoChiTietDoiBuoi(false);
                                            setMoFormDanhGia(false);
                                            setChiTietBuoi(null);
                                        }}
                                        className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-6">
                            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <p className="text-xs font-bold uppercase text-slate-500">Thông tin chi tiết</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <ThongTinBuoi label="Ngày học" value={`${chiTietBuoi.lichHoc.thu}, ${dinhDangNgay(chiTietBuoi.lichHoc.ngayHoc)}`} />
                                    <ThongTinBuoi label="Khung giờ" value={`${chiTietBuoi.lichHoc.gioBatDau} - ${chiTietBuoi.lichHoc.gioKetThuc}`} />
                                    <ThongTinBuoi label="Hình thức" value={chiTietBuoi.lichHoc.hinhThuc} />
                                    <ThongTinBuoi label="Địa điểm" value={chiTietBuoi.lichHoc.diaDiem} />
                                </div>

                                {laBuoiOnline(chiTietBuoi.lichHoc) && (
                                    <div className="mt-5 border-t border-slate-100 pt-4">
                                        <p className="text-xs font-bold uppercase text-sky-700">
                                            Link lớp học online
                                        </p>
                                        {chiTietBuoi.lichHoc.linkHocOnline ? (
                                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <a
                                                    href={chiTietBuoi.lichHoc.linkHocOnline}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="min-w-0 truncate text-sm font-bold text-blue-700 hover:underline"
                                                >
                                                    {chiTietBuoi.lichHoc.linkHocOnline}
                                                </a>
                                                <a
                                                    href={chiTietBuoi.lichHoc.linkHocOnline}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
                                                >
                                                    Vào lớp học
                                                </a>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                                Gia sư chưa cập nhật link lớp học.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {hienThiKhoiDoiBuoi && (
                                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase text-sky-700">Đổi buổi</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                                {daDoiLichThanhCong
                                                    ? "Lịch học đã được cập nhật."
                                                    : yeuCauDoiBuoiDangMo
                                                        ? "Yêu cầu đổi buổi đã được gửi."
                                                        : "Chọn lịch khác khi cần đổi buổi học."}
                                            </p>
                                        </div>
                                        {daDoiLichThanhCong ? (
                                            <button
                                                type="button"
                                                onClick={() => setMoChiTietDoiBuoi(true)}
                                                className="h-10 rounded-xl border border-sky-200 bg-white px-4 text-sm font-bold text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:shadow"
                                            >
                                                Xem chi tiết
                                            </button>
                                        ) : chiTietBuoi.lichHoc.coTheDoiBuoi ? (
                                            <button
                                                type="button"
                                                onClick={() => setMoFormDoiBuoi(true)}
                                                className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 hover:shadow-md"
                                            >
                                                Yêu cầu đổi buổi
                                            </button>
                                        ) : yeuCauDoiBuoiDangMo && (
                                            <button
                                                type="button"
                                                onClick={() => setMoChiTietDoiBuoi(true)}
                                                className="h-10 rounded-xl border border-sky-200 bg-white px-4 text-sm font-bold text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:shadow"
                                            >
                                                Xem chi tiết
                                            </button>
                                        )}
                                    </div>
                                )}
                            </section>

                            <div className="grid gap-5 lg:items-start">
                                {yeuCauHocBuTuGiaSu && yeuCauHocBuTuGiaSu.trangThai === 'cho_hoc_vien_xac_nhan' && (
                                    <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-blue-700">Yêu cầu học bù từ gia sư</p>
                                            </div>
                                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                                Cần phản hồi
                                            </span>
                                        </div>

                                        <div className="mt-4 rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm">
                                            <p className="font-bold text-slate-900">Gia sư xin phép dời buổi học này sang:</p>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase text-slate-400">Ngày học mới</p>
                                                    <p className="font-medium text-slate-900 mt-0.5">{yeuCauHocBuTuGiaSu.ngayHocText}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase text-slate-400">Khung giờ mới</p>
                                                    <p className="font-medium text-slate-900 mt-0.5">{yeuCauHocBuTuGiaSu.khungGio}</p>
                                                </div>
                                            </div>
                                            {yeuCauHocBuTuGiaSu.lyDo && (
                                                <div className="mt-3 rounded bg-slate-50 p-2.5">
                                                    <p className="text-[11px] font-bold uppercase text-slate-400">Lý do từ gia sư:</p>
                                                    <p className="mt-1 font-medium text-slate-700 leading-relaxed">{yeuCauHocBuTuGiaSu.lyDo}</p>
                                                </div>
                                            )}

                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    type="button"
                                                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 hover:shadow-md"
                                                    onClick={() => phanHoiYeuCauHocBu("dong_y")}
                                                >
                                                    Đồng ý
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex-1 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                                    onClick={() => phanHoiYeuCauHocBu("tu_choi")}
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase text-emerald-700">Xác nhận</p>
                                        </div>
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                                            {chiTietBuoi.lichHoc.loaiBuoi || "Học thường"}
                                        </span>
                                    </div>

                                    {chiTietBuoi.lichHoc.hocVienXacNhan?.trangThai ? (
                                        <div className="mt-4 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm">
                                            <p className="font-bold text-slate-900">
                                                Học viên: {nhanTrangThaiXacNhan(chiTietBuoi.lichHoc.hocVienXacNhan.trangThai)}
                                            </p>
                                            {chiTietBuoi.lichHoc.hocVienXacNhan?.thoiGian && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {chiTietBuoi.lichHoc.hocVienXacNhan.thoiGian}
                                                </p>
                                            )}
                                            {chiTietBuoi.lichHoc.hocVienXacNhan?.ghiChu && (
                                                <p className="mt-2 text-slate-600">{chiTietBuoi.lichHoc.hocVienXacNhan.ghiChu}</p>
                                            )}
                                        </div>
                                    ) : null}


                                    {chiTietBuoi.lichHoc.coTheXacNhanHoanThanh ? (
                                        <form onSubmit={guiXacNhanBuoiHoc} className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Xác nhận đã học xong</p>
                                                {!chiTietBuoi.lichHoc.xacNhan?.giaSuDaXacNhan ? (
                                                    <p className="mt-1 text-xs font-semibold text-amber-600">Bạn cần chờ gia sư xác nhận trước.</p>
                                                ) : (
                                                    <div>
                                                        <p className="mt-1 text-xs font-semibold text-slate-500">Buổi học diễn ra bình thường.</p>
                                                        <p className="mt-1.5 text-[11px] font-bold text-red-600 italic">* Hệ Thống Sẽ Tự Động Xác Nhận Hoàn Thành Buổi Học Sau 8 Tiếng Khi Kết Thúc Buổi Học.</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={dangGuiXacNhanBuoi || !chiTietBuoi.lichHoc.xacNhan?.giaSuDaXacNhan}
                                                className="h-10 shrink-0 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                                            >
                                                {dangGuiXacNhanBuoi ? "Đang gửi..." : "Gửi xác nhận"}
                                            </button>
                                        </form>
                                    ) : null}
                                </section>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {chiTietBuoi && moFormDanhGia && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
                    <form
                        onSubmit={guiDanhGia}
                        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase text-amber-700">Đánh giá</p>
                                <h2 className="mt-1 text-xl font-bold text-slate-950">Phản hồi buổi học</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {dinhDangMonVaLop(chiTietBuoi.goiHoc)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMoFormDanhGia(false)}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                                Đóng
                            </button>
                        </div>

                        {chiTietBuoi.lichHoc.danhGia && (
                            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="font-bold">Đã đánh giá</p>
                                    <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm">
                                        {[1, 2, 3, 4, 5].map((sao) => (
                                            <span
                                                key={sao}
                                                className={sao <= chiTietBuoi.lichHoc.danhGia.soSao ? "text-lg leading-none text-amber-500" : "text-lg leading-none text-slate-200"}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </span>
                                </div>
                                {chiTietBuoi.lichHoc.danhGia.noiDung && (
                                    <p className="mt-3 whitespace-pre-wrap break-words text-slate-700 [overflow-wrap:anywhere]">
                                        {chiTietBuoi.lichHoc.danhGia.noiDung}
                                    </p>
                                )}
                            </div>
                        )}

                        {!chiTietBuoi.lichHoc.danhGia && (
                            <div className="mt-5 space-y-4">
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
                                                    "h-10 w-10 rounded-xl border bg-white text-lg font-black shadow-sm transition hover:shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
                                                    formDanhGia.so_sao >= sao
                                                        ? "border-amber-300 text-amber-600"
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
                                    className="w-full resize-none rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                                />
                                {!chiTietBuoi.lichHoc.coTheDanhGia && (
                                    <p className="text-xs font-semibold text-amber-700/80">
                                        {chiTietBuoi.lichHoc.danhGia
                                            ? "Buổi học này đã được đánh giá. Mỗi buổi chỉ đánh giá một lần."
                                            : "Chỉ có thể đánh giá sau khi buổi học hoàn thành."}
                                    </p>
                                )}
                            </div>
                        )}

                        {!chiTietBuoi.lichHoc.danhGia && (
                            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setMoFormDanhGia(false)}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={!chiTietBuoi.lichHoc.coTheDanhGia || dangGuiDanhGia}
                                    className="h-10 rounded-xl bg-amber-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                                >
                                    {dangGuiDanhGia ? "Đang lưu..." : "Lưu đánh giá"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {chiTietDoiBuoiDangXem && moChiTietDoiBuoi && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-xs font-bold uppercase text-sky-700">Đổi buổi</p>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${chiTietDoiBuoiDangXem.lopTrangThai}`}>
                                        {chiTietDoiBuoiDangXem.trangThai}
                                    </span>
                                </div>
                                <h2 className="mt-2 text-xl font-bold text-slate-950">{chiTietDoiBuoiDangXem.tieuDe}</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {chiTietBuoi.lichHoc.ma} · {dinhDangMonVaLop(chiTietBuoi.goiHoc)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMoChiTietDoiBuoi(false)}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="mt-5 grid gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm shadow-sm sm:grid-cols-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase text-slate-400">Ngày mới</p>
                                <p className="mt-1 font-bold text-slate-950">
                                    {chiTietDoiBuoiDangXem.ngayHocText}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase text-slate-400">Giờ bắt đầu</p>
                                <p className="mt-1 font-bold text-slate-950">
                                    {chiTietDoiBuoiDangXem.gioBatDau}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase text-slate-400">Giờ kết thúc</p>
                                <p className="mt-1 font-bold text-slate-950">
                                    {chiTietDoiBuoiDangXem.gioKetThuc}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                            <p className="text-[11px] font-bold uppercase text-slate-400">Nhận xét</p>
                            <p className="mt-2 whitespace-pre-wrap break-words font-semibold text-slate-700">
                                {chiTietDoiBuoiDangXem.lyDo || "Không có lý do"}
                            </p>
                        </div>

                        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setMoChiTietDoiBuoi(false)}
                                className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 hover:shadow-md"
                            >
                                Đã xem
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {chiTietBuoi?.lichHoc?.coTheDoiBuoi && moFormDoiBuoi && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
                    <form
                        onSubmit={guiYeuCauDoiBuoi}
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase text-sky-700">Đổi buổi</p>
                                <h2 className="mt-1 text-xl font-bold text-slate-950">Yêu cầu đổi lịch học</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {chiTietBuoi.lichHoc.ma} · {dinhDangMonVaLop(chiTietBuoi.goiHoc)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMoFormDoiBuoi(false)}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Ngày mới</span>
                                <input
                                    type="date"
                                    min={ngayHomNay()}
                                    value={formDoiBuoi.ngay_hoc}
                                    onChange={(event) => setFormDoiBuoi((hienTai) => ({ ...hienTai, ngay_hoc: event.target.value }))}
                                    className="h-11 w-full rounded-xl border border-sky-100 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Giờ bắt đầu</span>
                                <select
                                    value={formDoiBuoi.gio_batdau}
                                    onChange={(event) => {
                                        const gioBatDau = event.target.value;
                                        setFormDoiBuoi((hienTai) => ({
                                            ...hienTai,
                                            gio_batdau: gioBatDau,
                                            gio_ketthuc: congPhutVaoGio(gioBatDau, 90),
                                        }));
                                    }}
                                    className="h-11 w-full rounded-xl border border-sky-100 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                >
                                    {cacKhungGio.map((gio) => {
                                        const biTrung = khungGioBiTrung(gio, lichBanDoiBuoi);

                                        return (
                                            <option key={gio} value={gio} disabled={biTrung}>
                                                {gio}{biTrung ? " - da co lich" : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                                {dangTaiLichBanDoiBuoi && (
                                    <p className="mt-1 text-xs font-semibold text-sky-600">Dang kiem tra lich ban...</p>
                                )}
                                {!dangTaiLichBanDoiBuoi && gioDoiBuoiDangChonBiTrung && (
                                    <p className="mt-1 text-xs font-semibold text-amber-600">
                                        Khung gio nay bi trung lich da dat hoac lich cua gia su.
                                    </p>
                                )}
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Giờ kết thúc</span>
                                <input
                                    type="text"
                                    value={formDoiBuoi.gio_ketthuc}
                                    readOnly
                                    className="h-11 w-full rounded-xl border border-sky-100 bg-slate-100 px-3 text-sm font-semibold text-slate-600 outline-none"
                                />
                                <p className="mt-1 text-xs text-slate-500">Tự tính 1 giờ 30 phút từ giờ bắt đầu.</p>
                            </label>
                            <label className="block md:col-span-3">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Lý do đổi buổi</span>
                                <textarea
                                    rows={4}
                                    value={formDoiBuoi.ly_do}
                                    maxLength={SO_KY_TU_TOI_DA_LY_DO_DOI_BUOI}
                                    onChange={(event) => {
                                        const lyDo = event.target.value.slice(0, SO_KY_TU_TOI_DA_LY_DO_DOI_BUOI);
                                        setFormDoiBuoi((hienTai) => ({ ...hienTai, ly_do: lyDo }));
                                    }}
                                    placeholder="Ví dụ: em bận lịch kiểm tra, muốn chuyển sang buổi khác"
                                    className="w-full resize-none rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                />
                                <div className="mt-1 flex justify-between gap-3 text-xs font-semibold text-slate-500">
                                    <span>Nhập tối đa {SO_KY_TU_TOI_DA_LY_DO_DOI_BUOI} ký tự.</span>
                                    <span>{formDoiBuoi.ly_do.length}/{SO_KY_TU_TOI_DA_LY_DO_DOI_BUOI}</span>
                                </div>
                            </label>
                        </div>

                        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setMoFormDoiBuoi(false)}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={dangGuiDoiBuoi || dangTaiLichBanDoiBuoi || gioDoiBuoiDangChonBiTrung}
                                className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                            >
                                {dangGuiDoiBuoi ? "Đang gửi..." : "Gửi yêu cầu đổi buổi"}
                            </button>
                        </div>
                    </form>
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

function LichSuThanhToan({ danhSach, thongKe, onXemMinhChung }) {
    return (
        <div className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TheThanhToan tieuDe="Tất cả giao dịch" giaTri={thongKe.tat_ca} />
                <TheThanhToan tieuDe="Đã thanh toán" giaTri={thongKe.da_thanhtoan} moTa={dinhDangTien(thongKe.tongDaThanhToan)} noiBat />
                <TheThanhToan tieuDe="Chờ duyệt" giaTri={thongKe.cho_thanhtoan} />
                <TheThanhToan tieuDe="Thất bại" giaTri={thongKe.that_bai} />
            </div>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-lg font-bold">Lịch sử thanh toán</h2>
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
                                                <button
                                                    type="button"
                                                    onClick={() => onXemMinhChung?.(item)}
                                                    className="inline-flex rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
                                                >
                                                    Xem ảnh
                                                </button>
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
            {moTa && (
                <div className={`mt-1 text-xs font-semibold ${noiBat ? "text-emerald-700" : "text-slate-400"}`}>{moTa}</div>
            )}
        </section>
    );
}

function ThongTinBuoi({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
            <p className="mt-1.5 text-sm font-bold text-slate-900">{value || "Chưa cập nhật"}</p>
        </div>
    );
}

function nhanTrangThaiYeuCau(trangThai) {
    return {
        cho_duyet: "Chờ admin xử lý",
        cho_gia_su_xac_nhan: "Chờ gia sư xác nhận",
        giasu_dong_y: "Gia sư đã đồng ý",
        giasu_tu_choi: "Gia sư từ chối",
        da_duyet: "Đã duyệt đổi buổi",
        tu_choi: "Đã từ chối",
    }[trangThai] || "Chưa cập nhật";
}

function nhanTrangThaiXacNhan(trangThai) {
    return {
        daxacnhan: "Đã xác nhận",
        baovan_de: "Báo vấn đề",
    }[trangThai] || "Chưa xác nhận";
}

export default LichHocCuaToi;
