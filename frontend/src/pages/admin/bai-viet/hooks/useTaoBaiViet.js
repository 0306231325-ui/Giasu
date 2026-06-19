import { useState } from "react";
import api from "../../../../services/api";
import { GIA_TRI_BAI_VIET_MAC_DINH } from "../trangThaiBaiViet";
import useAnhXemTruoc from "./useAnhXemTruoc";
import useThongBaoTamThoi from "./useThongBaoTamThoi";

function useTaoBaiViet({ sauKhiTaoThanhCong }) {
  const [form, setForm] = useState(GIA_TRI_BAI_VIET_MAC_DINH);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const { fileAnh, anhXemTruoc, loiAnh, chonAnh, xoaAnh } = useAnhXemTruoc();
  const { thongBao, anThongBao, hienThongBaoTamThoi } = useThongBaoTamThoi();

  const capNhatForm = (event) => {
    const { name, value } = event.target;
    setForm((duLieuHienTai) => ({
      ...duLieuHienTai,
      [name]: value,
    }));
  };

  const taoBaiViet = async (event) => {
    event.preventDefault();
    setDangLuu(true);
    setLoi("");
    anThongBao();

    const duLieu = new FormData();
    duLieu.append("tieu_de", form.tieu_de);
    duLieu.append("tom_tat", form.tom_tat);
    duLieu.append("noi_dung", form.noi_dung);
    duLieu.append("trang_thai", form.trang_thai);

    if (fileAnh) {
      duLieu.append("anh_bia", fileAnh);
    }

    try {
      const response = await api.post("/admin/baiviet", duLieu, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      hienThongBaoTamThoi(response.data.message || "Tạo bài viết thành công.");
      setForm(GIA_TRI_BAI_VIET_MAC_DINH);
      xoaAnh();
      event.target.reset();
      sauKhiTaoThanhCong();
    } catch (err) {
      const loiValidate = err.response?.data?.errors;
      const loiDauTien = loiValidate
        ? Object.values(loiValidate).flat()[0]
        : null;

      setLoi(
        loiDauTien ||
          err.response?.data?.message ||
          "Không tạo được bài viết."
      );
    } finally {
      setDangLuu(false);
    }
  };

  return {
    form,
    anhXemTruoc,
    loiAnh,
    dangLuu,
    loi,
    thongBao,
    capNhatForm,
    chonAnhBia: chonAnh,
    taoBaiViet,
  };
}

export default useTaoBaiViet;
