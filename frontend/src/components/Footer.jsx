function Footer() {
  return (
    <footer className="mt-32 border-t border-white/10 py-10 px-10">

      <div className="flex flex-col md:flex-row justify-between gap-10">

        {/* LEFT */}
        <div>

          <h2 className="text-3xl font-bold text-white">
            DATN_GIASU
          </h2>

          <p className="text-gray-400 mt-4 max-w-md leading-7">
            Nền tảng kết nối học viên và gia sư,
            hỗ trợ đặt lịch học nhanh chóng,
            quản lý thanh toán và đánh giá chất lượng học tập.
          </p>

        </div>

        {/* CENTER */}
        <div>

          <h3 className="text-white text-xl font-semibold mb-4">
            Liên Kết
          </h3>

          <div className="flex flex-col gap-3 text-gray-400">

            <a href="#" className="hover:text-white transition">
              Trang Chủ
            </a>

            <a href="#" className="hover:text-white transition">
              Gia Sư
            </a>

            <a href="#" className="hover:text-white transition">
              Môn Học
            </a>

            <a href="#" className="hover:text-white transition">
              Liên Hệ
            </a>

          </div>

        </div>

        {/* RIGHT */}
        <div>

          <h3 className="text-white text-xl font-semibold mb-4">
            Thông Tin
          </h3>

          <div className="flex flex-col gap-3 text-gray-400">

            <p>Email: support@datngiasu.com</p>

            <p>Hotline: 0123 456 789</p>

            <p>Địa chỉ: TP.HCM</p>

          </div>

        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-white/10 mt-10 pt-5 text-center text-gray-500">

        © 2026 DATN_GIASU. All rights reserved.

      </div>

    </footer>
  )
}

export default Footer