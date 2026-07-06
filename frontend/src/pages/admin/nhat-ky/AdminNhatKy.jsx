import BangNhatKy from "./components/BangNhatKy";
import BoLocNhatKy from "./components/BoLocNhatKy";
import TieuDeNhatKy from "./components/TieuDeNhatKy";
import useNhatKyHeThong from "./hooks/useNhatKyHeThong";

function AdminNhatKy() {
  const nhatKy = useNhatKyHeThong();

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <TieuDeNhatKy tongSo={nhatKy.meta.total} />

      <BoLocNhatKy
        tuKhoaNhap={nhatKy.tuKhoaNhap}
        vaiTro={nhatKy.vaiTro}
        nhomHanhDong={nhatKy.nhomHanhDong}
        setTuKhoaNhap={nhatKy.setTuKhoaNhap}
        timKiem={nhatKy.timKiem}
        lamMoiBoLoc={nhatKy.lamMoiBoLoc}
        xuLyNhanEnter={nhatKy.xuLyNhanEnter}
        doiVaiTro={nhatKy.doiVaiTro}
        doiNhomHanhDong={nhatKy.doiNhomHanhDong}
      />

      <BangNhatKy
        danhSach={nhatKy.danhSach}
        dangTai={nhatKy.dangTai}
        loi={nhatKy.loi}
        trangHopLe={nhatKy.trangHopLe}
        tongSoTrang={nhatKy.tongSoTrang}
        chuyenTrang={nhatKy.chuyenTrang}
        veTrangTruoc={nhatKy.veTrangTruoc}
        veTrangSau={nhatKy.veTrangSau}
      />
    </div>
  );
}

export default AdminNhatKy;
