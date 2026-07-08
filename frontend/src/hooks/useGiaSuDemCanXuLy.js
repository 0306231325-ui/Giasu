import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const demMacDinh = {
  lichDay: 0,
  hoSo: 0,
};

function useGiaSuDemCanXuLy({ kichHoat = true } = {}) {
  const [dem, setDem] = useState(demMacDinh);
  const [dangTai, setDangTai] = useState(false);

  const taiSoLuong = useCallback(async () => {
    if (!kichHoat) {
      setDem(demMacDinh);
      return demMacDinh;
    }

    setDangTai(true);
    try {
      const response = await api.get("/gia-su/dem-can-xu-ly");
      if (response.data?.success) {
        setDem({
          ...demMacDinh,
          ...response.data.data
        });
        return response.data.data;
      }
    } catch (error) {
      console.error("Không thể tải số lượng cần xử lý của gia sư:", error);
      setDem(demMacDinh);
    } finally {
      setDangTai(false);
    }
    return demMacDinh;
  }, [kichHoat]);

  useEffect(() => {
    taiSoLuong();
    
    // Listen for custom events to refresh count
    const langNgheLamMoi = () => taiSoLuong();
    window.addEventListener("giasu:refresh", langNgheLamMoi);
    
    return () => {
      window.removeEventListener("giasu:refresh", langNgheLamMoi);
    };
  }, [taiSoLuong]);

  return { dem, dangTai, taiSoLuong };
}

export default useGiaSuDemCanXuLy;
