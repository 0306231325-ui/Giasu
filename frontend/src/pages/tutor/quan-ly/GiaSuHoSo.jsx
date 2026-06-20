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

const bangCap = [
    {
        id: 1,
        ten: "Bằng tốt nghiệp Đại học",
        chiTiet: "Đại học Sư phạm TP. Hồ Chí Minh",
        trangThai: "Đã xác minh",
    },
    {
        id: 2,
        ten: "Chứng chỉ nghiệp vụ sư phạm",
        chiTiet: "Cấp ngày 12/08/2024",
        trangThai: "Đang xét duyệt",
    },
];

function GiaSuHoSo() {
    const { user, updateUser } = useAuth();
    const [thongTinCaNhan, setThongTinCaNhan] = useState(thongTinCaNhanMacDinh);
    const [banNhap, setBanNhap] = useState(thongTinCaNhanMacDinh);
    const [dangTai, setDangTai] = useState(true);
    const [dangLuu, setDangLuu] = useState(false);
    const [dangChinhSua, setDangChinhSua] = useState(false);
    const [loi, setLoi] = useState({});
    const [thongBao, setThongBao] = useState(null);
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
                    <ThongKe giaTri="2" nhan="Bằng cấp, chứng chỉ" />
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
                                nhan="Trường học"
                                giaTri="Đại học Sư phạm TP. Hồ Chí Minh"
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
                    >
                        <div className="space-y-3">
                            {bangCap.map((taiLieu) => (
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
                                                {taiLieu.ten}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {taiLieu.chiTiet}
                                            </p>
                                            <span
                                                className={[
                                                    "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                                                    taiLieu.trangThai === "Đã xác minh"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-amber-50 text-amber-700",
                                                ].join(" ")}
                                            >
                                                {taiLieu.trangThai}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label={`Xem ${taiLieu.ten}`}
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                                        >
                                            <BieuTuong ten="eye" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
        </div>
    );
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
