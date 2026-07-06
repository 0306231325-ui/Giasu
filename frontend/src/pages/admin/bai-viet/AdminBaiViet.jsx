import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DanhSachBaiViet from "./DanhSachBaiViet";
import FormChinhSuaBaiViet from "./FormChinhSuaBaiViet";
import FormTaoBaiViet from "./FormTaoBaiViet";
import TabButton from "./TabButton";
import ThungRacBaiViet from "./ThungRacBaiViet";
import useChinhSuaBaiViet from "./hooks/useChinhSuaBaiViet";
import useDanhSachBaiViet from "./hooks/useDanhSachBaiViet";
import useTaoBaiViet from "./hooks/useTaoBaiViet";
import useThungRacBaiViet from "./hooks/useThungRacBaiViet";

function AdminBaiViet() {
  const navigate = useNavigate();
  const [tabDangMo, setTabDangMo] = useState("danh_sach");
  const danhSach = useDanhSachBaiViet();
  const taoMoi = useTaoBaiViet({
    sauKhiTaoThanhCong: () => {
      danhSach.veTrangDau();
      danhSach.taiLaiDanhSach();
      setTabDangMo("danh_sach");
    },
  });
  const chinhSua = useChinhSuaBaiViet({
    moTabChinhSua: () => setTabDangMo("chinh_sua"),
    sauKhiCapNhatThanhCong: danhSach.taiLaiDanhSach,
  });
  const thungRac = useThungRacBaiViet({
    taiLaiDanhSach: danhSach.taiLaiDanhSach,
  });

  useEffect(() => {
    const lamMoi = () => {
      if (tabDangMo === "thung_rac") {
        thungRac.taiLaiThungRac();
        return;
      }

      danhSach.taiLaiDanhSach();
    };

    window.addEventListener("admin:refresh", lamMoi);

    return () => {
      window.removeEventListener("admin:refresh", lamMoi);
    };
  }, [danhSach, tabDangMo, thungRac]);

  const xoaBaiViet = async (baiViet) => {
    const daXoa = await danhSach.xoaBaiViet(baiViet);

    if (daXoa) {
      thungRac.taiLaiThungRac();
    }
  };

  const renderNoiDungTab = () => {
    if (tabDangMo === "danh_sach") {
      return (
        <DanhSachBaiViet
          danhSachBaiViet={danhSach.danhSachBaiViet}
          dangTai={danhSach.dangTaiDanhSach}
          loi={danhSach.loiDanhSach}
          meta={danhSach.meta}
          tuKhoa={danhSach.tuKhoa}
          locTrangThai={danhSach.locTrangThai}
          trangHienTai={danhSach.trangHienTai}
          doiTuKhoa={danhSach.doiTuKhoa}
          doiLocTrangThai={danhSach.doiLocTrangThai}
          chuyenTrang={danhSach.chuyenTrang}
          navigate={navigate}
          chonBaiVietDeSua={chinhSua.chonBaiVietDeSua}
          xoaBaiViet={xoaBaiViet}
          dangXoaId={danhSach.dangXoaId}
        />
      );
    }

    if (tabDangMo === "tao_moi") {
      return (
        <FormTaoBaiViet
          form={taoMoi.form}
          anhXemTruoc={taoMoi.anhXemTruoc}
          loiAnh={taoMoi.loiAnh}
          dangLuu={taoMoi.dangLuu}
          loi={taoMoi.loi}
          thongBao={taoMoi.thongBao}
          capNhatForm={taoMoi.capNhatForm}
          chonAnhBia={taoMoi.chonAnhBia}
          taoBaiViet={taoMoi.taoBaiViet}
        />
      );
    }

    if (tabDangMo === "chinh_sua") {
      return (
        <FormChinhSuaBaiViet
          baiVietDangChon={chinhSua.baiVietDangChon}
          form={chinhSua.formChinhSua}
          anhXemTruoc={chinhSua.anhChinhSuaXemTruoc}
          loiAnh={chinhSua.loiAnhChinhSua}
          dangLuu={chinhSua.dangCapNhat}
          loi={chinhSua.loiChinhSua}
          thongBao={chinhSua.thongBaoChinhSua}
          capNhatForm={chinhSua.capNhatFormChinhSua}
          chonAnhBia={chinhSua.chonAnhBiaChinhSua}
          capNhatBaiViet={chinhSua.capNhatBaiViet}
          quayLaiDanhSach={() => setTabDangMo("danh_sach")}
        />
      );
    }

    if (tabDangMo === "thung_rac") {
      return (
        <ThungRacBaiViet
          danhSachDaXoa={thungRac.danhSachDaXoa}
          meta={thungRac.meta}
          tuKhoa={thungRac.tuKhoa}
          trangHienTai={thungRac.trangHienTai}
          dangTai={thungRac.dangTai}
          dangXuLyId={thungRac.dangXuLyId}
          loi={thungRac.loi}
          thongBao={thungRac.thongBao}
          doiTuKhoa={thungRac.doiTuKhoa}
          chuyenTrang={thungRac.chuyenTrang}
          khoiPhucBaiViet={thungRac.khoiPhucBaiViet}
          xoaVinhVienBaiViet={thungRac.xoaVinhVienBaiViet}
        />
      );
    }

    return null;
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold">Quản lý bài viết</div>
          <div className="mt-2 text-sm text-white/70">
            Xem danh sách bài viết và đăng nội dung mới cho trang người dùng.
          </div>
        </div>

        <div className="text-sm text-white/70">
          Tổng:{" "}
          <span className="font-bold text-white">{danhSach.meta?.total ?? 0}</span>
        </div>
      </div>

      <div className="mt-6 flex w-full gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 sm:w-fit">
        <TabButton
          dangMo={tabDangMo === "danh_sach"}
          onClick={() => setTabDangMo("danh_sach")}
        >
          Danh sách bài viết
        </TabButton>
        <TabButton
          dangMo={tabDangMo === "tao_moi"}
          onClick={() => setTabDangMo("tao_moi")}
        >
          Tạo bài viết
        </TabButton>
        <TabButton
          dangMo={tabDangMo === "chinh_sua"}
          disabled={!chinhSua.baiVietDangChon}
          onClick={() => setTabDangMo("chinh_sua")}
        >
          Chỉnh sửa
        </TabButton>
        <TabButton
          dangMo={tabDangMo === "thung_rac"}
          onClick={() => setTabDangMo("thung_rac")}
        >
          Thùng rác
        </TabButton>
      </div>

      {renderNoiDungTab()}
    </div>
  );
}

export default AdminBaiViet;
