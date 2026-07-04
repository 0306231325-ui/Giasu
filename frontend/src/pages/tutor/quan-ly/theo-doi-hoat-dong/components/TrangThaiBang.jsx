import BieuTuong from "./BieuTuong";

function TrangThaiBang({ noiDung, moTa }) {
    return (
        <div className="px-5 py-14 text-center sm:px-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BieuTuong ten="message" />
            </div>
            <p className="mt-4 text-sm font-extrabold text-slate-800">
                {noiDung}
            </p>
            {moTa && (
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {moTa}
                </p>
            )}
        </div>
    );
}

export default TrangThaiBang;
