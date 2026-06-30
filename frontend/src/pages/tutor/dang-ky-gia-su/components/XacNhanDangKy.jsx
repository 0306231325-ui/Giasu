import { DauBatBuoc } from "./ThanhPhanChung";

function XacNhanDangKy({ dangGui = false }) {
    return (
        <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-slate-700">
                <p className="font-extrabold text-blue-700">Theo dõi kết quả xét duyệt</p>
                <p className="mt-2">
                    Sau khi gửi đơn, kết quả duyệt hồ sơ sẽ được gửi qua chuông thông báo. Vui lòng kiểm tra thông báo thường xuyên để biết hồ sơ được duyệt hay cần bổ sung thông tin.
                </p>
            </div>
            <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <input type="checkbox" name="dong_y" className="mt-1 h-4 w-4 shrink-0 accent-blue-600" />
                <span>Tôi cam kết các thông tin cung cấp là chính xác và đồng ý với điều khoản sử dụng, chính sách bảo mật của hệ thống.<DauBatBuoc /></span>
            </label>
            <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                <p className="text-sm text-slate-500">Các trường có dấu <span className="text-red-500">*</span> là bắt buộc.</p>
                <button
                    type="submit"
                    disabled={dangGui}
                    className="w-full rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {dangGui ? "Đang gửi đơn..." : "Gửi đơn đăng ký"}
                </button>
            </div>
        </div>
    );
}

export default XacNhanDangKy;
