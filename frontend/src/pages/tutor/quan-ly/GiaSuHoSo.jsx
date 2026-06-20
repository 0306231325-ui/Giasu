import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

const thongTinCaNhanMacDinh = {
    ho_ten: "",
    ngay_sinh: "",
    sdt: "",
    email: "",
    dia_chi: "",
    mo_ta: "",
};

const lopNhapLieu =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500";

const monDangDay = [
    {
        id: 1,
        tenMon: "Toán học",
        capHoc: "THPT",
        gia: "350.000đ",
        trangThai: "da_duyet",
    },
    {
        id: 2,
        tenMon: "Vật lý",
        capHoc: "THPT",
        gia: "370.000đ",
        trangThai: "cho_duyet",
    },
    {
        id: 3,
        tenMon: "Toán học",
        capHoc: "THCS",
        gia: "270.000đ",
        trangThai: "tu_choi",
        lyDo: "Chưa có bằng cấp hoặc minh chứng chuyên môn phù hợp.",
    },
];

const bangCapMacDinh = {
    ten_bang: "",
    loai_bang: "bang_cap",
    chuyen_nganh: "",
    truong_don_vi: "",
    tai_lieu: null,
};

function GiaSuHoSo() {
    const { user, updateUser } = useAuth();
    const [thongTinCaNhan, setThongTinCaNhan] = useState(thongTinCaNhanMacDinh);
    const [banNhap, setBanNhap] = useState(thongTinCaNhanMacDinh);
    const [dangTai, setDangTai] = useState(true);
    const [dangLuu, setDangLuu] = useState(false);
    const [dangChinhSua, setDangChinhSua] = useState(false);
    const [loi, setLoi] = useState({});
    const [thongBao, setThongBao] = useState(null);
    const [danhSachBangCap, setDanhSachBangCap] = useState([]);
    const [dangTaiBangCap, setDangTaiBangCap] = useState(true);
    const [hienFormBangCap, setHienFormBangCap] = useState(false);
    const [formBangCap, setFormBangCap] = useState(bangCapMacDinh);
    const [loiBangCap, setLoiBangCap] = useState({});
    const [dangThemBangCap, setDangThemBangCap] = useState(false);
    const [bangCapDangXoa, setBangCapDangXoa] = useState(null);
    const tenGiaSu = thongTinCaNhan.ho_ten || user?.ho_ten || "Gia sư";

    useEffect(() => {
        let conHieuLuc = true;

        api.get("/gia-su/ho-so/ca-nhan")
            .then((phanHoi) => {
                if (!conHieuLuc) return;
                const duLieu = { ...thongTinCaNhanMacDinh, ...phanHoi.data.data };
                setThongTinCaNhan(duLieu);
                setBanNhap(duLieu);
            })
            .catch((error) => {
                if (!conHieuLuc) return;
                setThongBao({
                    loai: "loi",
                    noiDung:
                        error.response?.data?.message ||
                        "Không thể tải thông tin cá nhân. Vui lòng thử lại.",
                });
            })
            .finally(() => {
                if (conHieuLuc) setDangTai(false);
            });

        return () => {
            conHieuLuc = false;
        };
    }, []);

    useEffect(() => {
        let conHieuLuc = true;

        api.get("/gia-su/ho-so/bang-cap")
            .then((phanHoi) => {
                if (conHieuLuc) setDanhSachBangCap(phanHoi.data.data || []);
            })
            .catch((error) => {
                if (!conHieuLuc) return;
                setThongBao({
                    loai: "loi",
                    noiDung:
                        error.response?.data?.message ||
                        "Không thể tải danh sách bằng cấp và chứng chỉ.",
                });
            })
            .finally(() => {
                if (conHieuLuc) setDangTaiBangCap(false);
            });

        return () => {
            conHieuLuc = false;
        };
    }, []);

    const batDauChinhSua = () => {
        setBanNhap(thongTinCaNhan);
        setLoi({});
        setThongBao(null);
        setDangChinhSua(true);
    };

    const huyChinhSua = () => {
        setBanNhap(thongTinCaNhan);
        setLoi({});
        setDangChinhSua(false);
    };

    const thayDoiTruong = (suKien) => {
        const { name, value } = suKien.target;
        setBanNhap((duLieuHienTai) => ({ ...duLieuHienTai, [name]: value }));
        setLoi((loiHienTai) => ({ ...loiHienTai, [name]: undefined }));
    };

    const luuThongTinCaNhan = async (suKien) => {
        suKien.preventDefault();
        setDangLuu(true);
        setLoi({});
        setThongBao(null);

        try {
            const phanHoi = await api.patch("/gia-su/ho-so/ca-nhan", banNhap);
            const duLieu = { ...thongTinCaNhanMacDinh, ...phanHoi.data.data };

            setThongTinCaNhan(duLieu);
            setBanNhap(duLieu);
            setDangChinhSua(false);
            updateUser({
                ho_ten: duLieu.ho_ten,
                ngay_sinh: duLieu.ngay_sinh,
                sdt: duLieu.sdt,
                email: duLieu.email,
            });
            setThongBao({
                loai: "thanh_cong",
                noiDung: phanHoi.data.message,
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setLoi(error.response.data.errors || {});
            } else {
                setThongBao({
                    loai: "loi",
                    noiDung:
                        error.response?.data?.message ||
                        "Không thể lưu thông tin cá nhân. Vui lòng thử lại.",
                });
            }
        } finally {
            setDangLuu(false);
        }
    };

    const thayDoiBangCap = (suKien) => {
        const { name, value, files } = suKien.target;
        setFormBangCap((hienTai) => ({
            ...hienTai,
            [name]: files ? files[0] || null : value,
        }));
        setLoiBangCap((hienTai) => ({ ...hienTai, [name]: undefined }));
    };

    const dongFormBangCap = () => {
        if (dangThemBangCap) return;
        setHienFormBangCap(false);
        setFormBangCap(bangCapMacDinh);
        setLoiBangCap({});
    };

    const themBangCap = async (suKien) => {
        suKien.preventDefault();
        setDangThemBangCap(true);
        setLoiBangCap({});
        setThongBao(null);

        const duLieuGui = new FormData();
        Object.entries(formBangCap).forEach(([ten, giaTri]) => {
            if (giaTri !== null && giaTri !== "") duLieuGui.append(ten, giaTri);
        });

        try {
            const phanHoi = await api.post(
                "/gia-su/ho-so/bang-cap",
                duLieuGui,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            setDanhSachBangCap((hienTai) => [phanHoi.data.data, ...hienTai]);
            setThongBao({
                loai: "thanh_cong",
                noiDung: phanHoi.data.message,
            });
            setHienFormBangCap(false);
            setFormBangCap(bangCapMacDinh);
            setLoiBangCap({});
        } catch (error) {
            if (error.response?.status === 422) {
                setLoiBangCap(error.response.data.errors || {});
            } else {
                setThongBao({
                    loai: "loi",
                    noiDung:
                        error.response?.data?.message ||
                        "Không thể thêm tài liệu. Vui lòng thử lại.",
                });
            }
        } finally {
            setDangThemBangCap(false);
        }
    };

    const xemBangCap = async (bangCap) => {
        try {
            const phanHoi = await api.get(bangCap.url_xem, {
                responseType: "blob",
            });
            const urlTam = URL.createObjectURL(phanHoi.data);
            window.open(urlTam, "_blank", "noopener,noreferrer");
            window.setTimeout(() => URL.revokeObjectURL(urlTam), 60000);
        } catch {
            setThongBao({
                loai: "loi",
                noiDung: "Không thể mở file tài liệu.",
            });
        }
    };

    const xoaBangCap = async (bangCap) => {
        if (!window.confirm(`Xóa tài liệu "${bangCap.ten_bang}"?`)) return;

        setBangCapDangXoa(bangCap.id);
        setThongBao(null);

        try {
            const phanHoi = await api.delete(
                `/gia-su/ho-so/bang-cap/${bangCap.id}`,
            );
            setDanhSachBangCap((hienTai) =>
                hienTai.filter((taiLieu) => taiLieu.id !== bangCap.id),
            );
            setThongBao({
                loai: "thanh_cong",
                noiDung: phanHoi.data.message,
            });
        } catch (error) {
            setThongBao({
                loai: "loi",
                noiDung:
                    error.response?.data?.message ||
                    "Không thể xóa tài liệu. Vui lòng thử lại.",
            });
        } finally {
            setBangCapDangXoa(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        Hồ sơ giảng dạy
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Hồ sơ gia sư
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                        Quản lý thông tin cá nhân, chuyên môn, môn đăng ký dạy và
                        hồ sơ xác minh của bạn.
                    </p>
                </div>

                <button
                    type="submit"
                    form="form-thong-tin-ca-nhan"
                    disabled={!dangChinhSua || dangLuu}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <BieuTuong ten="save" />
                    {dangLuu ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </div>

            {thongBao && (
                <div
                    role="status"
                    className={[
                        "mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold",
                        thongBao.loai === "thanh_cong"
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                            : "border-red-400/30 bg-red-400/10 text-red-200",
                    ].join(" ")}
                >
                    {thongBao.noiDung}
                </div>
            )}

            <section className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#101d43] to-[#0b1533] shadow-2xl shadow-black/20">
                <div className="relative p-6 sm:p-8">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                            <div className="relative">
                                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 text-4xl font-black text-white shadow-xl shadow-blue-950/40">
                                    {layChuCaiDau(tenGiaSu)}
                                </div>
                                <button
                                    type="button"
                                    aria-label="Đổi ảnh đại diện"
                                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-[#101d43] bg-white text-slate-700 shadow-lg transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <BieuTuong ten="camera" />
                                </button>
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                    <h2 className="text-2xl font-extrabold">{tenGiaSu}</h2>
                                    <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                                        Đã duyệt
                                    </span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-blue-200">
                                    Gia sư Toán học · 3 năm kinh nghiệm
                                </p>
                                <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/55 sm:justify-start">
                                    <span className="inline-flex items-center gap-2">
                                        <BieuTuong ten="location" />
                                        Quận Bình Thạnh, TP. Hồ Chí Minh
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <BieuTuong ten="star" />
                                        4.9 · 28 đánh giá
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-sm">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-white/70">
                                    Mức độ hoàn thiện hồ sơ
                                </span>
                                <span className="font-extrabold text-blue-300">85%</span>
                            </div>
                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                            </div>
                            <p className="mt-3 text-xs leading-5 text-white/45">
                                Thêm chứng chỉ ngoại ngữ để hồ sơ nổi bật và đáng tin
                                cậy hơn.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid border-t border-white/10 bg-black/10 sm:grid-cols-3">
                    <ThongKe giaTri="3" nhan="Môn đăng ký dạy" />
                    <ThongKe
                        giaTri={dangTaiBangCap ? "..." : String(danhSachBangCap.length)}
                        nhan="Bằng cấp, chứng chỉ"
                    />
                    <ThongKe giaTri="350.000đ" nhan="Giá dạy từ" />
                </div>
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
                <div className="space-y-6">
                    <KhoiNoiDung
                        bieuTuong="user"
                        tieuDe="Thông tin cá nhân"
                        moTa="Thông tin liên hệ và giới thiệu hiển thị trên hồ sơ."
                        hanhDong={dangChinhSua ? "Hủy" : "Chỉnh sửa"}
                        onHanhDong={dangChinhSua ? huyChinhSua : batDauChinhSua}
                        voHieuHoaHanhDong={dangTai || dangLuu}
                    >
                        {dangTai ? (
                            <p className="text-sm font-semibold text-slate-500">
                                Đang tải thông tin cá nhân...
                            </p>
                        ) : (
                            <form
                                id="form-thong-tin-ca-nhan"
                                onSubmit={luuThongTinCaNhan}
                                className="grid gap-5 md:grid-cols-2"
                            >
                                <TruongCaNhan
                                    nhan="Họ và tên"
                                    name="ho_ten"
                                    value={banNhap.ho_ten}
                                    dangChinhSua={dangChinhSua}
                                    onChange={thayDoiTruong}
                                    loi={loi.ho_ten}
                                    batBuoc
                                />
                                <TruongCaNhan
                                    nhan="Ngày sinh"
                                    name="ngay_sinh"
                                    type="date"
                                    value={banNhap.ngay_sinh}
                                    giaTriHienThi={dinhDangNgay(banNhap.ngay_sinh)}
                                    dangChinhSua={dangChinhSua}
                                    onChange={thayDoiTruong}
                                    loi={loi.ngay_sinh}
                                    batBuoc
                                />
                                <TruongCaNhan
                                    nhan="Số điện thoại"
                                    name="sdt"
                                    type="tel"
                                    value={banNhap.sdt}
                                    dangChinhSua={dangChinhSua}
                                    onChange={thayDoiTruong}
                                    loi={loi.sdt}
                                    batBuoc
                                />
                                <TruongCaNhan
                                    nhan="Email"
                                    name="email"
                                    type="email"
                                    value={banNhap.email}
                                    dangChinhSua={dangChinhSua}
                                    onChange={thayDoiTruong}
                                    loi={loi.email}
                                    batBuoc
                                />
                                <TruongCaNhan
                                    nhan="Địa chỉ hiện tại"
                                    name="dia_chi"
                                    value={banNhap.dia_chi}
                                    dangChinhSua={dangChinhSua}
                                    onChange={thayDoiTruong}
                                    loi={loi.dia_chi}
                                    batBuoc
                                    className="md:col-span-2"
                                />
                                <TruongCaNhan
                                    nhan="Giới thiệu bản thân"
                                    name="mo_ta"
                                    value={banNhap.mo_ta}
                                    dangChinhSua={dangChinhSua}
                                    onChange={thayDoiTruong}
                                    loi={loi.mo_ta}
                                    nhieuDong
                                    className="md:col-span-2"
                                />

                                {dangChinhSua && (
                                    <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
                                        <button
                                            type="button"
                                            onClick={huyChinhSua}
                                            disabled={dangLuu}
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={dangLuu}
                                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                                        >
                                            {dangLuu ? "Đang lưu..." : "Lưu thông tin"}
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}
                    </KhoiNoiDung>

                    <KhoiNoiDung
                        bieuTuong="book"
                        tieuDe="Chuyên môn và kinh nghiệm"
                        moTa="Nền tảng học vấn và năng lực giảng dạy hiện tại."
                        hanhDong="Chỉnh sửa"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <TruongThongTin
                                nhan="Trình độ"
                                giaTri="Đã tốt nghiệp Đại học"
                            />
                            <TruongThongTin
                                nhan="Mức kinh nghiệm"
                                giaTri="Từ 3 đến 5 năm"
                            />
                            <TruongThongTin
                                nhan="Chuyên ngành"
                                giaTri="Sư phạm Toán học"
                            />
                        </div>
                    </KhoiNoiDung>

                    <KhoiNoiDung
                        bieuTuong="subjects"
                        tieuDe="Danh mục môn dạy"
                        moTa="Các môn bạn đăng ký sẽ được quản trị viên xét duyệt."
                        hanhDong="Thêm môn dạy"
                        noiBat
                    >
                        <div className="space-y-3">
                            {monDangDay.map((mon) => (
                                <MonDay key={mon.id} mon={mon} />
                            ))}
                        </div>
                        <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
                            Khi thêm môn mới, môn học sẽ ở trạng thái chờ duyệt và
                            chưa hiển thị cho học viên cho đến khi được xác nhận.
                        </div>
                    </KhoiNoiDung>
                </div>

                <div className="space-y-6">
                    <KhoiNoiDung
                        bieuTuong="shield"
                        tieuDe="Trạng thái hồ sơ"
                        moTa="Thông tin xét duyệt tài khoản gia sư."
                    >
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                    <BieuTuong ten="check" />
                                </span>
                                <div>
                                    <p className="font-bold text-emerald-900">
                                        Hồ sơ đã được duyệt
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                                        Bạn có thể nhận lớp và quản lý hoạt động
                                        giảng dạy trên hệ thống.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 space-y-4 text-sm">
                            <DongThongTin nhan="Ngày tham gia" giaTri="20/05/2026" />
                            <DongThongTin nhan="Ngày được duyệt" giaTri="22/05/2026" />
                            <DongThongTin nhan="Mã gia sư" giaTri="#GS000128" />
                        </div>
                    </KhoiNoiDung>

                    <KhoiNoiDung
                        bieuTuong="certificate"
                        tieuDe="Bằng cấp và chứng chỉ"
                        moTa="Tài liệu dùng để xác minh chuyên môn."
                        hanhDong="Thêm tài liệu"
                        onHanhDong={() => setHienFormBangCap(true)}
                    >
                        {dangTaiBangCap ? (
                            <p className="text-sm font-semibold text-slate-500">
                                Đang tải tài liệu...
                            </p>
                        ) : danhSachBangCap.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center">
                                <p className="text-sm font-bold text-slate-700">
                                    Chưa có bằng cấp hoặc chứng chỉ
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Thêm file minh chứng để hồ sơ được xác minh đầy đủ hơn.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {danhSachBangCap.map((taiLieu) => (
                                <div
                                    key={taiLieu.id}
                                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <BieuTuong ten="document" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-slate-900">
                                                {taiLieu.ten_bang}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {[taiLieu.chuyen_nganh, taiLieu.truong_don_vi]
                                                    .filter(Boolean)
                                                    .join(" · ") || "Chưa cập nhật chi tiết"}
                                            </p>
                                            <span
                                                className={[
                                                    "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                                                    lopTrangThaiBangCap(taiLieu.trang_thai),
                                                ].join(" ")}
                                            >
                                                {nhanTrangThaiBangCap(taiLieu.trang_thai)}
                                            </span>
                                            {taiLieu.ly_do && (
                                                <p className="mt-2 text-xs leading-5 text-red-600">
                                                    <span className="font-bold">Lý do:</span>{" "}
                                                    {taiLieu.ly_do}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <button
                                                type="button"
                                                onClick={() => xemBangCap(taiLieu)}
                                                aria-label={`Xem ${taiLieu.ten_bang}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                                            >
                                                <BieuTuong ten="eye" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => xoaBangCap(taiLieu)}
                                                disabled={bangCapDangXoa === taiLieu.id}
                                                aria-label={`Xóa ${taiLieu.ten_bang}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                            >
                                                <BieuTuong ten="trash" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </KhoiNoiDung>

                    <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-5">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/15 text-blue-200">
                                <BieuTuong ten="bulb" />
                            </span>
                            <div>
                                <p className="font-bold text-white">Mẹo hoàn thiện hồ sơ</p>
                                <p className="mt-1 text-xs leading-5 text-white/55">
                                    Hồ sơ có ảnh đại diện rõ ràng, giới thiệu chi tiết
                                    và đầy đủ bằng cấp thường được học viên quan tâm
                                    nhiều hơn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {hienFormBangCap && (
                <FormBangCap
                    duLieu={formBangCap}
                    loi={loiBangCap}
                    dangGui={dangThemBangCap}
                    onChange={thayDoiBangCap}
                    onSubmit={themBangCap}
                    onDong={dongFormBangCap}
                />
            )}
        </div>
    );
}

function FormBangCap({ duLieu, loi, dangGui, onChange, onSubmit, onDong }) {
    const loiDauTien = (tenTruong) =>
        Array.isArray(loi[tenTruong]) ? loi[tenTruong][0] : loi[tenTruong];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tieu-de-form-bang-cap"
        >
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 id="tieu-de-form-bang-cap" className="text-xl font-extrabold">
                            Thêm bằng cấp hoặc chứng chỉ
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            File tải lên sẽ được gửi quản trị viên xét duyệt.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onDong}
                        disabled={dangGui}
                        aria-label="Đóng"
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <BieuTuong ten="x" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="grid gap-5 p-6 md:grid-cols-2">
                    <TruongBangCap
                        nhan="Tên bằng cấp/chứng chỉ"
                        name="ten_bang"
                        value={duLieu.ten_bang}
                        onChange={onChange}
                        loi={loiDauTien("ten_bang")}
                        placeholder="Ví dụ: Bằng tốt nghiệp Đại học"
                        className="md:col-span-2"
                        batBuoc
                    />

                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Loại tài liệu <span className="text-red-500">*</span>
                        </span>
                        <select
                            name="loai_bang"
                            value={duLieu.loai_bang}
                            onChange={onChange}
                            className={lopNhapLieu}
                            required
                        >
                            <option value="bang_cap">Bằng cấp</option>
                            <option value="chung_chi">Chứng chỉ</option>
                            <option value="khac">Tài liệu khác</option>
                        </select>
                        {loiDauTien("loai_bang") && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600">
                                {loiDauTien("loai_bang")}
                            </p>
                        )}
                    </label>

                    <TruongBangCap
                        nhan="Chuyên ngành"
                        name="chuyen_nganh"
                        value={duLieu.chuyen_nganh}
                        onChange={onChange}
                        loi={loiDauTien("chuyen_nganh")}
                        placeholder="Ví dụ: Sư phạm Toán"
                    />

                    <TruongBangCap
                        nhan="Trường/đơn vị cấp"
                        name="truong_don_vi"
                        value={duLieu.truong_don_vi}
                        onChange={onChange}
                        loi={loiDauTien("truong_don_vi")}
                        placeholder="Tên trường hoặc đơn vị cấp"
                        className="md:col-span-2"
                        batBuoc
                    />

                    <label className="block md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            File minh chứng <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="file"
                            name="tai_lieu"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={onChange}
                            required
                            className={`${lopNhapLieu} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100`}
                        />
                        <p className="mt-1.5 text-xs text-slate-400">
                            Hỗ trợ PDF, JPG, JPEG, PNG; tối đa 5MB.
                        </p>
                        {loiDauTien("tai_lieu") && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600">
                                {loiDauTien("tai_lieu")}
                            </p>
                        )}
                    </label>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
                        <button
                            type="button"
                            onClick={onDong}
                            disabled={dangGui}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={dangGui}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            <BieuTuong ten="upload" />
                            {dangGui ? "Đang tải lên..." : "Thêm tài liệu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TruongBangCap({
    nhan,
    name,
    value,
    onChange,
    loi,
    placeholder,
    className = "",
    batBuoc = false,
}) {
    return (
        <label className={`block ${className}`}>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {nhan}
                {batBuoc && <span className="text-red-500"> *</span>}
            </span>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={batBuoc}
                className={`${lopNhapLieu} ${loi ? "border-red-400" : ""}`}
            />
            {loi && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{loi}</p>
            )}
        </label>
    );
}

function nhanTrangThaiBangCap(trangThai) {
    return {
        cho_duyet: "Đang xét duyệt",
        duyet: "Đã xác minh",
        tu_choi: "Bị từ chối",
    }[trangThai] || "Chưa xác định";
}

function lopTrangThaiBangCap(trangThai) {
    return {
        cho_duyet: "bg-amber-50 text-amber-700",
        duyet: "bg-emerald-50 text-emerald-700",
        tu_choi: "bg-red-50 text-red-700",
    }[trangThai] || "bg-slate-100 text-slate-600";
}

function KhoiNoiDung({
    bieuTuong,
    tieuDe,
    moTa,
    hanhDong,
    onHanhDong,
    voHieuHoaHanhDong = false,
    noiBat = false,
    children,
}) {
    return (
        <section
            className={[
                "overflow-hidden rounded-3xl border bg-white text-slate-900 shadow-xl shadow-black/10",
                noiBat ? "border-blue-200" : "border-slate-200",
            ].join(" ")}
        >
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                    <span
                        className={[
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                            noiBat
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-600",
                        ].join(" ")}
                    >
                        <BieuTuong ten={bieuTuong} />
                    </span>
                    <div>
                        <h2 className="font-extrabold text-slate-950">{tieuDe}</h2>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{moTa}</p>
                    </div>
                </div>
                {hanhDong && (
                    <button
                        type="button"
                        onClick={onHanhDong}
                        disabled={voHieuHoaHanhDong}
                        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
                    >
                        <BieuTuong ten={hanhDong === "Thêm môn dạy" || hanhDong === "Thêm tài liệu" ? "plus" : "edit"} />
                        {hanhDong}
                    </button>
                )}
            </div>
            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

function TruongCaNhan({
    nhan,
    name,
    value,
    giaTriHienThi,
    type = "text",
    dangChinhSua,
    onChange,
    loi,
    batBuoc = false,
    nhieuDong = false,
    className = "",
}) {
    if (!dangChinhSua) {
        return (
            <div className={className}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {nhan}
                </p>
                <p className={`mt-2 text-sm font-semibold text-slate-800 ${nhieuDong ? "leading-7" : ""}`}>
                    {giaTriHienThi || value || "Chưa cập nhật"}
                </p>
            </div>
        );
    }

    const thuocTinhChung = {
        id: `thong-tin-${name}`,
        name,
        value: value || "",
        onChange,
        required: batBuoc,
        "aria-invalid": Boolean(loi),
        "aria-describedby": loi ? `loi-${name}` : undefined,
        className: `${lopNhapLieu} ${loi ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`,
    };

    return (
        <label htmlFor={`thong-tin-${name}`} className={`block ${className}`}>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {nhan}
                {batBuoc && <span className="text-red-500"> *</span>}
            </span>
            {nhieuDong ? (
                <textarea {...thuocTinhChung} rows={5} maxLength={2000} />
            ) : (
                <input {...thuocTinhChung} type={type} />
            )}
            {loi && (
                <span id={`loi-${name}`} className="mt-1.5 block text-xs font-semibold text-red-600">
                    {Array.isArray(loi) ? loi[0] : loi}
                </span>
            )}
        </label>
    );
}

function dinhDangNgay(ngay) {
    if (!ngay) return "";
    const [nam, thang, ngayTrongThang] = ngay.split("-");
    return `${ngayTrongThang}/${thang}/${nam}`;
}

function TruongThongTin({ nhan, giaTri, nhieuDong = false }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {nhan}
            </p>
            <p
                className={[
                    "mt-2 text-sm font-semibold text-slate-800",
                    nhieuDong ? "leading-7" : "",
                ].join(" ")}
            >
                {giaTri}
            </p>
        </div>
    );
}

function MonDay({ mon }) {
    const cauHinhTrangThai = {
        da_duyet: {
            nhan: "Đã duyệt",
            lop: "bg-emerald-50 text-emerald-700",
        },
        cho_duyet: {
            nhan: "Chờ duyệt",
            lop: "bg-amber-50 text-amber-700",
        },
        tu_choi: {
            nhan: "Từ chối",
            lop: "bg-red-50 text-red-700",
        },
    };
    const trangThai = cauHinhTrangThai[mon.trangThai];

    return (
        <div className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-extrabold text-blue-600">
                        {mon.tenMon.charAt(0)}
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">{mon.tenMon}</p>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                {mon.capHoc}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Giá dự kiến:{" "}
                            <span className="font-bold text-slate-700">
                                {mon.gia}/giờ
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${trangThai.lop}`}
                    >
                        {trangThai.nhan}
                    </span>
                    <button
                        type="button"
                        aria-label={`Tùy chọn môn ${mon.tenMon}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <BieuTuong ten="more" />
                    </button>
                </div>
            </div>
            {mon.lyDo && (
                <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                    <span className="font-bold">Lý do từ chối:</span> {mon.lyDo}
                </div>
            )}
        </div>
    );
}

function ThongKe({ giaTri, nhan }) {
    return (
        <div className="border-white/10 px-6 py-4 text-center first:border-0 sm:border-l">
            <p className="text-xl font-extrabold text-white">{giaTri}</p>
            <p className="mt-1 text-xs text-white/45">{nhan}</p>
        </div>
    );
}

function DongThongTin({ nhan, giaTri }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <span className="text-slate-500">{nhan}</span>
            <span className="font-bold text-slate-800">{giaTri}</span>
        </div>
    );
}

function layChuCaiDau(hoTen) {
    return hoTen
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((tu) => tu.charAt(0).toUpperCase())
        .join("");
}

function BieuTuong({ ten }) {
    const duongNet = {
        save: <><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></>,
        camera: <><path d="M4 7h3l2-3h6l2 3h3v12H4z" /><circle cx="12" cy="13" r="4" /></>,
        location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
        star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
        user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
        book: <><path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 3z" /><path d="M20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 3z" /></>,
        subjects: <><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></>,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
        check: <path d="m5 12 4 4L19 6" />,
        certificate: <><circle cx="12" cy="9" r="6" /><path d="m8 14-1 8 5-3 5 3-1-8" /></>,
        document: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
        eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
        trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></>,
        x: <path d="m6 6 12 12M18 6 6 18" />,
        upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" /></>,
        bulb: <><path d="M9 18h6M10 22h4" /><path d="M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z" /></>,
        plus: <path d="M12 5v14M5 12h14" />,
        edit: <><path d="m4 20 4-1 11-11-3-3L5 16z" /><path d="m14 7 3 3" /></>,
        more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
        >
            {duongNet[ten]}
        </svg>
    );
}

export default GiaSuHoSo;
