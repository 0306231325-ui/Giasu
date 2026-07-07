import {
    LopModal,
    ThongTin,
    TieuDeModal,
} from "./ModalChiTietLichHoc";
import { trangThaiYeuCau } from "../constants";

function ModalChiTietYeuCau({
    yeuCau,
    onDong,
    dangXuLy,
    onDongY,
    onTuChoi,
}) {
    const trangThai = trangThaiYeuCau[yeuCau.trangThai];
    const dangCho = yeuCau.trangThai === "cho_phan_hoi";

    return (
        <LopModal onDong={onDong}>
            <TieuDeModal
                tieuDe="Chi tiết yêu cầu đặt gia sư"
                phuDe={`${yeuCau.maYeuCau} · Admin gửi lúc ${yeuCau.guiLuc}`}
                onDong={onDong}
            />
            <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-slate-50 p-5">
                    <div>
                        <p className="text-xl font-extrabold">
                            {yeuCau.mon} · {yeuCau.capHoc}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {yeuCau.lop} · Học viên {yeuCau.hocVien}
                        </p>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${trangThai.lop}`}
                    >
                        {trangThai.nhan}
                    </span>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <ThongTin nhan="Học viên" giaTri={yeuCau.hocVien} />
                    <ThongTin
                        nhan="Hình thức"
                        giaTri={yeuCau.hinhThuc}
                    />
                    <ThongTin
                        nhan="Địa điểm"
                        giaTri={yeuCau.diaDiem}
                    />
                    <ThongTin
                        nhan="Ngày bắt đầu"
                        giaTri={yeuCau.ngayBatDau}
                    />
                    <ThongTin
                        nhan="Số buổi"
                        giaTri={`${yeuCau.soBuoi} buổi · ${yeuCau.gioMoiBuoi} giờ/buổi`}
                    />
                    <ThongTin
                        nhan="Học định kỳ"
                        giaTri={yeuCau.hocDinhKy ? "Có" : "Không"}
                    />
                    <DanhSachLichMongMuon yeuCau={yeuCau} />
                    <ThongTin
                        nhan="Đơn giá"
                        giaTri={yeuCau.donGia}
                    />
                    <ThongTin
                        nhan="Tổng giá trị gói"
                        giaTri={yeuCau.tongTien}
                    />
                </div>

                {yeuCau.lyDoTuChoi && (
                    <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span className="font-bold">Lý do từ chối:</span>{" "}
                        {yeuCau.lyDoTuChoi}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    {dangCho && (
                        <>
                            <button
                                type="button"
                                onClick={onTuChoi}
                                disabled={dangXuLy}
                                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                            >
                                Từ chối
                            </button>
                            <button
                                type="button"
                                onClick={onDongY}
                                disabled={dangXuLy}
                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {dangXuLy ? "Đang xử lý..." : "Đồng ý nhận lớp"}
                            </button>
                        </>
                    )}
                    {!dangCho && (
                        <button
                            type="button"
                            onClick={onDong}
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white"
                        >
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        </LopModal>
    );
}

function DanhSachLichMongMuon({ yeuCau }) {
    const danhSach = Array.isArray(yeuCau.lichHoc) ? yeuCau.lichHoc : [];

    if (danhSach.length === 0) {
        return (
            <ThongTin
                nhan="Lịch mong muốn"
                giaTri={yeuCau.lichMongMuon || "Chưa cập nhật"}
                className="sm:col-span-2"
            />
        );
    }

    return (
        <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                        Lịch mong muốn
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                        Hiển thị đầy đủ từng buổi học viên đã chọn.
                    </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                    {danhSach.length} buổi
                </span>
            </div>

            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {danhSach.map((buoi, index) => (
                    <div
                        key={buoi.id || `${buoi.ngayHoc}-${buoi.gioBatDau}-${index}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                        <p className="text-sm font-extrabold text-slate-900">
                            {buoi.thu ? `${buoi.thu} · ` : ""}
                            {dinhDangNgayBuoi(buoi)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                            {dinhDangKhungGioBuoi(buoi)} ·{" "}
                            {buoi.hinhThuc || yeuCau.hinhThuc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function dinhDangNgayBuoi(buoi) {
    const ngay = buoi.ngayHoc || buoi.ngay_hoc || buoi.ngay;

    if (!ngay) {
        return "Chưa cập nhật";
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(ngay)) {
        return ngay;
    }

    const [nam, thang, ngayTrongThang] = String(ngay).split("-");

    if (nam && thang && ngayTrongThang) {
        return `${ngayTrongThang}/${thang}/${nam}`;
    }

    return ngay;
}

function dinhDangKhungGioBuoi(buoi) {
    const batDau = buoi.gioBatDau || buoi.batDau || buoi.gio_batdau;
    const ketThuc = buoi.gioKetThuc || buoi.ketThuc || buoi.gio_ketthuc;

    if (!batDau || !ketThuc) {
        return "Chưa cập nhật giờ";
    }

    return `${batDau} - ${ketThuc}`;
}

export default ModalChiTietYeuCau;
