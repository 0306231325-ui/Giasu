import DongDanhGia from "./DongDanhGia";
import TrangThaiBang from "./TrangThaiBang";

function BangDanhGia({ boLocDanhGia, setBoLocDanhGia, danhSach, dangTai }) {
    return (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-950">
                        Đánh giá và phản hồi
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Danh sách phản hồi học viên gửi sau buổi học.
                    </p>
                </div>
                <select
                    value={boLocDanhGia}
                    onChange={(event) => setBoLocDanhGia(event.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                    <option value="">Tất cả số sao</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="duoi_3">Dưới 3 sao</option>
                </select>
            </div>

            <div className="hidden grid-cols-[1fr_1.15fr_0.8fr_0.7fr] gap-4 bg-slate-50 px-7 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:grid">
                <span>Buổi học</span>
                <span>Phản hồi học viên</span>
                <span>Môn học</span>
                <span className="text-right">Đánh giá</span>
            </div>

            {dangTai ? (
                <TrangThaiBang noiDung="Đang tải phản hồi học viên..." />
            ) : danhSach.length === 0 ? (
                <TrangThaiBang
                    noiDung="Chưa có phản hồi từ học viên"
                    moTa="Khi học viên đánh giá sau buổi học hoàn thành, nội dung phản hồi sẽ hiển thị tại đây."
                />
            ) : (
                <div className="max-h-[520px] overflow-y-auto">
                    {danhSach.map((danhGia) => (
                        <DongDanhGia key={danhGia.id} danhGia={danhGia} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default BangDanhGia;
