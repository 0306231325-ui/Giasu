import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { boDauTiengViet } from "../../utils/string";

const mucTieuHoc = [
    "Mất gốc cần học lại",
    "Theo sát chương trình trên lớp",
    "Ôn thi học kỳ",
    "Ôn thi chuyển cấp",
    "Luyện thi tốt nghiệp",
    "Nâng cao điểm số",
];

function TimGiaSuTheoYeuCau() {
    const [giaSus, setGiaSus] = useState([]);
    const [monHocs, setMonHocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yeuCau, setYeuCau] = useState({
        monhoc_id: "",
        muc_tieu: "",
        hinh_thuc: "",
        ngan_sach: "",
        thoi_gian: "",
        ghi_chu: "",
    });

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const [giaSuRes, monHocRes] = await Promise.all([
                    api.get("/gia-su"),
                    api.get("/mon-hoc"),
                ]);

                if (cancelled) return;

                if (giaSuRes.data.success) setGiaSus(giaSuRes.data.data.data || []);
                if (monHocRes.data.success) setMonHocs(monHocRes.data.data || []);
            } catch (error) {
                console.error("Không thể tải dữ liệu tìm gia sư:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    const goiY = useMemo(() => {
        const keyword = boDauTiengViet(
            `${yeuCau.muc_tieu} ${yeuCau.hinh_thuc} ${yeuCau.thoi_gian} ${yeuCau.ghi_chu}`,
        );
        const nganSach = Number(yeuCau.ngan_sach || 0);

        return giaSus
            .map((giaSu) => {
                let diem = 0;
                const giaTu = Number(giaSu.gia_tu || 0);
                const profileText = boDauTiengViet(
                    `${giaSu.user?.ho_ten || ""} ${giaSu.hoc_van || ""} ${giaSu.dia_chi || ""}`,
                );

                if (keyword && profileText.includes(keyword.split(" ")[0])) diem += 1;
                if (!nganSach || !giaTu || giaTu <= nganSach) diem += 2;
                diem += Number(giaSu.danh_gias_avg_so_sao || 0) / 2;

                return { ...giaSu, diem_goi_y: diem };
            })
            .sort((a, b) => b.diem_goi_y - a.diem_goi_y)
            .slice(0, 6);
    }, [giaSus, yeuCau]);

    const capNhat = (field, value) => {
        setYeuCau((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-[#07122f] px-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
                    Đang chuẩn bị gợi ý gia sư...
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
                        <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">
                            Mô tả nhu cầu, hệ thống gợi ý gia sư phù hợp
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                            Cách này phù hợp khi học viên chưa biết nên chọn ai. Điền mục tiêu học, ngân sách và lịch rảnh để xem các hồ sơ đáng cân nhắc.
                        </p>
                    </div>

                    <Link
                        to="/gia-su"
                        className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-300 hover:text-white"
                    >
                        Xem danh sách gia sư
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
                    <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <h2 className="text-xl font-extrabold">Yêu cầu học tập</h2>

                        <div className="mt-5 space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-200">Môn học</span>
                                <select
                                    value={yeuCau.monhoc_id}
                                    onChange={(event) => capNhat("monhoc_id", event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                >
                                    <option value="">Chưa chọn môn</option>
                                    {monHocs.map((mon) => (
                                        <option key={mon.id} value={mon.id}>
                                            {mon.ten_mon}{mon.lop ? ` - Lớp ${mon.lop}` : ""}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-200">Mục tiêu</span>
                                <select
                                    value={yeuCau.muc_tieu}
                                    onChange={(event) => capNhat("muc_tieu", event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                >
                                    <option value="">Chọn mục tiêu</option>
                                    {mucTieuHoc.map((mucTieu) => (
                                        <option key={mucTieu} value={mucTieu}>
                                            {mucTieu}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Hình thức</span>
                                    <select
                                        value={yeuCau.hinh_thuc}
                                        onChange={(event) => capNhat("hinh_thuc", event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                    >
                                        <option value="">Linh hoạt</option>
                                        <option value="online">Online</option>
                                        <option value="offline">Tại nhà</option>
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Ngân sách/giờ</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={yeuCau.ngan_sach}
                                        onChange={(event) => capNhat("ngan_sach", event.target.value)}
                                        placeholder="Ví dụ: 180000"
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-200">Thời gian rảnh</span>
                                <input
                                    value={yeuCau.thoi_gian}
                                    onChange={(event) => capNhat("thoi_gian", event.target.value)}
                                    placeholder="Ví dụ: tối thứ 2, 4, 6"
                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-200">Ghi chú thêm</span>
                                <textarea
                                    rows={4}
                                    value={yeuCau.ghi_chu}
                                    onChange={(event) => capNhat("ghi_chu", event.target.value)}
                                    placeholder="Nói rõ tình trạng học, mong muốn, khu vực..."
                                    className="w-full resize-none rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400"
                                />
                            </label>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold">Gia sư gợi ý</h2>
                                <p className="mt-1 text-sm text-slate-400">Chọn hồ sơ để xem chi tiết trước khi đặt lịch.</p>
                            </div>
                            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                                {goiY.length} kết quả
                            </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {goiY.map((giaSu) => (
                                <Link
                                    key={giaSu.id}
                                    to={`/gia-su/${giaSu.id}`}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-300/60 hover:bg-white/[0.06]"
                                >
                                    <div className="flex gap-3">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-lg font-bold">
                                            {giaSu.avatar ? (
                                                <img src={`http://127.0.0.1:8000/storage/${giaSu.avatar}`} alt={giaSu.user?.ho_ten || "Gia sư"} className="h-full w-full object-cover" />
                                            ) : (
                                                (giaSu.user?.ho_ten || "G").charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="truncate font-bold">{giaSu.user?.ho_ten || "Gia sư"}</h3>
                                            <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                                                {giaSu.hoc_van || "Chưa cập nhật học vấn"}
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
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TimGiaSuTheoYeuCau;
