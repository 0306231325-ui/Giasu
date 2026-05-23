import { useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function BaiVietDetail() {

  const { slug } = useParams();

  useEffect(() => {

    const fetchChiTiet = async () => {
      try {

        const res = await api.get(`/baiviet/${slug}`);

        console.log(res.data);

      } catch (error) {
        console.log(error);
      }
    };

    fetchChiTiet();

  }, [slug]);

  return (
    <div className="min-h-screen bg-[#03045e] text-white flex items-center justify-center text-4xl font-bold">
      Trang Chi Tiết Bài Viết
    </div>
  );
}

export default BaiVietDetail;