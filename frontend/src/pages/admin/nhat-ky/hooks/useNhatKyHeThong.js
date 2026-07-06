import { useEffect, useMemo, useState } from "react";
import api from "../../../../services/api";
import { META_MAC_DINH } from "../constants";

export default function useNhatKyHeThong() {
  const [tuKhoaNhap, setTuKhoaNhap] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [vaiTro, setVaiTro] = useState("");
  const [nhomHanhDong, setNhomHanhDong] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [danhSach, setDanhSach] = useState([]);
  const [meta, setMeta] = useState(META_MAC_DINH);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [lanTai, setLanTai] = useState(0);

  const tongSoTrang = Math.max(Number(meta.last_page || 1), 1);
  const trangHopLe = Math.min(Number(meta.current_page || trangHienTai), tongSoTrang);

  const thamSoLoc = useMemo(
    () => ({
      page: trangHienTai,
      tu_khoa: tuKhoa || undefined,
      vai_tro: vaiTro || undefined,
      nhom_hanh_dong: nhomHanhDong || undefined,
    }),
    [nhomHanhDong, trangHienTai, tuKhoa, vaiTro],
  );

  useEffect(() => {
    let daHuy = false;

    const taiDanhSach = async () => {
      setDangTai(true);
      setLoi("");

      try {
        const response = await api.get("/admin/nhat-ky", {
          params: thamSoLoc,
        });

        if (daHuy) return;

        setDanhSach(response.data?.data || []);
        setMeta(response.data?.meta || META_MAC_DINH);
      } catch (error) {
        if (daHuy) return;

        setDanhSach([]);
        setMeta(META_MAC_DINH);
        setLoi(
          error.response?.data?.message ||
            "Không thể tải danh sách nhật ký hệ thống.",
        );
      } finally {
        if (!daHuy) {
          setDangTai(false);
        }
      }
    };

    taiDanhSach();

    return () => {
      daHuy = true;
    };
  }, [thamSoLoc, lanTai]);

  useEffect(() => {
    const lamMoi = () => {
      setTrangHienTai(1);
      setLanTai((lan) => lan + 1);
    };

    window.addEventListener("admin:refresh", lamMoi);

    return () => {
      window.removeEventListener("admin:refresh", lamMoi);
    };
  }, []);

  const timKiem = () => {
    setTuKhoa(tuKhoaNhap.trim());
    setTrangHienTai(1);
  };

  const lamMoiBoLoc = () => {
    setTuKhoaNhap("");
    setTuKhoa("");
    setVaiTro("");
    setNhomHanhDong("");
    setTrangHienTai(1);
    setLanTai((lan) => lan + 1);
  };

  const xuLyNhanEnter = (event) => {
    if (event.key === "Enter") {
      timKiem();
    }
  };

  const doiVaiTro = (event) => {
    setVaiTro(event.target.value);
    setTrangHienTai(1);
  };

  const doiNhomHanhDong = (event) => {
    setNhomHanhDong(event.target.value);
    setTrangHienTai(1);
  };

  const veTrangTruoc = () => {
    setTrangHienTai((trang) => Math.max(1, trang - 1));
  };

  const veTrangSau = () => {
    setTrangHienTai((trang) => Math.min(tongSoTrang, trang + 1));
  };

  return {
    tuKhoaNhap,
    setTuKhoaNhap,
    vaiTro,
    nhomHanhDong,
    trangHopLe,
    tongSoTrang,
    danhSach,
    meta,
    dangTai,
    loi,
    timKiem,
    lamMoiBoLoc,
    xuLyNhanEnter,
    doiVaiTro,
    doiNhomHanhDong,
    chuyenTrang: setTrangHienTai,
    veTrangTruoc,
    veTrangSau,
  };
}
