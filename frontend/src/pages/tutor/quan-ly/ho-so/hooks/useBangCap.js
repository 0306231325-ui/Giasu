import { useEffect, useState } from "react";
import api from "../../../../../services/api";
import { BANG_CAP_MAC_DINH } from "../constants";

export default function useBangCap({ baoLoi, baoThanhCong }) {
    const [danhSach, setDanhSach] = useState([]);
    const [dangTai, setDangTai] = useState(true);
    const [hienForm, setHienForm] = useState(false);
    const [form, setForm] = useState(BANG_CAP_MAC_DINH);
    const [loi, setLoi] = useState({});
    const [dangThem, setDangThem] = useState(false);
    const [idDangXoa, setIdDangXoa] = useState(null);

    useEffect(() => {
        let conHieuLuc = true;
        api.get("/gia-su/ho-so/bang-cap")
            .then((phanHoi) => conHieuLuc && setDanhSach(phanHoi.data.data || []))
            .catch((error) => conHieuLuc && baoLoi(error.response?.data?.message || "Không thể tải danh sách bằng cấp và chứng chỉ."))
            .finally(() => conHieuLuc && setDangTai(false));
        return () => {
            conHieuLuc = false;
        };
    }, [baoLoi]);

    const thayDoi = ({ target: { name, value, files } }) => {
        setForm((hienTai) => ({
            ...hienTai,
            [name]: files ? files[0] || null : value,
        }));
        setLoi((hienTai) => ({ ...hienTai, [name]: undefined }));
    };
    const dongForm = () => {
        if (dangThem) return;
        setHienForm(false);
        setForm(BANG_CAP_MAC_DINH);
        setLoi({});
    };
    const them = async (suKien) => {
        suKien.preventDefault();
        setDangThem(true);
        setLoi({});
        const duLieuGui = new FormData();
        Object.entries(form).forEach(([ten, giaTri]) => {
            if (giaTri !== null && giaTri !== "") duLieuGui.append(ten, giaTri);
        });
        try {
            const phanHoi = await api.post("/gia-su/ho-so/bang-cap", duLieuGui, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDanhSach((hienTai) => [phanHoi.data.data, ...hienTai]);
            setHienForm(false);
            setForm(BANG_CAP_MAC_DINH);
            setLoi({});
            baoThanhCong(phanHoi.data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setLoi(error.response.data.errors || {});
            } else {
                baoLoi(error.response?.data?.message || "Không thể thêm tài liệu.");
            }
        } finally {
            setDangThem(false);
        }
    };
    const xem = async (bangCap) => {
        try {
            const phanHoi = await api.get(bangCap.url_xem, { responseType: "blob" });
            const urlTam = URL.createObjectURL(phanHoi.data);
            window.open(urlTam, "_blank", "noopener,noreferrer");
            window.setTimeout(() => URL.revokeObjectURL(urlTam), 60000);
        } catch {
            baoLoi("Không thể mở file tài liệu.");
        }
    };
    const xoa = async (bangCap) => {
        if (!window.confirm(`Xóa tài liệu "${bangCap.ten_bang}"?`)) return;
        setIdDangXoa(bangCap.id);
        try {
            const phanHoi = await api.delete(`/gia-su/ho-so/bang-cap/${bangCap.id}`);
            setDanhSach((hienTai) => hienTai.filter((taiLieu) => taiLieu.id !== bangCap.id));
            baoThanhCong(phanHoi.data.message);
        } catch (error) {
            baoLoi(error.response?.data?.message || "Không thể xóa tài liệu.");
        } finally {
            setIdDangXoa(null);
        }
    };

    return { danhSach, dangTai, hienForm, form, loi, dangThem, idDangXoa, setHienForm, thayDoi, dongForm, them, xem, xoa };
}
