import { useEffect } from "react";
import Home from "./pages/Home"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./context/ToastContext";
import MainLayout from "./layouts/MainLayout";
import BaiViet from "./pages/bai-viet/BaiViet";
import BaiVietDetail from "./pages/bai-viet/BaiVietDetail";
import DanhSachGiaSu from "./pages/tutor/dang-ky-goi/DanhSachGiaSu";
import GiaSuDetail from "./pages/tutor/dang-ky-goi/GiaSuDetail";
import TimGiaSuTheoYeuCau from "./pages/tutor/dang-ky-goi/TimGiaSuTheoYeuCau";
import ChonGoiHoc from "./pages/student/ChonGoiHoc";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import HoSoHocVien from "./pages/auth/profile/HoSoHocVien";
import LichHocCuaToi from "./pages/student/LichHocCuaToi";
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminHocVien from "./pages/admin/hoc-vien/AdminHocVien";
import AdminGiaSu from "./pages/admin/gia-su/AdminGiaSu";
import AdminBaiViet from "./pages/admin/bai-viet/AdminBaiViet";
import AdminDanhMuc from "./pages/admin/danh-muc/AdminDanhMuc";
import AdminQuanLyDatGoi from "./pages/admin/dat-goi/AdminYeuCauDatGiaSu";
import AdminLichHoc from "./pages/admin/lich-hoc/AdminLichHoc";
import DangKyLamGiaSu from "./pages/tutor/dang-ky-gia-su/DangKyLamGiaSu";
import GiaSuLayout from "./layouts/GiaSuLayout";
import GiaSuTongQuan from "./pages/tutor/quan-ly/GiaSuTongQuan";
import GiaSuHoSo from "./pages/tutor/quan-ly/ho-so/GiaSuHoSo";
import GiaSuLichDay from "./pages/tutor/quan-ly/lich-day/GiaSuLichDay";
import GiaSuThuNhap from "./pages/tutor/quan-ly/thu-nhap/GiaSuThuNhap";
import GiaSuTheoDoiHoatDong from "./pages/tutor/quan-ly/theo-doi-hoat-dong/GiaSuTheoDoiHoatDong";

function AuthSessionHandler() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const xuLyMatPhienDangNhap = (event) => {
      toast.error(
        event.detail?.message ||
          "Phiên đăng nhập đã hết hạn hoặc tài khoản đã bị khóa."
      );

      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("auth:unauthorized", xuLyMatPhienDangNhap);

    return () => {
      window.removeEventListener("auth:unauthorized", xuLyMatPhienDangNhap);
    };
  }, [location.pathname, navigate, toast]);

  return null;
}

function App() {
  return (
    <>
      <AuthSessionHandler />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/home" element={<Home />} />

          <Route path="/gia-su" element={<DanhSachGiaSu />} />

          <Route path="/gia-su/:id" element={<GiaSuDetail />} />

          <Route path="/gia-su/:id/goi-hoc" element={<ChonGoiHoc />} />

          <Route path="/tim-gia-su-theo-yeu-cau" element={<TimGiaSuTheoYeuCau />} />

          <Route path="/dang-ky-lam-gia-su" element={<DangKyLamGiaSu />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/hoc-vien/ho-so" element={<HoSoHocVien />} />

          <Route path="/hoc-vien/lich-hoc" element={<LichHocCuaToi />} />

          <Route path="/bai-viet" element={<BaiViet />} />

          <Route path="/bai-viet/:slug" element={<BaiVietDetail />} />

          <Route path="/baiviet/:slug" element={<BaiVietDetail />} />

        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="hoc-vien" element={<AdminHocVien />} />
          <Route path="gia-su" element={<AdminGiaSu />} />
          <Route path="danh-muc" element={<AdminDanhMuc />} />
          <Route path="quan-ly-dat-goi" element={<AdminQuanLyDatGoi />} />
          <Route path="lich-hoc" element={<AdminLichHoc />} />
          <Route path="yeu-cau-dat-gia-su" element={<AdminQuanLyDatGoi />} />
          <Route path="bai-viet" element={<AdminBaiViet />} />
        </Route>

        <Route path="/gia-su/quan-ly" element={<GiaSuLayout />}>
          <Route index element={<GiaSuTongQuan />} />
          <Route path="ho-so" element={<GiaSuHoSo />} />
          <Route path="lich-day" element={<GiaSuLichDay />} />
          <Route path="thu-nhap" element={<GiaSuThuNhap />} />
          <Route path="theo-doi-hoat-dong" element={<GiaSuTheoDoiHoatDong />} />
        </Route>

      </Routes>
    </>
  );
}

export default App
