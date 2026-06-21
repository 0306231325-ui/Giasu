import { LOP_NHAN } from "../constants";
import { DauBatBuoc, TieuDePhan } from "./ThanhPhanChung";

function CapHocMonDay({ danhMuc, dangTaiDanhMuc, luaChon }) {
    return (
        <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
            <TieuDePhan soThuTu="3" tieuDe="Cấp học và môn giảng dạy" moTa="Chọn các cấp học bạn có thể dạy và môn học phù hợp trong từng cấp." />
            <div className="grid gap-5">
                <fieldset>
                    <legend className={LOP_NHAN}>Cấp học có thể dạy<DauBatBuoc /></legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {danhMuc.cap_hoc.map((capHoc) => {
                            const daChon = luaChon.capHocIdsDaChon.includes(String(capHoc.id));
                            return (
                                <label key={capHoc.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${daChon ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-blue-300"}`}>
                                    <input type="checkbox" name="cap_hoc_ids[]" value={capHoc.id} checked={daChon} onChange={luaChon.chonCapHoc} disabled={dangTaiDanhMuc} className="h-4 w-4 accent-blue-600" />
                                    {capHoc.ten}
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
                <fieldset>
                    <legend className={LOP_NHAN}>Môn học đăng ký dạy<DauBatBuoc /></legend>
                    {luaChon.capHocIdsDaChon.length === 0 ? (
                        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Chọn ít nhất một cấp học để hiển thị môn học.</p>
                    ) : (
                        <div className="mt-3 space-y-4">
                            {luaChon.monHocTheoCap.map((capHoc) => (
                                <div key={capHoc.id} className="rounded-2xl border border-slate-200 p-4">
                                    <h3 className="font-bold text-slate-800">{capHoc.ten}</h3>
                                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {capHoc.monHoc.map((mon) => (
                                            <label key={mon.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50">
                                                <input type="checkbox" name="mon_hoc_ids[]" value={mon.id} checked={luaChon.monHocIdsDaChon.includes(String(mon.id))} onChange={luaChon.chonMonHoc} className="h-4 w-4 accent-blue-600" />
                                                {mon.ten_mon}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </fieldset>
            </div>
        </div>
    );
}

export default CapHocMonDay;
