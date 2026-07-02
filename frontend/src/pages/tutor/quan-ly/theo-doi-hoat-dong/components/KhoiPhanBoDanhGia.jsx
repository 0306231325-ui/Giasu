import BieuTuong from "./BieuTuong";
import PhanBoDanhGia from "./PhanBoDanhGia";

function KhoiPhanBoDanhGia({ phanBoDanhGia }) {
    return (
        <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-extrabold">
                            Phân bố đánh giá
                        </h2>
                        <p className="mt-1 text-xs text-white/40">
                            Tỷ lệ sao từ phản hồi học viên.
                        </p>
                    </div>
                    <span className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
                        <BieuTuong ten="star" />
                    </span>
                </div>

                <div className="mt-5 space-y-3">
                    <PhanBoDanhGia danhSach={phanBoDanhGia} />
                </div>
            </section>

            <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5 text-blue-100">
                <div className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-blue-200">
                        <BieuTuong ten="info" />
                    </span>
                    <div>
                        <h3 className="font-extrabold">
                            Thu thập ý kiến của học viên
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-blue-100/75">
                            Theo dõi phản hồi thường xuyên để cải thiện chất lượng giảng dạy.
                        </p>
                    </div>
                </div>
            </section>
        </aside>
    );
}

export default KhoiPhanBoDanhGia;
