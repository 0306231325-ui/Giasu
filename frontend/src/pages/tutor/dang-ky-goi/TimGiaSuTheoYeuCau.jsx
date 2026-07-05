import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { layUrlAnhGiaSu } from "./avatarGiaSu";


function taoQuery(yeuCau) {
    const params = {};
    Object.entries(yeuCau).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) params[key] = cleanValue;
    });
    return params;
}

function TimGiaSuTheoYeuCau() {
    const [goiY, setGoiY] = useState([]);
    const [monHocs, setMonHocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dangTim, setDangTim] = useState(false);
    const [loi, setLoi] = useState("");
    const [yeuCau, setYeuCau] = useState({
        cap_hoc_id: "",
        lop: "",
        ten_mon: "",
        ngan_sach: "",
    });

    const danhSachCapHoc = useMemo(() => {
        const map = new Map();
        monHocs.forEach((mon) => {
            if (mon.cap_hoc_id && mon.cap_hoc?.ten) {
                map.set(String(mon.cap_hoc_id), mon.cap_hoc.ten);
            }
        });
        return [...map.entries()].map(([id, ten]) => ({ id, ten }));
    }, [monHocs]);

    const monTheoCap = useMemo(() => {
        return monHocs.filter((mon) => !yeuCau.cap_hoc_id || String(mon.cap_hoc_id) === String(yeuCau.cap_hoc_id));
    }, [monHocs, yeuCau.cap_hoc_id]);

    const danhSachLop = useMemo(() => {
        return [...new Set(monTheoCap.map((mon) => mon.lop).filter(Boolean))].sort();
    }, [monTheoCap]);

    const monTheoLop = useMemo(() => {
        return monTheoCap.filter((mon) => !yeuCau.lop || mon.lop === yeuCau.lop);
    }, [monTheoCap, yeuCau.lop]);

    const danhSachMon = useMemo(() => {
        return [...new Set(monTheoLop.map((mon) => mon.ten_mon).filter(Boolean))].sort();
    }, [monTheoLop]);

    const timGiaSu = async (duLieu = yeuCau) => {
        setDangTim(true);
        setLoi("");

        try {
            const response = await api.get("/tim-gia-su-theo-yeu-cau", {
                params: taoQuery(duLieu),
            });

            if (response.data.success) {
                setGoiY(response.data.data || []);
            }
        } catch (error) {
            console.error("Không thể tìm gia sư theo yêu cầu:", error);
            setLoi(error.response?.data?.message || "Không thể tìm gia sư phù hợp.");
        } finally {
            setDangTim(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const [monHocRes, goiYRes] = await Promise.all([
                    api.get("/mon-hoc"),
                    api.get("/tim-gia-su-theo-yeu-cau"),
                ]);

                if (cancelled) return;
                if (monHocRes.data.success) setMonHocs(monHocRes.data.data || []);
                if (goiYRes.data.success) setGoiY(goiYRes.data.data || []);
            } catch (error) {
                console.error("Không thể tải dữ liệu tìm gia sư:", error);
                if (!cancelled) setLoi("Không thể tải dữ liệu tìm gia sư.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    const capNhat = (field, value) => {
        setYeuCau((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "cap_hoc_id") {
                next.lop = "";
                next.ten_mon = "";
            }
            if (field === "lop") {
                next.ten_mon = "";
            }
            return next;
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        timGiaSu();
    };

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-[#07122f] px-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
                    Đang chuẩn bị dữ liệu tìm gia sư...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07122f] px-6 py-8 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
                            Tìm theo yêu cầu
                        </p>
                        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                            Gợi ý gia sư từ dữ liệu hệ thống
                        </h1>
                    </div>

                    <Link
                        to="/gia-su"
                        className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-300 hover:text-white"
                    >
                        Xem danh sách gia sư
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <h2 className="text-xl font-bold">Yêu cầu học tập</h2>

                        <div className="mt-5 space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-200">Cấp học</span>
                                <select
                                    value={yeuCau.cap_hoc_id}
                                    onChange={(event) => capNhat("cap_hoc_id", event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                >
                                    <option value="">Tất cả cấp học</option>
                                    {danhSachCapHoc.map((capHoc) => (
                                        <option key={capHoc.id} value={capHoc.id}>
                                            {capHoc.ten}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Lớp</span>
                                    <select
                                        value={yeuCau.lop}
                                        onChange={(event) => capNhat("lop", event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                    >
                                        <option value="">Tất cả lớp</option>
                                        {danhSachLop.map((lop) => (
                                            <option key={lop} value={lop}>
                                                {lop}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Môn học</span>
                                    <select
                                        value={yeuCau.ten_mon}
                                        onChange={(event) => capNhat("ten_mon", event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                    >
                                        <option value="">Tất cả môn</option>
                                        {danhSachMon.map((tenMon) => (
                                            <option key={tenMon} value={tenMon}>
                                                {tenMon}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Ngân sách/giờ</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={yeuCau.ngan_sach}
                                        onChange={(event) => capNhat("ngan_sach", event.target.value)}
                                        placeholder="Ví dụ: 350000"
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400"
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={dangTim}
                                className="w-full rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {dangTim ? "Đang tìm..." : "Tìm gia sư phù hợp"}
                            </button>
                        </div>
                    </form>

                    <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">Gia sư gợi ý</h2>
                                <p className="mt-1 text-sm text-slate-400">Có thể lọc theo cấp học, lớp, môn hoặc kết hợp cả ba.</p>
                            </div>
                            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                                {goiY.length} kết quả
                            </span>
                        </div>

                        {loi && (
                            <div className="mb-4 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                {loi}
                            </div>
                        )}

                        {goiY.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/15 px-5 py-10 text-center text-sm text-slate-300">
                                Chưa tìm thấy gia sư phù hợp.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {goiY.map((giaSu) => {
                                    const avatarUrl = layUrlAnhGiaSu(giaSu);

                                    return (
                                        <Link
                                            key={giaSu.id}
                                            to={`/gia-su/${giaSu.id}`}
                                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-300/60 hover:bg-white/[0.06]"
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-lg font-bold">
                                                    {avatarUrl ? (
                                                        <img src={avatarUrl} alt={giaSu.user?.ho_ten || "Gia sư"} className="h-full w-full object-cover" />
                                                    ) : (
                                                        (giaSu.user?.ho_ten || "G").charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="truncate font-bold">{giaSu.user?.ho_ten || "Gia sư"}</h3>
                                                    <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                                                        {giaSu.trinh_do?.ten || giaSu.mo_ta || "Chưa cập nhật trình độ"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                                                <span className="font-semibold text-blue-300">
                                                    {giaSu.gia_tu ? `${Number(giaSu.gia_tu).toLocaleString("vi-VN")} đ/giờ` : "Thỏa thuận"}
                                                </span>
                                                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold text-slate-950">
                                                    {Number(giaSu.danh_gias_avg_so_sao || 0).toFixed(1)} sao
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TimGiaSuTheoYeuCau;
