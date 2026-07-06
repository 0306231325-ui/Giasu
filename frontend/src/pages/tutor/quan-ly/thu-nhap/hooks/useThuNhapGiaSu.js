import { useEffect, useState } from "react";
import { useToast } from "../../../../../context/ToastContext";
import api from "../../../../../services/api";
import { cauHinhBoLoc, duLieuRong, giaTriMacDinh } from "../constants";

function useThuNhapGiaSu() {
    const toast = useToast();
    const [boLoc, setBoLoc] = useState("thang");
    const [giaTriBoLoc, setGiaTriBoLoc] = useState(giaTriMacDinh.thang);
    const [duLieu, setDuLieu] = useState(duLieuRong);
    const [dangTai, setDangTai] = useState(false);
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
                    toast.error(error.response?.data?.message || "Không thể tải dữ liệu thu nhập.");
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
    }, [boLoc, giaTriBoLoc, toast]);

    return {
        boLoc,
        cauHinh,
        chiTietDangXem,
        dangTai,
        doiBoLoc,
        duLieu,
        giaTriBoLoc,
        setChiTietDangXem,
        setGiaTriBoLoc,
    };
}

export default useThuNhapGiaSu;
