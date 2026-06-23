import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const dinhDangGia = (giasu) => {
    const giaTu = Number(giasu?.gia_tu || 0);
    const giaDen = Number(giasu?.gia_den || 0);

    if (!giaTu) return "Thỏa thuận";
    if (giaDen > giaTu) {
        return `${giaTu.toLocaleString("vi-VN")} - ${giaDen.toLocaleString("vi-VN")} đ/giờ`;
    }
    return `${giaTu.toLocaleString("vi-VN")} đ/giờ`;
};

const GiaSuAvatar = memo(({ giasu }) => {
    if (!giasu.avatar) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-blue-500 text-5xl font-extrabold text-white">
                {(giasu.user?.ho_ten || "G").charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <img
            src={`http://127.0.0.1:8000/storage/${giasu.avatar}`}
            alt={giasu.user?.ho_ten || "Gia sư"}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
        />
    );
});

GiaSuAvatar.displayName = "GiaSuAvatar";

const GiaSuCard = memo(({ giasu }) => (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1854] shadow-lg transition duration-200 hover:-translate-y-1 hover:border-blue-400/50">
        <div className="relative h-52 overflow-hidden bg-[#111d5e]">
            <GiaSuAvatar giasu={giasu} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1854]/95 to-transparent" />
            <div className="absolute right-3 top-3 rounded-full bg-amber-300 px-2.5 py-1 text-sm font-bold text-slate-950">
                {Number(giasu.danh_gias_avg_so_sao || 0).toFixed(1)} sao
                <span className="ml-1 text-xs">({giasu.danh_gias_count || 0})</span>
            </div>
        </div>

        <div className="p-5">
            <h2 className="truncate text-xl font-bold text-white">
                {giasu.user?.ho_ten || "Đang cập nhật"}
            </h2>

            <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p className="line-clamp-2">{giasu.hoc_van || "Chưa cập nhật học vấn"}</p>
                <p className="font-bold text-blue-300">{dinhDangGia(giasu)}</p>
                <p className="line-clamp-2">{giasu.dia_chi || "Linh hoạt khu vực học"}</p>
            </div>

            <Link
                to={`/gia-su/${giasu.id}`}
                className="mt-5 block w-full rounded-xl bg-blue-500 py-2.5 text-center font-semibold text-white transition hover:bg-blue-600"
            >
                Xem chi tiết
            </Link>
        </div>
    </div>
));

GiaSuCard.displayName = "GiaSuCard";

function DanhSachGiaSu() {
    const [giaSus, setGiaSus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchGiaSu = async () => {
            try {
                const response = await api.get("/gia-su");
                if (!cancelled && response.data.success) {
                    setGiaSus(response.data.data.data || []);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API danh sách gia sư:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchGiaSu();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-lg text-white">Đang tải danh sách gia sư...</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-10">
            <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
                    Chọn gia sư
                </p>
                <h1 className="mt-3 text-4xl font-extrabold text-white">
                    Danh sách gia sư
                </h1>
                <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-blue-500" />
                <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                    Xem hồ sơ, đánh giá và mức học phí trước khi quyết định đặt lịch học.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to="/tim-gia-su-theo-yeu-cau"
                        className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-300 hover:text-white"
                    >
                        Tìm theo yêu cầu
                    </Link>
                </div>
            </div>

            {giaSus.length === 0 ? (
                <p className="text-center text-lg text-slate-300">
                    Chưa có gia sư nào trên hệ thống.
                </p>
            ) : (
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {giaSus.map((giasu) => (
                        <GiaSuCard key={giasu.id} giasu={giasu} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default DanhSachGiaSu;
