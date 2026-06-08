import { useEffect, useRef, useState } from "react";

function useThongBaoTamThoi() {
  const [thongBao, setThongBao] = useState("");
  const boDemAnThongBao = useRef(null);

  useEffect(() => {
    return () => {
      if (boDemAnThongBao.current) {
        clearTimeout(boDemAnThongBao.current);
      }
    };
  }, []);

  const anThongBao = () => {
    if (boDemAnThongBao.current) {
      clearTimeout(boDemAnThongBao.current);
      boDemAnThongBao.current = null;
    }

    setThongBao("");
  };

  const hienThongBaoTamThoi = (noiDung) => {
    anThongBao();
    setThongBao(noiDung);

    boDemAnThongBao.current = setTimeout(() => {
      setThongBao("");
      boDemAnThongBao.current = null;
    }, 3000);
  };

  return {
    thongBao,
    anThongBao,
    hienThongBaoTamThoi,
  };
}

export default useThongBaoTamThoi;
