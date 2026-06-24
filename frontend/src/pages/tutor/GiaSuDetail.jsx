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

function StatBox({ label, value, tone = "default" }) {
    const toneClass = tone === "warm" ? "text-amber-200" : tone === "blue" ? "text-blue-200" : "text-white";

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
            <div className={`mt-2 text-base font-bold ${toneClass}`}>{value}</div>
        </div>
    );
}

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
    const tenGiaSu = giaSu?.user?.ho_ten || "Gia sư";
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
                <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0d1854] p-8 text-center shadow-xl">
                    <h1 className="text-2xl font-bold">Không tìm thấy gia sư</h1>
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
            <section className="border-b border-white/10 bg-[#08112d]">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
                    <div className="relative">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1854] shadow-2xl">
                            <div className="relative h-[420px] bg-[#10205f]">
                                {anh ? (
                                    <img src={anh} alt={tenGiaSu} className="h-full w-full object-cover" />
                                ) : (
                                <div className="flex h-full items-center justify-center text-7xl font-bold text-blue-200">
                                        {tenGiaSu.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#08112d] to-transparent p-5">
                                <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-slate-950">
                                            {rating} sao
                                        </span>
                                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                                            {soDanhGia} đánh giá
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Link to="/gia-su" className="text-sm font-semibold text-blue-300 hover:text-blue-200">
                            Quay lại danh sách
                        </Link>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-full border border-blue-300/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
                                Hồ sơ gia sư
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                                Sẵn sàng nhận lịch
                            </span>
                        </div>

                        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
                            {tenGiaSu}
                        </h1>

                        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                            {giaSu.mo_ta || giaSu.hoc_van || "Gia sư đang cập nhật thêm thông tin hồ sơ."}
                        </p>

                        <div className="mt-7 grid gap-4 sm:grid-cols-3">
                            <StatBox label="Đánh giá" value={`${rating}/5`} tone="warm" />
                            <StatBox label="Học phí" value={dinhDangGia(giaSu)} tone="blue" />
                            <StatBox label="Liên hệ" value={giaSu.user?.sdt || "Chưa cập nhật"} />
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to={`/gia-su/${giaSu.id}/goi-hoc`}
                                className="rounded-xl bg-blue-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-600"
                            >
                                Đặt lịch học
                            </Link>
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

            <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-[#0d1854] p-6 shadow-xl">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
                                    Chuyên môn
                                </p>
                                <h2 className="mt-2 text-xl font-bold">Thông tin giảng dạy</h2>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <StatBox label="Học vấn" value={giaSu.hoc_van || "Chưa cập nhật"} />
                            <StatBox label="Khu vực" value={giaSu.dia_chi || "Linh hoạt"} />
                            <StatBox label="Mức giá" value={dinhDangGia(giaSu)} tone="blue" />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-[#0d1854] p-6 shadow-xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
                            Lộ trình
                        </p>
                        <h2 className="mt-2 text-xl font-bold">Quy trình bắt đầu học</h2>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {[
                                ["Trao đổi mục tiêu", "Học viên nêu nhu cầu, lịch rảnh và mức độ hiện tại."],
                                ["Chọn gói học", "Chọn định kỳ hoặc không định kỳ theo kế hoạch học."],
                                ["Xác nhận lịch", "Gia sư và học viên thống nhất lịch trước buổi đầu."],
                            ].map(([title, description], index) => (
                                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="h-fit rounded-3xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                    <h3 className="text-lg font-bold">Tóm tắt hồ sơ</h3>
                    <div className="mt-5 space-y-4 text-sm">
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Gia sư</span>
                            <span className="text-right font-semibold">{tenGiaSu}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Đánh giá</span>
                            <span className="text-right font-semibold text-amber-200">{rating}/5</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Học phí</span>
                            <span className="text-right font-semibold text-blue-200">{dinhDangGia(giaSu)}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Khu vực</span>
                            <span className="text-right font-semibold">{giaSu.dia_chi || "Linh hoạt"}</span>
                        </div>
                    </div>
                    <Link
                        to={`/gia-su/${giaSu.id}/goi-hoc`}
                        className="mt-6 block rounded-xl bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                        Đặt lịch học
                    </Link>
                </aside>
            </main>
        </div>
    );
}

export default GiaSuDetail;
