import { dinhDangTien } from "../utils/dinhDangDangKy";
import { TieuDePhan } from "./ThanhPhanChung";

function GiaDuKien({ gia }) {
    return (
        <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
            <TieuDePhan soThuTu="5" tieuDe="Giá giảng dạy dự kiến" moTa="Giá được tính từ giá môn, trình độ và mức kinh nghiệm đã chọn." />
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-slate-700">
                <p className="font-extrabold text-blue-700">
                    Cách hệ thống tính giá dự kiến
                </p>
                <p className="mt-1">
                    Giá mỗi giờ = <span className="font-bold">giá môn theo cấp học</span>{" "}
                    + <span className="font-bold">phụ cấp trình độ cao nhất trong hồ sơ</span>{" "}
                    + <span className="font-bold">phụ cấp kinh nghiệm</span>
                    {" "}+ <span className="font-bold">điều chỉnh thêm nếu có</span>.
                    Giá chính thức sẽ được tính lại sau khi quản trị viên xét duyệt hồ sơ.
                </p>
            </div>
            {gia.dangTai ? <ThongBao noiDung="Đang tính giá dự kiến..." lop="border-blue-100 bg-blue-50 text-blue-700" /> : gia.loi ? <ThongBao noiDung={gia.loi} lop="border-red-200 bg-red-50 text-red-700" /> : gia.giaDuKien.length === 0 ? <ThongBao noiDung="Chọn trình độ, mức kinh nghiệm và ít nhất một môn học để xem giá dự kiến." lop="border-dashed border-slate-300 bg-slate-50 text-slate-500" /> : (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="hidden grid-cols-[1.4fr_repeat(5,1fr)] gap-4 bg-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid"><span>Môn học</span><span>Giá môn</span><span>Trình độ</span><span>Kinh nghiệm</span><span>Điều chỉnh</span><span className="text-right">Tổng dự kiến</span></div>
                    {gia.giaDuKien.map((muc) => ( 
                        <div key={muc.monhoc_id} className="grid gap-3 border-t border-slate-100 px-5 py-4 first:border-t-0 md:grid-cols-[1.4fr_repeat(5,1fr)] md:items-center md:gap-4">
                            <div><span className="font-bold">{muc.ten_mon}</span>{muc.cap_hoc && <span className="mt-1 block text-xs font-semibold text-blue-600">{muc.cap_hoc}</span>}</div>
                            <CotTien nhan="Giá môn" giaTri={muc.gia_mon} />
                            <CotTien nhan="Trình độ" giaTri={muc.gia_cong_trinh_do} cong />
                            <CotTien nhan="Kinh nghiệm" giaTri={muc.gia_cong_kinh_nghiem} cong />
                            <CotTien nhan="Điều chỉnh" giaTri={muc.gia_cong_them} cong />
                            <span className="text-lg font-extrabold text-blue-600 md:text-right">{dinhDangTien(muc.tong_gia)}/giờ</span>
                        </div>
                    ))}
                </div>
            )}
            <p className="mt-4 text-xs text-slate-500">Đây là giá tham khảo. Hệ thống sẽ tính lại giá chính thức khi hồ sơ được gửi và xét duyệt.</p>
        </div>
    );
}

function ThongBao({ noiDung, lop }) {
    return <div className={`rounded-2xl border px-5 py-8 text-center text-sm ${lop}`}>{noiDung}</div>;
}
function CotTien({ nhan, giaTri, cong = false }) {
    return <span className="text-sm text-slate-600"><span className="mr-2 text-slate-400 md:hidden">{nhan}:</span>{cong && "+"}{dinhDangTien(giaTri)}</span>;
}

export default GiaDuKien;
