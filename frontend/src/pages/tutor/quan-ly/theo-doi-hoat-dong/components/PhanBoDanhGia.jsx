function PhanBoDanhGia({ danhSach }) {
    const lonNhat = Math.max(...danhSach.map((item) => Number(item.soLuong) || 0), 1);

    return danhSach.map((item) => {
        const soLuong = Number(item.soLuong) || 0;
        const chieuRong = `${(soLuong / lonNhat) * 100}%`;

        return (
            <div
                key={item.soSao}
                className="grid grid-cols-[48px_minmax(0,1fr)_32px] items-center gap-3 text-sm"
            >
                <span className="font-bold text-white/70">
                    {item.soSao} sao
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-white/10">
                    <span
                        className="block h-full rounded-full bg-amber-400"
                        style={{ width: chieuRong }}
                    />
                </span>
                <span className="text-right text-white/35">
                    {soLuong}
                </span>
            </div>
        );
    });
}

export default PhanBoDanhGia;
