import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../../../services/api";

export default function useMonDay({
    baoLoi,
    baoThanhCong,
}) {
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
    const [loi, setLoi] = useState({});

    const capNhatDuLieu = useCallback((duLieu) => {
        setDanhSach(
            (duLieu.mon_da_dang_ky || []).map((mon) => ({
                ...mon,
                gia: `${Number(mon.gia).toLocaleString("vi-VN")}đ`,
            })),
        );
        setCoTheThem(duLieu.mon_co_the_them || []);
        setCapHocs(duLieu.cap_hoc || []);
    }, []);

    const taiDanhSach = useCallback(async () => {
        const phanHoi = await api.get("/gia-su/ho-so/mon-day");
        capNhatDuLieu(phanHoi.data.data || {});
    }, [capNhatDuLieu]);

    useEffect(() => {
        let conHieuLuc = true;

        const taiDuLieuBanDau = async () => {
            setDangTai(true);
            try {
                const phanHoi = await api.get("/gia-su/ho-so/mon-day");
                if (!conHieuLuc) return;
                capNhatDuLieu(phanHoi.data.data || {});
            } catch (error) {
                if (conHieuLuc) {
                    baoLoi(error.response?.data?.message || "Không thể tải danh sách môn dạy.");
                }
            } finally {
                if (conHieuLuc) setDangTai(false);
            }
        };

        taiDuLieuBanDau();

        return () => {
            conHieuLuc = false;
        };
    }, [baoLoi, capNhatDuLieu]);

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
    const giaDuKienDaChon = useMemo(
        () => coTheThem
            .filter((mon) => idsDaChon.includes(String(mon.id)))
            .map((mon) => ({
                id: mon.id,
                tenMon: mon.ten_mon,
                capHoc: mon.cap_hoc,
                giaMon: Number(mon.gia_mon || 0),
                giaCongTrinhDo: Number(mon.gia_cong_trinh_do || 0),
                giaCongKinhNghiem: Number(mon.gia_cong_kinh_nghiem || 0),
                giaCongThem: Number(mon.gia_cong_them || 0),
                tongGia: Number(mon.tong_gia || 0),
            })),
        [coTheThem, idsDaChon],
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
        setLoi({});
    };
    const them = async (suKien) => {
        suKien.preventDefault();
        setDangThem(true);
        setLoi({});
        try {
            const phanHoi = await api.post("/gia-su/ho-so/mon-day", {
                mon_hoc_ids: idsDaChon.map(Number),
            });
            setHienForm(false);
            setIdsDaChon([]);
            setCapHocIdsDaChon([]);
            baoThanhCong(phanHoi.data.message);
            await taiDanhSach();
        } catch (error) {
            if (error.response?.status === 422) {
                setLoi(error.response.data.errors || {});
                baoLoi(error.response?.data?.message || "Vui lòng kiểm tra thông tin thêm môn dạy.");
            } else {
                baoLoi(error.response?.data?.message || "Không thể thêm môn dạy.");
            }
        } finally {
            setDangThem(false);
        }
    };
    const xoa = async (mon) => {
        if (!window.confirm(`Xóa môn "${mon.tenMon}" khỏi hồ sơ?`)) return;
        setIdDangXoa(mon.id);
        try {
            const phanHoi = await api.delete(`/gia-su/ho-so/mon-day/${mon.id}`);
            baoThanhCong(phanHoi.data.message);
            await taiDanhSach();
        } catch (error) {
            baoLoi(error.response?.data?.message || "Không thể xóa môn dạy.");
        } finally {
            setIdDangXoa(null);
        }
    };

    return {
        danhSach, coTheThem, capHocs, daLoc, dangTai, hienForm, idsDaChon,
        capHocIdsDaChon, monHocTheoCapDaChon, capHocIdsCoMonDeThem,
        giaDuKienDaChon,
        loi,
        dangThem, idDangXoa, tuKhoa, locCapHoc, locTrangThai,
        setTuKhoa, setLocCapHoc, setLocTrangThai, setHienForm,
        chonCapHoc, chonMon, dongForm, them, xoa, taiDanhSach,
    };
}
