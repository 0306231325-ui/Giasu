import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";

function BaiViet() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [baiViet, setBaiViet] = useState([]);
    const [meta, setMeta] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    const [loi, setLoi] = useState("");
    const [tuKhoa, setTuKhoa] = useState(searchParams.get("q") || "");

    const trang = Number(searchParams.get("page") || 1);
    const tuKhoaTrenUrl = searchParams.get("q") || "";

    useEffect(() => {
        let conHieuLuc = true;

        const taiBaiViet = async () => {
            setDangTai(true);
            setLoi("");

            try {
                const response = await api.get("/baiviet", {
                    params: {
                        page: trang,
                        q: tuKhoaTrenUrl || undefined,
                    },
                });

                if (!conHieuLuc) return;

                const duLieu = response.data?.data;
                setBaiViet(duLieu?.data || []);
                setMeta(duLieu || null);
            } catch (error) {
                if (!conHieuLuc) return;

                setBaiViet([]);
                setMeta(null);
                setLoi(error.response?.data?.message || "Không thể tải danh sách bài viết.");
            } finally {
                if (conHieuLuc) {
                    setDangTai(false);
                }
            }
        };

        taiBaiViet();

        return () => {
            conHieuLuc = false;
        };
    }, [trang, tuKhoaTrenUrl]);

    const timKiem = (event) => {
        event.preventDefault();
        const q = tuKhoa.trim();

        setSearchParams(q ? { q, page: "1" } : {});
    };

    const chuyenTrang = (page) => {
        const q = tuKhoaTrenUrl.trim();
        setSearchParams(q ? { q, page: String(page) } : { page: String(page) });
    };

    return (
        <section className="relative overflow-hidden bg-[#050b3d] px-4 py-12 text-white sm:px-6 lg:py-16">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),_transparent_60%)]" />
            <div className="relative mx-auto max-w-6xl">
                <div>
                    <span className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.22em] text-blue-200">
                        Bài viết
                    </span>
                    <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Bài viết
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/75">
                        Danh sách các bài viết, tin tức và kinh nghiệm học tập trên hệ thống.
                    </p>
                </div>

                <form
                    onSubmit={timKiem}
                    className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 shadow-2xl shadow-blue-950/20 backdrop-blur sm:flex-row"
                >
                    <input
                        type="search"
                        value={tuKhoa}
                        onChange={(event) => setTuKhoa(event.target.value)}
                        placeholder="Tìm bài viết theo tiêu đề, nội dung..."
                        className="min-h-12 flex-1 rounded-xl border border-white/10 bg-[#070d2e] px-4 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-blue-400"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
                    >
                        Tìm kiếm
                    </button>
                </form>

                {loi && (
                    <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-100">
                        {loi}
                    </div>
                )}

                {dangTai ? (
                    <KhungTrangThai noiDung="Đang tải danh sách bài viết..." />
                ) : baiViet.length === 0 ? (
                    <KhungTrangThai noiDung="Chưa có bài viết phù hợp." />
                ) : (
                    <>
                        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-blue-950/20">
                            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                                <p className="text-sm font-bold text-white/70">
                                    Tổng {meta?.total ?? baiViet.length} bài viết
                                </p>
                            </div>

                            <div className="divide-y divide-white/10">
                                {baiViet.map((item) => (
                                    <DongBaiViet key={item.id} baiViet={item} />
                                ))}
                            </div>
                        </div>

                        <PhanTrang
                            meta={meta}
                            dangTai={dangTai}
                            onChuyenTrang={chuyenTrang}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

function DongBaiViet({ baiViet }) {
    return (
        <div className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.04] sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center sm:px-6">
            <Link
                to={`/bai-viet/${baiViet.slug}`}
                className="block overflow-hidden rounded-2xl border border-white/10 bg-blue-500/10"
            >
                <AnhBaiViet baiViet={baiViet} className="h-32 sm:h-24" />
            </Link>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/40">
                    <span>Bài viết</span>
                    <span>•</span>
                    <span>{dinhDangNgay(baiViet.created_at)}</span>
                    <span>•</span>
                    <span>{baiViet.luot_xem || 0} lượt xem</span>
                </div>

                <Link
                    to={`/bai-viet/${baiViet.slug}`}
                    className="mt-2 block line-clamp-2 text-xl font-extrabold leading-snug text-white hover:text-blue-200"
                >
                    {baiViet.tieu_de}
                </Link>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
                    {baiViet.tom_tat || rutGonNoiDung(baiViet.noi_dung)}
                </p>
            </div>

            <Link
                to={`/bai-viet/${baiViet.slug}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 sm:justify-self-end"
            >
                Xem chi tiết
            </Link>
        </div>
    );
}

function AnhBaiViet({ baiViet, className = "" }) {
    if (baiViet.anh_bia) {
        return (
            <img
                src={baiViet.anh_bia}
                alt={baiViet.tieu_de || "Bài viết"}
                className={`w-full object-cover ${className}`}
            />
        );
    }

    return (
        <div className={`flex w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 ${className}`}>
            <span className="text-3xl font-black text-white/80">BV</span>
        </div>
    );
}

function PhanTrang({ meta, dangTai, onChuyenTrang }) {
    const trangHienTai = meta?.current_page || 1;
    const trangCuoi = meta?.last_page || 1;

    if (!meta || trangCuoi <= 1) return null;

    return (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 sm:flex-row">
            <p className="text-sm font-semibold text-white/55">
                Trang <span className="text-white">{trangHienTai}</span> / <span className="text-white">{trangCuoi}</span>
            </p>
            <div className="flex gap-3">
                <button
                    type="button"
                    disabled={dangTai || trangHienTai <= 1}
                    onClick={() => onChuyenTrang(trangHienTai - 1)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Trước
                </button>
                <button
                    type="button"
                    disabled={dangTai || trangHienTai >= trangCuoi}
                    onClick={() => onChuyenTrang(trangHienTai + 1)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Sau
                </button>
            </div>
        </div>
    );
}

function KhungTrangThai({ noiDung }) {
    return (
        <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.05] px-6 py-14 text-center text-sm font-semibold text-white/55">
            {noiDung}
        </div>
    );
}

function dinhDangNgay(ngay) {
    if (!ngay) return "Chưa cập nhật";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(ngay));
}

function rutGonNoiDung(noiDung = "") {
    return String(noiDung).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default BaiViet;
