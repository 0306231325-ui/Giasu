import IconAdminGiaSu from "./IconAdminGiaSu";

function ChiTietXetDuyet({
    hoSo,
    heSoGia = "0",
    onDoiHeSoGia,
    dangXuLy = false,
    onDuyet,
    onTuChoi,
    onXemTaiLieu,
}) {
    if (!hoSo) {
        return (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/50">
                Chọn một hồ sơ để xem chi tiết.
            </div>
        );
    }

    const avatarUrl = layAvatarUrl(hoSo);
    const heSoGiaSo = Number.isFinite(Number(heSoGia || 0)) ? Number(heSoGia || 0) : 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 shadow-xl shadow-black/15">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <AnhHoSo hoSo={hoSo} avatarUrl={avatarUrl} kichThuoc="h-14 w-14" />
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
                        disabled={dangXuLy}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <IconAdminGiaSu ten="x" className="h-4 w-4" />
                        Từ chối
                    </button>
                    <button
                        type="button"
                        onClick={onDuyet}
                        disabled={dangXuLy}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <IconAdminGiaSu ten="check" className="h-4 w-4" />
                        {dangXuLy ? "Đang xử lý..." : "Duyệt hồ sơ"}
                    </button>
                </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                {hoSo.laHoSoGuiLai && hoSo.lyDoTuChoiLanTruoc && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                        <p className="font-extrabold">Lý do từ chối lần trước</p>
                        <p className="mt-1">{hoSo.lyDoTuChoiLanTruoc}</p>
                    </div>
                )}

                <KhoiChiTiet
                    icon="user"
                    tieuDe="Thông tin cá nhân"
                    moTa="Thông tin định danh và liên hệ của người đăng ký."
                >
                    <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <AnhHoSo hoSo={hoSo} avatarUrl={avatarUrl} kichThuoc="h-36 w-full" boGoc="rounded-xl" />
                            <button
                                type="button"
                                disabled={!avatarUrl}
                                onClick={() => onXemTaiLieu?.({
                                    tieuDe: `Ảnh chân dung - ${hoSo.hoTen}`,
                                    tenFile: `Ảnh chân dung ${hoSo.hoTen}`,
                                    urlTrucTiep: avatarUrl,
                                })}
                                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                                Xem ảnh chân dung
                            </button>
                        </div>
                        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                            <Truong nhan="Họ và tên" giaTri={hoSo.hoTen} />
                            <Truong nhan="Ngày sinh" giaTri={hoSo.ngaySinh} />
                            <Truong nhan="Số điện thoại" giaTri={hoSo.sdt} icon="phone" />
                            <Truong nhan="Email" giaTri={hoSo.email} icon="mail" />
                            <Truong nhan="Địa chỉ" giaTri={hoSo.diaChi} icon="location" className="sm:col-span-2 xl:col-span-3" />
                        </div>
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
                    {hoSo.bangCap.length === 0 ? (
                        <TrangThaiRong noiDung="Hồ sơ này chưa có bằng cấp hoặc chứng chỉ." />
                    ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                        {hoSo.bangCap.map((taiLieu) => (
                            <div key={taiLieu.id} className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <IconAdminGiaSu ten="file" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold">{taiLieu.ten}</p>
                                        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                                            <DongTaiLieu nhan="Loại tài liệu" giaTri={taiLieu.loai} />
                                            <DongTaiLieu nhan="Trình độ xác minh" giaTri={taiLieu.trinhDo} />
                                            <DongTaiLieu nhan="Chuyên ngành" giaTri={taiLieu.chuyenNganh} />
                                            <DongTaiLieu nhan="Trường/đơn vị cấp" giaTri={taiLieu.donVi} />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onXemTaiLieu?.(taiLieu)}
                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                                    >
                                        <IconAdminGiaSu ten="eye" className="h-4 w-4" />
                                        Xem
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </KhoiChiTiet>

                <KhoiChiTiet
                    icon="book"
                    tieuDe="Thiết lập hệ số giá"
                    moTa="Nhập hệ số để xem trước giá cộng thêm và tổng giá dự kiến của từng môn trước khi duyệt."
                >
                    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                        <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Hệ số giá cộng thêm (%)
                            </span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={heSoGia}
                                onChange={onDoiHeSoGia}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                placeholder="Ví dụ: 10"
                            />
                            <p className="mt-2 text-xs font-semibold text-slate-500">
                                Hệ số đang nhập: {heSoGiaSo}%
                            </p>
                        </label>
                        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                            <p className="font-extrabold">Công thức tính giá chính thức</p>
                            <p className="mt-2">Giá cơ bản = giá môn + giá cộng trình độ + giá cộng kinh nghiệm</p>
                            <p>Giá cộng thêm = Giá cơ bản × hệ số giá / 100</p>
                            <p>Tổng giá = Giá cơ bản + Giá cộng thêm</p>
                        </div>
                    </div>
                </KhoiChiTiet>

                <KhoiChiTiet
                    icon="book"
                    tieuDe={`Môn đăng ký dạy (${hoSo.monDay.length})`}
                    moTa="Môn dạy sẽ được duyệt cùng hồ sơ ban đầu."
                >
                    {hoSo.monDay.length === 0 ? (
                        <TrangThaiRong noiDung="Hồ sơ này chưa đăng ký môn dạy." />
                    ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="hidden grid-cols-[1.15fr_0.8fr_0.85fr_0.85fr_0.85fr_0.9fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 lg:grid">
                            <span>Môn học</span>
                            <span>Giá môn</span>
                            <span>Trình độ</span>
                            <span>Kinh nghiệm</span>
                            <span>Điều chỉnh</span>
                            <span className="text-right">Tổng dự kiến</span>
                        </div>
                        {hoSo.monDay.map((mon) => (
                            <div key={mon.id} className="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 lg:grid-cols-[1.15fr_0.8fr_0.85fr_0.85fr_0.85fr_0.9fr] lg:items-center">
                                <div>
                                    <span className="block font-extrabold">{mon.ten}</span>
                                    <span className="mt-1 block text-sm font-bold text-blue-600">{mon.cap}</span>
                                </div>
                                <GiaMon nhan="Giá môn" giaTri={mon.giaMon} />
                                <GiaMon nhan="Trình độ" giaTri={mon.giaCongTrinhDo} coDauCong />
                                <GiaMon nhan="Kinh nghiệm" giaTri={mon.giaCongKinhNghiem} coDauCong />
                                <GiaMon nhan="Điều chỉnh" giaTri={tinhDieuChinhTheoHeSo(mon, heSoGiaSo)} coDauCong />
                                <div className="font-extrabold text-blue-600 lg:text-right">
                                    <span className="mr-2 text-xs uppercase tracking-wide text-slate-400 lg:hidden">Tổng dự kiến</span>
                                    {tinhTongGiaTheoHeSo(mon, heSoGiaSo)}/giờ
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </KhoiChiTiet>

            </div>
        </section>
    );
}

function GiaMon({ nhan, giaTri, coDauCong = false }) {
    return (
        <div className="text-sm font-bold text-slate-700">
            <span className="mr-2 text-xs uppercase tracking-wide text-slate-400 lg:hidden">
                {nhan}
            </span>
            <span>{coDauCong ? dinhDangCong(giaTri) : giaTri}</span>
        </div>
    );
}

function dinhDangCong(giaTri) {
    const gia = String(giaTri || "0đ");
    if (gia.startsWith("-") || gia.startsWith("+")) return gia;
    return `+${gia}`;
}

function tinhGiaCoBan(mon) {
    return (
        laySoTien(mon.giaMon) +
        laySoTien(mon.giaCongTrinhDo) +
        laySoTien(mon.giaCongKinhNghiem)
    );
}

function tinhDieuChinhTheoHeSo(mon, heSoGia) {
    const giaCoBan = tinhGiaCoBan(mon);
    const heSo = Number.isFinite(heSoGia) ? heSoGia : 0;
    const dieuChinh = (giaCoBan * heSo) / 100;

    return dinhDangTien(dieuChinh);
}

function tinhTongGiaTheoHeSo(mon, heSoGia) {
    const giaCoBan = tinhGiaCoBan(mon);
    const heSo = Number.isFinite(heSoGia) ? heSoGia : 0;
    const dieuChinh = (giaCoBan * heSo) / 100;

    return dinhDangTien(giaCoBan + dieuChinh);
}

function laySoTien(giaTri) {
    return Number(String(giaTri || "0").replace(/\D/g, "")) || 0;
}

function dinhDangTien(giaTri) {
    return `${Math.round(giaTri).toLocaleString("vi-VN")}đ`;
}

function AnhHoSo({ hoSo, avatarUrl, kichThuoc, boGoc = "rounded-2xl" }) {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={`Ảnh chân dung của ${hoSo.hoTen}`}
                className={`${kichThuoc} ${boGoc} shrink-0 object-cover ring-1 ring-slate-200`}
            />
        );
    }

    return (
        <span className={`flex ${kichThuoc} shrink-0 items-center justify-center ${boGoc} bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-extrabold text-white`}>
            {layChuCaiDau(hoSo.hoTen)}
        </span>
    );
}

function layAvatarUrl(hoSo) {
    const duongDan = hoSo?.avatarUrl || hoSo?.avatar;

    if (!duongDan) return "";
    if (/^https?:\/\//i.test(duongDan)) return duongDan;

    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    const publicBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

    return `${publicBaseUrl}/${String(duongDan).replace(/^\/+/, "")}`;
}

function DongTaiLieu({ nhan, giaTri }) {
    return (
        <div>
            <p className="font-bold uppercase tracking-wide text-slate-400">{nhan}</p>
            <p className="mt-1 font-semibold text-slate-700">{giaTri}</p>
        </div>
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

function TrangThaiRong({ noiDung }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            {noiDung}
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
