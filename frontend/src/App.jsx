import Home from "./pages/Home"
import { useEffect } from 'react'
import api from './services/api'
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import BaiVietDetail from "./pages/BaiVietDetail";
import DanhSachGiaSu from './pages/tutor/DanhSachGiaSu';
import DanhSachMonHoc from './pages/subject/DanhSachMonHoc';
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminHocVien from "./pages/admin/AdminHocVien";
import AdminGiaSu from "./pages/admin/AdminGiaSu";
import AdminBaiViet from "./pages/admin/AdminBaiViet";
import DangKyLamGiaSu from "./pages/tutor/DangKyLamGiaSu";
import GiaSuLayout from "./layouts/GiaSuLayout";
import GiaSuTongQuan from "./pages/tutor/quan-ly/GiaSuTongQuan";
import GiaSuHoSo from "./pages/tutor/quan-ly/GiaSuHoSo";
import GiaSuLichDay from "./pages/tutor/quan-ly/GiaSuLichDay";
import GiaSuThuNhap from "./pages/tutor/quan-ly/GiaSuThuNhap";

function App() {

  useEffect(() => {

    api.get('/test')
      .then((response) => {

        console.log(response.data)

      })

  }, [])

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/home" element={<Home />} />

        <Route path="/gia-su" element={<DanhSachGiaSu />} />

        <Route path="/dang-ky-lam-gia-su" element={<DangKyLamGiaSu />} />

        <Route path="/mon-hoc" element={<DanhSachMonHoc />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/baiviet/:slug"
          element={<BaiVietDetail />}
        />

      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="hoc-vien" element={<AdminHocVien />} />
        <Route path="gia-su" element={<AdminGiaSu />} />
        <Route path="bai-viet" element={<AdminBaiViet />} />
      </Route>

      <Route path="/gia-su/quan-ly" element={<GiaSuLayout />}>
        <Route index element={<GiaSuTongQuan />} />
        <Route path="ho-so" element={<GiaSuHoSo />} />
        <Route path="lich-day" element={<GiaSuLichDay />} />
        <Route path="thu-nhap" element={<GiaSuThuNhap />} />
      </Route>

    </Routes>
  );
}

export default App
