import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-32 border-t border-white/10 px-10 py-10">

      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row">

        {/* LEFT */}
        <div className="max-w-md">

          <Link to="/" className="text-2xl font-extrabold tracking-tight text-white transition hover:text-blue-300">
            DATN<span className="text-blue-400">_GIASU</span>
          </Link>

          <p className="mt-6 text-sm leading-relaxed text-blue-200/80">
            Nền tảng kết nối học viên và gia sư,
            hỗ trợ đặt lịch học nhanh chóng,
            quản lý thanh toán và đánh giá chất lượng học tập.
          </p>

        </div>

        {/* CENTER */}
        <div className="min-w-[150px]">

          <h3 className="mb-6 text-lg font-bold text-white">
            Liên Kết
          </h3>

          <div className="flex flex-col gap-4 text-sm font-semibold text-blue-200/90">

            <Link to="/home" className="transition hover:text-white">
              Trang Chủ
            </Link>

            <Link to="/gia-su" className="transition hover:text-white">
              Danh Sách Gia Sư
            </Link>

            <Link to="/bai-viet" className="transition hover:text-white">
              Bài viết
            </Link>

            <Link to="/gioi-thieu" className="transition hover:text-white">
              Giới Thiệu
            </Link>

          </div>

        </div>

        {/* RIGHT */}
        <div>

          <h3 className="mb-6 text-lg font-bold text-white">
            Thông Tin
          </h3>

          <div className="flex flex-col gap-4 text-sm text-blue-200/90">

            <p className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-blue-400">✉</span>
                <span>support@datngiasu.com</span>
            </p>

            <p className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-green-400">☏</span>
                <span className="font-semibold text-white">0123 456 789</span>
            </p>

            <p className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-red-400">📍</span>
                <span>TP.HCM</span>
            </p>

          </div>

        </div>

      </div>

      {/* BOTTOM */}
      <div className="mx-auto mt-16 max-w-7xl border-t border-blue-500/20 pt-8 text-center text-xs font-semibold text-blue-300/60">

        © 2026 DATN_GIASU. All rights reserved.

      </div>

    </footer>
  )
}

export default Footer
