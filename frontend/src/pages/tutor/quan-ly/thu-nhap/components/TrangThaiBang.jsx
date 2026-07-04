import BieuTuong from "./BieuTuong";

function TrangThaiBang({ noiDung }) {
    return (
        <div className="px-5 py-12 text-center sm:px-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BieuTuong ten="wallet" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-500">{noiDung}</p>
        </div>
    );
}

export default TrangThaiBang;
