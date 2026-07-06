import { useCallback, useEffect, useState } from "react";
import api from "../../../../../services/api";
import { CHUYEN_MON_MAC_DINH } from "../constants";

export default function useChuyenMon({ baoLoi, baoThanhCong }) {
    const [chuyenMon, setChuyenMon] = useState(CHUYEN_MON_MAC_DINH);
    const [banNhap, setBanNhap] = useState(CHUYEN_MON_MAC_DINH);
    const [danhMuc, setDanhMuc] = useState({ trinh_do: [], muc_kinh_nghiem: [] });
    const [dangTai, setDangTai] = useState(true);
    const [dangSua, setDangSua] = useState(false);
    const [dangLuu, setDangLuu] = useState(false);
    const [loi, setLoi] = useState({});

    const taiChuyenMon = useCallback(async () => {
        setDangTai(true);
        try {
            const phanHoi = await api.get("/gia-su/ho-so/chuyen-mon");
            const duLieu = {
                ...CHUYEN_MON_MAC_DINH,
                ...phanHoi.data.data.thong_tin,
            };
            setChuyenMon(duLieu);
            setBanNhap(duLieu);
            setDanhMuc({
                trinh_do: phanHoi.data.data.trinh_do || [],
                muc_kinh_nghiem: phanHoi.data.data.muc_kinh_nghiem || [],
            });
        } catch (error) {
            baoLoi(error.response?.data?.message || "Không thể tải thông tin chuyên môn.");
        } finally {
            setDangTai(false);
        }
    }, [baoLoi]);

    useEffect(() => {
        const boDemTaiLanDau = setTimeout(() => {
            taiChuyenMon();
        }, 0);

        return () => {
            clearTimeout(boDemTaiLanDau);
        };
    }, [taiChuyenMon]);

    const batDauSua = () => {
        setBanNhap(chuyenMon);
        setLoi({});
        setDangSua(true);
    };
    const huySua = () => {
        setBanNhap(chuyenMon);
        setLoi({});
        setDangSua(false);
    };
    const thayDoi = ({ target: { name, value } }) => {
        setBanNhap((hienTai) => ({ ...hienTai, [name]: value }));
        setLoi((hienTai) => ({ ...hienTai, [name]: undefined }));
    };
    const luu = async (suKien) => {
        suKien.preventDefault();
        setDangLuu(true);
        setLoi({});
        try {
            const phanHoi = await api.patch("/gia-su/ho-so/chuyen-mon", {
                muc_kinh_nghiem_id: Number(banNhap.muc_kinh_nghiem_id),
            });
            const duLieu = { ...CHUYEN_MON_MAC_DINH, ...phanHoi.data.data };
            setChuyenMon(duLieu);
            setBanNhap(duLieu);
            setDangSua(false);
            baoThanhCong(phanHoi.data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setLoi(error.response.data.errors || {});
            } else {
                baoLoi(error.response?.data?.message || "Không thể lưu thông tin chuyên môn.");
            }
        } finally {
            setDangLuu(false);
        }
    };

    return { chuyenMon, banNhap, danhMuc, dangTai, dangSua, dangLuu, loi, batDauSua, huySua, thayDoi, luu, taiChuyenMon };
}
