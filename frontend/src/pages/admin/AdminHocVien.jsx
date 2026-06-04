import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import BangHocVien from "./hoc-vien/BangHocVien";
import BoLocHocVien from "./hoc-vien/BoLocHocVien";
import PhanTrangHocVien from "./hoc-vien/PhanTrangHocVien";

function AdminHocVien() {
  const [danhSachHocVien, setDanhSachHocVien] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [dangCapNhatId, setDangCapNhatId] = useState(null);
  const [thongBao, setThongBao] = useState("");

  const thamSoTruyVan = useMemo(
    () => ({
      page: trangHienTai,
      per_page: 10,
      ...(tuKhoa.trim() ? { q: tuKhoa.trim() } : {}),
      ...(trangThai ? { trang_thai: trangThai } : {}),
    }),
    [trangHienTai, trangThai, tuKhoa]
  );

  useEffect(() => {
    let daHuy = false;

    const taiDanhSachHocVien = async () => {
      setDangTai(true);
      setLoi("");

      try {
        const response = await api.get("/admin/hoc-vien", {
          params: thamSoTruyVan,
        });

        if (!daHuy && response.data.success) {
          setDanhSachHocVien(response.data.data.data || []);
          setMeta(response.data.data);
        }
      } catch (err) {
        if (!daHuy) {
          setDanhSachHocVien([]);
          setMeta(null);
          setLoi(
            err.response?.data?.message ||
              "Không tải được danh sách tài khoản học viên."
          );
        }
      } finally {
        if (!daHuy) setDangTai(false);
      }
    };

    taiDanhSachHocVien();

    return () => {
      daHuy = true;
    };
  }, [thamSoTruyVan]);

  const xuLyDoiTuKhoa = (event) => {
    setTuKhoa(event.target.value);
    setTrangHienTai(1);
  };

  const xuLyDoiTrangThai = (event) => {
    setTrangThai(event.target.value);
    setTrangHienTai(1);
  };

  const xuLyChuyenTrangThai = async (hocVien) => {
    const trangThaiMoi = hocVien.trang_thai === "hoatdong" ? "khoa" : "hoatdong";
    const xacNhan = window.confirm(
      trangThaiMoi === "khoa"
        ? `Khóa tài khoản học viên ${hocVien.ho_ten}?`
        : `Mở khóa tài khoản học viên ${hocVien.ho_ten}?`
    );

    if (!xacNhan) return;

    setDangCapNhatId(hocVien.id);
    setLoi("");
    setThongBao("");

    try {
      const response = await api.patch(
        `/admin/hoc-vien/${hocVien.id}/trang-thai`,
        { trang_thai: trangThaiMoi }
      );

      if (response.data.success) {
        const hocVienDaCapNhat = response.data.data;

        capNhatDanhSachSauKhiDoiTrangThai(hocVienDaCapNhat);
        setThongBao(response.data.message);
      }
    } catch (err) {
      setLoi(
        err.response?.data?.message ||
          "Không cập nhật được trạng thái tài khoản học viên."
      );
    } finally {
      setDangCapNhatId(null);
    }
  };

  const capNhatDanhSachSauKhiDoiTrangThai = (hocVienDaCapNhat) => {
    setDanhSachHocVien((danhSachHienTai) => {
      if (trangThai && trangThai !== hocVienDaCapNhat.trang_thai) {
        return danhSachHienTai.filter(
          (hocVien) => hocVien.id !== hocVienDaCapNhat.id
        );
      }

      return danhSachHienTai.map((hocVien) =>
        hocVien.id === hocVienDaCapNhat.id ? hocVienDaCapNhat : hocVien
      );
    });

    if (trangThai && trangThai !== hocVienDaCapNhat.trang_thai) {
      setMeta((metaHienTai) =>
        metaHienTai
          ? {
              ...metaHienTai,
              total: Math.max((metaHienTai.total || 1) - 1, 0),
              to: Math.max((metaHienTai.to || 1) - 1, metaHienTai.from || 0),
            }
          : metaHienTai
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold">
            Danh sách tài khoản học viên
          </div>
          <div className="mt-2 text-sm text-white/70">
            Quản lý tài khoản, thông tin học tập và liên hệ phụ huynh.
          </div>
        </div>

        <div className="text-sm text-white/70">
          Tổng:{" "}
          <span className="font-bold text-white">{meta?.total ?? 0}</span>
        </div>
      </div>

      <BoLocHocVien
        tuKhoa={tuKhoa}
        trangThai={trangThai}
        xuLyDoiTuKhoa={xuLyDoiTuKhoa}
        xuLyDoiTrangThai={xuLyDoiTrangThai}
      />

      <BangHocVien
        danhSachHocVien={danhSachHocVien}
        dangTai={dangTai}
        loi={loi}
        thongBao={thongBao}
        dangCapNhatId={dangCapNhatId}
        xuLyChuyenTrangThai={xuLyChuyenTrangThai}
      />

      <PhanTrangHocVien
        meta={meta}
        trangHienTai={trangHienTai}
        dangTai={dangTai}
        chuyenTrang={setTrangHienTai}
      />
    </div>
  );
}

export default AdminHocVien;
