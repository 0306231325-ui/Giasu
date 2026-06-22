import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import IconAdminGiaSu from "./IconAdminGiaSu";

function DanhSachGiaSuAdmin() {
    const [danhSach, setDanhSach] = useState([]);
    const [dangTai, setDangTai] = useState(true);
    const [loi, setLoi] = useState("");
    const [tuKhoa, setTuKhoa] = useState("");
    const [trangThai, setTrangThai] = useState("");
    const [trinhDo, setTrinhDo] = useState("");
    const [giaSuDangXem, setGiaSuDangXem] = useState(null);

    useEffect(() => {
        let conHieuLuc = true;

        const taiDanhSachGiaSu = async () => {
            try {
                setDangTai(true);
                setLoi("");
                const response = await api.get("/admin/gia-su");

                if (conHieuLuc) {
                    setDanhSach(response.data?.data ?? []);
                }
            } catch (error) {
                if (conHieuLuc) {
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
    }, []);

    const danhSachDaLoc = useMemo(() => {
        const tuKhoaChuan = tuKhoa.trim().toLocaleLowerCase("vi");
        return danhSach.filter((giaSu) => {
            const khopTuKhoa =
                !tuKhoaChuan ||
                [giaSu.hoTen, giaSu.email, giaSu.sdt]
                    .some((giaTri) =>
                        giaTri.toLocaleLowerCase("vi").includes(tuKhoaChuan),
                    );
            return (
                khopTuKhoa &&
                (!trangThai || giaSu.trangThai === trangThai) &&
                (!trinhDo || giaSu.trinhDo === trinhDo)
            );
        });
    }, [danhSach, trangThai, trinhDo, tuKhoa]);

    const cacTrinhDo = [
        ...new Set(danhSach.map((giaSu) => giaSu.trinhDo).filter(Boolean)),
    ];

    return (
        <>
            <div className="mt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold">
                            Danh sách gia sư
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                            Quản lý tài khoản và hoạt động của gia sư đã được xét duyệt.
                        </p>
                    </div>
                    <p className="text-sm text-white/55">
                        Hiển thị{" "}
                        <span className="font-bold text-white">
                            {danhSachDaLoc.length}
                        </span>{" "}
                        gia sư
                    </p>
                </div>

                <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[minmax(0,1fr)_220px_240px]">
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
                                placeholder="Tên, email hoặc số điện thoại"
                                className="w-full rounded-xl border border-white/10 bg-[#0a0f24] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400"
                            />
                        </div>
                    </label>
                    <BoLoc
                        nhan="Trạng thái"
                        value={trangThai}
                        onChange={(event) => setTrangThai(event.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="hoatdong">Đang hoạt động</option>
                        <option value="khoa">Đã khóa</option>
                    </BoLoc>
                    <BoLoc
                        nhan="Trình độ"
                        value={trinhDo}
                        onChange={(event) => setTrinhDo(event.target.value)}
                    >
                        <option value="">Tất cả trình độ</option>
                        {cacTrinhDo.map((muc) => (
                            <option key={muc} value={muc}>
                                {muc}
                            </option>
                        ))}
                    </BoLoc>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
                    <div className="overflow-x-auto">
                        <table className="min-w-[1050px] w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-white/45">
                                <tr>
                                    <Th>Gia sư</Th>
                                    <Th>Trình độ</Th>
                                    <Th>Môn dạy</Th>
                                    <Th>Đánh giá</Th>
                                    <Th>Ngày duyệt</Th>
                                    <Th>Trạng thái</Th>
                                    <Th>Thao tác</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {dangTai ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-10 text-center text-white/45">
                                            Đang tải danh sách gia sư...
                                        </td>
                                    </tr>
                                ) : loi ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-10 text-center text-red-300">
                                            {loi}
                                        </td>
                                    </tr>
                                ) : danhSachDaLoc.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-10 text-center text-white/45">
                                            Không tìm thấy gia sư phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    danhSachDaLoc.map((giaSu) => (
                                        <HangGiaSu
                                            key={giaSu.id}
                                            giaSu={giaSu}
                                            onXem={() => setGiaSuDangXem(giaSu)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {giaSuDangXem && (
                <ChiTietNhanh
                    giaSu={giaSuDangXem}
                    onDong={() => setGiaSuDangXem(null)}
                />
            )}
        </>
    );
}

function HangGiaSu({ giaSu, onXem }) {
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
            <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1.5">
                    {giaSu.monDay.map((mon) => (
                        <span key={mon} className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-200">
                            {mon}
                        </span>
                    ))}
                </div>
                <p className="mt-1.5 text-xs text-white/40">{giaSu.soMon} môn/lớp đã duyệt</p>
            </td>
            <td className="px-4 py-4">
                <p className="font-bold text-amber-300">
                    ★ {giaSu.danhGia.toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-white/40">{giaSu.soDanhGia} đánh giá</p>
            </td>
            <td className="px-4 py-4 text-white/65">{giaSu.ngayDuyet}</td>
            <td className="px-4 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${giaSu.trangThai === "hoatdong" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                    {giaSu.trangThai === "hoatdong" ? "Hoạt động" : "Đã khóa"}
                </span>
            </td>
            <td className="px-4 py-4">
                <div className="flex gap-2">
                    <button type="button" onClick={onXem} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/10">
                        Xem
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ChiTietNhanh({ giaSu, onDong }) {
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
                    <ThongTin nhan="Môn đang dạy" giaTri={giaSu.monDay.join(", ")} className="sm:col-span-2" />
                    <ThongTin nhan="Đánh giá" giaTri={`${giaSu.danhGia.toFixed(1)} / 5 (${giaSu.soDanhGia} lượt)`} />
                    <ThongTin nhan="Ngày duyệt" giaTri={giaSu.ngayDuyet} />
                </div>
                <div className="mt-6 flex justify-end">
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
function layChuCaiDau(hoTen) {
    return hoTen.trim().split(/\s+/).slice(-2).map((tu) => tu.charAt(0).toUpperCase()).join("");
}

export default DanhSachGiaSuAdmin;
