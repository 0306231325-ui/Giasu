import { LOP_INPUT, LOP_NHAN } from "../constants";
import { DauBatBuoc, TieuDePhan } from "./ThanhPhanChung";

function ThongTinCaNhanDangKy({ user }) {
    return (
        <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
            <TieuDePhan soThuTu="1" tieuDe="Thông tin cá nhân" moTa="Thông tin dùng để liên hệ và xác minh hồ sơ của bạn." />
            <div className="grid gap-5 md:grid-cols-2">
                <Truong nhan="Họ và tên" name="ho_ten" placeholder="Nguyễn Văn An" defaultValue={user?.ho_ten || ""} />
                <Truong nhan="Ngày sinh" name="ngay_sinh" type="date" defaultValue={user?.ngay_sinh || ""} />
                <Truong nhan="Số điện thoại" name="so_dien_thoai" type="tel" placeholder="09xx xxx xxx" defaultValue={user?.sdt || ""} />
                <Truong nhan="Email" name="email" type="email" placeholder="email@example.com" defaultValue={user?.email || ""} />
                <Truong nhan="Địa chỉ hiện tại" name="dia_chi" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" defaultValue={user?.dia_chi || ""} className="md:col-span-2" />
                <label className={`${LOP_NHAN} md:col-span-2`}>
                    Ảnh chân dung<DauBatBuoc />
                    <input className={`${LOP_INPUT} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700`} type="file" name="anh_chan_dung" accept="image/*" required />
                    <span className="mt-2 block text-xs font-normal leading-5 text-slate-500">Sử dụng ảnh rõ khuôn mặt, đủ sáng và không bị che khuất.</span>
                </label>
            </div>
        </div>
    );
}

function Truong({ nhan, name, type = "text", placeholder, defaultValue = "", className = "" }) {
    return (
        <label className={`${LOP_NHAN} ${className}`}>
            {nhan}<DauBatBuoc />
            <input className={LOP_INPUT} type={type} name={name} placeholder={placeholder} defaultValue={defaultValue} />
        </label>
    );
}

export default ThongTinCaNhanDangKy;
