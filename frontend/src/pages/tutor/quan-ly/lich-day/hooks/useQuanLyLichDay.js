import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../../../context/ToastContext";
import api from "../../../../../services/api";

function useQuanLyLichDay() {
    const toast = useToast();
    const [tab, setTab] = useState("lich_hoc");
    const [danhSachLichHoc, setDanhSachLichHoc] = useState([]);
    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [dangTai, setDangTai] = useState(false);
    const [dangXuLyId, setDangXuLyId] = useState(null);

    const taiDuLieu = useCallback(async () => {
        setDangTai(true);

        try {
            const [lichHocResponse, yeuCauResponse] = await Promise.all([
                api.get("/gia-su/lich-day"),
                api.get("/gia-su/yeu-cau-dat-goi"),
            ]);

            setDanhSachLichHoc(lichHocResponse.data.data || []);
            setDanhSachYeuCau(yeuCauResponse.data.data || []);
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

        return () => {
            clearTimeout(boDemTaiLanDau);
        };
    }, [taiDuLieu]);

    const soYeuCauChoPhanHoi = useMemo(
        () =>
            danhSachYeuCau.filter(
                (yeuCau) => yeuCau.trangThai === "cho_phan_hoi",
            ).length,
        [danhSachYeuCau],
    );

    const capNhatYeuCau = useCallback((yeuCauMoi) => {
        setDanhSachYeuCau((hienTai) =>
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

    return {
        tab,
        setTab,
        danhSachLichHoc,
        danhSachYeuCau,
        dangTai,
        dangXuLyId,
        soYeuCauChoPhanHoi,
        xacNhanBuoiHoc,
        phanHoiYeuCau,
    };
}

export default useQuanLyLichDay;
