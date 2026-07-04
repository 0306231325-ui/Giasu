import { useEffect, useState } from "react";
import api from "../../../../../services/api";
import { duLieuRong } from "../constants";

function useTheoDoiHoatDong() {
    const [boLocDanhGia, setBoLocDanhGia] = useState("");
    const [boLocThoiGian, setBoLocThoiGian] = useState("tat_ca");
    const [duLieu, setDuLieu] = useState(duLieuRong);
    const [dangTai, setDangTai] = useState(false);
    const [loi, setLoi] = useState("");

    useEffect(() => {
        let daHuy = false;

        const taiTheoDoiHoatDong = async () => {
            setDangTai(true);
            setLoi("");

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
                    setLoi(error.response?.data?.message || "Không thể tải dữ liệu theo dõi hoạt động.");
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
    }, [boLocDanhGia, boLocThoiGian]);

    return {
        boLocDanhGia,
        setBoLocDanhGia,
        boLocThoiGian,
        setBoLocThoiGian,
        dangTai,
        duLieu,
        loi,
    };
}

export default useTheoDoiHoatDong;
