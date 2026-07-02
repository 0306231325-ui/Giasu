import { useEffect, useState } from "react";
import api from "../../../../../services/api";
import { cauHinhBoLoc, duLieuRong, giaTriMacDinh } from "../constants";

function useThuNhapGiaSu() {
    const [boLoc, setBoLoc] = useState("thang");
    const [giaTriBoLoc, setGiaTriBoLoc] = useState(giaTriMacDinh.thang);
    const [duLieu, setDuLieu] = useState(duLieuRong);
    const [dangTai, setDangTai] = useState(false);
    const [loi, setLoi] = useState("");
    const [chiTietDangXem, setChiTietDangXem] = useState(null);

    const cauHinh = cauHinhBoLoc[boLoc];

    const doiBoLoc = (giaTri) => {
        setBoLoc(giaTri);
        setGiaTriBoLoc(giaTriMacDinh[giaTri]);
    };

    useEffect(() => {
        let daHuy = false;

        const taiThuNhap = async () => {
            setDangTai(true);
            setLoi("");

            try {
                const response = await api.get("/gia-su/thu-nhap", {
                    params: {
                        loai: boLoc,
                        gia_tri: giaTriBoLoc,
                    },
                });

                if (!daHuy) {
                    setDuLieu(response.data.data || duLieuRong);
                }
            } catch (error) {
                if (!daHuy) {
                    console.error("Không thể tải thu nhập gia sư:", error);
                    setDuLieu(duLieuRong);
                    setLoi(error.response?.data?.message || "Không thể tải dữ liệu thu nhập.");
                }
            } finally {
                if (!daHuy) {
                    setDangTai(false);
                }
            }
        };

        void taiThuNhap();

        return () => {
            daHuy = true;
        };
    }, [boLoc, giaTriBoLoc]);

    return {
        boLoc,
        cauHinh,
        chiTietDangXem,
        dangTai,
        doiBoLoc,
        duLieu,
        giaTriBoLoc,
        loi,
        setChiTietDangXem,
        setGiaTriBoLoc,
    };
}

export default useThuNhapGiaSu;
