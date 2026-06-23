import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const dinhDangGia = (giaSu) => {
    const giaTu = Number(giaSu?.gia_tu || 0);
    const giaDen = Number(giaSu?.gia_den || 0);

    if (!giaTu) return "Thỏa thuận";
    if (giaDen > giaTu) {
        return `${giaTu.toLocaleString("vi-VN")} - ${giaDen.toLocaleString("vi-VN")} đ/giờ`;
    }
    return `${giaTu.toLocaleString("vi-VN")} đ/giờ`;
};

const layAnh = (giaSu) => {
    if (giaSu?.avatar) return `http://127.0.0.1:8000/storage/${giaSu.avatar}`;
    if (giaSu?.user?.anh_dai_dien) return giaSu.user.anh_dai_dien;
    return null;
};

function GiaSuDetail() {
    const { id } = useParams();
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
                console.error("Không thể tải chi tiết gia sư:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchGiaSu();

        return () => {
            cancelled = true;
        };
    }, []);

    const giaSu = useMemo(
        () => giaSus.find((item) => String(item.id) === String(id)),
        [giaSus, id],
    );

    const anh = layAnh(giaSu);
    const rating = Number(giaSu?.danh_gias_avg_so_sao || 0).toFixed(1);
    const soDanhGia = giaSu?.danh_gias_count || 0;

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-[#07122f] px-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
                    Đang tải hồ sơ gia sư...
                </div>
            </div>
        );
    }

    if (!giaSu) {
        return (
            <div className="min-h-[65vh] bg-[#07122f] px-6 py-12 text-white">
                <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0d1854] p-8 text-center">
                    <h1 className="text-2xl font-extrabold">Không tìm thấy gia sư</h1>
                    <p className="mt-2 text-sm text-slate-300">Hồ sơ này có thể đã được ẩn hoặc chưa có dữ liệu.</p>
                    <Link to="/gia-su" className="mt-6 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07122f] text-white">
            <section className="border-b border-white/10 bg-[#09173a]">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-end">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1854] shadow-xl">
                        <div className="h-72 bg-[#10205f]">
                            {anh ? (
                                <img src={anh} alt={giaSu.user?.ho_ten || "Gia sư"} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-7xl font-extrabold text-blue-200">
                                    {(giaSu.user?.ho_ten || "G").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <Link to="/gia-su" className="text-sm font-semibold text-blue-300 hover:text-blue-200">
                            Quay lại danh sách
                        </Link>
                        <h1 className="mt-4 text-4xl font-extrabold">{giaSu.user?.ho_ten || "Gia sư"}</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                            {giaSu.mo_ta || giaSu.hoc_van || "Gia sư đang cập nhật thêm thông tin hồ sơ."}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3 text-sm">
                            <span className="rounded-full bg-amber-300 px-4 py-2 font-bold text-slate-950">
                                {rating} sao ({soDanhGia})
                            </span>
                            <span className="rounded-full bg-blue-500/20 px-4 py-2 font-semibold text-blue-200">
                                {dinhDangGia(giaSu)}
                            </span>
                            <span className="rounded-full bg-white/10 px-4 py-2 text-slate-200">
                                {giaSu.user?.sdt || "Chưa có số điện thoại"}
                            </span>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                disabled
                                className="cursor-not-allowed rounded-xl bg-blue-500/60 px-6 py-3 text-center text-sm font-bold text-white"
                            >
                                Đặt lịch học
                            </button>
                            <Link
                                to="/tim-gia-su-theo-yeu-cau"
                                className="rounded-xl border border-white/15 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-blue-300 hover:text-white"
                            >
                                Tìm gia sư khác
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                <section className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-[#0d1854] p-6 shadow-xl">
                        <h2 className="text-xl font-extrabold">Thông tin chuyên môn</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl bg-white/5 p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Học vấn</div>
                                <div className="mt-2 text-sm font-semibold">{giaSu.hoc_van || "Chưa cập nhật"}</div>
                            </div>
                            <div className="rounded-2xl bg-white/5 p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Khu vực</div>
                                <div className="mt-2 text-sm font-semibold">{giaSu.dia_chi || "Linh hoạt"}</div>
                            </div>
                            <div className="rounded-2xl bg-white/5 p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Học phí</div>
                                <div className="mt-2 text-sm font-semibold text-blue-300">{dinhDangGia(giaSu)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0d1854] p-6 shadow-xl">
                        <h2 className="text-xl font-extrabold">Lộ trình gợi ý</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            {["Học thử và đánh giá đầu vào", "Chốt mục tiêu và lịch học", "Theo dõi tiến độ từng buổi"].map((title, index) => (
                                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-extrabold">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        Gia sư và học viên thống nhất nội dung trước khi bắt đầu gói học.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="h-fit rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                    <h3 className="text-lg font-extrabold">Sẵn sàng đặt lịch?</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Bước tiếp theo là chọn loại gói: định kỳ cho lịch học đều, hoặc không định kỳ cho các buổi linh hoạt.
                    </p>
                    <button
                        type="button"
                        disabled
                        className="mt-5 block w-full cursor-not-allowed rounded-xl bg-blue-500/60 px-5 py-3 text-center text-sm font-bold text-white"
                    >
                        Chọn gói học
                    </button>
                </aside>
            </main>
        </div>
    );
}

export default GiaSuDetail;
