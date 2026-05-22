import { useState, useEffect } from 'react';
import api from '../services/api';

function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // State quản lý slide hiện tại

  // Gọi API lấy banner
  useEffect(() => {
    // Giả sử API trả về mảng các đối tượng banner
    api.get('/banner')
      .then((response) => {
        // Cần đảm bảo dữ liệu trả về là mảng
        if (Array.isArray(response.data)) {
          setBanners(response.data);
        } else {
          console.error("Dữ liệu API banner không phải là mảng:");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API banner:", error);
      });
  }, []);

  // Tự động chuyển slide mỗi 3 giây
  useEffect(() => {
    if (banners.length <= 1) return; // Nếu có 1 hình hoặc không có hình thì không cần chạy
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 3000ms = 3 giây

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <section className="flex flex-col items-center justify-center text-center mt-12 px-5 relative w-full">

      {/* BLUR EFFECT BACKGROUND - Giữ nguyên */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>

      {/* --- PHẦN 1: BANNER SLIDER TO (Đã di chuyển lên trên và phóng to) --- */}
      {banners.length > 0 && (
        <div className="z-10 mb-16 w-full max-w-7xl relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-white/5">
          
          {/* Vùng chứa các ảnh, dài gấp n lần số ảnh, dùng translateX để trượt */}
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((item) => (
              // min-w-full đảm bảo mỗi slide chiếm đủ chiều rộng container
              <div key={item.id} className="min-w-full flex-shrink-0 relative group">
                {/* Hình ảnh - Đã tăng chiều cao lên 500px */}
                {item.anh ? (
                  <img
                    src={item.anh}
                    alt={item.tieu_de || 'Banner'}
                    className="w-full h-[700px] object-cover" // Tăng chiều cao ở đây
                  />
                ) : (
                  // Placeholder nếu không có ảnh
                  <div className="w-full h-[500px] bg-gray-700 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                
                {/* Lớp mờ đen bên dưới cùng text nếu bạn muốn hiển thị tiêu đề đè lên ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040B3D]/90 via-[#040B3D]/20 to-transparent flex flex-col justify-end p-8 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.tieu_de && <h2 className="text-3xl font-bold text-white">{item.tieu_de}</h2>}
                  {item.mo_ta && <p className="text-gray-200 mt-2 max-w-2xl text-lg">{item.mo_ta}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Dấu chấm (Dots) để biết đang ở slide nào */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-blue-500 w-8' : 'bg-white/40 hover:bg-white'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>

        </div>
      )}


      {/* --- PHẦN 2: TIÊU ĐỀ CHÍNH & NÚT (Đã di chuyển xuống dưới banner) --- */}
      <div className="z-10 flex flex-col items-center">
        <h1 className="text-6xl font-bold leading-tight max-w-5xl text-white">
          Tìm Gia Sư Phù Hợp
          <br />
          Cho Việc Học Của Bạn
        </h1>
        <p className="text-gray-300 mt-8 max-w-3xl text-lg leading-8">
          Nền tảng kết nối học viên và gia sư nhanh chóng,
          hỗ trợ đặt lịch học định kỳ, quản lý thanh toán
          và đánh giá chất lượng giảng dạy.
        </p>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-6 mt-12 z-10 mb-20">
        <button className="bg-blue-500 hover:bg-blue-600 transition px-10 py-4 rounded-xl text-white font-semibold text-lg shadow-md hover:shadow-blue-500/20">
          Tìm Gia Sư
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 transition px-10 py-4 rounded-xl text-white font-semibold text-lg border border-gray-600">
          Đăng Ký Dạy
        </button>
      </div>

    </section>
  );
}

export default Hero;