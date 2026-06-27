import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import IconAdminGiaSu from "./gia-su/IconAdminGiaSu";

const BO_LOC_TRANG_THAI = [
    { value: "cho_xu_ly", label: "Chờ xử lý" },
    { value: "da_phan_hoi", label: "Đã phản hồi" },
    { value: "cho_thanh_toan", label: "Chờ thanh toán" },
    { value: "da_huy", label: "Đã huỷ" },
];

const TRANG_THAI_MAC_DINH = "cho_xu_ly";

const TRANG_THAI_GOI = {
    cho_xu_ly: {
        label: "Chờ xử lý",
        className: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    },
    giasu_dong_y: {
        label: "Gia sư đồng ý",
        className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    },
    giasu_tu_choi: {
        label: "Gia sư từ chối",
        className: "border-red-400/25 bg-red-400/10 text-red-200",
    },
    cho_thanh_toan: {
        label: "Chờ thanh toán",
        className: "border-purple-400/25 bg-purple-400/10 text-purple-200",
    },
    da_tao_lich: {
        label: "Đã tạo lịch",
        className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    },
    da_huy: {
        label: "Đã huỷ",
        className: "border-white/10 bg-white/5 text-white/55",
    },
};

const YEU_CAU_MAU = [];

function AdminYeuCauDatGiaSu() {
    const [danhSachYeuCau, setDanhSachYeuCau] = useState(YEU_CAU_MAU);
    const [boLocTrangThai, setBoLocTrangThai] = useState(TRANG_THAI_MAC_DINH);
    const [boLocPhanHoi, setBoLocPhanHoi] = useState("");
    const [tuKhoa, setTuKhoa] = useState("");
    const [yeuCauDangChonId, setYeuCauDangChonId] = useState(YEU_CAU_MAU[0]?.id);
    const [thongBao, setThongBao] = useState("");
    const [dangTai, setDangTai] = useState(false);
    const boDemThongBao = useRef(null);

    const hienThongBao = (noiDung) => {
        if (boDemThongBao.current) {
            clearTimeout(boDemThongBao.current);
        }

        setThongBao(noiDung);
        boDemThongBao.current = setTimeout(() => {
            setThongBao("");
            boDemThongBao.current = null;
        }, 3000);
    };

    const taiDanhSach = useCallback(async ({ lamMoiBoLoc = false } = {}) => {
        setDangTai(true);

        try {
            const response = await api.get("/admin/dat-goi");
            const danhSach = response.data.data || [];

            setDanhSachYeuCau(danhSach);
            setYeuCauDangChonId((hienTai) => (
                danhSach.some((yeuCau) => yeuCau.id === hienTai)
                    ? hienTai
                    : danhSach[0]?.id
            ));

            if (lamMoiBoLoc) {
                setBoLocTrangThai(TRANG_THAI_MAC_DINH);
                setBoLocPhanHoi("");
                setTuKhoa("");
            }
        } catch (error) {
            console.error("Không thể tải danh sách đặt gói:", error);
            hienThongBao(error.response?.data?.message || "Không thể tải danh sách đặt gói.");
        } finally {
            setDangTai(false);
        }
    }, []);

    useEffect(() => {
        const lamMoi = () => {
            taiDanhSach({ lamMoiBoLoc: true });
            hienThongBao("Đã làm mới dữ liệu đặt gói.");
        };

        window.addEventListener("admin:refresh", lamMoi);
        const boDemTaiLanDau = setTimeout(() => {
            taiDanhSach();
        }, 0);

        return () => {
            window.removeEventListener("admin:refresh", lamMoi);
            clearTimeout(boDemTaiLanDau);
            if (boDemThongBao.current) {
                clearTimeout(boDemThongBao.current);
            }
        };
    }, [taiDanhSach]);

    const danhSachDaLoc = useMemo(() => {
        const tuKhoaChuanHoa = tuKhoa.trim().toLowerCase();

        return danhSachYeuCau.filter((yeuCau) => {
            const khopTrangThai =
                yeuCau.trangThai === boLocTrangThai ||
                (boLocTrangThai === "da_phan_hoi" &&
                    ["giasu_dong_y", "giasu_tu_choi"].includes(yeuCau.trangThai));

            const khopPhanHoi =
                boLocTrangThai !== "da_phan_hoi" ||
                !boLocPhanHoi ||
                yeuCau.phanHoi?.ketQua === boLocPhanHoi;

            const noiDungTimKiem = [
                yeuCau.ma,
                yeuCau.hocVien,
                yeuCau.giaSu,
                yeuCau.mon,
                yeuCau.capHoc,
            ]
                .join(" ")
                .toLowerCase();

            const khopTuKhoa =
                !tuKhoaChuanHoa || noiDungTimKiem.includes(tuKhoaChuanHoa);

            return khopTrangThai && khopPhanHoi && khopTuKhoa;
        });
    }, [boLocPhanHoi, boLocTrangThai, danhSachYeuCau, tuKhoa]);

    const yeuCauDangChon =
        danhSachDaLoc.find((yeuCau) => yeuCau.id === yeuCauDangChonId) ??
        danhSachDaLoc[0] ??
        null;

    const demTheoTrangThai = (trangThai) => {
        if (trangThai === "da_phan_hoi") {
            return danhSachYeuCau.filter((yeuCau) =>
                ["giasu_dong_y", "giasu_tu_choi"].includes(yeuCau.trangThai),
            ).length;
        }

        return danhSachYeuCau.filter((yeuCau) => yeuCau.trangThai === trangThai).length;
    };

    const doiTrangThai = (trangThai) => {
        setBoLocTrangThai(trangThai);
        setBoLocPhanHoi("");
        setYeuCauDangChonId(null);
    };

    const capNhatYeuCau = (id, duLieuMoi) => {
        setDanhSachYeuCau((hienTai) =>
            hienTai.map((yeuCau) =>
                yeuCau.id === id
                    ? {
                        ...yeuCau,
                        ...duLieuMoi,
                    }
                    : yeuCau,
            ),
        );
    };

    const xuLyHanhDong = async (yeuCau, hanhDong) => {
        if (!yeuCau || !hanhDong) return;

        if (hanhDong === "gui_gia_su") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/gui-gia-su`);
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("cho_xu_ly");
                setYeuCauDangChonId(yeuCau.id);
                hienThongBao(response.data.message || `Đã gửi/nhắc yêu cầu ${yeuCau.ma} cho gia sư ${yeuCau.giaSu}.`);
            } catch (error) {
                console.error("Không thể gửi yêu cầu cho gia sư:", error);
                hienThongBao(error.response?.data?.message || "Không thể gửi yêu cầu cho gia sư.");
            }
            return;
        }

        if (hanhDong === "cho_thanh_toan") {
            capNhatYeuCau(yeuCau.id, {
                trangThai: "cho_thanh_toan",
            });
            setBoLocTrangThai("cho_thanh_toan");
            setYeuCauDangChonId(yeuCau.id);
            hienThongBao(`Đã chuyển ${yeuCau.ma} sang trạng thái chờ học viên thanh toán.`);
            return;
        }

        if (hanhDong === "nhac_thanh_toan") {
            hienThongBao(`Đã gửi nhắc thanh toán cho học viên ${yeuCau.hocVien}.`);
            return;
        }

        if (hanhDong === "xem_thanh_toan") {
            hienThongBao("Phần thông tin thanh toán sẽ nối sau khi có dữ liệu thanh toán.");
            return;
        }

        if (hanhDong === "huy_yeu_cau") {
            const dongY = window.confirm(`Bạn muốn hủy yêu cầu ${yeuCau.ma}?`);
            if (!dongY) return;

            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/huy`, {
                    ly_do: "Admin hủy yêu cầu đặt gói.",
                });
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("da_huy");
                setYeuCauDangChonId(yeuCau.id);
                hienThongBao(response.data.message || `Đã hủy yêu cầu ${yeuCau.ma}.`);
            } catch (error) {
                console.error("Không thể hủy yêu cầu đặt gói:", error);
                hienThongBao(error.response?.data?.message || "Không thể hủy yêu cầu đặt gói.");
            }
        }
    };

    return (
        <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-300">
                        Điều phối lớp học
                    </p>
                    <h1 className="mt-2 text-2xl font-extrabold">
                        Quản lý đặt gói
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                        Theo dõi các gói học được đặt, gửi yêu cầu cho gia sư, xem phản hồi và chuyển bước thanh toán/tạo lịch.
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {BO_LOC_TRANG_THAI.map((muc) => (
                    <button
                        key={muc.value}
                        type="button"
                        onClick={() => doiTrangThai(muc.value)}
                        className={[
                            "rounded-xl border px-4 py-2.5 text-sm font-bold transition",
                            boLocTrangThai === muc.value
                                ? "border-blue-400/40 bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white",
                        ].join(" ")}
                    >
                        {muc.label}
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
                            {demTheoTrangThai(muc.value)}
                        </span>
                    </button>
                ))}
            </div>

            {thongBao && (
                <div className="mt-4 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100">
                    {thongBao}
                </div>
            )}

            <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[minmax(0,1fr)_240px_140px]">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-white/45">
                        Tìm kiếm
                    </span>
                    <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/30">
                            <IconAdminGiaSu ten="search" className="h-4 w-4" />
                        </span>
                        <input
                            type="search"
                            value={tuKhoa}
                            onChange={(event) => setTuKhoa(event.target.value)}
                            placeholder="Mã yêu cầu, học viên, gia sư, môn học..."
                            className="w-full rounded-xl border border-white/10 bg-[#0a0f24] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400"
                        />
                    </div>
                </label>

                <label className={boLocTrangThai === "da_phan_hoi" ? "block" : "block opacity-50"}>
                    <span className="text-xs font-bold uppercase tracking-wide text-white/45">
                        Kết quả phản hồi
                    </span>
                    <select
                        value={boLocPhanHoi}
                        disabled={boLocTrangThai !== "da_phan_hoi"}
                        onChange={(event) => setBoLocPhanHoi(event.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400 disabled:cursor-not-allowed"
                    >
                        <option value="">Tất cả phản hồi</option>
                        <option value="dong_y">Đồng ý</option>
                        <option value="tu_choi">Từ chối</option>
                    </select>
                </label>

                <div className="rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/35">
                        Kết quả
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-white">
                        {danhSachDaLoc.length}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
                    <div className="border-b border-white/10 px-5 py-4">
                        <h2 className="text-lg font-extrabold">Danh sách yêu cầu</h2>
                        <p className="mt-1 text-sm text-white/45">
                            Một danh sách chung, lọc theo trạng thái gói học.
                        </p>
                    </div>

                    <div className="max-h-[720px] space-y-3 overflow-y-auto p-3">
                        {dangTai ? (
                            <div className="rounded-2xl border border-white/10 px-5 py-12 text-center text-white/55">
                                Đang tải danh sách đặt gói...
                            </div>
                        ) : danhSachDaLoc.length === 0 ? (
                            <TrangThaiRong />
                        ) : (
                            danhSachDaLoc.map((yeuCau) => (
                                <TheYeuCau
                                    key={yeuCau.id}
                                    yeuCau={yeuCau}
                                    active={yeuCauDangChon?.id === yeuCau.id}
                                    onClick={() => setYeuCauDangChonId(yeuCau.id)}
                                />
                            ))
                        )}
                    </div>
                </section>

                <section className="min-h-[720px] rounded-2xl border border-white/10 bg-white text-slate-900">
                    {yeuCauDangChon ? (
                        <ChiTietYeuCau
                            yeuCau={yeuCauDangChon}
                            onThucHien={xuLyHanhDong}
                        />
                    ) : (
                        <div className="flex min-h-[520px] items-center justify-center px-6 text-center text-slate-500">
                            Chọn một yêu cầu bên trái để xem chi tiết.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function TheYeuCau({ yeuCau, active, onClick }) {
    const trangThai = TRANG_THAI_GOI[yeuCau.trangThai];

    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full rounded-2xl border p-4 text-left transition",
                active
                    ? "border-blue-400/60 bg-blue-500/15"
                    : "border-white/10 bg-white/[0.03] hover:border-blue-400/30 hover:bg-white/[0.06]",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-white/35">
                        {yeuCau.ma}
                    </p>
                    <h3 className="mt-2 text-base font-extrabold text-white">
                        {yeuCau.mon} · {yeuCau.capHoc}
                    </h3>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${trangThai.className}`}>
                    {trangThai.label}
                </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/55">
                <p>HV: <span className="font-semibold text-white/80">{yeuCau.hocVien}</span></p>
                <p>GS: <span className="font-semibold text-white/80">{yeuCau.giaSu}</span></p>
                <p className="line-clamp-2">{yeuCau.lichMongMuon}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs font-semibold text-white/40">
                    {yeuCau.soBuoi} buổi · {yeuCau.gioMoiBuoi} giờ/buổi
                </span>
                <span className="text-sm font-extrabold text-blue-200">
                    {yeuCau.tongTien}
                </span>
            </div>

            {yeuCau.phanHoi && (
                <div className={[
                    "mt-3 rounded-xl px-3 py-2 text-xs font-bold",
                    yeuCau.phanHoi.ketQua === "dong_y"
                        ? "bg-emerald-400/10 text-emerald-200"
                        : "bg-red-400/10 text-red-200",
                ].join(" ")}>
                    Phản hồi: {yeuCau.phanHoi.ketQua === "dong_y" ? "Đồng ý" : "Từ chối"}
                </div>
            )}
        </button>
    );
}

function ChiTietYeuCau({ yeuCau, onThucHien }) {
    return (
        <div>
            <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
                            {yeuCau.ma}
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold">
                            {yeuCau.mon} · {yeuCau.capHoc}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Tạo lúc {yeuCau.ngayTao}
                        </p>
                    </div>
                    <NhanTrangThai trangThai={yeuCau.trangThai} />
                </div>
            </div>

            <div className="space-y-5 p-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <KhoiThongTin tieuDe="Thông tin học viên" icon="user">
                        <ThongTin label="Họ tên" value={yeuCau.hocVien} />
                        <ThongTin label="Email" value={yeuCau.hocVienEmail} />
                        <ThongTin label="Số điện thoại" value={yeuCau.hocVienSdt} />
                    </KhoiThongTin>

                    <KhoiThongTin tieuDe="Gia sư được chọn" icon="user">
                        <ThongTin label="Họ tên" value={yeuCau.giaSu} />
                        <ThongTin label="Email" value={yeuCau.giaSuEmail} />
                    </KhoiThongTin>
                </div>

                <KhoiThongTin tieuDe="Thông tin gói học" icon="book">
                    <div className="grid gap-4 md:grid-cols-3">
                        <ThongTin label="Loại gói" value={yeuCau.loaiGoi} />
                        <ThongTin label="Số buổi" value={`${yeuCau.soBuoi} buổi`} />
                        <ThongTin label="Tổng tiền" value={yeuCau.tongTien} noiBat />
                        <ThongTin
                            label="Ngày học mong muốn"
                            value={yeuCau.ngayMongMuon || yeuCau.lichMongMuon}
                        />
                        <ThongTin
                            label="Giờ mong muốn"
                            value={yeuCau.gioMongMuon || "Chưa cập nhật"}
                        />
                        <ThongTin label="Hình thức" value={yeuCau.hinhThuc} />
                        <ThongTin label="Địa điểm" value={yeuCau.diaDiem} />
                    </div>
                    <DanhSachBuoiHoc yeuCau={yeuCau} />
                </KhoiThongTin>

                <KhoiPhanHoi yeuCau={yeuCau} />

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-base font-extrabold">Hành động tiếp theo</h3>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {layHanhDong(yeuCau).map((hanhDong) => (
                            <button
                                key={hanhDong.label}
                                type="button"
                                onClick={() => onThucHien(yeuCau, hanhDong.key)}
                                className={hanhDong.className}
                            >
                                {hanhDong.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DanhSachBuoiHoc({ yeuCau }) {
    const danhSach = yeuCau.lichHoc || [];

    if (danhSach.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                Chưa có dữ liệu giờ học chi tiết.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-extrabold text-slate-900">
                        {yeuCau.hocDinhKy ? "Lịch học định kỳ" : "Các buổi học không định kỳ"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                        {yeuCau.hocDinhKy
                            ? "Hệ thống tóm tắt theo thứ và khung giờ học."
                            : "Hiển thị từng buổi học viên đã chọn khi đặt gói."}
                    </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                    {danhSach.length} buổi
                </span>
            </div>

            <div className="mt-4 max-h-48 overflow-y-auto pr-1">
                <div className="grid gap-2 md:grid-cols-2">
                {danhSach.map((buoiHoc) => (
                    <div
                        key={buoiHoc.id}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                        <p className="text-sm font-bold text-slate-800">
                            {buoiHoc.thu} · {dinhDangNgay(buoiHoc.ngayHoc)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                            {buoiHoc.gioBatDau} - {buoiHoc.gioKetThuc} · {buoiHoc.hinhThuc}
                        </p>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}

function KhoiPhanHoi({ yeuCau }) {
    if (!yeuCau.phanHoi) {
        return (
            <KhoiThongTin tieuDe="Phản hồi gia sư" icon="mail">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <p className="font-extrabold">Gia sư chưa phản hồi</p>
                    <p className="mt-1">
                        Khi gia sư bấm đồng ý/từ chối, hệ thống sẽ tạo dòng trong bảng phản hồi và cập nhật trạng thái gói học.
                    </p>
                </div>
            </KhoiThongTin>
        );
    }

    const laDongY = yeuCau.phanHoi.ketQua === "dong_y";

    return (
        <KhoiThongTin tieuDe="Phản hồi gia sư" icon="mail">
            <div className={[
                "rounded-2xl border px-4 py-3",
                laDongY
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800",
            ].join(" ")}>
                <p className="font-extrabold">
                    Trạng thái: {laDongY ? "Đã đồng ý" : "Đã từ chối"}
                </p>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                    <ThongTin label="Gia sư" value={yeuCau.giaSu} />
                    <ThongTin label="Thời gian phản hồi" value={yeuCau.phanHoi.thoiGian} />
                </div>
                {!laDongY && (
                    <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm">
                        <span className="font-bold">Lý do:</span> {yeuCau.phanHoi.lyDo}
                    </div>
                )}
            </div>
        </KhoiThongTin>
    );
}

function dinhDangNgay(ngay) {
    if (!ngay) return "Chưa cập nhật";
    const [nam, thang, ngayTrongThang] = String(ngay).split("-");
    if (!nam || !thang || !ngayTrongThang) return ngay;
    return `${ngayTrongThang}/${thang}/${nam}`;
}

function KhoiThongTin({ tieuDe, icon, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <IconAdminGiaSu ten={icon} className="h-5 w-5" />
                </span>
                <h3 className="text-base font-extrabold">{tieuDe}</h3>
            </div>
            <div className="space-y-4 p-5">{children}</div>
        </section>
    );
}

function ThongTin({ label, value, noiBat = false }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className={[
                "mt-1.5 text-sm font-semibold",
                noiBat ? "text-blue-600" : "text-slate-800",
            ].join(" ")}>
                {value}
            </p>
        </div>
    );
}

function NhanTrangThai({ trangThai }) {
    const thongTin = TRANG_THAI_GOI[trangThai];
    return (
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-extrabold ${thongTin.className}`}>
            {thongTin.label}
        </span>
    );
}

function TrangThaiRong() {
    return (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center text-white/45">
            Không có yêu cầu phù hợp với bộ lọc.
        </div>
    );
}

function layHanhDong(yeuCau) {
    const nutChinh = "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700";
    const nutPhu = "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50";
    const nutDo = "rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100";

    const map = {
        cho_xu_ly: [
            { key: "gui_gia_su", label: "Gửi/Nhắc gia sư", className: nutChinh },
            { key: "huy_yeu_cau", label: "Huỷ yêu cầu", className: nutDo },
        ],
        giasu_dong_y: [
            { key: "cho_thanh_toan", label: "Chuyển sang chờ thanh toán", className: nutChinh },
            { key: "xem_thanh_toan", label: "Xem thông tin thanh toán", className: nutPhu },
        ],
        giasu_tu_choi: [
            { key: "huy_yeu_cau", label: "Huỷ yêu cầu", className: nutDo },
        ],
        cho_thanh_toan: [
            { key: "nhac_thanh_toan", label: "Nhắc học viên thanh toán", className: nutChinh },
            { key: "huy_yeu_cau", label: "Huỷ yêu cầu", className: nutDo },
        ],
        da_tao_lich: [
            { key: "xem_lich", label: "Xem lịch học", className: nutChinh },
        ],
        da_huy: [
            { key: "xem_huy", label: "Xem chi tiết huỷ", className: nutPhu },
        ],
    };

    return map[yeuCau.trangThai] ?? [];
}

export default AdminYeuCauDatGiaSu;
