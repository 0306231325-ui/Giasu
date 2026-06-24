import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../../../services/api";

export default function useMonDay({ baoLoi, baoThanhCong }) {
    const [danhSach, setDanhSach] = useState([]);
    const [coTheThem, setCoTheThem] = useState([]);
    const [capHocs, setCapHocs] = useState([]);
    const [dangTai, setDangTai] = useState(true);
    const [hienForm, setHienForm] = useState(false);
    const [idsDaChon, setIdsDaChon] = useState([]);
    const [capHocIdsDaChon, setCapHocIdsDaChon] = useState([]);
    const [dangThem, setDangThem] = useState(false);
    const [idDangXoa, setIdDangXoa] = useState(null);
    const [tuKhoa, setTuKhoa] = useState("");
    const [locCapHoc, setLocCapHoc] = useState("");
    const [locTrangThai, setLocTrangThai] = useState("");

    const taiDanhSach = useCallback(async () => {
        const phanHoi = await api.get("/gia-su/ho-so/mon-day");
        setDanhSach(
            (phanHoi.data.data.mon_da_dang_ky || []).map((mon) => ({
                ...mon,
                gia: `${Number(mon.gia).toLocaleString("vi-VN")}đ`,
            })),
        );
        setCoTheThem(phanHoi.data.data.mon_co_the_them || []);
        setCapHocs(phanHoi.data.data.cap_hoc || []);
    }, []);

    useEffect(() => {
        let conHieuLuc = true;
        api.get("/gia-su/ho-so/mon-day")
            .then((phanHoi) => {
                if (!conHieuLuc) return;
                setDanhSach(
                    (phanHoi.data.data.mon_da_dang_ky || []).map((mon) => ({
                        ...mon,
                        gia: `${Number(mon.gia).toLocaleString("vi-VN")}đ`,
                    })),
                );
                setCoTheThem(phanHoi.data.data.mon_co_the_them || []);
                setCapHocs(phanHoi.data.data.cap_hoc || []);
            })
            .catch((error) => conHieuLuc && baoLoi(error.response?.data?.message || "Không thể tải danh sách môn dạy."))
            .finally(() => conHieuLuc && setDangTai(false));
        return () => {
            conHieuLuc = false;
        };
    }, [baoLoi, taiDanhSach]);

    const daLoc = useMemo(() => {
        const tuKhoaChuan = tuKhoa.trim().toLocaleLowerCase("vi");
        return danhSach.filter((mon) => {
            const khopTuKhoa =
                !tuKhoaChuan ||
                [mon.tenMon, mon.capHoc]
                    .filter(Boolean)
                    .some((giaTri) => giaTri.toLocaleLowerCase("vi").includes(tuKhoaChuan));
            return khopTuKhoa &&
                (!locCapHoc || String(mon.capHocId) === locCapHoc) &&
                (!locTrangThai || mon.trangThai === locTrangThai);
        });
    }, [danhSach, locCapHoc, locTrangThai, tuKhoa]);

    const monHocTheoCapDaChon = useMemo(
        () => capHocs
            .filter((capHoc) =>
                capHocIdsDaChon.includes(String(capHoc.id)),
            )
            .map((capHoc) => ({
                ...capHoc,
                monHoc: coTheThem.filter(
                    (mon) =>
                        String(mon.cap_hoc_id) === String(capHoc.id),
                ),
            })),
        [capHocIdsDaChon, capHocs, coTheThem],
    );
    const capHocIdsCoMonDeThem = useMemo(
        () => new Set(coTheThem.map((mon) => String(mon.cap_hoc_id))),
        [coTheThem],
    );

    const chonCapHoc = (id) => {
        const idChuoi = String(id);
        const dangDuocChon = capHocIdsDaChon.includes(idChuoi);

        setCapHocIdsDaChon((hienTai) =>
            dangDuocChon
                ? hienTai.filter((capHocId) => capHocId !== idChuoi)
                : [...hienTai, idChuoi],
        );

        if (dangDuocChon) {
            const monIdsThuocCap = new Set(
                coTheThem
                    .filter(
                        (mon) => String(mon.cap_hoc_id) === idChuoi,
                    )
                    .map((mon) => String(mon.id)),
            );
            setIdsDaChon((hienTai) =>
                hienTai.filter((monId) => !monIdsThuocCap.has(monId)),
            );
        }
    };

    const chonMon = (id) => {
        const idChuoi = String(id);
        setIdsDaChon((hienTai) =>
            hienTai.includes(idChuoi)
                ? hienTai.filter((monId) => monId !== idChuoi)
                : [...hienTai, idChuoi],
        );
    };
    const dongForm = () => {
        if (dangThem) return;
        setHienForm(false);
        setIdsDaChon([]);
        setCapHocIdsDaChon([]);
    };
    const them = async (suKien) => {
        suKien.preventDefault();
        setDangThem(true);
        try {
            const phanHoi = await api.post("/gia-su/ho-so/mon-day", {
                mon_hoc_ids: idsDaChon.map(Number),
            });
            await taiDanhSach();
            setHienForm(false);
            setIdsDaChon([]);
            setCapHocIdsDaChon([]);
            baoThanhCong(phanHoi.data.message);
        } catch (error) {
            baoLoi(error.response?.data?.message || "Không thể thêm môn dạy.");
        } finally {
            setDangThem(false);
        }
    };
    const xoa = async (mon) => {
        if (!window.confirm(`Xóa môn "${mon.tenMon}" khỏi hồ sơ?`)) return;
        setIdDangXoa(mon.id);
        try {
            const phanHoi = await api.delete(`/gia-su/ho-so/mon-day/${mon.id}`);
            await taiDanhSach();
            baoThanhCong(phanHoi.data.message);
        } catch (error) {
            baoLoi(error.response?.data?.message || "Không thể xóa môn dạy.");
        } finally {
            setIdDangXoa(null);
        }
    };

    return {
        danhSach, coTheThem, capHocs, daLoc, dangTai, hienForm, idsDaChon,
        capHocIdsDaChon, monHocTheoCapDaChon, capHocIdsCoMonDeThem,
        dangThem, idDangXoa, tuKhoa, locCapHoc, locTrangThai,
        setTuKhoa, setLocCapHoc, setLocTrangThai, setHienForm,
        chonCapHoc, chonMon, dongForm, them, xoa,
    };
}
