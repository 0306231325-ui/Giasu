import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import ModalNhapLyDo from "../../../components/ModalNhapLyDo";
import { useToast } from "../../../context/ToastContext";
import IconAdminGiaSu from "./IconAdminGiaSu";

function DanhSachGiaSuAdmin({ trangThaiHoSo = "duyet" }) {
    const toast = useToast();
    const [danhSach, setDanhSach] = useState([]);
    const [danhMucTrinhDo, setDanhMucTrinhDo] = useState([]);
    const [meta, setMeta] = useState(null);
    const [trangHienTai, setTrangHienTai] = useState(1);
    const [lanTaiLai, setLanTaiLai] = useState(0);
    const [dangTai, setDangTai] = useState(true);
    const [loi, setLoi] = useState("");
    const [dangCapNhatId, setDangCapNhatId] = useState(null);
    const [tuKhoa, setTuKhoa] = useState("");
    const [trangThai, setTrangThai] = useState("");
    const [trinhDo, setTrinhDo] = useState("");
    const [giaSuDangXem, setGiaSuDangXem] = useState(null);
    const [giaSuDangKhoa, setGiaSuDangKhoa] = useState(null);
    const laHoSoTuChoi = trangThaiHoSo === "tu_choi";

    const thamSoTruyVan = useMemo(
        () => ({
            page: trangHienTai,
            trang_thai_ho_so: trangThaiHoSo,
            ...(tuKhoa.trim() ? { q: tuKhoa.trim() } : {}),
            ...(!laHoSoTuChoi && trangThai ? { trang_thai: trangThai } : {}),
            ...(trinhDo ? { trinh_do_id: trinhDo } : {}),
        }),
        [laHoSoTuChoi, trangHienTai, trangThai, trangThaiHoSo, trinhDo, tuKhoa],
    );

    useEffect(() => {
        let conHieuLuc = true;

        const taiDanhSachGiaSu = async () => {
            try {
                setDangTai(true);
                setLoi("");
                const response = await api.get("/admin/gia-su", {
                    params: thamSoTruyVan,
                });

                if (conHieuLuc) {
                    const duLieuGiaSu = response.data?.data?.giaSu;
                    const trangCuoi = duLieuGiaSu?.last_page ?? 1;

                    if (trangHienTai > trangCuoi) {
                        setTrangHienTai(trangCuoi);
                        return;
                    }

                    setDanhSach(duLieuGiaSu?.data ?? []);
                    setMeta(duLieuGiaSu ?? null);
                    setDanhMucTrinhDo(response.data?.data?.trinhDo ?? []);
                }
            } catch (error) {
                if (conHieuLuc) {
                    setDanhSach([]);
                    setMeta(null);
                    setLoi(
                        error.response?.data?.message
                        ?? "Không thể tải danh sách gia sư.",
                    );
                }
            } finally {
                if (conHieuLuc) {
                    setDangTai(false);
                }
            }
        };

        taiDanhSachGiaSu();

        return () => {
            conHieuLuc = false;
        };
    }, [lanTaiLai, thamSoTruyVan, trangHienTai]);

    useEffect(() => {
        const lamMoi = () => {
            setLanTaiLai((hienTai) => hienTai + 1);
        };

        window.addEventListener("admin:refresh", lamMoi);

        return () => {
            window.removeEventListener("admin:refresh", lamMoi);
        };
    }, []);

    const xuLyChuyenTrangThai = async (giaSu) => {
        const trangThaiMoi =
            giaSu.trangThai === "hoatdong" ? "khoa" : "hoatdong";

        if (trangThaiMoi === "khoa") {
            setGiaSuDangKhoa(giaSu);
            return;
        }

        await capNhatTrangThaiGiaSu(giaSu, trangThaiMoi);
    };

    const capNhatTrangThaiGiaSu = async (giaSu, trangThaiMoi, lyDoKhoa = "") => {
        setDangCapNhatId(giaSu.id);

        try {
            const response = await api.patch(
                `/admin/gia-su/${giaSu.id}/trang-thai`,
                {
                    trang_thai: trangThaiMoi,
                    ...(trangThaiMoi === "khoa" ? { ly_do_khoa: lyDoKhoa } : {}),
                },
            );
            const giaSuDaCapNhat = response.data?.data;

            if (response.data?.success && giaSuDaCapNhat) {
                setDanhSach((hienTai) =>
                    hienTai.map((muc) =>
                        muc.id === giaSuDaCapNhat.id
                            ? {
                                ...muc,
                                trangThai: giaSuDaCapNhat.trangThai,
                                lyDoKhoa: giaSuDaCapNhat.lyDoKhoa,
                            }
                            : muc,
                    ),
                );
                setGiaSuDangXem((hienTai) =>
                    hienTai?.id === giaSuDaCapNhat.id
                        ? {
                            ...hienTai,
                            trangThai: giaSuDaCapNhat.trangThai,
                            lyDoKhoa: giaSuDaCapNhat.lyDoKhoa,
                        }
                        : hienTai,
                );
                toast.success(response.data.message || "Đã cập nhật trạng thái tài khoản gia sư.");
                setGiaSuDangKhoa(null);
                setLanTaiLai((hienTai) => hienTai + 1);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message
                ?? "Không thể cập nhật trạng thái tài khoản gia sư.",
            );
        } finally {
            setDangCapNhatId(null);
        }
    };

    return (
        <>
            <div className="mt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold">
                            {laHoSoTuChoi ? "Hồ sơ gia sư bị từ chối" : "Danh sách gia sư"}
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                            {laHoSoTuChoi
                                ? "Xem lại các hồ sơ không được duyệt cùng lý do xử lý."
                                : "Quản lý tài khoản và hoạt động của gia sư đã được xét duyệt."}
                        </p>
                    </div>
                    <p className="text-sm text-white/55">
                        Tổng{" "}
                        <span className="font-bold text-white">
                            {meta?.total ?? 0}
                        </span>{" "}
                        {laHoSoTuChoi ? "hồ sơ" : "gia sư"}
                    </p>
                </div>

                <div className={[
                    "mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4",
                    laHoSoTuChoi
                        ? "md:grid-cols-[minmax(0,1fr)_240px]"
                        : "md:grid-cols-[minmax(0,1fr)_220px_240px]",
                ].join(" ")}>
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
                                onChange={(event) => {
                                    setTuKhoa(event.target.value);
                                    setTrangHienTai(1);
                                }}
                                placeholder="Tên, email hoặc số điện thoại"
                                className="w-full rounded-xl border border-white/10 bg-[#0a0f24] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400"
                            />
                        </div>
                    </label>
                    {!laHoSoTuChoi && (
                        <BoLoc
                            nhan="Trạng thái"
                            value={trangThai}
                            onChange={(event) => {
                                setTrangThai(event.target.value);
                                setTrangHienTai(1);
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="hoatdong">Đang hoạt động</option>
                            <option value="khoa">Đã khóa</option>
                        </BoLoc>
                    )}
                    <BoLoc
                        nhan="Trình độ"
                        value={trinhDo}
                        onChange={(event) => {
                            setTrinhDo(event.target.value);
                            setTrangHienTai(1);
                        }}
                    >
                        <option value="">Tất cả trình độ</option>
                        {danhMucTrinhDo.map((muc) => (
                            <option key={muc.id} value={muc.id}>
                                {muc.ten}
                            </option>
                        ))}
                    </BoLoc>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
                    <div className="overflow-x-auto">
                        <table className="min-w-[760px] w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-white/45">
                                <tr>
                                    <Th>Gia sư</Th>
                                    <Th>Trình độ</Th>
                                    {laHoSoTuChoi ? (
                                        <>
                                            <Th>Ngày xử lý</Th>
                                            <Th>Lý do từ chối</Th>
                                        </>
                                    ) : (
                                        <>
                                            <Th>Đánh giá</Th>
                                            <Th>Trạng thái</Th>
                                        </>
                                    )}
                                    <Th>Thao tác</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {dangTai ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center text-white/45">
                                            {laHoSoTuChoi
                                                ? "Đang tải hồ sơ bị từ chối..."
                                                : "Đang tải danh sách gia sư..."}
                                        </td>
                                    </tr>
                                ) : loi ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center text-red-300">
                                            {loi}
                                        </td>
                                    </tr>
                                ) : danhSach.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center text-white/45">
                                            {laHoSoTuChoi
                                                ? "Chưa có hồ sơ bị từ chối phù hợp."
                                                : "Không tìm thấy gia sư phù hợp."}
                                        </td>
                                    </tr>
                                ) : (
                                    danhSach.map((giaSu) => (
                                        <HangGiaSu
                                            key={giaSu.id}
                                            giaSu={giaSu}
                                            onXem={() => setGiaSuDangXem(giaSu)}
                                            laHoSoTuChoi={laHoSoTuChoi}
                                            dangCapNhat={dangCapNhatId === giaSu.id}
                                            onDoiTrangThai={() =>
                                                xuLyChuyenTrangThai(giaSu)
                                            }
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PhanTrang
                    meta={meta}
                    trangHienTai={trangHienTai}
                    dangTai={dangTai}
                    onChuyenTrang={setTrangHienTai}
                />
            </div>

            {giaSuDangXem && (
                <ChiTietNhanh
                    giaSu={giaSuDangXem}
                    onDong={() => setGiaSuDangXem(null)}
                    dangCapNhat={dangCapNhatId === giaSuDangXem.id}
                    onDoiTrangThai={() =>
                        xuLyChuyenTrangThai(giaSuDangXem)
                    }
                    laHoSoTuChoi={laHoSoTuChoi}
                />
            )}

            <ModalNhapLyDo
                mo={Boolean(giaSuDangKhoa)}
                tieuDe="Khóa tài khoản gia sư"
                moTa={`Nhập lý do khóa tài khoản ${giaSuDangKhoa?.hoTen || "gia sư"}. Lý do này sẽ được lưu để quản trị viên theo dõi.`}
                placeholder="Ví dụ: Hồ sơ không còn hợp lệ hoặc vi phạm quy định..."
                nutXacNhan="Khóa tài khoản"
                dangXuLy={dangCapNhatId === giaSuDangKhoa?.id}
                onDong={() => setGiaSuDangKhoa(null)}
                onXacNhan={(lyDo) =>
                    capNhatTrangThaiGiaSu(giaSuDangKhoa, "khoa", lyDo)
                }
            />
        </>
    );
}

function HangGiaSu({
    giaSu,
    onXem,
    onDoiTrangThai,
    dangCapNhat,
    laHoSoTuChoi,
}) {
    return (
        <tr className="align-middle transition hover:bg-white/[0.03]">
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-extrabold">
                        {layChuCaiDau(giaSu.hoTen)}
                    </span>
                    <div>
                        <p className="font-bold text-white">{giaSu.hoTen}</p>
                        <p className="mt-1 text-xs text-white/45">{giaSu.email}</p>
                        <p className="text-xs text-white/45">{giaSu.sdt}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <p className="font-semibold text-white/80">{giaSu.trinhDo}</p>
                <p className="mt-1 text-xs text-white/45">{giaSu.kinhNghiem}</p>
            </td>
            {laHoSoTuChoi ? (
                <>
                    <td className="px-4 py-4">
                        <p className="font-semibold text-white/80">
                            {giaSu.ngayXuLy}
                        </p>
                        <p className="mt-1 text-xs text-red-200/70">
                            Đã từ chối
                        </p>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-red-100/85">
                            {giaSu.lyDoTuChoi}
                        </p>
                    </td>
                </>
            ) : (
                <>
                    <td className="px-4 py-4">
                        <p className="font-bold text-amber-300">
                            ★ {giaSu.danhGia.toFixed(1)}
                        </p>
                        <p className="mt-1 text-xs text-white/40">{giaSu.soDanhGia} đánh giá</p>
                    </td>
                    <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${giaSu.trangThai === "hoatdong" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                            {giaSu.trangThai === "hoatdong" ? "Hoạt động" : "Đã khóa"}
                        </span>
                    </td>
                </>
            )}
            <td className="px-4 py-4">
                <div className="flex gap-2">
                    <button type="button" onClick={onXem} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/10">
                        Xem
                    </button>
                    {!laHoSoTuChoi && (
                        <button
                            type="button"
                            onClick={onDoiTrangThai}
                            disabled={dangCapNhat}
                            className={`rounded-lg px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${giaSu.trangThai === "hoatdong" ? "bg-red-500/10 text-red-200 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"}`}
                        >
                            {dangCapNhat
                                ? "Đang xử lý..."
                                : giaSu.trangThai === "hoatdong"
                                    ? "Khóa"
                                    : "Mở khóa"}
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

function ChiTietNhanh({
    giaSu,
    onDong,
    onDoiTrangThai,
    dangCapNhat,
    laHoSoTuChoi,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold">{giaSu.hoTen}</h2>
                        <p className="mt-1 text-sm text-slate-500">Mã gia sư: GS{String(giaSu.id).padStart(6, "0")}</p>
                    </div>
                    <button type="button" onClick={onDong} className="rounded-lg p-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <ThongTin nhan="Email" giaTri={giaSu.email} />
                    <ThongTin nhan="Số điện thoại" giaTri={giaSu.sdt} />
                    <ThongTin nhan="Trình độ" giaTri={giaSu.trinhDo} />
                    <ThongTin nhan="Kinh nghiệm" giaTri={giaSu.kinhNghiem} />
                    <ThongTin
                        nhan="Môn đang dạy"
                        giaTri={giaSu.monDay.length > 0 ? giaSu.monDay.join(", ") : "Chưa có môn đã duyệt"}
                        className="sm:col-span-2"
                    />
                    <ThongTin nhan="Đánh giá" giaTri={`${giaSu.danhGia.toFixed(1)} / 5 (${giaSu.soDanhGia} lượt)`} />
                    <ThongTin
                        nhan={laHoSoTuChoi ? "Ngày từ chối" : "Ngày duyệt"}
                        giaTri={laHoSoTuChoi ? giaSu.ngayXuLy : giaSu.ngayDuyet}
                    />
                    {laHoSoTuChoi ? (
                        <ThongTin
                            nhan="Lý do từ chối"
                            giaTri={giaSu.lyDoTuChoi}
                            className="sm:col-span-2"
                        />
                    ) : (
                        <ThongTin
                            nhan="Trạng thái tài khoản"
                            giaTri={giaSu.trangThai === "hoatdong" ? "Đang hoạt động" : "Đã khóa"}
                        />
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    {!laHoSoTuChoi && (
                        <button
                            type="button"
                            onClick={onDoiTrangThai}
                            disabled={dangCapNhat}
                            className={`rounded-xl px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${giaSu.trangThai === "hoatdong" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
                        >
                            {dangCapNhat
                                ? "Đang xử lý..."
                                : giaSu.trangThai === "hoatdong"
                                    ? "Khóa tài khoản"
                                    : "Mở khóa tài khoản"}
                        </button>
                    )}
                    <button type="button" onClick={onDong} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white">Đóng</button>
                </div>
            </div>
        </div>
    );
}

function BoLoc({ nhan, children, ...props }) {
    return (
        <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-white/45">{nhan}</span>
            <select {...props} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400">
                {children}
            </select>
        </label>
    );
}
function Th({ children }) {
    return <th className="px-4 py-3 font-bold">{children}</th>;
}
function ThongTin({ nhan, giaTri, className = "" }) {
    return <div className={className}><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{nhan}</p><p className="mt-1.5 text-sm font-semibold text-slate-800">{giaTri}</p></div>;
}
function PhanTrang({ meta, trangHienTai, dangTai, onChuyenTrang }) {
    const trangCuoi = meta?.last_page ?? 1;
    const trangDangDung = meta?.current_page ?? trangHienTai;
    const danhSachTrang = taoDanhSachTrang(trangDangDung, trangCuoi);

    if (!meta) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-white/55">
                <p>
                    Trang{" "}
                    <span className="font-bold text-white">{trangDangDung}</span>
                    {" "}/{" "}
                    <span className="font-bold text-white">{trangCuoi}</span>
                </p>
                <p className="mt-1 text-xs text-white/35">
                    Hiển thị {meta.from ?? 0} - {meta.to ?? 0} trong tổng {meta.total ?? 0} gia sư
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    disabled={dangTai || trangDangDung <= 1}
                    onClick={() =>
                        onChuyenTrang((trang) => Math.max(trang - 1, 1))
                    }
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Trước
                </button>
                <div className="flex flex-wrap gap-1.5">
                    {danhSachTrang.map((trang, index) =>
                        trang === "..." ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold text-white/35"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={trang}
                                type="button"
                                disabled={dangTai || trang === trangDangDung}
                                onClick={() => onChuyenTrang(trang)}
                                className={[
                                    "h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition disabled:cursor-not-allowed",
                                    trang === trangDangDung
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                        : "border border-white/10 text-white/70 hover:bg-white/5 hover:text-white",
                                ].join(" ")}
                            >
                                {trang}
                            </button>
                        ),
                    )}
                </div>
                <button
                    type="button"
                    disabled={dangTai || trangDangDung >= trangCuoi}
                    onClick={() =>
                        onChuyenTrang((trang) =>
                            Math.min(trang + 1, trangCuoi),
                        )
                    }
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Sau
                </button>
            </div>
        </div>
    );
}
function taoDanhSachTrang(trangHienTai, trangCuoi) {
    if (trangCuoi <= 7) {
        return Array.from({ length: trangCuoi }, (_, index) => index + 1);
    }

    const danhSach = new Set([
        1,
        trangCuoi,
        trangHienTai - 1,
        trangHienTai,
        trangHienTai + 1,
    ]);

    const cacTrang = [...danhSach]
        .filter((trang) => trang >= 1 && trang <= trangCuoi)
        .sort((a, b) => a - b);

    return cacTrang.flatMap((trang, index) => {
        const trangTruoc = cacTrang[index - 1];
        if (index > 0 && trang - trangTruoc > 1) {
            return ["...", trang];
        }

        return [trang];
    });
}
function layChuCaiDau(hoTen) {
    return hoTen.trim().split(/\s+/).slice(-2).map((tu) => tu.charAt(0).toUpperCase()).join("");
}

export default DanhSachGiaSuAdmin;
