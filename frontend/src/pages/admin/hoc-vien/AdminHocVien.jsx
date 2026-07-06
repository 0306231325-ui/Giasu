import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import ModalNhapLyDo from "../../../components/ModalNhapLyDo";
import { useToast } from "../../../context/ToastContext";
import BangHocVien from "./BangHocVien";
import BoLocHocVien from "./BoLocHocVien";
import PhanTrangHocVien from "./PhanTrangHocVien";

const SO_TAI_KHOAN_MOI_TRANG = 5;

function AdminHocVien() {
  const toast = useToast();
  const [danhSachHocVien, setDanhSachHocVien] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [lanTaiLai, setLanTaiLai] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [dangCapNhatId, setDangCapNhatId] = useState(null);
  const [hocVienDangKhoa, setHocVienDangKhoa] = useState(null);

  const thamSoTruyVan = useMemo(
    () => ({
      page: trangHienTai,
      per_page: SO_TAI_KHOAN_MOI_TRANG,
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
  }, [lanTaiLai, thamSoTruyVan]);

  useEffect(() => {
    const lamMoi = () => {
      setLanTaiLai((lan) => lan + 1);
    };

    window.addEventListener("admin:refresh", lamMoi);

    return () => {
      window.removeEventListener("admin:refresh", lamMoi);
    };
  }, []);

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

    if (trangThaiMoi === "khoa") {
      setHocVienDangKhoa(hocVien);
      return;
    }

    await capNhatTrangThaiHocVien(hocVien, trangThaiMoi);
  };

  const capNhatTrangThaiHocVien = async (hocVien, trangThaiMoi, lyDoKhoa = "") => {
    setDangCapNhatId(hocVien.id);
    setLoi("");

    try {
      const response = await api.patch(
        `/admin/hoc-vien/${hocVien.id}/trang-thai`,
        {
          trang_thai: trangThaiMoi,
          ...(trangThaiMoi === "khoa" ? { ly_do_khoa: lyDoKhoa } : {}),
        }
      );

      if (response.data.success) {
        const hocVienDaCapNhat = response.data.data;

        capNhatDanhSachSauKhiDoiTrangThai(hocVienDaCapNhat);
        toast.success(response.data.message || "Đã cập nhật trạng thái tài khoản học viên.");
        setHocVienDangKhoa(null);
      }
    } catch (err) {
      toast.error(
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
        dangCapNhatId={dangCapNhatId}
        xuLyChuyenTrangThai={xuLyChuyenTrangThai}
      />

      <PhanTrangHocVien
        meta={meta}
        trangHienTai={trangHienTai}
        dangTai={dangTai}
        chuyenTrang={setTrangHienTai}
      />

      <ModalNhapLyDo
        mo={Boolean(hocVienDangKhoa)}
        tieuDe="Khóa tài khoản học viên"
        moTa={`Nhập lý do khóa tài khoản ${hocVienDangKhoa?.ho_ten || "học viên"}. Lý do này sẽ được lưu để quản trị viên theo dõi.`}
        placeholder="Ví dụ: Tài khoản vi phạm quy định sử dụng..."
        nutXacNhan="Khóa tài khoản"
        dangXuLy={dangCapNhatId === hocVienDangKhoa?.id}
        onDong={() => setHocVienDangKhoa(null)}
        onXacNhan={(lyDo) =>
          capNhatTrangThaiHocVien(hocVienDangKhoa, "khoa", lyDo)
        }
      />
    </div>
  );
}

export default AdminHocVien;
