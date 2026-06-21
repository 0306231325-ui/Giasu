import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const giaTriMacDinh = {
    ho_ten: "",
    ngay_sinh: "",
    email: "",
    sdt: "",
    lop: "",
    truong_hoc: "",
    dia_chi: "",
    ten_phu_huynh: "",
    sdt_phu_huynh: "",
    muc_tieu_hoc_tap: "",
};

function layThongDiepLoi(loi) {
    if (!loi) return "";
    return Array.isArray(loi) ? loi[0] : loi;
}

function truongTuHoSo(duLieu) {
    return {
        ho_ten: duLieu?.ho_ten || "",
        ngay_sinh: duLieu?.ngay_sinh || "",
        email: duLieu?.email || "",
        sdt: duLieu?.sdt || "",
        lop: duLieu?.hocvien?.lop || "",
        truong_hoc: duLieu?.hocvien?.truong_hoc || "",
        dia_chi: duLieu?.hocvien?.dia_chi || "",
        ten_phu_huynh: duLieu?.hocvien?.ten_phu_huynh || "",
        sdt_phu_huynh: duLieu?.hocvien?.sdt_phu_huynh || "",
        muc_tieu_hoc_tap: duLieu?.hocvien?.muc_tieu_hoc_tap || "",
    };
}

function lopThanhTienDo(phanTram) {
    if (phanTram >= 90) return "w-full";
    if (phanTram >= 75) return "w-4/5";
    if (phanTram >= 60) return "w-3/5";
    if (phanTram >= 45) return "w-1/2";
    if (phanTram >= 30) return "w-1/3";
    if (phanTram > 0) return "w-1/6";
    return "w-0";
}

function TruongNhap({ label, name, value, onChange, error, type = "text", placeholder }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`h-11 w-full rounded-lg border px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 ${
                    error ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
            />
            {error && <p className="mt-2 text-xs font-semibold text-red-600">{layThongDiepLoi(error)}</p>}
        </label>
    );
}

function NhomTruong({ title, description, children }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function DongThongTin({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="text-right text-sm font-semibold text-slate-900">{value}</dd>
        </div>
    );
}

function HoSoHocVien() {
    const navigate = useNavigate();
    const { user, loading: dangKiemTraDangNhap, isAuthenticated, updateUser } = useAuth();
    const [form, setForm] = useState(giaTriMacDinh);
    const [dangTai, setDangTai] = useState(true);
    const [dangLuu, setDangLuu] = useState(false);
    const [loi, setLoi] = useState({});
    const [thongBao, setThongBao] = useState(null);

    const laHocVien = user?.vai_tro === "hocvien";

    const mucHoanThien = useMemo(() => {
        const batBuoc = ["ho_ten", "email", "sdt", "lop", "truong_hoc", "dia_chi"];
        const daNhap = batBuoc.filter((tenTruong) => form[tenTruong]?.trim()).length;
        return Math.round((daNhap / batBuoc.length) * 100);
    }, [form]);

    const tenVietTat = useMemo(() => {
        const ten = form.ho_ten || user?.ho_ten || "HV";
        return ten
            .split(" ")
            .filter(Boolean)
            .slice(-2)
            .map((phan) => phan[0])
            .join("")
            .toUpperCase();
    }, [form.ho_ten, user?.ho_ten]);

    useEffect(() => {
        if (dangKiemTraDangNhap) return;

        if (!isAuthenticated) {
            navigate("/login", { replace: true });
            return;
        }

        if (!laHocVien) {
            return;
        }

        api.get("/hoc-vien/ho-so")
            .then((phanHoi) => {
                if (phanHoi.data.success) {
                    setForm(truongTuHoSo(phanHoi.data.data));
                }
            })
            .catch((error) => {
                setThongBao({
                    loai: "loi",
                    noiDung: error.response?.data?.message || "Không thể tải hồ sơ học viên.",
                });
            })
            .finally(() => setDangTai(false));
    }, [dangKiemTraDangNhap, isAuthenticated, laHocVien, navigate]);

    const thayDoiTruong = (suKien) => {
        const { name, value } = suKien.target;
        setForm((hienTai) => ({ ...hienTai, [name]: value }));
        setLoi((hienTai) => ({ ...hienTai, [name]: undefined }));
        setThongBao(null);
    };

    const luuHoSo = async (suKien) => {
        suKien.preventDefault();
        setDangLuu(true);
        setLoi({});
        setThongBao(null);

        try {
            const phanHoi = await api.patch("/hoc-vien/ho-so", form);
            const duLieuMoi = truongTuHoSo(phanHoi.data.data);

            setForm(duLieuMoi);
            updateUser({
                ho_ten: duLieuMoi.ho_ten,
                ngay_sinh: duLieuMoi.ngay_sinh,
                email: duLieuMoi.email,
                sdt: duLieuMoi.sdt,
            });
            setThongBao({
                loai: "thanh_cong",
                noiDung: phanHoi.data.message || "Đã lưu hồ sơ học viên.",
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setLoi(error.response.data.errors || {});
            } else {
                setThongBao({
                    loai: "loi",
                    noiDung: error.response?.data?.message || "Không thể lưu hồ sơ học viên.",
                });
            }
        } finally {
            setDangLuu(false);
        }
    };

    if (dangKiemTraDangNhap || (laHocVien && dangTai)) {
        return (
            <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600 shadow-sm">
                    Đang tải hồ sơ học viên...
                </div>
            </main>
        );
    }

    if (!laHocVien) {
        return (
            <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
                <section className="mx-auto max-w-3xl rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-amber-950">Không thể truy cập hồ sơ học viên</h1>
                    <p className="mt-2 text-sm text-amber-800">Khu vực này chỉ dành cho tài khoản học viên.</p>
                    <Link
                        to="/home"
                        className="mt-5 inline-flex h-10 items-center rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                        Về trang chủ
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="overflow-hidden rounded-lg bg-slate-950 shadow-xl">
                    <div className="grid gap-6 p-6 md:grid-cols-[1fr_300px] md:p-8">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-2xl font-black text-white shadow-lg shadow-sky-950/30">
                                {tenVietTat || "HV"}
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">
                                    Hồ sơ học viên
                                </p>
                                <h1 className="mt-2 text-3xl font-bold text-white">{form.ho_ten || "Học viên"}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                    Cập nhật thông tin cá nhân, lớp học và liên hệ phụ huynh để việc kết nối gia sư chính xác hơn.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-slate-200">Mức hoàn thiện</span>
                                <span className="text-2xl font-black text-white">{mucHoanThien}%</span>
                            </div>
                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                                <div className={`h-full rounded-full bg-sky-400 transition-all ${lopThanhTienDo(mucHoanThien)}`} />
                            </div>
                            <p className="mt-3 text-xs font-medium text-slate-300">
                                {mucHoanThien === 100 ? "Hồ sơ đã đầy đủ." : "Bổ sung các mục còn trống để hoàn thiện hồ sơ."}
                            </p>
                        </div>
                    </div>
                </header>

                {thongBao && (
                    <div
                        className={`mt-5 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${
                            thongBao.loai === "thanh_cong"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        {thongBao.noiDung}
                    </div>
                )}

                <form onSubmit={luuHoSo} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                        <NhomTruong
                            title="Thông tin liên hệ"
                            description="Thông tin cơ bản dùng để tài khoản và gia sư liên hệ khi cần."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TruongNhap
                                    label="Họ và tên"
                                    name="ho_ten"
                                    value={form.ho_ten}
                                    onChange={thayDoiTruong}
                                    error={loi.ho_ten}
                                    placeholder="Nguyễn Văn A"
                                />
                                <TruongNhap
                                    label="Ngày sinh"
                                    name="ngay_sinh"
                                    type="date"
                                    value={form.ngay_sinh}
                                    onChange={thayDoiTruong}
                                    error={loi.ngay_sinh}
                                />
                                <TruongNhap
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={thayDoiTruong}
                                    error={loi.email}
                                    placeholder="email@example.com"
                                />
                                <TruongNhap
                                    label="Số điện thoại"
                                    name="sdt"
                                    value={form.sdt}
                                    onChange={thayDoiTruong}
                                    error={loi.sdt}
                                    placeholder="0912345678"
                                />
                            </div>
                        </NhomTruong>

                        <NhomTruong
                            title="Thông tin học tập"
                            description="Lớp, trường và mục tiêu học tập giúp gợi ý gia sư phù hợp hơn."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TruongNhap
                                    label="Lớp"
                                    name="lop"
                                    value={form.lop}
                                    onChange={thayDoiTruong}
                                    error={loi.lop}
                                    placeholder="Lớp 10"
                                />
                                <TruongNhap
                                    label="Trường học"
                                    name="truong_hoc"
                                    value={form.truong_hoc}
                                    onChange={thayDoiTruong}
                                    error={loi.truong_hoc}
                                    placeholder="THPT Nguyễn Huệ"
                                />
                                <div className="md:col-span-2">
                                    <TruongNhap
                                        label="Địa chỉ"
                                        name="dia_chi"
                                        value={form.dia_chi}
                                        onChange={thayDoiTruong}
                                        error={loi.dia_chi}
                                        placeholder="Quận/Huyện, Tỉnh/Thành phố"
                                    />
                                </div>
                            </div>

                            <label className="mt-4 block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Mục tiêu học tập</span>
                                <textarea
                                    name="muc_tieu_hoc_tap"
                                    value={form.muc_tieu_hoc_tap}
                                    onChange={thayDoiTruong}
                                    rows={5}
                                    placeholder="Ví dụ: Củng cố kiến thức Toán lớp 10, luyện thi học kỳ..."
                                    className={`w-full resize-none rounded-lg border px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 ${
                                        loi.muc_tieu_hoc_tap ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                                    }`}
                                />
                                {loi.muc_tieu_hoc_tap && (
                                    <p className="mt-2 text-xs font-semibold text-red-600">
                                        {layThongDiepLoi(loi.muc_tieu_hoc_tap)}
                                    </p>
                                )}
                            </label>
                        </NhomTruong>
                    </div>

                    <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                        <NhomTruong title="Phụ huynh" description="Thông tin người giám hộ hoặc người liên hệ chính.">
                            <div className="space-y-4">
                                <TruongNhap
                                    label="Tên phụ huynh"
                                    name="ten_phu_huynh"
                                    value={form.ten_phu_huynh}
                                    onChange={thayDoiTruong}
                                    error={loi.ten_phu_huynh}
                                    placeholder="Nguyễn Văn B"
                                />
                                <TruongNhap
                                    label="Số điện thoại phụ huynh"
                                    name="sdt_phu_huynh"
                                    value={form.sdt_phu_huynh}
                                    onChange={thayDoiTruong}
                                    error={loi.sdt_phu_huynh}
                                    placeholder="0912345678"
                                />
                            </div>
                        </NhomTruong>

                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-950">Tài khoản</h2>
                            <dl className="mt-2">
                                <DongThongTin label="Vai trò" value="Học viên" />
                                <DongThongTin
                                    label="Trạng thái"
                                    value={user?.trang_thai === "hoatdong" ? "Đang hoạt động" : "Đã khóa"}
                                />
                                <DongThongTin label="Email đăng nhập" value={form.email || "Chưa cập nhật"} />
                            </dl>
                        </section>

                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <button
                                type="submit"
                                disabled={dangLuu}
                                className="flex h-12 w-full items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                            >
                                {dangLuu ? "Đang lưu..." : "Lưu thông tin"}
                            </button>
                            <Link
                                to="/home"
                                className="mt-3 flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Quay lại trang chủ
                            </Link>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
}

export default HoSoHocVien;
