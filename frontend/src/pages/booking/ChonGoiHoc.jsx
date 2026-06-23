import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ngayMai = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
};

const cacThu = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const goiDinhKy = [
    {
        id: "dinh-ky-8",
        ten: "Gói nền tảng",
        soBuoiMoiThang: 8,
        soThang: 1,
        giamGia: 0,
        moTa: "Học đều mỗi tuần, phù hợp để kiểm tra mức độ phù hợp và tạo nhịp học ổn định.",
        phuHop: "Học thử nghiêm túc",
    },
    {
        id: "dinh-ky-12",
        ten: "Gói tiến bộ",
        soBuoiMoiThang: 8,
        soThang: 2,
        giamGia: 5,
        moTa: "Theo sát chương trình học, có đủ thời gian củng cố kiến thức và luyện bài.",
        phuHop: "Cải thiện điểm số",
    },
    {
        id: "dinh-ky-16",
        ten: "Gói bứt phá",
        soBuoiMoiThang: 8,
        soThang: 3,
        giamGia: 10,
        moTa: "Dành cho ôn thi, lấy lại gốc hoặc tăng tốc trong học kỳ.",
        phuHop: "Ôn thi, mất gốc",
    },
];

const goiKhongDinhKy = [
    {
        id: "linh-hoat-1",
        ten: "Buổi học thử",
        soBuoiMoiThang: 1,
        soThang: 1,
        giamGia: 0,
        moTa: "Một buổi để trao đổi mục tiêu và thử phong cách dạy.",
        phuHop: "Muốn thử trước",
    },
    {
        id: "linh-hoat-4",
        ten: "Gói ôn gấp",
        soBuoiMoiThang: 4,
        soThang: 1,
        giamGia: 0,
        moTa: "Chọn từng buổi linh hoạt khi cần xử lý một chuyên đề hoặc bài kiểm tra gần.",
        phuHop: "Ôn ngắn hạn",
    },
    {
        id: "linh-hoat-8",
        ten: "Gói linh hoạt",
        soBuoiMoiThang: 8,
        soThang: 1,
        giamGia: 3,
        moTa: "Không cố định thứ hằng tuần, học theo lịch rảnh của học viên và gia sư.",
        phuHop: "Lịch thay đổi",
    },
];

const dinhDangGia = (giaSu) => {
    const giaTu = Number(giaSu?.gia_tu || 0);
    const giaDen = Number(giaSu?.gia_den || 0);

    if (!giaTu) return "Chờ báo giá";
    if (giaDen > giaTu) {
        return `${giaTu.toLocaleString("vi-VN")} - ${giaDen.toLocaleString("vi-VN")} đ/giờ`;
    }
    return `${giaTu.toLocaleString("vi-VN")} đ/giờ`;
};

const tinhTienGoi = (giaSu, goi) => {
    const donGia = Number(giaSu?.gia_tu || 0);
    const tongBuoi = goi.soBuoiMoiThang * goi.soThang;
    const tongTruocGiam = donGia * tongBuoi * 1.5;
    const tienGiam = Math.round((tongTruocGiam * goi.giamGia) / 100);

    return {
        tongBuoi,
        tongTruocGiam,
        tienGiam,
        tongSauGiam: tongTruocGiam - tienGiam,
    };
};

function ChonGoiHoc() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [giaSus, setGiaSus] = useState([]);
    const [monHocs, setMonHocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loaiGoi, setLoaiGoi] = useState("dinh_ky");
    const [goiId, setGoiId] = useState("dinh-ky-8");
    const [thuHoc, setThuHoc] = useState(["Thứ 2", "Thứ 5"]);
    const [thongBao, setThongBao] = useState("");
    const [form, setForm] = useState({
        monhoc_id: "",
        ngay_batdau: ngayMai(),
        gio_batdau: "18:00",
        gio_ketthuc: "19:30",
        hinh_thuc_hoc: "online",
        dia_chi_hoc: "",
        ghi_chu: "",
    });
    const [buoiLinhHoat, setBuoiLinhHoat] = useState([
        { ngay: ngayMai(), gio_batdau: "18:00", gio_ketthuc: "19:30" },
    ]);

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
                console.error("Không thể tải dữ liệu đặt lịch:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    const giaSu = useMemo(
        () => giaSus.find((item) => String(item.id) === String(id)),
        [giaSus, id],
    );

    const danhSachGoi = loaiGoi === "dinh_ky" ? goiDinhKy : goiKhongDinhKy;
    const goiDangChon = danhSachGoi.find((goi) => goi.id === goiId) || danhSachGoi[0];
    const monHocDaChon = monHocs.find((mon) => String(mon.id) === String(form.monhoc_id));
    const tienGoi = tinhTienGoi(giaSu, goiDangChon);
    const soBuoi = tienGoi.tongBuoi;
    const tamTinh = tienGoi.tongSauGiam;

    const doiLoaiGoi = (value) => {
        setLoaiGoi(value);
        setGoiId(value === "dinh_ky" ? "dinh-ky-8" : "linh-hoat-1");
        setThongBao("");
    };

    const capNhatForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setThongBao("");
    };

    const toggleThu = (thu) => {
        setThuHoc((prev) => {
            if (prev.includes(thu)) return prev.filter((item) => item !== thu);
            return [...prev, thu];
        });
        setThongBao("");
    };

    const capNhatBuoi = (index, field, value) => {
        setBuoiLinhHoat((prev) =>
            prev.map((buoi, currentIndex) =>
                currentIndex === index ? { ...buoi, [field]: value } : buoi,
            ),
        );
        setThongBao("");
    };

    const themBuoiLinhHoat = () => {
        setBuoiLinhHoat((prev) => [
            ...prev,
            { ngay: ngayMai(), gio_batdau: form.gio_batdau, gio_ketthuc: form.gio_ketthuc },
        ]);
    };

    const xoaBuoiLinhHoat = (index) => {
        setBuoiLinhHoat((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isAuthenticated) {
            setThongBao("Bạn cần đăng nhập tài khoản học viên trước khi đặt lịch.");
            return;
        }

        if (user?.vai_tro !== "hocvien") {
            setThongBao("Chức năng đặt lịch dành cho tài khoản học viên.");
            return;
        }

        if (!form.monhoc_id) {
            setThongBao("Vui lòng chọn môn học.");
            return;
        }

        if (loaiGoi === "dinh_ky" && thuHoc.length === 0) {
            setThongBao("Vui lòng chọn ít nhất một thứ học cố định.");
            return;
        }

        if (loaiGoi === "khong_dinh_ky" && buoiLinhHoat.length === 0) {
            setThongBao("Vui lòng thêm ít nhất một buổi học.");
            return;
        }

        if (loaiGoi === "khong_dinh_ky" && buoiLinhHoat.length !== soBuoi) {
            setThongBao(`Gói này có ${soBuoi} buổi. Vui lòng chọn đủ ${soBuoi} buổi học.`);
            return;
        }

        if (form.hinh_thuc_hoc === "offline" && !form.dia_chi_hoc.trim()) {
            setThongBao("Vui lòng nhập địa chỉ học tại nhà.");
            return;
        }

        setThongBao("Đã ghi nhận yêu cầu đặt lịch. Khi nối API, thông tin này sẽ tạo gói học và lịch học.");
    };

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-[#07122f] px-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
                    Đang tải dữ liệu đặt lịch...
                </div>
            </div>
        );
    }

    if (!giaSu) {
        return (
            <div className="min-h-[65vh] bg-[#07122f] px-6 py-12 text-white">
                <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0d1854] p-8 text-center">
                    <h1 className="text-2xl font-extrabold">Không tìm thấy gia sư</h1>
                    <p className="mt-2 text-sm text-slate-300">Bạn cần chọn một gia sư trước khi đặt lịch.</p>
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
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Link to={`/gia-su/${giaSu.id}`} className="text-sm font-semibold text-blue-300 hover:text-blue-200">
                            Quay lại chi tiết gia sư
                        </Link>
                        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
                            Chọn gói và đặt lịch học
                        </h1>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                        <div className="text-sm text-slate-300">Gia sư</div>
                        <div className="mt-1 text-lg font-extrabold">{giaSu.user?.ho_ten || "Gia sư"}</div>
                        <div className="mt-1 text-sm font-semibold text-blue-300">{dinhDangGia(giaSu)}</div>
                    </div>
                </div>
            </section>

            <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <h2 className="text-xl font-extrabold">1. Chọn môn và gói học</h2>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-200">Môn học</span>
                                <select
                                    value={form.monhoc_id}
                                    onChange={(event) => capNhatForm("monhoc_id", event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                >
                                    <option value="">Chọn môn học</option>
                                    {monHocs.map((mon) => (
                                        <option key={mon.id} value={mon.id}>
                                            {mon.ten_mon}{mon.lop ? ` - Lớp ${mon.lop}` : ""}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-200">Hình thức học</span>
                                <select
                                    value={form.hinh_thuc_hoc}
                                    onChange={(event) => capNhatForm("hinh_thuc_hoc", event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Tại nhà</option>
                                </select>
                            </label>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#07122f] p-2">
                            <button
                                type="button"
                                onClick={() => doiLoaiGoi("dinh_ky")}
                                className={[
                                    "rounded-xl px-4 py-3 text-sm font-bold transition",
                                    loaiGoi === "dinh_ky" ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/5",
                                ].join(" ")}
                            >
                                Định kỳ
                            </button>
                            <button
                                type="button"
                                onClick={() => doiLoaiGoi("khong_dinh_ky")}
                                className={[
                                    "rounded-xl px-4 py-3 text-sm font-bold transition",
                                    loaiGoi === "khong_dinh_ky" ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/5",
                                ].join(" ")}
                            >
                                Không định kỳ
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            {danhSachGoi.map((goi) => (
                                <button
                                    key={goi.id}
                                    type="button"
                                    onClick={() => setGoiId(goi.id)}
                                    className={[
                                        "flex min-h-56 flex-col rounded-2xl border p-5 text-left transition",
                                        goiId === goi.id
                                            ? "border-blue-400 bg-blue-500/15"
                                            : "border-white/10 bg-white/[0.03] hover:border-white/25",
                                    ].join(" ")}
                                >
                                    <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                                        {goi.phuHop}
                                    </span>
                                    <h3 className="mt-4 text-xl font-extrabold">{goi.ten}</h3>
                                    <div className="mt-2 text-3xl font-extrabold text-blue-300">
                                        {goi.soThang}
                                        <span className="ml-1 text-sm font-semibold text-slate-300">tháng</span>
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-slate-200">
                                        {goi.soBuoiMoiThang} buổi/tháng
                                    </div>
                                    {goi.giamGia > 0 && (
                                        <div className="mt-3 w-fit rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                                            Giảm {goi.giamGia}%
                                        </div>
                                    )}
                                    <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{goi.moTa}</p>
                                    <span className="mt-5 text-sm font-bold text-white">
                                        {goiId === goi.id ? "Đang chọn" : "Chọn gói này"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <h2 className="text-xl font-extrabold">2. Chọn lịch học</h2>

                        {loaiGoi === "dinh_ky" ? (
                            <div className="mt-5 space-y-5">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Ngày bắt đầu</span>
                                    <input
                                        type="date"
                                        value={form.ngay_batdau}
                                        onChange={(event) => capNhatForm("ngay_batdau", event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 md:w-64"
                                    />
                                </label>

                                <div>
                                    <div className="mb-2 text-sm font-semibold text-slate-200">Thứ học cố định</div>
                                    <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
                                        {cacThu.map((thu) => (
                                            <button
                                                key={thu}
                                                type="button"
                                                onClick={() => toggleThu(thu)}
                                                className={[
                                                    "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                                                    thuHoc.includes(thu)
                                                        ? "border-blue-400 bg-blue-500/20 text-white"
                                                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25",
                                                ].join(" ")}
                                            >
                                                {thu}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-200">Giờ bắt đầu</span>
                                        <input
                                            type="time"
                                            value={form.gio_batdau}
                                            onChange={(event) => capNhatForm("gio_batdau", event.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-200">Giờ kết thúc</span>
                                        <input
                                            type="time"
                                            value={form.gio_ketthuc}
                                            onChange={(event) => capNhatForm("gio_ketthuc", event.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {buoiLinhHoat.map((buoi, index) => (
                                    <div key={`${buoi.ngay}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                                        <input
                                            type="date"
                                            value={buoi.ngay}
                                            onChange={(event) => capNhatBuoi(index, "ngay", event.target.value)}
                                            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                        />
                                        <input
                                            type="time"
                                            value={buoi.gio_batdau}
                                            onChange={(event) => capNhatBuoi(index, "gio_batdau", event.target.value)}
                                            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                        />
                                        <input
                                            type="time"
                                            value={buoi.gio_ketthuc}
                                            onChange={(event) => capNhatBuoi(index, "gio_ketthuc", event.target.value)}
                                            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => xoaBuoiLinhHoat(index)}
                                            disabled={buoiLinhHoat.length === 1}
                                            className="rounded-xl border border-red-300/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={themBuoiLinhHoat}
                                    className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-300 hover:text-white"
                                >
                                    Thêm buổi học
                                </button>
                            </div>
                        )}
                    </section>

                    {form.hinh_thuc_hoc === "offline" && (
                        <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                            <h2 className="text-xl font-extrabold">3. Địa chỉ học</h2>
                            <input
                                value={form.dia_chi_hoc}
                                onChange={(event) => capNhatForm("dia_chi_hoc", event.target.value)}
                                placeholder="Nhập địa chỉ học tại nhà"
                                className="mt-5 w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400"
                            />
                        </section>
                    )}

                    <section className="rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                        <h2 className="text-xl font-extrabold">Ghi chú</h2>
                        <textarea
                            rows={4}
                            value={form.ghi_chu}
                            onChange={(event) => capNhatForm("ghi_chu", event.target.value)}
                            placeholder="Ví dụ: muốn học thử buổi đầu, cần ôn mất gốc, mục tiêu điểm số..."
                            className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400"
                        />

                        {thongBao && (
                            <div className="mt-5 rounded-xl border border-blue-300/30 bg-blue-400/10 px-4 py-3 text-sm text-blue-100">
                                {thongBao}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="mt-5 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
                        >
                            Gửi yêu cầu đặt lịch
                        </button>
                    </section>
                </form>

                <aside className="h-fit rounded-2xl border border-white/10 bg-[#0d1854] p-5 shadow-xl">
                    <h2 className="text-lg font-extrabold">Tóm tắt</h2>
                    <div className="mt-5 space-y-4 text-sm">
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Gia sư</span>
                            <span className="text-right font-semibold">{giaSu.user?.ho_ten || "Gia sư"}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Môn học</span>
                            <span className="text-right font-semibold">{monHocDaChon?.ten_mon || "Chưa chọn"}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Loại gói</span>
                            <span className="text-right font-semibold">{loaiGoi === "dinh_ky" ? "Định kỳ" : "Không định kỳ"}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Gói</span>
                            <span className="text-right font-semibold">{goiDangChon.ten}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Thời lượng</span>
                            <span className="text-right font-semibold">{goiDangChon.soThang} tháng</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Số buổi</span>
                            <span className="text-right font-semibold">{soBuoi} buổi</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Giảm giá</span>
                            <span className="text-right font-semibold">{goiDangChon.giamGia}%</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Trước giảm</span>
                            <span className="text-right font-semibold">
                                {tienGoi.tongTruocGiam
                                    ? `${tienGoi.tongTruocGiam.toLocaleString("vi-VN")} đ`
                                    : "Chờ báo giá"}
                            </span>
                        </div>
                        {tienGoi.tienGiam > 0 && (
                            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Tiết kiệm</span>
                                <span className="text-right font-semibold text-emerald-300">
                                    {tienGoi.tienGiam.toLocaleString("vi-VN")} đ
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-slate-400">Lịch</span>
                            <span className="text-right font-semibold">
                                {loaiGoi === "dinh_ky" ? thuHoc.join(", ") || "Chưa chọn" : "Chọn từng buổi"}
                            </span>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Tạm tính
                            </div>
                            <div className="mt-2 text-2xl font-extrabold text-blue-300">
                                {tamTinh ? `${tamTinh.toLocaleString("vi-VN")} đ` : "Chờ báo giá"}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default ChonGoiHoc;
