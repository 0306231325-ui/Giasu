function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center mt-24 px-5 relative">

      {/* BLUR EFFECT */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-500 opacity-20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-400 opacity-20 rounded-full blur-3xl"></div>

      {/* TITLE */}
      <h1 className="text-6xl font-bold leading-tight max-w-5xl text-white">
        Tìm Gia Sư Phù Hợp
        <br />
        Cho Việc Học Của Bạn
      </h1>

      {/* DESCRIPTION */}
      <p className="text-gray-300 mt-8 max-w-3xl text-lg leading-8">
        Nền tảng kết nối học viên và gia sư nhanh chóng,
        hỗ trợ đặt lịch học định kỳ, quản lý thanh toán
        và đánh giá chất lượng giảng dạy.
      </p>

      {/* BUTTON */}
      <div className="flex gap-6 mt-10">

        <button className="bg-blue-500 hover:bg-blue-600 transition px-8 py-4 rounded-xl text-white font-semibold">
          Tìm Gia Sư
        </button>

        <button className="bg-gray-700 hover:bg-gray-600 transition px-8 py-4 rounded-xl text-white font-semibold">
          Đăng Ký Dạy
        </button>

      </div>

    </section>
  )
}

export default Hero


