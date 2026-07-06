import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../../../context/ToastContext";
import api from "../../../../../services/api";
import { duLieuRong } from "../constants";

function useTheoDoiHoatDong() {
    const toast = useToast();
    const [boLocDanhGia, setBoLocDanhGia] = useState("");
    const [boLocThoiGian, setBoLocThoiGian] = useState("tat_ca");
    const [duLieu, setDuLieu] = useState(duLieuRong);
    const [dangTai, setDangTai] = useState(false);

    const taiTheoDoiHoatDong = useCallback(async ({ imLang = false } = {}) => {
        setDangTai(true);

        try {
            const response = await api.get("/gia-su/theo-doi-hoat-dong", {
                params: {
                    thoi_gian: boLocThoiGian,
                    so_sao: boLocDanhGia || undefined,
                },
            });

            setDuLieu(response.data.data || duLieuRong);
            if (!imLang) {
                toast.success("Đã làm mới dữ liệu theo dõi hoạt động.");
            }
        } catch (error) {
            setDuLieu(duLieuRong);
            toast.error(error.response?.data?.message || "Không thể tải dữ liệu theo dõi hoạt động.");
        } finally {
            setDangTai(false);
        }
    }, [boLocDanhGia, boLocThoiGian, toast]);

    useEffect(() => {
        const boDemTaiLanDau = setTimeout(() => {
            taiTheoDoiHoatDong({ imLang: true });
        }, 0);

        const lamMoi = () => {
            taiTheoDoiHoatDong();
        };

        window.addEventListener("giasu:refresh", lamMoi);

        return () => {
            clearTimeout(boDemTaiLanDau);
            window.removeEventListener("giasu:refresh", lamMoi);
        };
    }, [taiTheoDoiHoatDong]);

    return {
        boLocDanhGia,
        setBoLocDanhGia,
        boLocThoiGian,
        setBoLocThoiGian,
        dangTai,
        duLieu,
    };
}

export default useTheoDoiHoatDong;
