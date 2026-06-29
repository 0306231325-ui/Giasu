import { TieuDePhan } from "./ThanhPhanChung";

function TrinhDoHoSo({ danhMuc, hoSo }) {
    const layTenTrinhDo = (id) =>
        danhMuc.trinh_do.find((muc) => String(muc.id) === String(id))?.ten ||
        "Chưa chọn trình độ";

    const layNhanLoaiTaiLieu = (loai) => {
        switch (loai) {
            case "bang_cap":
                return "Bằng cấp";
            case "chung_chi":
                return "Chứng chỉ";
            case "khac":
                return "Tài liệu khác";
            default:
                return "Chưa phân loại";
        }
    };

    const moFile = (file) => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    return (
        <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
            <TieuDePhan soThuTu="2" tieuDe="Hồ sơ chuyên môn" moTa="Cung cấp bằng cấp hoặc chứng chỉ kèm trình độ xác minh để quản trị viên xét duyệt." />
            <div className="grid gap-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div><h3 className="font-bold text-slate-900">Bằng cấp và chứng chỉ</h3><p className="mt-1 text-sm text-slate-500">Thêm các tài liệu dùng để xác minh chuyên môn.</p></div>
                        <button type="button" onClick={() => hoSo.setHienForm(true)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50"><span className="text-lg">+</span>Thêm bằng cấp/chứng chỉ</button>
                    </div>
                    {hoSo.danhSach.length === 0 ? (
                        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
                            <p className="text-sm font-bold text-slate-700">Chưa có bằng cấp hoặc chứng chỉ</p>
                            <p className="mt-1 text-xs text-slate-500">Thêm ít nhất một hồ sơ chuyên môn để gửi xét duyệt.</p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {hoSo.danhSach.map((muc) => (
                                <div key={muc.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-base font-extrabold text-slate-900">{muc.ten_bang}</p>
                                            <p className="mt-1 text-xs font-semibold text-blue-600">
                                                {layNhanLoaiTaiLieu(muc.loai_bang)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            <button type="button" onClick={() => hoSo.sua(muc.id)} className="text-xs font-bold text-blue-600 hover:text-blue-700">Sửa</button>
                                            <button type="button" onClick={() => hoSo.xoa(muc.id)} className="text-xs font-bold text-red-600 hover:text-red-700">Xóa</button>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                                        <ThongTinTaiLieu nhan="Chuyên ngành" giaTri={muc.chuyen_nganh || "Chưa nhập"} />
                                        <ThongTinTaiLieu nhan="Trình độ xác minh" giaTri={layTenTrinhDo(muc.trinh_do_giasu_id)} />
                                        <ThongTinTaiLieu nhan="Trường/đơn vị cấp" giaTri={muc.truong_don_vi} className="sm:col-span-2" />
                                    </div>
                                    <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">File minh chứng</p>
                                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">{muc.tai_lieu?.name || "Chưa chọn file"}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => moFile(muc.tai_lieu)}
                                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
                                        >
                                            Xem file
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ThongTinTaiLieu({ nhan, giaTri, className = "" }) {
    return (
        <div className={className}>
            <p className="font-bold uppercase tracking-wide text-slate-400">{nhan}</p>
            <p className="mt-1 font-semibold text-slate-800">{giaTri}</p>
        </div>
    );
}

export default TrinhDoHoSo;
