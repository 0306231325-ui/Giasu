import { useCallback, useEffect, useState } from "react";
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

    const taiThuNhap = useCallback(async ({ imLang = false } = {}) => {
        setDangTai(true);

        try {
            const response = await api.get("/gia-su/thu-nhap", {
                params: {
                    loai: boLoc,
                    gia_tri: giaTriBoLoc,
                },
            });

            setDuLieu(response.data.data || duLieuRong);
            if (!imLang) {
                toast.success("Đã làm mới dữ liệu thu nhập.");
            }
        } catch (error) {
            console.error("Không thể tải thu nhập gia sư:", error);
            setDuLieu(duLieuRong);
            toast.error(error.response?.data?.message || "Không thể tải dữ liệu thu nhập.");
        } finally {
            setDangTai(false);
        }
    }, [boLoc, giaTriBoLoc, toast]);

    useEffect(() => {
        const boDemTaiLanDau = setTimeout(() => {
            taiThuNhap({ imLang: true });
        }, 0);

        const lamMoi = () => {
            taiThuNhap();
        };

        window.addEventListener("giasu:refresh", lamMoi);

        return () => {
            clearTimeout(boDemTaiLanDau);
            window.removeEventListener("giasu:refresh", lamMoi);
        };
    }, [taiThuNhap]);

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
