import { LOP_NHAP_LIEU } from "../constants";
import { lopTrangThaiBangCap, nhanTrangThaiBangCap } from "../utils/dinhDangHoSo";
import IconHoSo from "./IconHoSo";
import KhoiNoiDung from "./KhoiNoiDung";

function BangCapChungChi({ duLieu }) {
    const layTenTrinhDo = (id) =>
        duLieu.danhMucTrinhDo.find((muc) => String(muc.id) === String(id))?.ten ||
        null;

    return (
        <>
            <KhoiNoiDung bieuTuong="certificate" tieuDe="Bằng cấp và chứng chỉ" moTa="Tài liệu dùng để xác minh chuyên môn." hanhDong="Thêm tài liệu" onHanhDong={() => duLieu.setHienForm(true)}>
                {duLieu.dangTai ? (
                    <p className="text-sm font-semibold text-slate-500">Đang tải tài liệu...</p>
                ) : duLieu.danhSach.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
                        <p className="text-sm font-bold text-slate-700">Chưa có bằng cấp hoặc chứng chỉ</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Thêm file minh chứng để hồ sơ được xác minh đầy đủ hơn.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                        {duLieu.danhSach.map((taiLieu) => (
                            <div key={taiLieu.id} className="grid gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-bold text-slate-900">{taiLieu.ten_bang}</p>
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${lopTrangThaiBangCap(taiLieu.trang_thai)}`}>
                                            {nhanTrangThaiBangCap(taiLieu.trang_thai)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => duLieu.xemChiTiet(taiLieu)}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        Chi tiết
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => duLieu.xoa(taiLieu)}
                                        disabled={duLieu.idDangXoa === taiLieu.id}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </KhoiNoiDung>
            {duLieu.hienForm && <FormThemBangCap duLieu={duLieu} />}
            {duLieu.chiTietBangCap && <ModalChiTietBangCap duLieu={duLieu} />}
        </>
    );
}

function FormThemBangCap({ duLieu }) {
    const loiDauTien = (ten) => Array.isArray(duLieu.loi[ten]) ? duLieu.loi[ten][0] : duLieu.loi[ten];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div><h2 className="text-xl font-extrabold">Thêm bằng cấp hoặc chứng chỉ</h2><p className="mt-1 text-sm text-slate-500">File tải lên sẽ được gửi quản trị viên xét duyệt.</p></div>
                    <button type="button" onClick={duLieu.dongForm} disabled={duLieu.dangThem} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><IconHoSo ten="x" /></button>
                </div>
                <form onSubmit={duLieu.them} className="grid gap-5 p-6 md:grid-cols-2">
                    <Truong nhan="Tên bằng cấp/chứng chỉ" name="ten_bang" value={duLieu.form.ten_bang} onChange={duLieu.thayDoi} loi={loiDauTien("ten_bang")} placeholder="Ví dụ: Bằng tốt nghiệp Đại học" className="md:col-span-2" batBuoc />
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Loại tài liệu <span className="text-red-500">*</span></span>
                        <select name="loai_bang" value={duLieu.form.loai_bang} onChange={duLieu.thayDoi} className={LOP_NHAP_LIEU} required>
                            <option value="bang_cap">Bằng cấp</option><option value="chung_chi">Chứng chỉ</option><option value="khac">Tài liệu khác</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Trình độ xác minh <span className="text-red-500">*</span></span>
                        <select
                            name="trinh_do_giasu_id"
                            value={duLieu.form.trinh_do_giasu_id}
                            onChange={duLieu.thayDoi}
                            className={`${LOP_NHAP_LIEU} ${loiDauTien("trinh_do_giasu_id") ? "border-red-400" : ""}`}
                            required
                        >
                            <option value="" disabled>Chọn trình độ</option>
                            {duLieu.danhMucTrinhDo.map((muc) => (
                                <option key={muc.id} value={muc.id}>
                                    {muc.ten}
                                </option>
                            ))}
                        </select>
                        {loiDauTien("trinh_do_giasu_id") && <p className="mt-1.5 text-xs font-semibold text-red-600">{loiDauTien("trinh_do_giasu_id")}</p>}
                    </label>
                    <Truong nhan="Chuyên ngành" name="chuyen_nganh" value={duLieu.form.chuyen_nganh} onChange={duLieu.thayDoi} loi={loiDauTien("chuyen_nganh")} placeholder="Ví dụ: Sư phạm Toán" />
                    <Truong nhan="Trường/đơn vị cấp" name="truong_don_vi" value={duLieu.form.truong_don_vi} onChange={duLieu.thayDoi} loi={loiDauTien("truong_don_vi")} placeholder="Tên trường hoặc đơn vị cấp" className="md:col-span-2" batBuoc />
                    <label className="block md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">File minh chứng <span className="text-red-500">*</span></span>
                        <input type="file" name="tai_lieu" accept=".pdf,.jpg,.jpeg,.png" onChange={duLieu.thayDoi} required className={`${LOP_NHAP_LIEU} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700`} />
                        <p className="mt-1.5 text-xs text-slate-400">Hỗ trợ PDF, JPG, JPEG, PNG; tối đa 5MB.</p>
                        {loiDauTien("tai_lieu") && <p className="mt-1.5 text-xs font-semibold text-red-600">{loiDauTien("tai_lieu")}</p>}
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
                        <button type="button" onClick={duLieu.dongForm} disabled={duLieu.dangThem} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button>
                        <button type="submit" disabled={duLieu.dangThem} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><IconHoSo ten="upload" />{duLieu.dangThem ? "Đang tải lên..." : "Thêm tài liệu"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Truong({ nhan, name, value, onChange, loi, placeholder, className = "", batBuoc = false }) {
    return (
        <label className={`block ${className}`}>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{nhan}{batBuoc && <span className="text-red-500"> *</span>}</span>
            <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} required={batBuoc} className={`${LOP_NHAP_LIEU} ${loi ? "border-red-400" : ""}`} />
            {loi && <p className="mt-1.5 text-xs font-semibold text-red-600">{loi}</p>}
        </label>
    );
}

function ModalChiTietBangCap({ duLieu }) {
    if (!duLieu.chiTietBangCap) return null;
    const bangCap = duLieu.chiTietBangCap;

    const layTenTrinhDo = (id) =>
        duLieu.danhMucTrinhDo.find((muc) => String(muc.id) === String(id))?.ten ||
        null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-extrabold">Chi tiết bằng cấp</h2>
                    </div>
                    <button type="button" onClick={duLieu.dongChiTiet} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
                        <IconHoSo ten="x" />
                    </button>
                </div>
                <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tên bằng cấp</p>
                        <p className="mt-1 font-extrabold text-slate-900">{bangCap.ten_bang}</p>
                    </div>
                    {bangCap.trinh_do_giasu_id && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trình độ xác minh</p>
                            <p className="mt-1 font-bold text-slate-900">{layTenTrinhDo(bangCap.trinh_do_giasu_id) || bangCap.ten_trinh_do || "Trình độ xác minh"}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trạng thái</p>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${lopTrangThaiBangCap(bangCap.trang_thai)}`}>
                            {nhanTrangThaiBangCap(bangCap.trang_thai)}
                        </span>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chuyên ngành</p>
                        <p className="mt-1 font-bold text-slate-900">{bangCap.chuyen_nganh || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trường/đơn vị cấp</p>
                        <p className="mt-1 font-bold text-slate-900">{bangCap.truong_don_vi || "Chưa cập nhật"}</p>
                    </div>
                    {bangCap.ly_do && (
                        <div className="sm:col-span-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lý do từ chối</p>
                            <p className="mt-1 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{bangCap.ly_do}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                    <button type="button" onClick={duLieu.dongChiTiet} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Đóng</button>
                    <button type="button" onClick={() => duLieu.xem(bangCap)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500">Xem tài liệu</button>
                </div>
            </div>
        </div>
    );
}

export default BangCapChungChi;
