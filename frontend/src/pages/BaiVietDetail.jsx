import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function BaiVietDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [baiViet, setBaiViet] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    const [loi, setLoi] = useState("");

    useEffect(() => {
        let conHieuLuc = true;

        const fetchChiTiet = async () => {
            setDangTai(true);
            setLoi("");

            try {
                const res = await api.get(`/baiviet/${slug}`);

                if (conHieuLuc) {
                    setBaiViet(res.data);
                }
            } catch (error) {
                if (conHieuLuc) {
                    setBaiViet(null);
                    setLoi(error.response?.data?.message || "Không thể tải chi tiết bài viết.");
                }
            } finally {
                if (conHieuLuc) {
                    setDangTai(false);
                }
            }
        };

        fetchChiTiet();

        return () => {
            conHieuLuc = false;
        };
    }, [slug]);

    const cacDoanNoiDung = useMemo(
        () => tachNoiDung(baiViet?.noi_dung || ""),
        [baiViet?.noi_dung],
    );

    return (
        <section className="relative overflow-hidden bg-[#050b3d] px-4 py-12 text-white sm:px-6 lg:py-16">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.35),_transparent_60%)]" />
            <div className="relative mx-auto max-w-5xl">
                <div className="mb-8 flex flex-wrap items-center gap-3 text-sm font-semibold text-blue-100/70">
                    <Link to="/" className="hover:text-white">Trang chủ</Link>
                    <span>/</span>
                    <Link to="/bai-viet" className="hover:text-white">Bài viết</Link>
                    {baiViet?.tieu_de && (
                        <>
                            <span>/</span>
                            <span className="line-clamp-1 text-white/80">{baiViet.tieu_de}</span>
                        </>
                    )}
                </div>

                {dangTai ? (
                    <KhungTrangThai noiDung="Đang tải chi tiết bài viết..." />
                ) : loi ? (
                    <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-6 py-10 text-center">
                        <p className="text-sm font-semibold text-red-100">{loi}</p>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900"
                        >
                            Quay lại
                        </button>
                    </div>
                ) : baiViet ? (
                    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white text-slate-900 shadow-2xl shadow-blue-950/30">
                        <div className="bg-gradient-to-br from-[#0f1d55] to-[#101936] px-6 py-10 text-white sm:px-10 lg:px-12">
                            <span className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-blue-200">
                                Bài viết
                            </span>
                            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
                                {baiViet.tieu_de}
                            </h1>
                            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-blue-100/70">
                                <span>{dinhDangNgay(baiViet.created_at)}</span>
                                <span>•</span>
                                <span>{baiViet.luot_xem || 0} lượt xem</span>
                            </div>
                            {baiViet.tom_tat && (
                                <p className="mt-6 max-w-3xl text-base leading-8 text-blue-50/80">
                                    {baiViet.tom_tat}
                                </p>
                            )}
                        </div>

                        {baiViet.anh_bia && (
                            <img
                                src={baiViet.anh_bia}
                                alt={baiViet.tieu_de || "Bài viết"}
                                className="h-[420px] w-full object-cover"
                            />
                        )}

                        <div className="px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
                            <div className="prose prose-slate max-w-none">
                                {cacDoanNoiDung.length > 0 ? (
                                    cacDoanNoiDung.map((doan, index) => (
                                        <p key={`${doan.slice(0, 20)}-${index}`} className="mb-5 text-base font-medium leading-8 text-slate-700">
                                            {doan}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-slate-500">Bài viết chưa có nội dung.</p>
                                )}
                            </div>

                            <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    ← Quay lại
                                </button>
                                <Link
                                    to="/bai-viet"
                                    className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    Xem danh sách bài viết
                                </Link>
                            </div>
                        </div>
                    </article>
                ) : null}
            </div>
        </section>
    );
}

function KhungTrangThai({ noiDung }) {
    return (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.05] px-6 py-16 text-center text-sm font-semibold text-white/55">
            {noiDung}
        </div>
    );
}

function tachNoiDung(noiDung) {
    const khongHtml = String(noiDung)
        .replace(/<\/p>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, " ");

    return khongHtml
        .split(/\n+/)
        .map((dong) => dong.replace(/\s+/g, " ").trim())
        .filter(Boolean);
}

function dinhDangNgay(ngay) {
    if (!ngay) return "Chưa cập nhật";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(ngay));
}

export default BaiVietDetail;
