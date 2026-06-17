import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useDanhMucDangKyGiaSu from "./hooks/useDanhMucDangKyGiaSu";
import useGiaDuKienGiaSu from "./hooks/useGiaDuKienGiaSu";

const lopInput =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const lopNhan = "block text-sm font-semibold text-slate-700";

function TieuDePhan({ soThuTu, tieuDe, moTa }) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {soThuTu}
            </span>
            <div>
                <h2 className="text-lg font-bold text-slate-900">{tieuDe}</h2>
                <p className="mt-1 text-sm text-slate-500">{moTa}</p>
            </div>
        </div>
    );
}

function DauBatBuoc() {
    return <span className="text-red-500"> *</span>;
}

function dinhDangMucKinhNghiem(mucKinhNghiem) {
    if (mucKinhNghiem.tu_khoang === 0 && mucKinhNghiem.den_khoang === 0) {
        return "Chưa có kinh nghiệm";
    }

    if (mucKinhNghiem.den_khoang === null) {
        return `Từ ${mucKinhNghiem.tu_khoang} năm trở lên`;
    }

    return `Từ ${mucKinhNghiem.tu_khoang} đến ${mucKinhNghiem.den_khoang} năm`;
}

function dinhDangTien(giaTri) {
    return `${Number(giaTri).toLocaleString("vi-VN")}đ`;
}

function DangKyLamGiaSu() {
    const dieuHuong = useNavigate();
    const viTri = useLocation();
    const { isAuthenticated, loading: dangTaiXacThuc } = useAuth();
    const { danhMuc, dangTai: dangTaiDanhMuc, loi: loiDanhMuc } =
        useDanhMucDangKyGiaSu();
    const [capHocIdDaChon, setCapHocIdDaChon] = useState("");
    const [trinhDoIdDaChon, setTrinhDoIdDaChon] = useState("");
    const [mucKinhNghiemIdDaChon, setMucKinhNghiemIdDaChon] = useState("");
    const [monHocIdsDaChon, setMonHocIdsDaChon] = useState([]);
    const monHocTheoCap = danhMuc.mon_hoc.filter(
        (monHoc) => String(monHoc.cap_hoc_id) === capHocIdDaChon,
    );
    const {
        giaDuKien,
        dangTai: dangTinhGia,
        loi: loiTinhGia,
    } = useGiaDuKienGiaSu({
        monHocIdsDaChon,
        trinhDoIdDaChon,
        mucKinhNghiemIdDaChon,
    });

    const xuLyChonMonHoc = (suKien) => {
        const monHocId = suKien.target.value;

        setMonHocIdsDaChon((danhSachHienTai) =>
            suKien.target.checked
                ? [...danhSachHienTai, monHocId]
                : danhSachHienTai.filter((id) => id !== monHocId),
        );
    };

    useEffect(() => {
        if (!dangTaiXacThuc && !isAuthenticated) {
            dieuHuong(
                `/login?redirect=${encodeURIComponent(viTri.pathname)}`,
                { replace: true },
            );
        }
    }, [dangTaiXacThuc, dieuHuong, isAuthenticated, viTri.pathname]);

    if (dangTaiXacThuc || !isAuthenticated) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 text-slate-900">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-lg">
                    <p className="text-sm font-semibold text-slate-700">
                        Đang kiểm tra đăng nhập...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:py-16">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-950 to-slate-50" />

            <div className="relative mx-auto max-w-6xl">
                <div className="mx-auto mb-10 max-w-3xl text-center text-white">
                    <span className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-1.5 text-sm font-semibold text-blue-200">
                        Gia nhập đội ngũ gia sư
                    </span>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        Gửi đơn đăng ký gia sư
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                        Hoàn thiện thông tin bên dưới để chúng tôi hiểu rõ hơn về
                        chuyên môn và kinh nghiệm giảng dạy của bạn.
                    </p>
                </div>

                <form className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-950/10">
                    {loiDanhMuc && (
                        <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 sm:px-8 lg:px-10">
                            {loiDanhMuc}
                        </div>
                    )}

                    <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
                        <TieuDePhan
                            soThuTu="1"
                            tieuDe="Thông tin cá nhân"
                            moTa="Thông tin dùng để liên hệ và xác minh hồ sơ của bạn."
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={lopNhan}>
                                Họ và tên<DauBatBuoc />
                                <input
                                    className={lopInput}
                                    type="text"
                                    name="ho_ten"
                                    placeholder="Nguyễn Văn An"
                                />
                            </label>

                            <label className={lopNhan}>
                                Ngày sinh<DauBatBuoc />
                                <input
                                    className={lopInput}
                                    type="date"
                                    name="ngay_sinh"
                                />
                            </label>

                            <label className={lopNhan}>
                                Số điện thoại<DauBatBuoc />
                                <input
                                    className={lopInput}
                                    type="tel"
                                    name="so_dien_thoai"
                                    placeholder="09xx xxx xxx"
                                />
                            </label>

                            <label className={lopNhan}>
                                Email<DauBatBuoc />
                                <input
                                    className={lopInput}
                                    type="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                            </label>

                            <label className={`${lopNhan} md:col-span-2`}>
                                Địa chỉ hiện tại<DauBatBuoc />
                                <input
                                    className={lopInput}
                                    type="text"
                                    name="dia_chi"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
                        <TieuDePhan
                            soThuTu="2"
                            tieuDe="Học vấn và chuyên môn"
                            moTa="Cung cấp nền tảng chuyên môn phù hợp với môn học bạn muốn giảng dạy."
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={lopNhan}>
                                Trình độ hiện tại<DauBatBuoc />
                                <select
                                    className={lopInput}
                                    name="trinh_do_giasu_id"
                                    value={trinhDoIdDaChon}
                                    onChange={(suKien) =>
                                        setTrinhDoIdDaChon(suKien.target.value)
                                    }
                                    disabled={dangTaiDanhMuc}
                                >
                                    <option value="" disabled>
                                        {dangTaiDanhMuc ? "Đang tải trình độ..." : "Chọn trình độ"}
                                    </option>
                                    {danhMuc.trinh_do.map((trinhDo) => (
                                        <option key={trinhDo.id} value={trinhDo.id}>
                                            {trinhDo.ten}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={lopNhan}>
                                Trường học<DauBatBuoc />
                                <input
                                    className={lopInput}
                                    type="text"
                                    name="truong_hoc"
                                    placeholder="Tên trường đang học hoặc đã tốt nghiệp"
                                />
                            </label>

                            <label className={lopNhan}>
                                Chuyên ngành<DauBatBuoc />
                                <input
                                    className={lopInput}
                                    type="text"
                                    name="chuyen_nganh"
                                    placeholder="Ví dụ: Sư phạm Toán học"
                                />
                            </label>

                            <label className={lopNhan}>
                                Cấp học có thể dạy<DauBatBuoc />
                                <select
                                    className={lopInput}
                                    name="cap_hoc_id"
                                    value={capHocIdDaChon}
                                    onChange={(suKien) => {
                                        setCapHocIdDaChon(suKien.target.value);
                                        setMonHocIdsDaChon([]);
                                    }}
                                    disabled={dangTaiDanhMuc}
                                >
                                    <option value="" disabled>
                                        {dangTaiDanhMuc ? "Đang tải cấp học..." : "Chọn cấp học"}
                                    </option>
                                    {danhMuc.cap_hoc.map((capHoc) => (
                                        <option key={capHoc.id} value={capHoc.id}>
                                            {capHoc.ten}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <fieldset className="md:col-span-2">
                                <legend className={lopNhan}>
                                    Môn học đăng ký dạy<DauBatBuoc />
                                </legend>
                                {!capHocIdDaChon ? (
                                    <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-normal text-slate-500">
                                        Chọn cấp học để hiển thị môn học.
                                    </p>
                                ) : monHocTheoCap.length === 0 ? (
                                    <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-normal text-slate-500">
                                        Cấp học này chưa có môn học.
                                    </p>
                                ) : (
                                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {monHocTheoCap.map((monHoc) => (
                                            <label
                                                key={monHoc.id}
                                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="mon_hoc_ids[]"
                                                    value={monHoc.id}
                                                    checked={monHocIdsDaChon.includes(
                                                        String(monHoc.id),
                                                    )}
                                                    onChange={xuLyChonMonHoc}
                                                    className="h-4 w-4 accent-blue-600"
                                                />
                                                {monHoc.ten_mon}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </fieldset>
                        </div>
                    </div>

                    <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
                        <TieuDePhan
                            soThuTu="3"
                            tieuDe="Kinh nghiệm giảng dạy"
                            moTa="Mô tả kinh nghiệm và phương pháp giúp bạn tạo ra kết quả học tập tốt."
                        />

                        <div className="grid gap-5">
                            <label className={lopNhan}>
                                Mức kinh nghiệm<DauBatBuoc />
                                <select
                                    className={lopInput}
                                    name="muc_kinh_nghiem_id"
                                    value={mucKinhNghiemIdDaChon}
                                    onChange={(suKien) =>
                                        setMucKinhNghiemIdDaChon(suKien.target.value)
                                    }
                                    disabled={dangTaiDanhMuc}
                                >
                                    <option value="" disabled>
                                        {dangTaiDanhMuc
                                            ? "Đang tải mức kinh nghiệm..."
                                            : "Chọn mức kinh nghiệm"}
                                    </option>
                                    {danhMuc.muc_kinh_nghiem.map((mucKinhNghiem) => (
                                        <option
                                            key={mucKinhNghiem.id}
                                            value={mucKinhNghiem.id}
                                        >
                                            {dinhDangMucKinhNghiem(mucKinhNghiem)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={lopNhan}>
                                Kinh nghiệm giảng dạy<DauBatBuoc />
                                <textarea
                                    className={`${lopInput} min-h-32 resize-y`}
                                    name="kinh_nghiem"
                                    placeholder="Chia sẻ kinh nghiệm, thành tích giảng dạy hoặc đối tượng học viên từng phụ trách..."
                                />
                            </label>

                            <label className={lopNhan}>
                                Giới thiệu bản thân và phương pháp dạy<DauBatBuoc />
                                <textarea
                                    className={`${lopInput} min-h-36 resize-y`}
                                    name="gioi_thieu"
                                    placeholder="Giới thiệu ngắn gọn về bản thân, phong cách và phương pháp giảng dạy của bạn..."
                                />
                            </label>
                        </div>
                    </div>

                    <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
                        <TieuDePhan
                            soThuTu="4"
                            tieuDe="Giá giảng dạy dự kiến"
                            moTa="Giá được tính từ giá môn, trình độ và mức kinh nghiệm đã chọn."
                        />

                        {dangTinhGia ? (
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-8 text-center text-sm text-blue-700">
                                Đang tính giá dự kiến...
                            </div>
                        ) : loiTinhGia ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                                {loiTinhGia}
                            </div>
                        ) : giaDuKien.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                                Chọn trình độ, mức kinh nghiệm và ít nhất một môn học để
                                xem giá dự kiến.
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-slate-200">
                                <div className="hidden grid-cols-[1.4fr_repeat(4,1fr)] gap-4 bg-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
                                    <span>Môn học</span>
                                    <span>Giá môn</span>
                                    <span>Trình độ</span>
                                    <span>Kinh nghiệm</span>
                                    <span className="text-right">Tổng dự kiến</span>
                                </div>

                                {giaDuKien.map((mucGia) => (
                                    <div
                                        key={mucGia.monhoc_id}
                                        className="grid gap-3 border-t border-slate-100 px-5 py-4 first:border-t-0 md:grid-cols-[1.4fr_repeat(4,1fr)] md:items-center md:gap-4"
                                    >
                                        <span className="font-bold text-slate-900">
                                            {mucGia.ten_mon}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            <span className="mr-2 text-slate-400 md:hidden">
                                                Giá môn:
                                            </span>
                                            {dinhDangTien(mucGia.gia_mon)}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            <span className="mr-2 text-slate-400 md:hidden">
                                                Trình độ:
                                            </span>
                                            +{dinhDangTien(mucGia.gia_cong_trinh_do)}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            <span className="mr-2 text-slate-400 md:hidden">
                                                Kinh nghiệm:
                                            </span>
                                            +{dinhDangTien(mucGia.gia_cong_kinh_nghiem)}
                                        </span>
                                        <span className="text-lg font-extrabold text-blue-600 md:text-right">
                                            {dinhDangTien(mucGia.tong_gia)}/giờ
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                            Đây là giá tham khảo. Hệ thống sẽ tính lại giá chính thức khi
                            hồ sơ được gửi và xét duyệt.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                        <TieuDePhan
                            soThuTu="5"
                            tieuDe="Hồ sơ xác minh"
                            moTa="Tải lên giấy tờ rõ nét để quá trình xét duyệt diễn ra thuận lợi."
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={lopNhan}>
                                Ảnh chân dung<DauBatBuoc />
                                <input
                                    className={`${lopInput} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700`}
                                    type="file"
                                    name="anh_chan_dung"
                                    accept="image/*"
                                />
                            </label>

                            <label className={lopNhan}>
                                Bằng cấp / Thẻ sinh viên<DauBatBuoc />
                                <input
                                    className={`${lopInput} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700`}
                                    type="file"
                                    name="bang_cap[]"
                                    accept="image/*"
                                    multiple
                                />
                                <span className="mt-2 block text-xs font-normal text-slate-500">
                                    Có thể chọn nhiều ảnh cùng lúc.
                                </span>
                            </label>
                        </div>

                        <label className="mt-7 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                            <input
                                type="checkbox"
                                name="dong_y"
                                className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                            />
                            <span>
                                Tôi cam kết các thông tin cung cấp là chính xác và đồng ý
                                với điều khoản sử dụng, chính sách bảo mật của hệ thống.
                                <DauBatBuoc />
                            </span>
                        </label>

                        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                            <p className="text-sm text-slate-500">
                                Các trường có dấu <span className="text-red-500">*</span> là
                                bắt buộc.
                            </p>
                            <button
                                type="button"
                                className="w-full rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
                            >
                                Gửi đơn đăng ký
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default DangKyLamGiaSu;
