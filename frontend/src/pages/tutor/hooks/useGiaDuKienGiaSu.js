import { useEffect, useState } from "react";
import api from "../../../services/api";

function useGiaDuKienGiaSu({
    monHocIdsDaChon,
    trinhDoIdDaChon,
    mucKinhNghiemIdDaChon,
}) {
    const kichHoat = Boolean(
        trinhDoIdDaChon &&
            mucKinhNghiemIdDaChon &&
            monHocIdsDaChon.length > 0,
    );
    const khoaYeuCau = kichHoat
        ? [
              trinhDoIdDaChon,
              mucKinhNghiemIdDaChon,
              [...monHocIdsDaChon].sort().join(","),
          ].join("|")
        : "";
    const [ketQua, setKetQua] = useState({
        khoa: "",
        giaDuKien: [],
        loi: "",
    });

    useEffect(() => {
        if (!kichHoat) {
            return undefined;
        }

        let daHuy = false;
        const boDieuKhien = new AbortController();
        const maHenGio = setTimeout(async () => {
            try {
                const phanHoi = await api.post(
                    "/dang-ky-gia-su/tinh-gia",
                    {
                        mon_hoc_ids: monHocIdsDaChon.map(Number),
                        trinh_do_giasu_id: Number(trinhDoIdDaChon),
                        muc_kinh_nghiem_id: Number(mucKinhNghiemIdDaChon),
                    },
                    { signal: boDieuKhien.signal },
                );

                if (!daHuy && phanHoi.data.success) {
                    setKetQua({
                        khoa: khoaYeuCau,
                        giaDuKien: phanHoi.data.data,
                        loi: "",
                    });
                }
            } catch (loiYeuCau) {
                if (!daHuy && loiYeuCau.code !== "ERR_CANCELED") {
                    setKetQua({
                        khoa: khoaYeuCau,
                        giaDuKien: [],
                        loi: "Không thể tính giá dự kiến. Vui lòng thử lại.",
                    });
                }
            }
        }, 250);

        return () => {
            daHuy = true;
            clearTimeout(maHenGio);
            boDieuKhien.abort();
        };
    }, [
        kichHoat,
        khoaYeuCau,
        monHocIdsDaChon,
        mucKinhNghiemIdDaChon,
        trinhDoIdDaChon,
    ]);

    const coKetQuaHienTai = kichHoat && ketQua.khoa === khoaYeuCau;

    return {
        giaDuKien: coKetQuaHienTai ? ketQua.giaDuKien : [],
        dangTai: kichHoat && !coKetQuaHienTai,
        loi: coKetQuaHienTai ? ketQua.loi : "",
    };
}

export default useGiaDuKienGiaSu;
