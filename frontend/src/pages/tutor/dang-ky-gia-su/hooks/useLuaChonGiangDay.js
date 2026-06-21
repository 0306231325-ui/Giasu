import { useMemo, useState } from "react";
import useGiaDuKienGiaSu from "./useGiaDuKienGiaSu";

export default function useLuaChonGiangDay(danhMuc) {
    const [capHocIdsDaChon, setCapHocIdsDaChon] = useState([]);
    const [trinhDoIdDaChon, setTrinhDoIdDaChon] = useState("");
    const [mucKinhNghiemIdDaChon, setMucKinhNghiemIdDaChon] = useState("");
    const [monHocIdsDaChon, setMonHocIdsDaChon] = useState([]);

    const monHocTheoCap = useMemo(
        () =>
            danhMuc.cap_hoc
                .filter((capHoc) => capHocIdsDaChon.includes(String(capHoc.id)))
                .map((capHoc) => ({
                    ...capHoc,
                    monHoc: danhMuc.mon_hoc.filter(
                        (monHoc) =>
                            String(monHoc.cap_hoc_id) === String(capHoc.id),
                    ),
                })),
        [capHocIdsDaChon, danhMuc.cap_hoc, danhMuc.mon_hoc],
    );

    const gia = useGiaDuKienGiaSu({
        monHocIdsDaChon,
        trinhDoIdDaChon,
        mucKinhNghiemIdDaChon,
    });

    const chonMonHoc = ({ target }) => {
        setMonHocIdsDaChon((hienTai) =>
            target.checked
                ? [...hienTai, target.value]
                : hienTai.filter((id) => id !== target.value),
        );
    };

    const chonCapHoc = ({ target }) => {
        const capHocId = target.value;
        if (target.checked) {
            setCapHocIdsDaChon((hienTai) => [...hienTai, capHocId]);
            return;
        }
        const idsThuocCap = danhMuc.mon_hoc
            .filter((mon) => String(mon.cap_hoc_id) === capHocId)
            .map((mon) => String(mon.id));
        setCapHocIdsDaChon((hienTai) => hienTai.filter((id) => id !== capHocId));
        setMonHocIdsDaChon((hienTai) =>
            hienTai.filter((id) => !idsThuocCap.includes(id)),
        );
    };

    return {
        capHocIdsDaChon,
        trinhDoIdDaChon,
        mucKinhNghiemIdDaChon,
        monHocIdsDaChon,
        monHocTheoCap,
        setTrinhDoIdDaChon,
        setMucKinhNghiemIdDaChon,
        chonMonHoc,
        chonCapHoc,
        gia,
    };
}
