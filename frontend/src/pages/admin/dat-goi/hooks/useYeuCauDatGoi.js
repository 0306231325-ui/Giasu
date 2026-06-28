import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../../../services/api";
import { TRANG_THAI_MAC_DINH } from "../constants";
import { coThongTinChoXacNhanThanhToan } from "../utils";

const BAT_DU_LIEU_MAU_DAT_GOI = true;

const DU_LIEU_MAU_DAT_GOI = [
    {
        id: "mock-cho-xu-ly",
        ma: "GH000101",
        trangThai: "cho_xu_ly",
        hocVien: "Nguyễn Minh Anh",
        hocVienEmail: "minhanh@gmail.com",
        hocVienSdt: "0901234567",
        giaSu: "Trần Quốc Bảo",
        giaSuEmail: "baogiasu@gmail.com",
        mon: "Toán",
        capHoc: "THCS",
        loaiGoi: "Định kỳ",
        hocDinhKy: true,
        soBuoi: 8,
        gioMoiBuoi: 1.5,
        tongTien: "1.920.000đ",
        lichMongMuon: "Thứ 2, Thứ 5 · 18:00 - 19:30 · 01/07/2026 - 25/07/2026",
        ngayMongMuon: "Thứ 2, Thứ 5 · 01/07/2026 - 25/07/2026",
        gioMongMuon: "18:00 - 19:30",
        hinhThuc: "Online",
        diaDiem: "Online",
        ngayTao: "28/06/2026 09:30",
        phanHoi: null,
        lichHoc: [
            { id: "mock-lh-1", thu: "Thứ 2", ngayHoc: "2026-07-01", gioBatDau: "18:00", gioKetThuc: "19:30", hinhThuc: "Online" },
            { id: "mock-lh-2", thu: "Thứ 5", ngayHoc: "2026-07-04", gioBatDau: "18:00", gioKetThuc: "19:30", hinhThuc: "Online" },
        ],
    },
    {
        id: "mock-da-phan-hoi",
        ma: "GH000102",
        trangThai: "giasu_dong_y",
        hocVien: "Lê Gia Hân",
        hocVienEmail: "giahan@gmail.com",
        hocVienSdt: "0912345678",
        giaSu: "Phạm Thanh Tâm",
        giaSuEmail: "tamgiasu@gmail.com",
        mon: "Tiếng Anh",
        capHoc: "THPT",
        loaiGoi: "Không định kỳ",
        hocDinhKy: false,
        soBuoi: 4,
        gioMoiBuoi: 2,
        tongTien: "2.400.000đ",
        lichMongMuon: "02/07 14:00 - 16:00; 05/07 14:00 - 16:00; 09/07 14:00 - 16:00 (+1 buổi)",
        ngayMongMuon: "02/07/2026; 05/07/2026; 09/07/2026 +1 buổi",
        gioMongMuon: "14:00 - 16:00",
        hinhThuc: "Tại nhà",
        diaDiem: "Quận 5, TP.HCM",
        ngayTao: "28/06/2026 10:15",
        phanHoi: {
            ketQua: "dong_y",
            lyDo: null,
            thoiGian: "28/06/2026 10:45",
        },
        lichHoc: [
            { id: "mock-lh-3", thu: "Thứ 4", ngayHoc: "2026-07-02", gioBatDau: "14:00", gioKetThuc: "16:00", hinhThuc: "Tại nhà" },
        ],
    },
    {
        id: "mock-cho-thanh-toan",
        ma: "GH000103",
        trangThai: "cho_thanh_toan",
        hocVien: "Võ Hoàng Nam",
        hocVienEmail: "hoangnam@gmail.com",
        hocVienSdt: "0923456789",
        giaSu: "Nguyễn Thảo Vy",
        giaSuEmail: "thaovy@gmail.com",
        mon: "Vật lý",
        capHoc: "THPT",
        loaiGoi: "Định kỳ",
        hocDinhKy: true,
        soBuoi: 8,
        gioMoiBuoi: 1.5,
        tongTien: "2.160.000đ",
        lichMongMuon: "Thứ 3, Thứ 6 · 19:00 - 20:30 · 02/07/2026 - 26/07/2026",
        ngayMongMuon: "Thứ 3, Thứ 6 · 02/07/2026 - 26/07/2026",
        gioMongMuon: "19:00 - 20:30",
        hinhThuc: "Online",
        diaDiem: "Online",
        ngayTao: "28/06/2026 11:20",
        phanHoi: {
            ketQua: "dong_y",
            lyDo: null,
            thoiGian: "28/06/2026 11:40",
        },
        thanhToan: null,
        lichHoc: [],
    },
    {
        id: "mock-xac-nhan-thanh-toan",
        ma: "GH000104",
        trangThai: "cho_thanh_toan",
        hocVien: "Trần Ngọc Linh",
        hocVienEmail: "ngoclinh@gmail.com",
        hocVienSdt: "0934567890",
        giaSu: "Lê Minh Quân",
        giaSuEmail: "minhquan@gmail.com",
        mon: "Hóa học",
        capHoc: "THCS",
        loaiGoi: "Định kỳ",
        hocDinhKy: true,
        soBuoi: 8,
        gioMoiBuoi: 1.5,
        tongTien: "1.760.000đ",
        lichMongMuon: "Thứ 4, Thứ 7 · 17:30 - 19:00 · 03/07/2026 - 27/07/2026",
        ngayMongMuon: "Thứ 4, Thứ 7 · 03/07/2026 - 27/07/2026",
        gioMongMuon: "17:30 - 19:00",
        hinhThuc: "Tại nhà",
        diaDiem: "Bình Thạnh, TP.HCM",
        ngayTao: "28/06/2026 13:05",
        phanHoi: {
            ketQua: "dong_y",
            lyDo: null,
            thoiGian: "28/06/2026 13:30",
        },
        thanhToan: {
            soTien: "1.760.000đ",
            phuongThuc: "Chuyển khoản",
            maGiaoDich: "GD92837465",
            ngayThanhToan: "28/06/2026 14:10",
            anhMinhChung: "mock-minh-chung.png",
        },
        lichHoc: [],
    },
    {
        id: "mock-danh-sach-goi",
        ma: "GH000105",
        trangThai: "da_tao_lich",
        hocVien: "Đặng Bảo Châu",
        hocVienEmail: "baochau@gmail.com",
        hocVienSdt: "0945678901",
        giaSu: "Huỳnh Gia Phúc",
        giaSuEmail: "giaphuc@gmail.com",
        mon: "Ngữ Văn",
        capHoc: "THCS",
        loaiGoi: "Định kỳ",
        hocDinhKy: true,
        soBuoi: 8,
        gioMoiBuoi: 1.5,
        tongTien: "1.680.000đ",
        lichMongMuon: "Thứ 2, Thứ 5 · 20:00 - 21:30 · 01/07/2026 - 25/07/2026",
        ngayMongMuon: "Thứ 2, Thứ 5 · 01/07/2026 - 25/07/2026",
        gioMongMuon: "20:00 - 21:30",
        hinhThuc: "Online",
        diaDiem: "Online",
        ngayTao: "27/06/2026 19:20",
        phanHoi: {
            ketQua: "dong_y",
            lyDo: null,
            thoiGian: "27/06/2026 20:00",
        },
        thanhToan: {
            soTien: "1.680.000đ",
            phuongThuc: "Momo",
            maGiaoDich: "MM123456789",
            ngayThanhToan: "27/06/2026 21:10",
            anhMinhChung: "mock-momo.png",
        },
        lichHoc: [
            { id: "mock-lh-4", thu: "Thứ 2", ngayHoc: "2026-07-01", gioBatDau: "20:00", gioKetThuc: "21:30", hinhThuc: "Online" },
            { id: "mock-lh-5", thu: "Thứ 5", ngayHoc: "2026-07-04", gioBatDau: "20:00", gioKetThuc: "21:30", hinhThuc: "Online" },
        ],
    },
];

function useYeuCauDatGoi() {
    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [boLocTrangThai, setBoLocTrangThai] = useState(TRANG_THAI_MAC_DINH);
    const [boLocPhanHoi, setBoLocPhanHoi] = useState("");
    const [tuKhoa, setTuKhoa] = useState("");
    const [yeuCauDangChonId, setYeuCauDangChonId] = useState(null);
    const [thongBao, setThongBao] = useState("");
    const [dangTai, setDangTai] = useState(false);
    const [dangDungDuLieuMau, setDangDungDuLieuMau] = useState(false);
    const boDemThongBao = useRef(null);

    const anThongBao = useCallback(() => {
        if (boDemThongBao.current) {
            clearTimeout(boDemThongBao.current);
            boDemThongBao.current = null;
        }

        setThongBao("");
    }, []);

    const hienThongBao = useCallback((noiDung) => {
        anThongBao();
        setThongBao(noiDung);

        boDemThongBao.current = setTimeout(() => {
            setThongBao("");
            boDemThongBao.current = null;
        }, 3000);
    }, [anThongBao]);

    const taiDanhSach = useCallback(async ({ lamMoiBoLoc = false } = {}) => {
        setDangTai(true);

        try {
            const response = await api.get("/admin/dat-goi");
            const danhSachApi = response.data.data || [];
            const danhSach = BAT_DU_LIEU_MAU_DAT_GOI
                ? [...danhSachApi, ...DU_LIEU_MAU_DAT_GOI]
                : danhSachApi;

            setDangDungDuLieuMau(BAT_DU_LIEU_MAU_DAT_GOI);
            setDanhSachYeuCau(danhSach);
            setYeuCauDangChonId((hienTai) => (
                danhSach.some((yeuCau) => yeuCau.id === hienTai)
                    ? hienTai
                    : danhSach[0]?.id
            ));

            if (lamMoiBoLoc) {
                setBoLocTrangThai(TRANG_THAI_MAC_DINH);
                setBoLocPhanHoi("");
                setTuKhoa("");
            }
        } catch (error) {
            console.error("Không thể tải danh sách đặt gói:", error);
            setDangDungDuLieuMau(false);
            hienThongBao(error.response?.data?.message || "Không thể tải danh sách đặt gói.");
        } finally {
            setDangTai(false);
        }
    }, [hienThongBao]);

    useEffect(() => {
        const lamMoi = () => {
            taiDanhSach({ lamMoiBoLoc: true });
            hienThongBao("Đã làm mới dữ liệu đặt gói.");
        };

        window.addEventListener("admin:refresh", lamMoi);
        const boDemTaiLanDau = setTimeout(() => {
            taiDanhSach();
        }, 0);

        return () => {
            window.removeEventListener("admin:refresh", lamMoi);
            clearTimeout(boDemTaiLanDau);
            anThongBao();
        };
    }, [anThongBao, hienThongBao, taiDanhSach]);

    const danhSachDaLoc = useMemo(() => {
        const tuKhoaChuanHoa = tuKhoa.trim().toLowerCase();

        return danhSachYeuCau.filter((yeuCau) => {
            const laBoLocDacBiet = [
                "cho_thanh_toan",
                "xac_nhan_thanh_toan",
                "danh_sach_goi_hoc",
            ].includes(boLocTrangThai);

            const khopNhomThanhToan =
                (boLocTrangThai === "cho_thanh_toan" &&
                    yeuCau.trangThai === "cho_thanh_toan" &&
                    !coThongTinChoXacNhanThanhToan(yeuCau)) ||
                (boLocTrangThai === "xac_nhan_thanh_toan" &&
                    yeuCau.trangThai === "cho_thanh_toan" &&
                    coThongTinChoXacNhanThanhToan(yeuCau)) ||
                (boLocTrangThai === "danh_sach_goi_hoc" &&
                    yeuCau.trangThai === "da_tao_lich");

            const khopTrangThai =
                laBoLocDacBiet
                    ? khopNhomThanhToan
                    : yeuCau.trangThai === boLocTrangThai ||
                        (boLocTrangThai === "da_phan_hoi" &&
                            ["giasu_dong_y", "giasu_tu_choi"].includes(yeuCau.trangThai));

            const khopPhanHoi =
                boLocTrangThai !== "da_phan_hoi" ||
                !boLocPhanHoi ||
                yeuCau.phanHoi?.ketQua === boLocPhanHoi;

            const noiDungTimKiem = [
                yeuCau.ma,
                yeuCau.hocVien,
                yeuCau.giaSu,
                yeuCau.mon,
                yeuCau.capHoc,
            ]
                .join(" ")
                .toLowerCase();

            const khopTuKhoa =
                !tuKhoaChuanHoa || noiDungTimKiem.includes(tuKhoaChuanHoa);

            return khopTrangThai && khopPhanHoi && khopTuKhoa;
        });
    }, [boLocPhanHoi, boLocTrangThai, danhSachYeuCau, tuKhoa]);

    const yeuCauDangChon =
        danhSachDaLoc.find((yeuCau) => yeuCau.id === yeuCauDangChonId) ??
        danhSachDaLoc[0] ??
        null;

    const demTheoTrangThai = (trangThai) => {
        if (trangThai === "da_phan_hoi") {
            return danhSachYeuCau.filter((yeuCau) =>
                ["giasu_dong_y", "giasu_tu_choi"].includes(yeuCau.trangThai),
            ).length;
        }

        if (trangThai === "cho_thanh_toan") {
            return danhSachYeuCau.filter((yeuCau) =>
                yeuCau.trangThai === "cho_thanh_toan" &&
                !coThongTinChoXacNhanThanhToan(yeuCau),
            ).length;
        }

        if (trangThai === "xac_nhan_thanh_toan") {
            return danhSachYeuCau.filter((yeuCau) =>
                yeuCau.trangThai === "cho_thanh_toan" &&
                coThongTinChoXacNhanThanhToan(yeuCau),
            ).length;
        }

        if (trangThai === "danh_sach_goi_hoc") {
            return danhSachYeuCau.filter((yeuCau) => yeuCau.trangThai === "da_tao_lich").length;
        }

        return danhSachYeuCau.filter((yeuCau) => yeuCau.trangThai === trangThai).length;
    };

    const doiTrangThai = (trangThai) => {
        setBoLocTrangThai(trangThai);
        setBoLocPhanHoi("");
        setYeuCauDangChonId(null);
    };

    const capNhatYeuCau = (id, duLieuMoi) => {
        setDanhSachYeuCau((hienTai) =>
            hienTai.map((yeuCau) =>
                yeuCau.id === id
                    ? {
                        ...yeuCau,
                        ...duLieuMoi,
                    }
                    : yeuCau,
            ),
        );
    };

    const xuLyHanhDong = async (yeuCau, hanhDong) => {
        if (!yeuCau || !hanhDong) return;

        if (hanhDong === "gui_gia_su") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/gui-gia-su`);
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("cho_xu_ly");
                setYeuCauDangChonId(yeuCau.id);
                hienThongBao(response.data.message || `Đã gửi/nhắc yêu cầu ${yeuCau.ma} cho gia sư ${yeuCau.giaSu}.`);
            } catch (error) {
                console.error("Không thể gửi yêu cầu cho gia sư:", error);
                hienThongBao(error.response?.data?.message || "Không thể gửi yêu cầu cho gia sư.");
            }
            return;
        }

        if (hanhDong === "cho_thanh_toan") {
            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/cho-thanh-toan`);
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("cho_thanh_toan");
                setYeuCauDangChonId(yeuCau.id);
                hienThongBao(response.data.message || `Đã chuyển ${yeuCau.ma} sang trạng thái chờ học viên thanh toán.`);
            } catch (error) {
                console.error("Không thể chuyển sang chờ thanh toán:", error);
                hienThongBao(error.response?.data?.message || "Không thể chuyển sang chờ thanh toán.");
            }
            return;
        }

        if (hanhDong === "nhac_thanh_toan") {
            hienThongBao(`Đã gửi nhắc thanh toán cho học viên ${yeuCau.hocVien}.`);
            return;
        }

        if (hanhDong === "xem_thanh_toan") {
            hienThongBao("Phần thông tin thanh toán sẽ nối sau khi có dữ liệu thanh toán.");
            return;
        }

        if (hanhDong === "huy_yeu_cau") {
            const dongY = window.confirm(`Bạn muốn hủy yêu cầu ${yeuCau.ma}?`);
            if (!dongY) return;

            try {
                const response = await api.patch(`/admin/dat-goi/${yeuCau.id}/huy`, {
                    ly_do: "Admin hủy yêu cầu đặt gói.",
                });
                capNhatYeuCau(yeuCau.id, response.data.data);
                setBoLocTrangThai("da_huy");
                setYeuCauDangChonId(yeuCau.id);
                hienThongBao(response.data.message || `Đã hủy yêu cầu ${yeuCau.ma}.`);
            } catch (error) {
                console.error("Không thể hủy yêu cầu đặt gói:", error);
                hienThongBao(error.response?.data?.message || "Không thể hủy yêu cầu đặt gói.");
            }
        }
    };

    return {
        boLocPhanHoi,
        boLocTrangThai,
        dangTai,
        dangDungDuLieuMau,
        danhSachDaLoc,
        thongBao,
        tuKhoa,
        yeuCauDangChon,
        demTheoTrangThai,
        doiTrangThai,
        setBoLocPhanHoi,
        setTuKhoa,
        setYeuCauDangChonId,
        xuLyHanhDong,
    };
}

export default useYeuCauDatGoi;
