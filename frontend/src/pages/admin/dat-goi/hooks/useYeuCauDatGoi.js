import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../../context/ToastContext";
import api from "../../../../services/api";
import { TRANG_THAI_MAC_DINH } from "../constants";
import { coThongTinChoXacNhanThanhToan } from "../utils";

function useYeuCauDatGoi() {
    const toast = useToast();
    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [boLocTrangThai, setBoLocTrangThai] = useState(TRANG_THAI_MAC_DINH);
    const [tuKhoa, setTuKhoa] = useState("");
    const [yeuCauDangChonId, setYeuCauDangChonId] = useState(null);
    const [dangTai, setDangTai] = useState(false);

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
                    yeuCau.trangThai === "da_tao_lich");

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
    }, [boLocTrangThai, danhSachYeuCau, tuKhoa]);

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
            return danhSachYeuCau.filter((yeuCau) => yeuCau.trangThai === "da_tao_lich").length;
        }

        return danhSachYeuCau.filter((yeuCau) => yeuCau.trangThai === trangThai).length;
    };

    const doiTrangThai = (trangThai) => {
        setBoLocTrangThai(trangThai);
        setYeuCauDangChonId(null);
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

    const xuLyHanhDong = async (yeuCau, hanhDong) => {
        if (!yeuCau || !hanhDong) return;

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
            }
            return;
        }

        if (hanhDong === "cho_thanh_toan") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/cho-thanh-toan`);
                const yeuCauMoi = response.data.data;
                capNhatYeuCau(yeuCau.id, yeuCauMoi);
                setBoLocTrangThai(yeuCauMoi?.trangThai === "da_tao_lich" ? "danh_sach_goi_hoc" : "cho_thanh_toan");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã chuyển ${yeuCau.ma} sang trạng thái chờ học viên thanh toán.`, "success");
            } catch (error) {
                console.error("Không thể chuyển sang chờ thanh toán:", error);
                hienToast(error.response?.data?.message || "Không thể chuyển sang chờ thanh toán.", "error");
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
            }
            return;
        }

        if (hanhDong === "duyet_thanh_toan") {
            const dongY = window.confirm(`Xác nhận thanh toán cho gói ${yeuCau.ma}?`);
            if (!dongY) return;

            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/duyet-thanh-toan`);
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("danh_sach_goi_hoc");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã xác nhận thanh toán cho ${yeuCau.ma}.`, "success");
            } catch (error) {
                console.error("Không thể duyệt thanh toán:", error);
                hienToast(error.response?.data?.message || "Không thể duyệt thanh toán.", "error");
            }
            return;
        }

        if (hanhDong === "tu_choi_thanh_toan") {
            const lyDo = window.prompt(`Nhập lý do từ chối thanh toán cho ${yeuCau.ma}:`);
            if (lyDo === null) return;

            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/tu-choi-thanh-toan`, {
                    ly_do: lyDo.trim(),
                });
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("cho_thanh_toan");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã từ chối thanh toán của ${yeuCau.ma}.`, "success");
            } catch (error) {
                console.error("Không thể từ chối thanh toán:", error);
                hienToast(error.response?.data?.message || "Không thể từ chối thanh toán.", "error");
            }
            return;
        }

        if (hanhDong === "xem_thanh_toan") {
            hienToast("Phần thông tin thanh toán sẽ nối sau khi có dữ liệu thanh toán.", "info");
            return;
        }

        if (hanhDong === "huy_yeu_cau") {
            const dongY = window.confirm(`Bạn muốn hủy yêu cầu ${yeuCau.ma}?`);
            if (!dongY) return;

            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/huy`, {
                    ly_do: "Admin hủy yêu cầu đặt gói.",
                });
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("da_huy");
                setYeuCauDangChonId(yeuCau.id);
                hienToast(response.data.message || `Đã hủy yêu cầu ${yeuCau.ma}.`, "success");
            } catch (error) {
                console.error("Không thể hủy yêu cầu đặt gói:", error);
                hienToast(error.response?.data?.message || "Không thể hủy yêu cầu đặt gói.", "error");
            }
        }
    };

    return {
        boLocTrangThai,
        dangTai,
        danhSachDaLoc,
        tuKhoa,
        yeuCauDangChon,
        demTheoTrangThai,
        doiTrangThai,
        setTuKhoa,
        setYeuCauDangChonId,
        xuLyHanhDong,
    };
}

export default useYeuCauDatGoi;
