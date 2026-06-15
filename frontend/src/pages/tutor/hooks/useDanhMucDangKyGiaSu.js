import { useEffect, useState } from "react";
import api from "../../../services/api";

const danhMucBanDau = {
    trinh_do: [],
    cap_hoc: [],
    mon_hoc: [],
    muc_kinh_nghiem: [],
};

function useDanhMucDangKyGiaSu() {
    const [danhMuc, setDanhMuc] = useState(danhMucBanDau);
    const [dangTai, setDangTai] = useState(true);
    const [loi, setLoi] = useState("");

    useEffect(() => {
        let daHuy = false;

        const taiDanhMuc = async () => {
            try {
                const phanHoi = await api.get("/dang-ky-gia-su/danh-muc");

                if (!daHuy && phanHoi.data.success) {
                    setDanhMuc(phanHoi.data.data);
                }
            } catch {
                if (!daHuy) {
                    setLoi("Không thể tải dữ liệu đăng ký. Vui lòng thử lại sau.");
                }
            } finally {
                if (!daHuy) {
                    setDangTai(false);
                }
            }
        };

        taiDanhMuc();

        return () => {
            daHuy = true;
        };
    }, []);

    return { danhMuc, dangTai, loi };
}

export default useDanhMucDangKyGiaSu;
