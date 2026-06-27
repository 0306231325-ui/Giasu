import Home from "./pages/Home"
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import BaiVietDetail from "./pages/BaiVietDetail";
import DanhSachGiaSu from './pages/tutor/DanhSachGiaSu';
import GiaSuDetail from "./pages/tutor/GiaSuDetail";
import TimGiaSuTheoYeuCau from "./pages/tutor/TimGiaSuTheoYeuCau";
import DanhSachMonHoc from './pages/subject/DanhSachMonHoc';
import ChonGoiHoc from "./pages/booking/ChonGoiHoc";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import HoSoHocVien from "./pages/profile/HoSoHocVien";
import LichHocCuaToi from "./pages/student/LichHocCuaToi";
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminHocVien from "./pages/admin/AdminHocVien";
import AdminGiaSu from "./pages/admin/AdminGiaSu";
import AdminBaiViet from "./pages/admin/AdminBaiViet";
import AdminYeuCauDatGiaSu from "./pages/admin/AdminYeuCauDatGiaSu";
import DangKyLamGiaSu from "./pages/tutor/dang-ky-gia-su/DangKyLamGiaSu";
import GiaSuLayout from "./layouts/GiaSuLayout";
import GiaSuTongQuan from "./pages/tutor/quan-ly/GiaSuTongQuan";
import GiaSuHoSo from "./pages/tutor/quan-ly/GiaSuHoSo";
import GiaSuLichDay from "./pages/tutor/quan-ly/GiaSuLichDay";
import GiaSuThuNhap from "./pages/tutor/quan-ly/GiaSuThuNhap";
import GiaSuTheoDoiHoatDong from "./pages/tutor/quan-ly/GiaSuTheoDoiHoatDong";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/home" element={<Home />} />

        <Route path="/gia-su" element={<DanhSachGiaSu />} />

        <Route path="/gia-su/:id" element={<GiaSuDetail />} />

        <Route path="/gia-su/:id/goi-hoc" element={<ChonGoiHoc />} />

        <Route path="/tim-gia-su-theo-yeu-cau" element={<TimGiaSuTheoYeuCau />} />

        <Route path="/dang-ky-lam-gia-su" element={<DangKyLamGiaSu />} />

        <Route path="/mon-hoc" element={<DanhSachMonHoc />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/hoc-vien/ho-so" element={<HoSoHocVien />} />

        <Route path="/hoc-vien/lich-hoc" element={<LichHocCuaToi />} />

        <Route
          path="/baiviet/:slug"
          element={<BaiVietDetail />}
        />

      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="hoc-vien" element={<AdminHocVien />} />
        <Route path="gia-su" element={<AdminGiaSu />} />
        <Route path="yeu-cau-dat-gia-su" element={<AdminYeuCauDatGiaSu />} />
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
  );
}

export default App
