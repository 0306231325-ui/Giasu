import { useEffect, useState } from "react";
import api from "../../../../../services/api";
import { THONG_TIN_CA_NHAN_MAC_DINH } from "../constants";

export default function useThongTinCaNhan({ updateUser, baoLoi, baoThanhCong }) {
    const [thongTin, setThongTin] = useState(THONG_TIN_CA_NHAN_MAC_DINH);
    const [banNhap, setBanNhap] = useState(THONG_TIN_CA_NHAN_MAC_DINH);
    const [dangTai, setDangTai] = useState(true);
    const [dangLuu, setDangLuu] = useState(false);
    const [dangChinhSua, setDangChinhSua] = useState(false);
    const [loi, setLoi] = useState({});

    useEffect(() => {
        let conHieuLuc = true;
        api.get("/gia-su/ho-so/ca-nhan")
            .then((phanHoi) => {
                if (!conHieuLuc) return;
                const duLieu = {
                    ...THONG_TIN_CA_NHAN_MAC_DINH,
                    ...phanHoi.data.data,
                };
                setThongTin(duLieu);
                setBanNhap(duLieu);
            })
            .catch((error) => {
                if (conHieuLuc) {
                    baoLoi(error.response?.data?.message || "Không thể tải thông tin cá nhân.");
                }
            })
            .finally(() => conHieuLuc && setDangTai(false));

        return () => {
            conHieuLuc = false;
        };
    }, [baoLoi]);

    const batDauSua = () => {
        setBanNhap(thongTin);
        setLoi({});
        setDangChinhSua(true);
    };

    const huySua = () => {
        setBanNhap(thongTin);
        setLoi({});
        setDangChinhSua(false);
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
            const phanHoi = await api.patch("/gia-su/ho-so/ca-nhan", banNhap);
            const duLieu = {
                ...THONG_TIN_CA_NHAN_MAC_DINH,
                ...phanHoi.data.data,
            };
            setThongTin(duLieu);
            setBanNhap(duLieu);
            setDangChinhSua(false);
            updateUser({
                ho_ten: duLieu.ho_ten,
                ngay_sinh: duLieu.ngay_sinh,
                sdt: duLieu.sdt,
                email: duLieu.email,
            });
            baoThanhCong(phanHoi.data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setLoi(error.response.data.errors || {});
            } else {
                baoLoi(error.response?.data?.message || "Không thể lưu thông tin cá nhân.");
            }
        } finally {
            setDangLuu(false);
        }
    };

    return {
        thongTin,
        banNhap,
        dangTai,
        dangLuu,
        dangChinhSua,
        loi,
        batDauSua,
        huySua,
        thayDoi,
        luu,
    };
}
