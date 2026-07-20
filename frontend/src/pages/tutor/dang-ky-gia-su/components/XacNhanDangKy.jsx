import { useState } from "react";
import { DauBatBuoc } from "./ThanhPhanChung";

function XacNhanDangKy({ dangGui = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                <span>
                    Tôi cam kết các thông tin cung cấp là chính xác và đồng ý với{" "}
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="text-blue-600 underline hover:text-blue-700 font-semibold">
                        điều khoản sử dụng, chính sách bảo mật
                    </button>{" "}
                    của hệ thống.<DauBatBuoc />
                </span>
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


            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl lg:p-8">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-800">Điều khoản sử dụng & Chính sách bảo mật</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="space-y-5 text-sm leading-relaxed text-slate-600">
                            <div>
                                <p className="font-bold text-slate-800 mb-1">1. Quy định chung</p>
                                <p>Bằng việc đăng ký tài khoản gia sư, bạn cam kết cung cấp thông tin cá nhân (bằng cấp, thẻ sinh viên, CMND/CCCD) chính xác, trung thực. Mọi hành vi gian lận thông tin sẽ dẫn đến việc từ chối hồ sơ hoặc khóa tài khoản vĩnh viễn.</p>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 mb-1">2. Trách nhiệm của gia sư</p>
                                <p>Gia sư có trách nhiệm liên hệ với phụ huynh/học viên trong vòng 24h kể từ khi nhận lớp. Trong trường hợp không thể giảng dạy, phải báo lại ngay cho ban quản trị hệ thống để có phương án xử lý kịp thời.</p>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 mb-1">3. Chính sách thu nhập & Phí</p>
                                <p>chính sách phân chia thu nhập sẽ được hệ thống tính toán minh bạch dựa trên từng gói học .</p>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 mb-1">4. Chính sách bảo mật thông tin</p>
                                <p>Hệ thống cam kết bảo mật tuyệt đối các thông tin cá nhân và hình ảnh giấy tờ tùy thân của gia sư. Chúng tôi không mua bán, trao đổi hoặc chia sẻ thông tin cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý, ngoại trừ các trường hợp có yêu cầu từ cơ quan pháp luật có thẩm quyền.</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-700 transition">
                                Đã hiểu và Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default XacNhanDangKy;
