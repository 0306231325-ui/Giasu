export function TieuDePhan({ soThuTu, tieuDe, moTa }) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {soThuTu}
            </span>
            <div>
                <h2 className="text-lg font-bold text-slate-900">{tieuDe}</h2>
                <p className="mt-1 text-sm text-slate-500">{moTa}</p>
            </div>
        </div>
    );
}

export function DauBatBuoc() {
    return <span className="text-red-500"> *</span>;
}
