import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../../../context/ToastContext";
import api from "../../../../../services/api";

function useQuanLyLichDay() {
    const toast = useToast();
    const [tab, setTab] = useState("lich_hoc");
    const [danhSachLichHoc, setDanhSachLichHoc] = useState([]);
    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [danhSachYeuCauDoiBuoi, setDanhSachYeuCauDoiBuoi] = useState([]);
    const [dangTai, setDangTai] = useState(false);
    const [dangXuLyId, setDangXuLyId] = useState(null);

    const taiDuLieu = useCallback(async () => {
        setDangTai(true);

        try {
            const [lichHocResponse, yeuCauResponse, yeuCauDoiBuoiResponse] = await Promise.all([
                api.get("/gia-su/lich-day"),
                api.get("/gia-su/yeu-cau-dat-goi"),
                api.get("/gia-su/yeu-cau-doi-buoi"),
            ]);

            setDanhSachLichHoc(lichHocResponse.data.data || []);
            setDanhSachYeuCau(yeuCauResponse.data.data || []);
            setDanhSachYeuCauDoiBuoi(yeuCauDoiBuoiResponse.data.data || []);
        } catch (error) {
            console.error("Không thể tải lịch dạy gia sư:", error);
            toast.error(error.response?.data?.message || "Không thể tải dữ liệu lịch dạy.");
        } finally {
            setDangTai(false);
        }
    }, [toast]);

    useEffect(() => {
        const boDemTaiLanDau = setTimeout(() => {
            taiDuLieu();
        }, 0);

        const lamMoi = () => {
            taiDuLieu();
            toast.success("Đã làm mới dữ liệu lịch dạy.");
        };

        window.addEventListener("giasu:refresh", lamMoi);

        return () => {
            clearTimeout(boDemTaiLanDau);
            window.removeEventListener("giasu:refresh", lamMoi);
        };
    }, [taiDuLieu, toast]);

    const soYeuCauChoPhanHoi = useMemo(
        () =>
            danhSachYeuCau.filter(
                (yeuCau) => yeuCau.trangThai === "cho_phan_hoi",
            ).length,
        [danhSachYeuCau],
    );

    const soYeuCauDoiBuoiChoPhanHoi = useMemo(
        () =>
            danhSachYeuCauDoiBuoi.filter(
                (yeuCau) => yeuCau.trangThai === "cho_gia_su_xac_nhan",
            ).length,
        [danhSachYeuCauDoiBuoi],
    );

    const capNhatYeuCau = useCallback((yeuCauMoi) => {
        setDanhSachYeuCau((hienTai) =>
            hienTai.map((yeuCau) =>
                yeuCau.id === yeuCauMoi.id ? yeuCauMoi : yeuCau,
            ),
        );
    }, []);

    const capNhatYeuCauDoiBuoi = useCallback((yeuCauMoi) => {
        setDanhSachYeuCauDoiBuoi((hienTai) =>
            hienTai.map((yeuCau) =>
                yeuCau.id === yeuCauMoi.id ? yeuCauMoi : yeuCau,
            ),
        );
    }, []);

    const capNhatLichHoc = useCallback((lichMoi) => {
        setDanhSachLichHoc((hienTai) =>
            hienTai.map((lichHoc) =>
                lichHoc.id === lichMoi.id ? lichMoi : lichHoc,
            ),
        );
    }, []);

    const xacNhanBuoiHoc = useCallback(
        async (lichHoc, payload) => {
            if (!lichHoc || dangXuLyId) return false;

            setDangXuLyId(`lich-${lichHoc.id}`);

            try {
                const response = await api.post(
                    `/gia-su/lich-day/${lichHoc.id}/xac-nhan-hoan-thanh`,
                    payload,
                );

                capNhatLichHoc(response.data.data);
                toast.success(response.data.message || "Đã ghi nhận xác nhận buổi học.");
                return true;
            } catch (error) {
                console.error("Không thể xác nhận buổi học:", error);
                toast.error(error.response?.data?.message || "Không thể xác nhận buổi học.");
                return false;
            } finally {
                setDangXuLyId(null);
            }
        },
        [capNhatLichHoc, dangXuLyId, toast],
    );

    const capNhatLinkHocOnline = useCallback(
        async (lichHoc, linkHocOnline) => {
            if (!lichHoc || dangXuLyId) return false;

            setDangXuLyId(`link-${lichHoc.id}`);

            try {
                const response = await api.patch(
                    `/gia-su/lich-day/${lichHoc.id}/link-hoc-online`,
                    {
                        link_hoc_online: linkHocOnline,
                    },
                );

                capNhatLichHoc(response.data.data);
                toast.success(response.data.message || "Đã cập nhật link lớp học.");
                return true;
            } catch (error) {
                console.error("Không thể cập nhật link lớp học:", error);
                toast.error(
                    error.response?.data?.message ||
                    "Không thể cập nhật link lớp học.",
                );
                return false;
            } finally {
                setDangXuLyId(null);
            }
        },
        [capNhatLichHoc, dangXuLyId, toast],
    );

    const phanHoiYeuCau = useCallback(
        async (yeuCau, ketQua, lyDo = "") => {
            if (!yeuCau || dangXuLyId) return;

            setDangXuLyId(yeuCau.id);

            try {
                const response = await api.patch(
                    `/gia-su/yeu-cau-dat-goi/${yeuCau.id}/phan-hoi`,
                    {
                        phan_hoi: ketQua,
                        ly_do: lyDo,
                    },
                );

                capNhatYeuCau(response.data.data);
                toast.success(response.data.message || "Đã ghi nhận phản hồi của bạn.");

                if (ketQua === "dong_y") {
                    taiDuLieu();
                }
            } catch (error) {
                console.error("Không thể phản hồi yêu cầu đặt gói:", error);
                toast.error(
                    error.response?.data?.message ||
                    "Không thể phản hồi yêu cầu đặt gói.",
                );
            } finally {
                setDangXuLyId(null);
            }
        },
        [capNhatYeuCau, dangXuLyId, taiDuLieu, toast],
    );

    const phanHoiYeuCauDoiBuoi = useCallback(
        async (yeuCau, ketQua, lyDo = "") => {
            if (!yeuCau || dangXuLyId) return;

            setDangXuLyId(`doi-buoi-${yeuCau.id}`);

            try {
                const response = await api.patch(
                    `/gia-su/yeu-cau-doi-buoi/${yeuCau.id}/phan-hoi`,
                    {
                        phan_hoi: ketQua,
                        ly_do: lyDo,
                    },
                );

                capNhatYeuCauDoiBuoi(response.data.data);
                toast.success(response.data.message || "Đã ghi nhận phản hồi đổi buổi.");
            } catch (error) {
                console.error("Không thể phản hồi yêu cầu đổi buổi:", error);
                toast.error(
                    error.response?.data?.message ||
                    "Không thể phản hồi yêu cầu đổi buổi.",
                );
            } finally {
                setDangXuLyId(null);
            }
        },
        [capNhatYeuCauDoiBuoi, dangXuLyId, toast],
    );

    const layKhoangThoiGianBan = useCallback(
        async (lichHocId, ngayHoc) => {
            if (!lichHocId || !ngayHoc) return [];
            try {
                const response = await api.get(`/gia-su/lich-day/${lichHocId}/khoang-thoi-gian-ban`, {
                    params: { ngay_hoc: ngayHoc },
                });
                return response.data.data || [];
            } catch (error) {
                console.error("Không thể lấy khoảng thời gian bận:", error);
                return [];
            }
        },
        []
    );

    const guiYeuCauDoiBuoi = useCallback(
        async (lichHoc, payload) => {
            if (!lichHoc || dangXuLyId) return false;

            setDangXuLyId(`yeu-cau-doi-buoi-${lichHoc.id}`);

            try {
                const response = await api.post(
                    `/gia-su/lich-day/${lichHoc.id}/doi-buoi`,
                    payload
                );

                toast.success(response.data.message || "Đã gửi yêu cầu đổi buổi học.");
                taiDuLieu(); // Làm mới dữ liệu
                return true;
            } catch (error) {
                console.error("Không thể gửi yêu cầu đổi buổi:", error);
                const thongDiepLoi = error.response?.data?.errors 
                    ? Object.values(error.response.data.errors)[0][0]
                    : error.response?.data?.message || "Không thể gửi yêu cầu đổi buổi.";
                toast.error(thongDiepLoi);
                return false;
            } finally {
                setDangXuLyId(null);
            }
        },
        [dangXuLyId, taiDuLieu, toast]
    );

    return {
        tab,
        setTab,
        danhSachLichHoc,
        danhSachYeuCau,
        danhSachYeuCauDoiBuoi,
        dangTai,
        dangXuLyId,
        soYeuCauChoPhanHoi,
        soYeuCauDoiBuoiChoPhanHoi,
        xacNhanBuoiHoc,
        capNhatLinkHocOnline,
        phanHoiYeuCau,
        phanHoiYeuCauDoiBuoi,
        layKhoangThoiGianBan,
        guiYeuCauDoiBuoi,
    };
}

export default useQuanLyLichDay;
