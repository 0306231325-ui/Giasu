import { useEffect, useMemo, useState } from "react";
import api from "../../../../services/api";
import useThongBaoTamThoi from "./useThongBaoTamThoi";

function useThungRacBaiViet({ taiLaiDanhSach }) {
  const [danhSachDaXoa, setDanhSachDaXoa] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [lanTaiLai, setLanTaiLai] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [dangXuLyId, setDangXuLyId] = useState(null);
  const [loi, setLoi] = useState("");
  const { thongBao, anThongBao, hienThongBaoTamThoi } = useThongBaoTamThoi();

  const thamSoDanhSach = useMemo(
    () => ({
      page: trangHienTai,
      ...(tuKhoa.trim() ? { q: tuKhoa.trim() } : {}),
    }),
    [trangHienTai, tuKhoa]
  );

  useEffect(() => {
    let daHuy = false;

    const taiThungRac = async () => {
      setDangTai(true);
      setLoi("");

      try {
        const response = await api.get("/admin/baiviet/thung-rac", {
          params: thamSoDanhSach,
        });

        if (!daHuy && response.data.success) {
          setDanhSachDaXoa(response.data.data.data || []);
          setMeta(response.data.data);
        }
      } catch (err) {
        if (!daHuy) {
          setDanhSachDaXoa([]);
          setMeta(null);
          setLoi(
            err.response?.data?.message || "Không tải được thùng rác bài viết."
          );
        }
      } finally {
        if (!daHuy) setDangTai(false);
      }
    };

    taiThungRac();

    return () => {
      daHuy = true;
    };
  }, [lanTaiLai, thamSoDanhSach]);

  const doiTuKhoa = (event) => {
    setTuKhoa(event.target.value);
    setTrangHienTai(1);
  };

  const taiLaiThungRac = () => {
    setLanTaiLai((lan) => lan + 1);
  };

  const khoiPhucBaiViet = async (baiViet) => {
    const xacNhan = window.confirm(`Khôi phục bài viết "${baiViet.tieu_de}"?`);
    if (!xacNhan) return;

    setDangXuLyId(baiViet.id);
    setLoi("");
    anThongBao();

    try {
      const response = await api.patch(`/admin/baiviet/${baiViet.id}/khoi-phuc`);
      hienThongBaoTamThoi(
        response.data.message || "Khôi phục bài viết thành công."
      );
      taiLaiThungRac();
      taiLaiDanhSach();
    } catch (err) {
      setLoi(
        err.response?.data?.message || "Không khôi phục được bài viết."
      );
    } finally {
      setDangXuLyId(null);
    }
  };

  const xoaVinhVienBaiViet = async (baiViet) => {
    const xacNhan = window.confirm(
      `Xóa vĩnh viễn bài viết "${baiViet.tieu_de}"? Thao tác này không thể khôi phục.`
    );
    if (!xacNhan) return;

    setDangXuLyId(baiViet.id);
    setLoi("");
    anThongBao();

    try {
      const response = await api.delete(
        `/admin/baiviet/${baiViet.id}/xoa-vinh-vien`
      );
      hienThongBaoTamThoi(
        response.data.message || "Đã xóa vĩnh viễn bài viết."
      );
      taiLaiThungRac();
    } catch (err) {
      setLoi(
        err.response?.data?.message || "Không xóa vĩnh viễn được bài viết."
      );
    } finally {
      setDangXuLyId(null);
    }
  };

  return {
    danhSachDaXoa,
    meta,
    tuKhoa,
    trangHienTai,
    dangTai,
    dangXuLyId,
    loi,
    thongBao,
    doiTuKhoa,
    chuyenTrang: setTrangHienTai,
    taiLaiThungRac,
    khoiPhucBaiViet,
    xoaVinhVienBaiViet,
  };
}

export default useThungRacBaiViet;
