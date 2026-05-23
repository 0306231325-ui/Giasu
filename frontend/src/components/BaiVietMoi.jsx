import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function BaiVietMoi() {

  const [baiviet, setBaiViet] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchBaiViet = async () => {

      try {

        const res = await api.get("/baiviet-moi");

        setBaiViet(res.data);

      } catch (error) {

        console.log(error);

      }

    };

    fetchBaiViet();

  }, []);

  return (

    <section className="max-w-7xl mx-auto px-5 mt-24">

      <h2 className="text-4xl font-bold text-white mb-12">
        Tin Moi Nhat
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {baiviet.map((item) => (

          <div
            key={item.id}
            className="bg-[#111827] rounded-2xl overflow-hidden border border-white/10 hover:translate-y-[-5px] transition"
          >

            <img
              src={
                item.anh_bia ||
                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              }
              alt=""
              className="w-full h-52 object-cover"
            />

            <div className="p-5">

              <h3 className="text-white text-xl font-semibold line-clamp-2">
                {item.tieu_de}
              </h3>

              <p className="text-gray-400 mt-4 text-sm line-clamp-3">
                {item.tom_tat}
              </p>

              <div className="flex justify-between items-center mt-6">

                <span className="text-gray-500 text-sm">
                  Lượt xem: {item.luot_xem}
                </span>

                <button
                  onClick={() => navigate(`/baiviet/${item.slug}`)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Xem thêm
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );
}

export default BaiVietMoi;