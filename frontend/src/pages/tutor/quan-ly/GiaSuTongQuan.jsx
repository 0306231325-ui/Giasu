function GiaSuTongQuan() {
    return (
        <div>
            <h1 className="text-2xl font-extrabold">Tổng quan gia sư</h1>
            <p className="mt-2 text-white/70">
                Theo dõi nhanh hồ sơ, lịch dạy và hoạt động nhận lớp của bạn.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <TheThongKe tieuDe="Lớp đang dạy" giaTri="0" />
                <TheThongKe tieuDe="Buổi học tuần này" giaTri="0" />
                <TheThongKe tieuDe="Doanh thu tạm tính" giaTri="0đ" />
            </div>
        </div>
    );
}

function TheThongKe({ tieuDe, giaTri }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">{tieuDe}</div>
            <div className="mt-3 text-3xl font-extrabold">{giaTri}</div>
        </div>
    );
}

export default GiaSuTongQuan;
