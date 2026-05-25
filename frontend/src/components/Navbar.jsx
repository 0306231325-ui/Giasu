import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="flex justify-between items-center px-10 py-6 bg-gray-900 text-white"> 
      {/* Thêm chút màu nền text-white nếu layout của bạn màu tối giống code hiện tại */}

      <div className="text-3xl font-bold">
        DATN_GIASU
      </div>

      <nav className="flex gap-10 text-gray-300">
        {/* Sửa href="#" thành to="..." */}
        <Link to="/Home" className="hover:text-white transition">Trang Chủ</Link>
        <Link to="/gia-su" className="hover:text-white transition">Gia Sư</Link>
        <Link to="/mon-hoc" className="hover:text-white transition">Môn Học</Link>
        <Link to="/gioi-thieu" className="hover:text-white transition">Giới Thiệu</Link>
      </nav>

      <div className="flex gap-4">
      <Link
        to="/login"
        className="px-5 py-2 hover:text-blue-400 transition"
      >
        Đăng Nhập
      </Link>

        

        <button className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-xl transition">
          Đăng Ký
        </button>

      </div>

    </header>
  )
}

export default Navbar;