import { useState } from "react";
import { HO_SO_CHUYEN_MON_MAC_DINH } from "../constants";

export default function useHoSoChuyenMon() {
    const [danhSach, setDanhSach] = useState([]);
    const [hienForm, setHienForm] = useState(false);
    const [form, setForm] = useState(HO_SO_CHUYEN_MON_MAC_DINH);

    const thayDoi = ({ target: { name, value, files } }) => {
        setForm((hienTai) => ({
            ...hienTai,
            [name]: files ? files[0] || null : value,
        }));
    };

    const dongForm = () => {
        setHienForm(false);
        setForm(HO_SO_CHUYEN_MON_MAC_DINH);
    };

    const them = () => {
        if (!form.ten_bang.trim() || !form.truong_don_vi.trim() || !form.tai_lieu) {
            return;
        }
        setDanhSach((hienTai) => [
            ...hienTai,
            { ...form, id: crypto.randomUUID() },
        ]);
        dongForm();
    };

    const xoa = (id) => {
        setDanhSach((hienTai) => hienTai.filter((muc) => muc.id !== id));
    };

    return { danhSach, hienForm, form, setHienForm, thayDoi, dongForm, them, xoa };
}
