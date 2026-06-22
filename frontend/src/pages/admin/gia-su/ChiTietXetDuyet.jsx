import IconAdminGiaSu from "./IconAdminGiaSu";

function ChiTietXetDuyet({ hoSo, onDuyet, onTuChoi }) {
    if (!hoSo) {
        return (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/50">
                Chọn một hồ sơ để xem chi tiết.
            </div>
        );
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 shadow-xl shadow-black/15">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-extrabold text-white">
                        {layChuCaiDau(hoSo.hoTen)}
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-extrabold">{hoSo.hoTen}</h2>
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                Chờ duyệt
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Gửi hồ sơ lúc {hoSo.ngayGui}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onTuChoi}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                        <IconAdminGiaSu ten="x" className="h-4 w-4" />
                        Từ chối
                    </button>
                    <button
                        type="button"
                        onClick={onDuyet}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        <IconAdminGiaSu ten="check" className="h-4 w-4" />
                        Duyệt hồ sơ
                    </button>
                </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                <KhoiChiTiet
                    icon="user"
                    tieuDe="Thông tin cá nhân"
                    moTa="Thông tin định danh và liên hệ của người đăng ký."
                >
                    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                        <Truong nhan="Họ và tên" giaTri={hoSo.hoTen} />
                        <Truong nhan="Ngày sinh" giaTri={hoSo.ngaySinh} />
                        <Truong nhan="Số điện thoại" giaTri={hoSo.sdt} icon="phone" />
                        <Truong nhan="Email" giaTri={hoSo.email} icon="mail" />
                        <Truong nhan="Địa chỉ" giaTri={hoSo.diaChi} icon="location" className="sm:col-span-2" />
                    </div>
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Giới thiệu và phương pháp dạy
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                            {hoSo.gioiThieu}
                        </p>
                    </div>
                </KhoiChiTiet>

                <KhoiChiTiet
                    icon="book"
                    tieuDe="Trình độ và kinh nghiệm"
                    moTa="Năng lực chuyên môn người đăng ký đã khai báo."
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Truong nhan="Trình độ hiện tại" giaTri={hoSo.trinhDo} />
                        <Truong nhan="Mức kinh nghiệm" giaTri={hoSo.kinhNghiem} />
                    </div>
                </KhoiChiTiet>

                <KhoiChiTiet
                    icon="file"
                    tieuDe={`Bằng cấp và chứng chỉ (${hoSo.bangCap.length})`}
                    moTa="Admin có thể mở file để đối chiếu thông tin."
                >
                    <div className="grid gap-3 lg:grid-cols-2">
                        {hoSo.bangCap.map((taiLieu) => (
                            <div key={taiLieu.id} className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <IconAdminGiaSu ten="file" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold">{taiLieu.ten}</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {taiLieu.loai} · {taiLieu.chuyenNganh}
                                        </p>
                                        <p className="text-xs leading-5 text-slate-500">
                                            {taiLieu.donVi}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                                    >
                                        <IconAdminGiaSu ten="eye" className="h-4 w-4" />
                                        Xem
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </KhoiChiTiet>

                <KhoiChiTiet
                    icon="book"
                    tieuDe={`Môn đăng ký dạy (${hoSo.monDay.length})`}
                    moTa="Môn dạy sẽ được duyệt cùng hồ sơ ban đầu."
                >
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 sm:grid">
                            <span>Môn học</span>
                            <span>Cấp học</span>
                            <span>Lớp</span>
                            <span className="text-right">Giá dự kiến</span>
                        </div>
                        {hoSo.monDay.map((mon) => (
                            <div key={mon.id} className="grid gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] sm:items-center">
                                <span className="font-bold">{mon.ten}</span>
                                <span className="text-sm text-slate-600">{mon.cap}</span>
                                <span className="text-sm text-slate-600">{mon.lop}</span>
                                <span className="font-bold text-blue-600 sm:text-right">{mon.gia}/giờ</span>
                            </div>
                        ))}
                    </div>
                </KhoiChiTiet>
            </div>
        </section>
    );
}

function KhoiChiTiet({ icon, tieuDe, moTa, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <IconAdminGiaSu ten={icon} className="h-4.5 w-4.5" />
                </span>
                <div>
                    <h3 className="font-extrabold">{tieuDe}</h3>
                    <p className="mt-1 text-xs text-slate-500">{moTa}</p>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function Truong({ nhan, giaTri, icon, className = "" }) {
    return (
        <div className={className}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {nhan}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                {icon && <IconAdminGiaSu ten={icon} className="h-4 w-4 text-slate-400" />}
                {giaTri}
            </p>
        </div>
    );
}

function layChuCaiDau(hoTen) {
    return hoTen
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((tu) => tu.charAt(0).toUpperCase())
        .join("");
}

export default ChiTietXetDuyet;
