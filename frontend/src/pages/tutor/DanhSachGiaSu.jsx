import { useState, useEffect, memo } from "react";
import api from "../../services/api";

const getInitials = (name) => {
    if (!name) return "G";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AVATAR_COLORS = [
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-rose-600",
    "bg-amber-600",
];

const GiaSuAvatar = memo(({ giasu }) => {
    if (giasu.avatar) {
        return (
            <img
                src={`http://127.0.0.1:8000/storage/${giasu.avatar}`}
                alt={giasu.user?.ho_ten || "Gia sư"}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
            />
        );
    }

    const colorClass = AVATAR_COLORS[(giasu.id || 0) % AVATAR_COLORS.length];

    return (
        <div
            className={`w-full h-full flex items-center justify-center ${colorClass}`}
        >
            <span className="text-5xl font-bold text-white/90 select-none">
                {getInitials(giasu.user?.ho_ten)}
            </span>
        </div>
    );
});

GiaSuAvatar.displayName = "GiaSuAvatar";

const GiaSuCard = memo(({ giasu }) => (
    <div className="bg-[#0d1854] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-blue-400/40 hover:-translate-y-1 transition-[transform,border-color] duration-200">
        <div className="relative h-52 overflow-hidden bg-[#111d5e]">
            <GiaSuAvatar giasu={giasu} />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1854]/90 to-transparent pointer-events-none" />

            <div className="absolute top-3 right-3 bg-yellow-400 text-black text-sm font-bold px-2.5 py-1 rounded-full">
                ⭐{" "}
                {giasu.danh_gias_avg_so_sao
                    ? Number(giasu.danh_gias_avg_so_sao).toFixed(1)
                    : "0.0"}
                <span className="ml-1 text-xs">({giasu.danh_gias_count || 0})</span>
            </div>
        </div>

        <div className="p-5">
            <h2 className="text-xl font-bold text-white mb-3 truncate">
                {giasu.user?.ho_ten || "Đang cập nhật"}
            </h2>

            <div className="space-y-2 text-sm text-gray-300">
                <p className="line-clamp-2">
                    🎓 {giasu.hoc_van || "Chưa cập nhật học vấn"}
                </p>
                <p className="font-bold text-blue-400">
                    💰{" "}
                    {giasu.gia_theogio
                        ? `${Number(giasu.gia_theogio).toLocaleString("vi-VN")} đ/h`
                        : "Thỏa thuận"}
                </p>
                <p className="line-clamp-2">
                    📍 {giasu.dia_chi || "Chưa cập nhật địa chỉ"}
                </p>
                <p>📞 {giasu.user?.sdt || "Chưa có số điện thoại"}</p>
            </div>

            <button className="mt-4 w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors duration-150">
                Xem Chi Tiết
            </button>
        </div>
    </div>
));

GiaSuCard.displayName = "GiaSuCard";

const DanhSachGiaSu = () => {
    const [giaSus, setGiaSus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchGiaSu = async () => {
            try {
                const response = await api.get("/gia-su");

                if (!cancelled && response.data.success) {
                    setGiaSus(response.data.data.data);
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-white text-lg">Đang tải danh sách gia sư...</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-10">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-white mb-3">
                    Danh Sách Gia Sư
                </h1>
                <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
                <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
                    Tìm kiếm gia sư chất lượng cao với mức học phí phù hợp,
                    chuyên môn đa dạng và đánh giá uy tín.
                </p>
            </div>

            {giaSus.length === 0 ? (
                <p className="text-center text-gray-300 text-lg">
                    Chưa có gia sư nào trên hệ thống.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {giaSus.map((giasu) => (
                        <GiaSuCard key={giasu.id} giasu={giasu} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DanhSachGiaSu;
