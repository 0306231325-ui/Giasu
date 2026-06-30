import { LOP_INPUT, LOP_NHAN } from "../constants";
import { DauBatBuoc } from "./ThanhPhanChung";

function FormThemHoSo({ hoSo, danhMuc, dangTaiDanhMuc }) {
    if (!hoSo.hienForm) return null;
    const dangSua = Boolean(hoSo.idDangSua);
    const duDieuKien =
        hoSo.form.ten_bang.trim() &&
        hoSo.form.trinh_do_giasu_id &&
        hoSo.form.truong_don_vi.trim() &&
        hoSo.form.tai_lieu;

    const xemFileDangChon = () => {
        if (!hoSo.form.tai_lieu) return;

        const url = URL.createObjectURL(hoSo.form.tai_lieu);
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div><h2 className="text-xl font-extrabold">{dangSua ? "Sửa bằng cấp hoặc chứng chỉ" : "Thêm bằng cấp hoặc chứng chỉ"}</h2><p className="mt-1 text-sm text-slate-500">File tải lên sẽ được gửi quản trị viên xét duyệt.</p></div>
                    <button type="button" onClick={hoSo.dongForm} aria-label="Đóng" className="rounded-xl p-2 text-2xl text-slate-400 hover:bg-slate-100">×</button>
                </div>
                <div className="grid gap-5 p-6 md:grid-cols-2">
                    <Truong nhan="Tên bằng cấp/chứng chỉ" name="ten_bang" value={hoSo.form.ten_bang} onChange={hoSo.thayDoi} placeholder="Ví dụ: Bằng tốt nghiệp Đại học" className="md:col-span-2" batBuoc />
                    <label className={LOP_NHAN}>Loại tài liệu<DauBatBuoc /><select className={LOP_INPUT} name="loai_bang" value={hoSo.form.loai_bang} onChange={hoSo.thayDoi}><option value="bang_cap">Bằng cấp</option><option value="chung_chi">Chứng chỉ</option><option value="khac">Tài liệu khác</option></select></label>
                    <label className={LOP_NHAN}>
                        Trình độ xác minh<DauBatBuoc />
                        <select
                            className={LOP_INPUT}
                            name="trinh_do_giasu_id"
                            value={hoSo.form.trinh_do_giasu_id}
                            onChange={hoSo.thayDoi}
                            disabled={dangTaiDanhMuc}
                        >
                            <option value="" disabled>
                                {dangTaiDanhMuc ? "Đang tải trình độ..." : "Chọn trình độ"}
                            </option>
                            {danhMuc.trinh_do.map((muc) => (
                                <option key={muc.id} value={muc.id}>
                                    {muc.ten}
                                </option>
                            ))}
                        </select>
                    </label>
                    <Truong nhan="Chuyên ngành" name="chuyen_nganh" value={hoSo.form.chuyen_nganh} onChange={hoSo.thayDoi} placeholder="Ví dụ: Sư phạm Toán" />
                    <Truong nhan="Trường/đơn vị cấp" name="truong_don_vi" value={hoSo.form.truong_don_vi} onChange={hoSo.thayDoi} placeholder="Tên trường hoặc đơn vị cấp" className="md:col-span-2" batBuoc />
                    <label className={`${LOP_NHAN} md:col-span-2`}>File minh chứng<DauBatBuoc /><input className={`${LOP_INPUT} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700`} type="file" name="tai_lieu" accept=".pdf,.jpg,.jpeg,.png" onChange={hoSo.thayDoi} /><span className="mt-2 block text-xs font-normal text-slate-500">Hỗ trợ PDF, JPG, JPEG, PNG; tối đa 5MB.</span></label>
                    {hoSo.form.tai_lieu && (
                        <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-blue-500">File đã chọn</p>
                                <p className="mt-1 truncate text-sm font-bold text-slate-800">{hoSo.form.tai_lieu.name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={xemFileDangChon}
                                className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50"
                            >
                                Xem file
                            </button>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
                        <button type="button" onClick={hoSo.dongForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button>
                        <button type="button" onClick={hoSo.them} disabled={!duDieuKien} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                            {dangSua ? "Lưu thay đổi" : "Thêm tài liệu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Truong({ nhan, name, value, onChange, placeholder, className = "", batBuoc = false }) {
    return <label className={`${LOP_NHAN} ${className}`}>{nhan}{batBuoc && <DauBatBuoc />}<input className={LOP_INPUT} type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} /></label>;
}

export default FormThemHoSo;
