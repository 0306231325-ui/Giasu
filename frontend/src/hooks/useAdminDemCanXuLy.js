import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const demMacDinh = {
  hocVien: 0,
  giaSu: 0,
  giaSuHoSoChoDuyet: 0,
  giaSuYeuCauChuyenMon: 0,
  datGoi: 0,
  lichHoc: 0,
  danhMuc: 0,
  baiViet: 0,
};

const laySo = (giaTri) => Number(giaTri || 0);

const coThongTinChoXacNhanThanhToan = (yeuCau) => {
  const thanhToan = yeuCau?.thanhToan || {};

  return Boolean(
    thanhToan.maGiaoDich ||
      thanhToan.noiDung ||
      thanhToan.anhMinhChung ||
      thanhToan.anh_minh_chung ||
      thanhToan.urlMinhChung ||
      thanhToan.url_minh_chung,
  );
};

function useAdminDemCanXuLy({ kichHoat = true } = {}) {
  const [dem, setDem] = useState(demMacDinh);
  const [dangTai, setDangTai] = useState(false);

  const taiSoLuong = useCallback(async () => {
    if (!kichHoat) {
      setDem(demMacDinh);
      return demMacDinh;
    }

    setDangTai(true);
    try {
      const [hoSoGiaSu, yeuCauChuyenMon, datGoi, lichHoc] = await Promise.allSettled([
        api.get("/admin/gia-su/xet-duyet"),
        api.get("/admin/gia-su/yeu-cau-chuyen-mon", {
          params: { trang_thai: "cho_duyet" },
        }),
        api.get("/admin/dat-goi"),
        api.get("/admin/lich-hoc"),
      ]);

      const hoSoChoDuyet =
        hoSoGiaSu.status === "fulfilled"
          ? laySo(hoSoGiaSu.value.data?.data?.thongKe?.choDuyet)
          : 0;

      const chuyenMonChoDuyet =
        yeuCauChuyenMon.status === "fulfilled"
          ? laySo(yeuCauChuyenMon.value.data?.data?.thongKe?.choDuyet)
          : 0;

      const danhSachDatGoi =
        datGoi.status === "fulfilled" && Array.isArray(datGoi.value.data?.data)
          ? datGoi.value.data.data
          : [];

      const soDatGoiCanXuLy = danhSachDatGoi.filter((yeuCau) => {
        if (yeuCau.trangThai === "cho_xu_ly") return true;
        if (yeuCau.trangThai === "cho_xacnhan") return true;
        if (yeuCau.trangThai === "cho_thanhtoan") {
          return coThongTinChoXacNhanThanhToan(yeuCau);
        }

        return false;
      }).length;

      const thongKeLichHoc =
        lichHoc.status === "fulfilled" ? lichHoc.value.data?.data?.thong_ke : null;
      const soLichHocCanXuLy = laySo(thongKeLichHoc?.cho_xacnhan);

      const demMoi = {
        ...demMacDinh,
        giaSuHoSoChoDuyet: hoSoChoDuyet,
        giaSuYeuCauChuyenMon: chuyenMonChoDuyet,
        giaSu: hoSoChoDuyet + chuyenMonChoDuyet,
        datGoi: soDatGoiCanXuLy,
        lichHoc: soLichHocCanXuLy,
      };

      setDem(demMoi);
      return demMoi;
    } catch (error) {
      console.error("Không thể tải số lượng cần xử lý của admin:", error);
      setDem(demMacDinh);
      return demMacDinh;
    } finally {
      setDangTai(false);
    }
  }, [kichHoat]);

  useEffect(() => {
    if (!kichHoat) {
      return undefined;
    }

    const taiLanDau = setTimeout(() => {
      void taiSoLuong();
    }, 0);

    const lamMoi = () => {
      void taiSoLuong();
    };

    window.addEventListener("admin:refresh", lamMoi);

    return () => {
      clearTimeout(taiLanDau);
      window.removeEventListener("admin:refresh", lamMoi);
    };
  }, [kichHoat, taiSoLuong]);

  return { dem, dangTai, taiSoLuong };
}

export default useAdminDemCanXuLy;
