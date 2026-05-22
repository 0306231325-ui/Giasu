function Navbar() {
  return (
    <header className="flex justify-between items-center px-10 py-6">

      <div className="text-3xl font-bold">
        DATN_GIASU
      </div>

      <nav className="flex gap-10 text-gray-300">
        <a href="#">Trang Chủ</a>
        <a href="#">Gia Sư</a>
        <a href="#">Môn Học</a>
        <a href="#">Giới Thiệu</a>
      </nav>

      <div className="flex gap-4">

        <button className="px-5 py-2">
          Đăng Nhập
        </button>

        <button className="bg-blue-500 px-5 py-2 rounded-xl">
          Đăng Ký
        </button>

      </div>

    </header>
  )
}

export default Navbar