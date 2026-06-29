import { useState } from "react";
import { HO_SO_CHUYEN_MON_MAC_DINH } from "../constants";

export default function useHoSoChuyenMon() {
    const [danhSach, setDanhSach] = useState([]);
    const [hienForm, setHienForm] = useState(false);
    const [form, setForm] = useState(HO_SO_CHUYEN_MON_MAC_DINH);
    const [idDangSua, setIdDangSua] = useState(null);

    const thayDoi = ({ target: { name, value, files } }) => {
        setForm((hienTai) => ({
            ...hienTai,
            [name]: files ? files[0] || null : value,
        }));
    };

    const dongForm = () => {
        setHienForm(false);
        setForm(HO_SO_CHUYEN_MON_MAC_DINH);
        setIdDangSua(null);
    };

    const them = () => {
        if (
            !form.ten_bang.trim() ||
            !form.trinh_do_giasu_id ||
            !form.truong_don_vi.trim() ||
            !form.tai_lieu
        ) {
            return;
        }
        setDanhSach((hienTai) => {
            if (idDangSua) {
                return hienTai.map((muc) =>
                    muc.id === idDangSua ? { ...form, id: idDangSua } : muc,
                );
            }

            return [
                ...hienTai,
                { ...form, id: crypto.randomUUID() },
            ];
        });
        dongForm();
    };

    const sua = (id) => {
        const mucCanSua = danhSach.find((muc) => muc.id === id);
        if (!mucCanSua) return;

        setForm(mucCanSua);
        setIdDangSua(id);
        setHienForm(true);
    };

    const xoa = (id) => {
        setDanhSach((hienTai) => hienTai.filter((muc) => muc.id !== id));
    };

    const reset = () => {
        setDanhSach([]);
        setHienForm(false);
        setForm(HO_SO_CHUYEN_MON_MAC_DINH);
        setIdDangSua(null);
    };

    return {
        danhSach,
        hienForm,
        form,
        idDangSua,
        setHienForm,
        thayDoi,
        dongForm,
        them,
        sua,
        xoa,
        reset,
    };
}
