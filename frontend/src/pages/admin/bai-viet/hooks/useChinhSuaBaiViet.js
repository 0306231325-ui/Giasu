import { useState } from "react";
import api from "../../../../services/api";
import { GIA_TRI_BAI_VIET_MAC_DINH } from "../trangThaiBaiViet";
import useAnhXemTruoc from "./useAnhXemTruoc";
import useThongBaoTamThoi from "./useThongBaoTamThoi";

function taoFormTuBaiViet(baiViet) {
  return {
    tieu_de: baiViet?.tieu_de || "",
    tom_tat: baiViet?.tom_tat || "",
    noi_dung: baiViet?.noi_dung || "",
    trang_thai: baiViet?.trang_thai || "xuat_ban",
  };
}

function useChinhSuaBaiViet({ moTabChinhSua, sauKhiCapNhatThanhCong }) {
  const [baiVietDangChon, setBaiVietDangChon] = useState(null);
  const [formChinhSua, setFormChinhSua] = useState(GIA_TRI_BAI_VIET_MAC_DINH);
  const [dangCapNhat, setDangCapNhat] = useState(false);
  const [loiChinhSua, setLoiChinhSua] = useState("");
  const { fileAnh, anhXemTruoc, loiAnh, chonAnh, xoaAnh } = useAnhXemTruoc();
  const {
    thongBao: thongBaoChinhSua,
    anThongBao,
    hienThongBaoTamThoi,
  } = useThongBaoTamThoi();

  const capNhatFormChinhSua = (event) => {
    const { name, value } = event.target;
    setFormChinhSua((duLieuHienTai) => ({
      ...duLieuHienTai,
      [name]: value,
    }));
  };

  const chonBaiVietDeSua = (baiViet) => {
    setBaiVietDangChon(baiViet);
    setFormChinhSua(taoFormTuBaiViet(baiViet));
    setLoiChinhSua("");
    anThongBao();
    xoaAnh();
    moTabChinhSua();
  };

  const capNhatBaiViet = async (event) => {
    event.preventDefault();
    if (!baiVietDangChon) return;

    setDangCapNhat(true);
    setLoiChinhSua("");
    anThongBao();

    try {
      const duLieu = new FormData();
      duLieu.append("tieu_de", formChinhSua.tieu_de);
      duLieu.append("tom_tat", formChinhSua.tom_tat);
      duLieu.append("noi_dung", formChinhSua.noi_dung);
      duLieu.append("trang_thai", formChinhSua.trang_thai);

      if (fileAnh) {
        duLieu.append("anh_bia", fileAnh);
      }

      const response = await api.post(
        `/admin/baiviet/${baiVietDangChon.id}/cap-nhat`,
        duLieu,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const baiVietDaCapNhat = response.data.data;
      setBaiVietDangChon(baiVietDaCapNhat);
      setFormChinhSua(taoFormTuBaiViet(baiVietDaCapNhat));
      hienThongBaoTamThoi(
        response.data.message || "Cập nhật bài viết thành công."
      );
      xoaAnh();
      sauKhiCapNhatThanhCong();
    } catch (err) {
      const loiValidate = err.response?.data?.errors;
      const loiDauTien = loiValidate
        ? Object.values(loiValidate).flat()[0]
        : null;

      setLoiChinhSua(
        loiDauTien ||
          err.response?.data?.message ||
          "Không cập nhật được bài viết."
      );
    } finally {
      setDangCapNhat(false);
    }
  };

  return {
    baiVietDangChon,
    formChinhSua,
    anhChinhSuaXemTruoc: anhXemTruoc,
    loiAnhChinhSua: loiAnh,
    dangCapNhat,
    loiChinhSua,
    thongBaoChinhSua,
    capNhatFormChinhSua,
    chonAnhBiaChinhSua: chonAnh,
    chonBaiVietDeSua,
    capNhatBaiViet,
  };
}

export default useChinhSuaBaiViet;
