import { useEffect, useMemo, useState } from "react";
import api from "../../../../services/api";

function useDanhSachBaiViet() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [lanTaiLaiDanhSach, setLanTaiLaiDanhSach] = useState(0);
  const [dangTaiDanhSach, setDangTaiDanhSach] = useState(false);
  const [dangXoaId, setDangXoaId] = useState(null);
  const [loiDanhSach, setLoiDanhSach] = useState("");

  const thamSoDanhSach = useMemo(
    () => ({
      page: trangHienTai,
      ...(tuKhoa.trim() ? { q: tuKhoa.trim() } : {}),
      ...(locTrangThai ? { trang_thai: locTrangThai } : {}),
    }),
    [locTrangThai, trangHienTai, tuKhoa]
  );

  useEffect(() => {
    let daHuy = false;

    const taiDanhSachBaiViet = async () => {
      setDangTaiDanhSach(true);
      setLoiDanhSach("");

      try {
        const response = await api.get("/admin/baiviet", {
          params: thamSoDanhSach,
        });

        if (!daHuy && response.data.success) {
          setDanhSachBaiViet(response.data.data.data || []);
          setMeta(response.data.data);
        }
      } catch (err) {
        if (!daHuy) {
          setDanhSachBaiViet([]);
          setMeta(null);
          setLoiDanhSach(
            err.response?.data?.message || "Không tải được danh sách bài viết."
          );
        }
      } finally {
        if (!daHuy) setDangTaiDanhSach(false);
      }
    };

    taiDanhSachBaiViet();

    return () => {
      daHuy = true;
    };
  }, [lanTaiLaiDanhSach, thamSoDanhSach]);

  const doiTuKhoa = (event) => {
    setTuKhoa(event.target.value);
    setTrangHienTai(1);
  };

  const doiLocTrangThai = (event) => {
    setLocTrangThai(event.target.value);
    setTrangHienTai(1);
  };

  const taiLaiDanhSach = () => {
    setLanTaiLaiDanhSach((lanTaiLai) => lanTaiLai + 1);
  };

  const veTrangDau = () => {
    setTrangHienTai(1);
  };

  const xoaBaiViet = async (baiViet) => {
    const xacNhan = window.confirm(`Đưa bài viết "${baiViet.tieu_de}" vào thùng rác?`);
    if (!xacNhan) return;

    setDangXoaId(baiViet.id);
    setLoiDanhSach("");

    try {
      await api.delete(`/admin/baiviet/${baiViet.id}`);
      taiLaiDanhSach();
    } catch (err) {
      setLoiDanhSach(
        err.response?.data?.message || "Không xóa được bài viết."
      );
    } finally {
      setDangXoaId(null);
    }
  };

  return {
    danhSachBaiViet,
    meta,
    tuKhoa,
    locTrangThai,
    trangHienTai,
    dangTaiDanhSach,
    dangXoaId,
    loiDanhSach,
    doiTuKhoa,
    doiLocTrangThai,
    chuyenTrang: setTrangHienTai,
    taiLaiDanhSach,
    veTrangDau,
    xoaBaiViet,
  };
}

export default useDanhSachBaiViet;
