import { useMemo, useState } from "react";

const danhSachYeuCauMau = [
    {
        id: 1,
        ma: "CM000001",
        loai: "bang_cap",
        trangThai: "cho_duyet",
        giaSu: "Trần Hồng Kỳ",
        email: "hongky@gmail.com",
        ngayGui: "04/07/2026 08:30",
        tieuDe: "Thêm bằng Thạc sĩ Toán học",
        moTa: "Gia sư bổ sung bằng cấp mới để xác minh trình độ cao hơn.",
        thongTin: [
            ["Loại tài liệu", "Bằng cấp"],
            ["Trình độ xác minh", "Thạc sĩ"],
            ["Chuyên ngành", "Toán học"],
            ["Trường/đơn vị cấp", "Đại học Sư phạm TP.HCM"],
            ["File minh chứng", "bang-thac-si-toan-hoc.pdf"],
        ],
        anhHuong: [
            "Nếu được duyệt, hệ thống sẽ tính lại trình độ cao nhất của gia sư.",
            "Giá các môn đã duyệt có thể được cập nhật lại theo phụ cấp trình độ mới.",
        ],
    },
    {
        id: 2,
        ma: "CM000002",
        loai: "mon_day",
        trangThai: "cho_duyet",
        giaSu: "Lê Công Minh",
        email: "congminh@gmail.com",
        ngayGui: "04/07/2026 09:15",
        tieuDe: "Đăng ký dạy Ngữ Văn THPT",
        moTa: "Gia sư muốn bổ sung môn dạy mới trong danh mục giảng dạy.",
        thongTin: [
            ["Môn học", "Ngữ Văn"],
            ["Cấp học", "THPT"],
            ["Giá môn", "250.000đ"],
            ["Phụ cấp trình độ", "120.000đ"],
            ["Phụ cấp kinh nghiệm", "50.000đ"],
            ["Hệ số giá", "10%"],
            ["Giá cộng thêm", "42.000đ"],
            ["Tổng giá dự kiến", "462.000đ/giờ"],
        ],
        anhHuong: [
            "Nếu được duyệt, môn này sẽ hiển thị trong danh mục môn dạy của gia sư.",
            "Học viên chỉ đặt được môn này sau khi trạng thái chuyển sang đã duyệt.",
        ],
    },
    {
        id: 3,
        ma: "CM000003",
        loai: "bang_cap",
        trangThai: "tu_choi",
        giaSu: "Nguyễn Văn Hiếu Nghĩa",
        email: "hieugia@gmail.com",
        ngayGui: "03/07/2026 20:40",
        tieuDe: "Thêm chứng chỉ IELTS",
        moTa: "File minh chứng bị mờ, admin cần gia sư gửi lại.",
        lyDo: "Ảnh chứng chỉ không đọc rõ thông tin.",
        thongTin: [
            ["Loại tài liệu", "Chứng chỉ"],
            ["Trình độ xác minh", "Đại học"],
            ["Chuyên ngành", "Tiếng Anh"],
            ["Trường/đơn vị cấp", "British Council"],
            ["File minh chứng", "ielts-cert-blur.jpg"],
        ],
        anhHuong: [
            "Yêu cầu bị từ chối nên không ảnh hưởng đến trình độ/giá hiện tại.",
        ],
    },
    {
        id: 4,
        ma: "CM000004",
        loai: "mon_day",
        trangThai: "da_duyet",
        giaSu: "Phạm Minh Tâm",
        email: "minhtam@gmail.com",
        ngayGui: "02/07/2026 15:10",
        tieuDe: "Đăng ký dạy Tiếng Anh THCS",
        moTa: "Môn dạy đã được admin duyệt và có thể nhận đặt gói.",
        thongTin: [
            ["Môn học", "Tiếng Anh"],
            ["Cấp học", "THCS"],
            ["Giá môn", "200.000đ"],
            ["Phụ cấp trình độ", "80.000đ"],
            ["Phụ cấp kinh nghiệm", "20.000đ"],
            ["Hệ số giá", "5%"],
            ["Giá cộng thêm", "15.000đ"],
            ["Tổng giá đã duyệt", "315.000đ/giờ"],
        ],
        anhHuong: [
            "Môn dạy đã được hiển thị cho học viên đặt gói.",
        ],
    },
];

const boLocTrangThai = [
    { value: "cho_duyet", label: "Chờ duyệt" },
    { value: "da_duyet", label: "Đã duyệt" },
    { value: "tu_choi", label: "Đã từ chối" },
];

const boLocLoai = [
    { value: "tat_ca", label: "Tất cả loại" },
    { value: "bang_cap", label: "Bằng cấp/chứng chỉ" },
    { value: "mon_day", label: "Môn dạy & giá" },
];

const nhanLoai = {
    bang_cap: "Bằng cấp/chứng chỉ",
    mon_day: "Môn dạy & giá",
};

const cauHinhTrangThai = {
    cho_duyet: "border-amber-300/30 bg-amber-300/10 text-amber-300",
    da_duyet: "border-emerald-300/30 bg-emerald-300/10 text-emerald-300",
    tu_choi: "border-red-300/30 bg-red-300/10 text-red-300",
};

const tenTrangThai = {
    cho_duyet: "Chờ duyệt",
    da_duyet: "Đã duyệt",
    tu_choi: "Từ chối",
};

function YeuCauChuyenMon() {
    const [trangThaiDangChon, setTrangThaiDangChon] = useState("cho_duyet");
    const [loaiDangChon, setLoaiDangChon] = useState("tat_ca");
    const [tuKhoaNhap, setTuKhoaNhap] = useState("");
    const [tuKhoa, setTuKhoa] = useState("");
    const [yeuCauDangChon, setYeuCauDangChon] = useState(danhSachYeuCauMau[0]);

    const chonYeuCauDauTien = (trangThaiMoi, loaiMoi, tuKhoaMoi = tuKhoa) => {
        const tuKhoaTim = tuKhoaMoi.trim().toLowerCase();
        const yeuCauDauTien = danhSachYeuCauMau.find((yeuCau) => {
            const khopTrangThai = yeuCau.trangThai === trangThaiMoi;
            const khopLoai = loaiMoi === "tat_ca" || yeuCau.loai === loaiMoi;
            const khopTuKhoa =
                !tuKhoaTim ||
                [yeuCau.ma, yeuCau.giaSu, yeuCau.email, yeuCau.tieuDe]
                    .join(" ")
                    .toLowerCase()
                    .includes(tuKhoaTim);

            return khopTrangThai && khopLoai && khopTuKhoa;
        });

        setYeuCauDangChon(yeuCauDauTien ?? null);
    };

    const timKiemYeuCau = () => {
        setTuKhoa(tuKhoaNhap);
        chonYeuCauDauTien(trangThaiDangChon, loaiDangChon, tuKhoaNhap);
    };

    const lamMoiBoLoc = () => {
        setTuKhoaNhap("");
        setTuKhoa("");
        setTrangThaiDangChon("cho_duyet");
        setLoaiDangChon("tat_ca");
        chonYeuCauDauTien("cho_duyet", "tat_ca", "");
    };

    const danhSachHienThi = useMemo(() => {
        const tuKhoaTim = tuKhoa.trim().toLowerCase();

        return danhSachYeuCauMau.filter((yeuCau) => {
            const khopTrangThai = yeuCau.trangThai === trangThaiDangChon;
            const khopLoai = loaiDangChon === "tat_ca" || yeuCau.loai === loaiDangChon;

            const khopTuKhoa =
                !tuKhoaTim ||
                [yeuCau.ma, yeuCau.giaSu, yeuCau.email, yeuCau.tieuDe]
                    .join(" ")
                    .toLowerCase()
                    .includes(tuKhoaTim);

            return khopTrangThai && khopLoai && khopTuKhoa;
        });
    }, [loaiDangChon, trangThaiDangChon, tuKhoa]);

    return (
        <div className="mt-5 grid gap-5 xl:grid-cols-[460px_minmax(0,1fr)] 2xl:grid-cols-[500px_minmax(0,1fr)]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="border-b border-white/10 p-4">
                    <p className="text-lg font-extrabold text-white">Yêu cầu chuyên môn</p>
                    <p className="mt-1 text-sm text-white/50">
                        Mock giao diện các yêu cầu thêm bằng cấp, môn dạy và giá cần admin duyệt.
                    </p>
                </div>

                <div className="space-y-4 border-b border-white/10 p-4">
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <input
                            value={tuKhoaNhap}
                            onChange={(event) => setTuKhoaNhap(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    timKiemYeuCau();
                                }
                            }}
                            placeholder="Tìm mã, tên gia sư, email..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/60"
                        />
                        <button
                            type="button"
                            onClick={timKiemYeuCau}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-500"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <label className="block">
                            <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white/35">
                                Trạng thái
                            </span>
                            <select
                                value={trangThaiDangChon}
                                onChange={(event) => {
                                    const trangThaiMoi = event.target.value;
                                    setTrangThaiDangChon(trangThaiMoi);
                                    chonYeuCauDauTien(trangThaiMoi, loaiDangChon, tuKhoa);
                                }}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-extrabold text-white outline-none transition focus:border-blue-400/60"
                            >
                                {boLocTrangThai.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white/35">
                                Loại yêu cầu
                            </span>
                            <select
                                value={loaiDangChon}
                                onChange={(event) => {
                                    const loaiMoi = event.target.value;
                                    setLoaiDangChon(loaiMoi);
                                    chonYeuCauDauTien(trangThaiDangChon, loaiMoi, tuKhoa);
                                }}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-extrabold text-white outline-none transition focus:border-blue-400/60"
                            >
                                {boLocLoai.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={lamMoiBoLoc}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:border-blue-400/40 hover:bg-white/10"
                            >
                                Làm mới lọc
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-h-[620px] space-y-3 overflow-y-auto p-4">
                    {danhSachHienThi.map((yeuCau) => (
                        <button
                            key={yeuCau.id}
                            type="button"
                            onClick={() => setYeuCauDangChon(yeuCau)}
                            className={[
                                "w-full rounded-2xl border p-4 text-left transition",
                                yeuCauDangChon?.id === yeuCau.id
                                    ? "border-blue-400/60 bg-blue-600/20"
                                    : "border-white/10 bg-slate-950/35 hover:border-blue-400/30 hover:bg-white/8",
                            ].join(" ")}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wide text-white/35">
                                        {yeuCau.ma} · {nhanLoai[yeuCau.loai]}
                                    </p>
                                    <p className="mt-2 text-base font-extrabold text-white">
                                        {yeuCau.tieuDe}
                                    </p>
                                </div>
                                <TrangThai trangThai={yeuCau.trangThai} />
                            </div>
                            <p className="mt-3 text-sm font-bold text-white/75">{yeuCau.giaSu}</p>
                            <p className="mt-1 text-xs font-semibold text-white/35">
                                {yeuCau.email} · {yeuCau.ngayGui}
                            </p>
                        </button>
                    ))}

                    {danhSachHienThi.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm font-semibold text-white/45">
                            Không có yêu cầu phù hợp bộ lọc.
                        </div>
                    )}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
                {yeuCauDangChon ? (
                    <>
                        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
                                    {yeuCauDangChon.ma} · {nhanLoai[yeuCauDangChon.loai]}
                                </p>
                                <h2 className="mt-2 text-2xl font-extrabold">
                                    {yeuCauDangChon.tieuDe}
                                </h2>
                                <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-500">
                                    {yeuCauDangChon.moTa}
                                </p>
                            </div>
                            <TrangThai trangThai={yeuCauDangChon.trangThai} nenSang />
                        </div>

                        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-slate-200">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <p className="text-lg font-extrabold">Thông tin yêu cầu</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-500">
                                            Phần này sau này sẽ lấy từ bảng bằng cấp hoặc bảng giá/môn dạy.
                                        </p>
                                    </div>
                                    <div className="grid gap-3 p-5 md:grid-cols-2">
                                        {yeuCauDangChon.thongTin.map(([nhan, giaTri]) => (
                                            <div
                                                key={nhan}
                                                className="rounded-xl bg-slate-50 px-4 py-3"
                                            >
                                                <p className="text-xs font-extrabold uppercase text-slate-400">
                                                    {nhan}
                                                </p>
                                                <p className="mt-1 text-sm font-extrabold text-slate-800">
                                                    {giaTri}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                                    <p className="font-extrabold text-blue-700">
                                        Cách xử lý dự kiến khi duyệt
                                    </p>
                                    <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600">
                                        {yeuCauDangChon.anhHuong.map((noiDung) => (
                                            <li key={noiDung} className="flex gap-2">
                                                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                                <span>{noiDung}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {yeuCauDangChon.lyDo && (
                                    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
                                        <p className="font-extrabold text-red-700">Lý do từ chối</p>
                                        <p className="mt-2 text-sm font-semibold text-red-600">
                                            {yeuCauDangChon.lyDo}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 p-5">
                                    <p className="text-sm font-extrabold uppercase text-slate-400">
                                        Gia sư gửi yêu cầu
                                    </p>
                                    <p className="mt-3 text-xl font-extrabold">
                                        {yeuCauDangChon.giaSu}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                        {yeuCauDangChon.email}
                                    </p>
                                    <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                                        Gửi lúc: {yeuCauDangChon.ngayGui}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-5">
                                    <p className="font-extrabold">Thao tác mẫu</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                        Giao diện trước, chưa nối API xử lý.
                                    </p>
                                    <div className="mt-4 grid gap-3">
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white opacity-60"
                                        >
                                            Duyệt yêu cầu
                                        </button>
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600 opacity-70"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                ) : (
                    <div className="flex min-h-[520px] items-center justify-center text-sm font-semibold text-slate-500">
                        Chọn một yêu cầu bên trái để xem chi tiết.
                    </div>
                )}
            </section>
        </div>
    );
}

function TrangThai({ trangThai, nenSang = false }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold",
                cauHinhTrangThai[trangThai],
                nenSang ? "bg-opacity-100" : "",
            ].join(" ")}
        >
            {tenTrangThai[trangThai]}
        </span>
    );
}

export default YeuCauChuyenMon;
