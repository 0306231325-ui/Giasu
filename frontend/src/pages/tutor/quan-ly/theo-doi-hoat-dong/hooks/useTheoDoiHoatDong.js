import { useEffect, useState } from "react";
import { useToast } from "../../../../../context/ToastContext";
import api from "../../../../../services/api";
import { duLieuRong } from "../constants";

function useTheoDoiHoatDong() {
    const toast = useToast();
    const [boLocDanhGia, setBoLocDanhGia] = useState("");
    const [boLocThoiGian, setBoLocThoiGian] = useState("tat_ca");
    const [duLieu, setDuLieu] = useState(duLieuRong);
    const [dangTai, setDangTai] = useState(false);

    useEffect(() => {
        let daHuy = false;

        const taiTheoDoiHoatDong = async () => {
            setDangTai(true);

            try {
                const response = await api.get("/gia-su/theo-doi-hoat-dong", {
                    params: {
                        thoi_gian: boLocThoiGian,
                        so_sao: boLocDanhGia || undefined,
                    },
                });

                if (!daHuy) {
                    setDuLieu(response.data.data || duLieuRong);
                }
            } catch (error) {
                if (!daHuy) {
                    setDuLieu(duLieuRong);
                    toast.error(error.response?.data?.message || "Không thể tải dữ liệu theo dõi hoạt động.");
                }
            } finally {
                if (!daHuy) {
                    setDangTai(false);
                }
            }
        };

        void taiTheoDoiHoatDong();

        return () => {
            daHuy = true;
        };
    }, [boLocDanhGia, boLocThoiGian, toast]);

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
