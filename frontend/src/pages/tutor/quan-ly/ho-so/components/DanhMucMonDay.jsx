import KhoiNoiDung from "./KhoiNoiDung";
import IconHoSo from "./IconHoSo";

function DanhMucMonDay({ duLieu }) {
    return (
        <>
            <KhoiNoiDung
                bieuTuong="subjects"
                tieuDe="Danh mục môn dạy"
                moTa="Các môn bạn đăng ký sẽ được quản trị viên xét duyệt."
                hanhDong="Thêm môn dạy"
                onHanhDong={() => duLieu.setHienForm(true)}
                voHieuHoaHanhDong={duLieu.dangTai || duLieu.coTheThem.length === 0}
                noiBat
            >
                <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-500">{duLieu.danhSach.length} môn đang đăng ký</span>
                    <span className="text-slate-400">Cuộn để xem thêm</span>
                </div>
                <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px]">
                    <input type="search" value={duLieu.tuKhoa} onChange={(e) => duLieu.setTuKhoa(e.target.value)} placeholder="Tìm tên môn học..." className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                    <select value={duLieu.locCapHoc} onChange={(e) => duLieu.setLocCapHoc(e.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                        <option value="">Tất cả cấp học</option>
                        {duLieu.capHocs.map((capHoc) => (
                            <option key={capHoc.id} value={capHoc.id}>
                                {capHoc.ten}
                            </option>
                        ))}
                    </select>
                    <select value={duLieu.locTrangThai} onChange={(e) => duLieu.setLocTrangThai(e.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                        <option value="">Tất cả trạng thái</option>
                        <option value="da_duyet">Đã duyệt</option>
                        <option value="cho_duyet">Chờ duyệt</option>
                        <option value="tu_choi">Từ chối</option>
                    </select>
                </div>
                {duLieu.dangTai ? (
                    <p className="text-sm font-semibold text-slate-500">Đang tải danh sách môn dạy...</p>
                ) : duLieu.danhSach.length === 0 ? (
                    <TrangThaiRong noiDung="Chưa có môn dạy nào." />
                ) : duLieu.daLoc.length === 0 ? (
                    <TrangThaiRong noiDung="Không tìm thấy môn phù hợp bộ lọc." />
                ) : (
                    <div className="max-h-[430px] space-y-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#94a3b8_#f1f5f9] [scrollbar-width:thin]">
                        {duLieu.daLoc.map((mon) => <MonDay key={mon.id} mon={mon} onXoa={duLieu.xoa} dangXoa={duLieu.idDangXoa === mon.id} />)}
                    </div>
                )}
                <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
                    Khi thêm môn mới, môn học sẽ ở trạng thái chờ duyệt và chưa hiển thị cho học viên cho đến khi được xác nhận.
                </div>
            </KhoiNoiDung>
            {duLieu.hienForm && <FormThemMonDay duLieu={duLieu} />}
        </>
    );
}

function TrangThaiRong({ noiDung }) {
    return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{noiDung}</p>;
}

function MonDay({ mon, onXoa, dangXoa }) {
    const trangThai = {
        da_duyet: { nhan: "Đã duyệt", lop: "bg-emerald-50 text-emerald-700" },
        cho_duyet: { nhan: "Chờ duyệt", lop: "bg-amber-50 text-amber-700" },
        tu_choi: { nhan: "Từ chối", lop: "bg-red-50 text-red-700" },
    }[mon.trangThai] || { nhan: "Chưa xác định", lop: "bg-slate-100 text-slate-600" };

    return (
        <div className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-extrabold text-blue-600">{mon.tenMon.charAt(0)}</span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">{mon.tenMon}</p>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{mon.capHoc}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Giá dự kiến: <span className="font-bold text-slate-700">{mon.gia}/giờ</span></p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${trangThai.lop}`}>{trangThai.nhan}</span>
                    <button type="button" onClick={() => onXoa(mon)} disabled={dangXoa} aria-label={`Xóa môn ${mon.tenMon}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                        <IconHoSo ten="trash" />
                    </button>
                </div>
            </div>
            {mon.lyDo && <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"><span className="font-bold">Lý do từ chối:</span> {mon.lyDo}</div>}
        </div>
    );
}

function FormThemMonDay({ duLieu }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-xl">
                <div className="shrink-0 flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div><h2 className="text-xl font-extrabold">Thêm môn dạy</h2><p className="mt-1 text-sm text-slate-500">Môn mới sẽ được gửi quản trị viên xét duyệt.</p></div>
                    <button type="button" onClick={duLieu.dongForm} disabled={duLieu.dangThem} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><IconHoSo ten="x" /></button>
                </div>
                <form onSubmit={duLieu.them} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
                        <fieldset>
                            <legend className="text-sm font-extrabold uppercase tracking-wide text-slate-600">
                                1. Chọn cấp học
                            </legend>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {duLieu.capHocs.map((capHoc) => {
                                    const idChuoi = String(capHoc.id);
                                    const daChon = duLieu.capHocIdsDaChon.includes(idChuoi);
                                    const coMonDeThem =
                                        duLieu.capHocIdsCoMonDeThem.has(idChuoi);

                                    return (
                                        <label
                                            key={capHoc.id}
                                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                                !coMonDeThem
                                                    ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                                                    : daChon
                                                        ? "cursor-pointer border-blue-400 bg-blue-50 text-blue-700"
                                                        : "cursor-pointer border-slate-200 text-slate-700 hover:border-blue-300"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={daChon}
                                                disabled={!coMonDeThem}
                                                onChange={() => duLieu.chonCapHoc(capHoc.id)}
                                                className="h-4 w-4 accent-blue-600"
                                            />
                                            {capHoc.ten}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className="text-sm font-extrabold uppercase tracking-wide text-slate-600">
                                2. Chọn môn muốn dạy
                            </legend>
                            {duLieu.capHocIdsDaChon.length === 0 ? (
                                <p className="mt-3 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                                    Chọn ít nhất một cấp học để hiển thị môn học.
                                </p>
                            ) : (
                                <div className="mt-3 space-y-4">
                                    {duLieu.monHocTheoCapDaChon.map((capHoc) => (
                                        <div key={capHoc.id} className="rounded-2xl border border-slate-200 p-4">
                                            <h3 className="font-extrabold text-slate-800">{capHoc.ten}</h3>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {capHoc.monHoc.map((mon) => {
                                                    const daChon = duLieu.idsDaChon.includes(String(mon.id));

                                                    return (
                                                        <label key={mon.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${daChon ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}>
                                                            <input type="checkbox" checked={daChon} onChange={() => duLieu.chonMon(mon.id)} className="h-4 w-4 accent-blue-600" />
                                                            <span>
                                                                <span className="block font-bold">{mon.ten_mon}</span>
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </fieldset>
                    </div>
                    <div className="shrink-0 flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
                        <button type="button" onClick={duLieu.dongForm} disabled={duLieu.dangThem} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button>
                        <button type="submit" disabled={duLieu.dangThem || duLieu.idsDaChon.length === 0} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                            {duLieu.dangThem ? "Đang thêm..." : `Thêm ${duLieu.idsDaChon.length || ""} môn`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DanhMucMonDay;
