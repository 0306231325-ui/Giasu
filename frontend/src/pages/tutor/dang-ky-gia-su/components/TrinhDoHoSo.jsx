import { LOP_INPUT, LOP_NHAN } from "../constants";
import { DauBatBuoc, TieuDePhan } from "./ThanhPhanChung";

function TrinhDoHoSo({ danhMuc, dangTaiDanhMuc, luaChon, hoSo }) {
    return (
        <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
            <TieuDePhan soThuTu="2" tieuDe="Trình độ và hồ sơ chuyên môn" moTa="Cung cấp trình độ cùng bằng cấp hoặc chứng chỉ để xác minh chuyên môn." />
            <div className="grid gap-5">
                <label className={`${LOP_NHAN} md:max-w-[calc(50%-0.625rem)]`}>
                    Trình độ hiện tại<DauBatBuoc />
                    <select className={LOP_INPUT} name="trinh_do_giasu_id" value={luaChon.trinhDoIdDaChon} onChange={(e) => luaChon.setTrinhDoIdDaChon(e.target.value)} disabled={dangTaiDanhMuc}>
                        <option value="" disabled>{dangTaiDanhMuc ? "Đang tải trình độ..." : "Chọn trình độ"}</option>
                        {danhMuc.trinh_do.map((muc) => <option key={muc.id} value={muc.id}>{muc.ten}</option>)}
                    </select>
                </label>
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
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0"><p className="truncate text-sm font-bold">{muc.ten_bang}</p><p className="mt-1 text-xs text-slate-500">{[muc.chuyen_nganh, muc.truong_don_vi].filter(Boolean).join(" · ")}</p><p className="mt-2 truncate text-xs font-semibold text-blue-600">{muc.tai_lieu.name}</p></div>
                                        <button type="button" onClick={() => hoSo.xoa(muc.id)} className="text-xs font-bold text-red-600">Xóa</button>
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

export default TrinhDoHoSo;
