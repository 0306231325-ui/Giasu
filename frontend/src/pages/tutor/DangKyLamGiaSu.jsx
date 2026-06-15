import { useState } from "react";
import useTutorRegistrationOptions from "./hooks/useTutorRegistrationOptions";

const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClass = "block text-sm font-semibold text-slate-700";

function SectionTitle({ number, title, description }) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {number}
            </span>
            <div>
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
        </div>
    );
}

function RequiredMark() {
    return <span className="text-red-500"> *</span>;
}

function formatExperienceLevel(level) {
    if (level.tu_khoang === 0 && level.den_khoang === 0) {
        return "Chưa có kinh nghiệm";
    }

    if (level.den_khoang === null) {
        return `Từ ${level.tu_khoang} năm trở lên`;
    }

    return `Từ ${level.tu_khoang} đến ${level.den_khoang} năm`;
}

function DangKyLamGiaSu() {
    const { options, loading, error } = useTutorRegistrationOptions();
    const [selectedCapHocId, setSelectedCapHocId] = useState("");
    const monHocTheoCap = options.mon_hoc.filter(
        (monHoc) => String(monHoc.cap_hoc_id) === selectedCapHocId,
    );

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
                    {error && (
                        <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 sm:px-8 lg:px-10">
                            {error}
                        </div>
                    )}

                    <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
                        <SectionTitle
                            number="1"
                            title="Thông tin cá nhân"
                            description="Thông tin dùng để liên hệ và xác minh hồ sơ của bạn."
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={labelClass}>
                                Họ và tên<RequiredMark />
                                <input
                                    className={inputClass}
                                    type="text"
                                    name="ho_ten"
                                    placeholder="Nguyễn Văn An"
                                />
                            </label>

                            <label className={labelClass}>
                                Ngày sinh<RequiredMark />
                                <input
                                    className={inputClass}
                                    type="date"
                                    name="ngay_sinh"
                                />
                            </label>

                            <label className={labelClass}>
                                Số điện thoại<RequiredMark />
                                <input
                                    className={inputClass}
                                    type="tel"
                                    name="so_dien_thoai"
                                    placeholder="09xx xxx xxx"
                                />
                            </label>

                            <label className={labelClass}>
                                Email<RequiredMark />
                                <input
                                    className={inputClass}
                                    type="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                            </label>

                            <label className={`${labelClass} md:col-span-2`}>
                                Địa chỉ hiện tại<RequiredMark />
                                <input
                                    className={inputClass}
                                    type="text"
                                    name="dia_chi"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
                        <SectionTitle
                            number="2"
                            title="Học vấn và chuyên môn"
                            description="Cung cấp nền tảng chuyên môn phù hợp với môn học bạn muốn giảng dạy."
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={labelClass}>
                                Trình độ hiện tại<RequiredMark />
                                <select
                                    className={inputClass}
                                    name="trinh_do_giasu_id"
                                    defaultValue=""
                                    disabled={loading}
                                >
                                    <option value="" disabled>
                                        {loading ? "Đang tải trình độ..." : "Chọn trình độ"}
                                    </option>
                                    {options.trinh_do.map((trinhDo) => (
                                        <option key={trinhDo.id} value={trinhDo.id}>
                                            {trinhDo.ten}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={labelClass}>
                                Trường học<RequiredMark />
                                <input
                                    className={inputClass}
                                    type="text"
                                    name="truong_hoc"
                                    placeholder="Tên trường đang học hoặc đã tốt nghiệp"
                                />
                            </label>

                            <label className={labelClass}>
                                Chuyên ngành<RequiredMark />
                                <input
                                    className={inputClass}
                                    type="text"
                                    name="chuyen_nganh"
                                    placeholder="Ví dụ: Sư phạm Toán học"
                                />
                            </label>

                            <label className={labelClass}>
                                Cấp học có thể dạy<RequiredMark />
                                <select
                                    className={inputClass}
                                    name="cap_hoc_id"
                                    value={selectedCapHocId}
                                    onChange={(event) => setSelectedCapHocId(event.target.value)}
                                    disabled={loading}
                                >
                                    <option value="" disabled>
                                        {loading ? "Đang tải cấp học..." : "Chọn cấp học"}
                                    </option>
                                    {options.cap_hoc.map((capHoc) => (
                                        <option key={capHoc.id} value={capHoc.id}>
                                            {capHoc.ten}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <fieldset className="md:col-span-2">
                                <legend className={labelClass}>
                                    Môn học đăng ký dạy<RequiredMark />
                                </legend>
                                {!selectedCapHocId ? (
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
                        <SectionTitle
                            number="3"
                            title="Kinh nghiệm giảng dạy"
                            description="Mô tả kinh nghiệm và phương pháp giúp bạn tạo ra kết quả học tập tốt."
                        />

                        <div className="grid gap-5">
                            <label className={labelClass}>
                                Mức kinh nghiệm<RequiredMark />
                                <select
                                    className={inputClass}
                                    name="muc_kinh_nghiem_id"
                                    defaultValue=""
                                    disabled={loading}
                                >
                                    <option value="" disabled>
                                        {loading
                                            ? "Đang tải mức kinh nghiệm..."
                                            : "Chọn mức kinh nghiệm"}
                                    </option>
                                    {options.muc_kinh_nghiem.map((level) => (
                                        <option key={level.id} value={level.id}>
                                            {formatExperienceLevel(level)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={labelClass}>
                                Kinh nghiệm giảng dạy<RequiredMark />
                                <textarea
                                    className={`${inputClass} min-h-32 resize-y`}
                                    name="kinh_nghiem"
                                    placeholder="Chia sẻ kinh nghiệm, thành tích giảng dạy hoặc đối tượng học viên từng phụ trách..."
                                />
                            </label>

                            <label className={labelClass}>
                                Giới thiệu bản thân và phương pháp dạy<RequiredMark />
                                <textarea
                                    className={`${inputClass} min-h-36 resize-y`}
                                    name="gioi_thieu"
                                    placeholder="Giới thiệu ngắn gọn về bản thân, phong cách và phương pháp giảng dạy của bạn..."
                                />
                            </label>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                        <SectionTitle
                            number="4"
                            title="Hồ sơ xác minh"
                            description="Tải lên giấy tờ rõ nét để quá trình xét duyệt diễn ra thuận lợi."
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={labelClass}>
                                Ảnh chân dung<RequiredMark />
                                <input
                                    className={`${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700`}
                                    type="file"
                                    name="anh_chan_dung"
                                    accept="image/*"
                                />
                            </label>

                            <label className={labelClass}>
                                Bằng cấp / Thẻ sinh viên<RequiredMark />
                                <input
                                    className={`${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700`}
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
                                <RequiredMark />
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
