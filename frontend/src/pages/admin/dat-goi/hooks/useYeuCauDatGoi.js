import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import api from "../../../../services/api";
import { TRANG_THAI_MAC_DINH, BO_LOC_TRANG_THAI } from "../constants";
import { coThongTinChoXacNhanThanhToan } from "../utils";

function useYeuCauDatGoi() {
    const toast = useToast();
    const location = useLocation();

    const layTrangThaiTuHash = () => {
        const hash = location.hash.replace("#", "");
        if (hash && BO_LOC_TRANG_THAI.some((muc) => muc.value === hash)) {
            return hash;
        }
        return null;
    };

    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [boLocTrangThai, setBoLocTrangThai] = useState(() => layTrangThaiTuHash() || TRANG_THAI_MAC_DINH);
    const [boLocTrangThaiCon, setBoLocTrangThaiCon] = useState("tat_ca");
    const [tuKhoa, setTuKhoa] = useState("");
    const [yeuCauDangChonId, setYeuCauDangChonId] = useState(null);
    const [dangTai, setDangTai] = useState(false);
    const [dangXuLyHanhDong, setDangXuLyHanhDong] = useState(false);
    const [hopThoaiXacNhan, setHopThoaiXacNhan] = useState(null);
    const [hopThoaiLyDo, setHopThoaiLyDo] = useState(null);

    const hienToast = useCallback((noiDung, loai = "info") => {
        if (!noiDung) return;
        const hien = toast[loai] ?? toast.info;
        hien(noiDung);
    }, [toast]);

    const layViTriCuon = () => ({
        left: window.scrollX,
        top: window.scrollY,
    });

    const khoiPhucViTriCuon = useCallback((viTriCuon) => {
        window.requestAnimationFrame(() => {
            window.scrollTo({
                left: viTriCuon.left,
                top: viTriCuon.top,
                behavior: "auto",
            });
        });
    }, []);

    const taiDanhSach = useCallback(async ({ lamMoiBoLoc = false } = {}) => {
        setDangTai(true);

        try {
            const response = await api.get("/admin/dat-goi");
            const danhSach = response.data.data || [];

            setDanhSachYeuCau(danhSach);
            setYeuCauDangChonId((hienTai) => (
                danhSach.some((yeuCau) => yeuCau.id === hienTai)
                    ? hienTai
                    : danhSach[0]?.id
            ));

            if (lamMoiBoLoc) {
                setBoLocTrangThai(TRANG_THAI_MAC_DINH);
                setTuKhoa("");
            }
        } catch (error) {
            console.error("Không thể tải danh sách đặt gói:", error);
            hienToast(error.response?.data?.message || "Không thể tải danh sách đặt gói.", "error");
        } finally {
            setDangTai(false);
        }
    }, [hienToast]);

    useEffect(() => {
        const lamMoi = () => {
            taiDanhSach({ lamMoiBoLoc: true });
            hienToast("Đã làm mới dữ liệu đặt gói.", "success");
        };

        window.addEventListener("admin:refresh", lamMoi);
        const boDemTaiLanDau = setTimeout(() => {
            taiDanhSach();
        }, 0);

        return () => {
            window.removeEventListener("admin:refresh", lamMoi);
            clearTimeout(boDemTaiLanDau);
        };
    }, [hienToast, taiDanhSach]);

    useEffect(() => {
        const hash = layTrangThaiTuHash();
        if (hash) {
            setBoLocTrangThai(hash);
            setBoLocTrangThaiCon("tat_ca");
            setYeuCauDangChonId(null);
        }
    }, [location.hash]);

    //lọc trạng thái nè 
    const danhSachDaLoc = useMemo(() => {
        const tuKhoaChuanHoa = tuKhoa.trim().toLowerCase();

        return danhSachYeuCau.filter((yeuCau) => {
            const laBoLocDacBiet = [
                "cho_thanh_toan",
                "xac_nhan_thanh_toan",
                "danh_sach_goi_hoc",
            ].includes(boLocTrangThai);

            const khopNhomThanhToan =
                (boLocTrangThai === "cho_thanh_toan" &&
                    yeuCau.trangThai === "cho_thanh_toan" &&
                    !coThongTinChoXacNhanThanhToan(yeuCau)) ||
                (boLocTrangThai === "xac_nhan_thanh_toan" &&
                    yeuCau.trangThai === "cho_thanh_toan" &&
                    coThongTinChoXacNhanThanhToan(yeuCau)) ||
                (boLocTrangThai === "danh_sach_goi_hoc" &&
                    ["dang_hoc", "hoan_thanh"].includes(yeuCau.trangThai) &&
                    (boLocTrangThaiCon === "tat_ca" || yeuCau.trangThai === boLocTrangThaiCon));

            const khopTrangThai =
                laBoLocDacBiet
                    ? khopNhomThanhToan
                    : yeuCau.trangThai === boLocTrangThai;

            const noiDungTimKiem = [
                yeuCau.ma,
                yeuCau.hocVien,
                yeuCau.giaSu,
                yeuCau.mon,
                yeuCau.capHoc,
            ]
                .join(" ")
                .toLowerCase();

            const khopTuKhoa =
                !tuKhoaChuanHoa || noiDungTimKiem.includes(tuKhoaChuanHoa);

            return khopTrangThai && khopTuKhoa;
        });
    }, [boLocTrangThai, boLocTrangThaiCon, danhSachYeuCau, tuKhoa]);

    const yeuCauDangChon =
        danhSachDaLoc.find((yeuCau) => yeuCau.id === yeuCauDangChonId) ??
        danhSachDaLoc[0] ??
        null;

    const demTheoTrangThai = (trangThai) => {
        if (trangThai === "cho_thanh_toan") {
            return danhSachYeuCau.filter((yeuCau) =>
                yeuCau.trangThai === "cho_thanh_toan" &&
                !coThongTinChoXacNhanThanhToan(yeuCau),
            ).length;
        }

        if (trangThai === "xac_nhan_thanh_toan") {
            return danhSachYeuCau.filter((yeuCau) =>
                yeuCau.trangThai === "cho_thanh_toan" &&
                coThongTinChoXacNhanThanhToan(yeuCau),
            ).length;
        }

        if (trangThai === "danh_sach_goi_hoc") {
            return danhSachYeuCau.filter((yeuCau) => ["dang_hoc", "hoan_thanh"].includes(yeuCau.trangThai)).length;
        }

        return danhSachYeuCau.filter((yeuCau) => yeuCau.trangThai === trangThai).length;
    };

    const doiTrangThai = (trangThai) => {
        setBoLocTrangThai(trangThai);
        setBoLocTrangThaiCon("tat_ca");
        setYeuCauDangChonId(null);
        window.history.replaceState(null, "", `#${trangThai}`);
    };

    const capNhatYeuCau = (id, duLieuMoi) => {
        setDanhSachYeuCau((hienTai) =>
            hienTai.map((yeuCau) =>
                yeuCau.id === id
                    ? {
                        ...yeuCau,
                        ...duLieuMoi,
                    }
                    : yeuCau,
            ),
        );
    };

    const thucThiHanhDong = async (yeuCau, hanhDong, tuyChon = {}) => {
        if (!yeuCau || !hanhDong) return;
        setDangXuLyHanhDong(true);

        if (hanhDong === "gui_gia_su") {
            const viTriCuon = layViTriCuon();

            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/gui-gia-su`);
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("cho_xu_ly");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã gửi/nhắc yêu cầu ${yeuCau.ma} cho gia sư ${yeuCau.giaSu}.`, "success");
            } catch (error) {
                console.error("Không thể gửi yêu cầu cho gia sư:", error);
                hienToast(error.response?.data?.message || "Không thể gửi yêu cầu cho gia sư.", "error");
            } finally {
                khoiPhucViTriCuon(viTriCuon);
                setDangXuLyHanhDong(false);
            }
            return;
        }

        if (hanhDong === "nhac_thanh_toan") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/nhac-thanh-toan`);
                capNhatYeuCau(yeuCau.id, response.data.data);
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã gửi nhắc thanh toán cho học viên ${yeuCau.hocVien}.`, "success");
            } catch (error) {
                console.error("Không thể nhắc học viên thanh toán:", error);
                hienToast(error.response?.data?.message || "Không thể nhắc học viên thanh toán.", "error");
            } finally {
                setDangXuLyHanhDong(false);
            }
            return;
        }

        if (hanhDong === "duyet_thanh_toan") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/duyet-thanh-toan`);
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("danh_sach_goi_hoc");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã xác nhận thanh toán cho ${yeuCau.ma}.`, "success");
            } catch (error) {
                console.error("Không thể duyệt thanh toán:", error);
                hienToast(error.response?.data?.message || "Không thể duyệt thanh toán.", "error");
            } finally {
                setDangXuLyHanhDong(false);
            }
            return;
        }

        if (hanhDong === "tu_choi_thanh_toan") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/tu-choi-thanh-toan`, {
                    ly_do: tuyChon.lyDo?.trim() || "",
                });
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("cho_thanh_toan");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã từ chối thanh toán của ${yeuCau.ma}.`, "success");
            } catch (error) {
                console.error("Không thể từ chối thanh toán:", error);
                hienToast(error.response?.data?.message || "Không thể từ chối thanh toán.", "error");
            } finally {
                setDangXuLyHanhDong(false);
            }
            return;
        }

        if (hanhDong === "huy_yeu_cau") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/huy`, {
                    ly_do: tuyChon.lyDo?.trim() || "Admin hủy yêu cầu đặt gói.",
                });
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("da_huy");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã hủy yêu cầu ${yeuCau.ma}.`, "success");
            } catch (error) {
                console.error("Không thể hủy yêu cầu đặt gói:", error);
                hienToast(error.response?.data?.message || "Không thể hủy yêu cầu đặt gói.", "error");
            } finally {
                setDangXuLyHanhDong(false);
            }
            return;
        }

        setDangXuLyHanhDong(false);
    };

    const xuLyHanhDong = (yeuCau, hanhDong) => {
        if (!yeuCau || !hanhDong || dangXuLyHanhDong) return;

        if (hanhDong === "duyet_thanh_toan") {
            setHopThoaiXacNhan({
                yeuCau,
                hanhDong,
                tieuDe: "Xác nhận thanh toán",
                moTa: `Xác nhận thanh toán cho gói ${yeuCau.ma}? Sau khi duyệt, hệ thống sẽ chuyển gói sang danh sách gói học.`,
                nutXacNhan: "Duyệt thanh toán",
                bienThe: "primary",
            });
            return;
        }

        if (hanhDong === "tu_choi_thanh_toan") {
            setHopThoaiLyDo({
                yeuCau,
                hanhDong,
                tieuDe: "Từ chối thanh toán",
                moTa: `Nhập lý do từ chối thanh toán cho gói ${yeuCau.ma}.`,
                placeholder: "Ví dụ: Minh chứng không rõ, sai số tiền, sai mã giao dịch...",
                nutXacNhan: "Từ chối thanh toán",
            });
            return;
        }

        if (hanhDong === "huy_yeu_cau") {
            const laGoiChoThanhToan = yeuCau.trangThai === "cho_thanh_toan";
            setHopThoaiLyDo({
                yeuCau,
                hanhDong,
                tieuDe: laGoiChoThanhToan ? "Hủy gói chờ thanh toán" : "Hủy yêu cầu đặt gói",
                moTa: `Nhập lý do hủy ${laGoiChoThanhToan ? "gói chờ thanh toán" : "yêu cầu"} ${yeuCau.ma}. Lý do này sẽ được gửi cho học viên và gia sư.`,
                placeholder: laGoiChoThanhToan
                    ? "Ví dụ: Học viên không thanh toán đúng hạn, cần hủy gói..."
                    : "Ví dụ: Lịch học không phù hợp, thông tin đặt gói chưa hợp lệ...",
                nutXacNhan: laGoiChoThanhToan ? "Hủy gói" : "Hủy yêu cầu",
            });
            return;
        }

        thucThiHanhDong(yeuCau, hanhDong);
    };

    const dongHopThoaiXacNhan = () => {
        if (dangXuLyHanhDong) return;
        setHopThoaiXacNhan(null);
    };

    const xacNhanHopThoai = async () => {
        if (!hopThoaiXacNhan) return;
        const { yeuCau, hanhDong } = hopThoaiXacNhan;
        setHopThoaiXacNhan(null);
        await thucThiHanhDong(yeuCau, hanhDong);
    };

    const dongHopThoaiLyDo = () => {
        if (dangXuLyHanhDong) return;
        setHopThoaiLyDo(null);
    };

    const xacNhanHopThoaiLyDo = async (lyDo) => {
        if (!hopThoaiLyDo) return;
        const { yeuCau, hanhDong } = hopThoaiLyDo;
        setHopThoaiLyDo(null);
        await thucThiHanhDong(yeuCau, hanhDong, { lyDo });
    };

    return {
        boLocTrangThai,
        boLocTrangThaiCon,
        dangTai,
        dangXuLyHanhDong,
        danhSachDaLoc,
        hopThoaiLyDo,
        hopThoaiXacNhan,
        tuKhoa,
        yeuCauDangChon,
        dongHopThoaiLyDo,
        dongHopThoaiXacNhan,
        demTheoTrangThai,
        doiTrangThai,
        setBoLocTrangThaiCon,
        setTuKhoa,
        setYeuCauDangChonId,
        xacNhanHopThoai,
        xacNhanHopThoaiLyDo,
        xuLyHanhDong,
    };
}

export default useYeuCauDatGoi;
