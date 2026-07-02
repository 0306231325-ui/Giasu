import BieuTuong from "./BieuTuong";
import DongThuNhap from "./DongThuNhap";
import TrangThaiBang from "./TrangThaiBang";

function BangThuNhap({ cauHinh, chiTiet, dangTai, onXemChiTiet }) {
    return (
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-950">
                        Bảng tính thu nhập
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Chỉ hiển thị các buổi học đã hoàn thành trong {cauHinh.nhanThoiGian}.
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:self-center"
                >
                    <BieuTuong ten="download" />
                    Xuất báo cáo
                </button>
            </div>

            <div className="hidden grid-cols-[0.9fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 bg-slate-50 px-6 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:grid">
                <span>Mã buổi</span>
                <span>Ngày học</span>
                <span className="text-right">Tiền học</span>
                <span className="text-right">Hoa hồng</span>
                <span className="text-right">Gia sư nhận</span>
                <span className="text-right">Chi tiết</span>
            </div>

            {dangTai ? (
                <TrangThaiBang noiDung="Đang tải dữ liệu thu nhập..." />
            ) : chiTiet.length === 0 ? (
                <TrangThaiBang noiDung="Chưa có buổi học hoàn thành trong thời gian này." />
            ) : (
                <div className="max-h-[420px] overflow-y-auto">
                    {chiTiet.map((dong) => (
                        <DongThuNhap
                            key={dong.id}
                            dong={dong}
                            onXemChiTiet={() => onXemChiTiet(dong)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default BangThuNhap;
