import { useEffect, useRef, useState } from "react";

const DINH_DANG_ANH_CHO_PHEP = ["image/jpeg", "image/png", "image/webp"];
const DUNG_LUONG_ANH_TOI_DA = 2 * 1024 * 1024;

function useAnhXemTruoc() {
  const [fileAnh, setFileAnh] = useState(null);
  const [anhXemTruoc, setAnhXemTruoc] = useState("");
  const [loiAnh, setLoiAnh] = useState("");
  const urlAnhXemTruoc = useRef("");

  useEffect(() => {
    return () => {
      if (urlAnhXemTruoc.current) {
        URL.revokeObjectURL(urlAnhXemTruoc.current);
      }
    };
  }, []);

  const xoaAnh = () => {
    if (urlAnhXemTruoc.current) {
      URL.revokeObjectURL(urlAnhXemTruoc.current);
      urlAnhXemTruoc.current = "";
    }

    setFileAnh(null);
    setAnhXemTruoc("");
    setLoiAnh("");
  };

  const chonAnh = (event) => {
    const file = event.target.files?.[0] || null;
    xoaAnh();

    if (!file) {
      return;
    }

    if (!DINH_DANG_ANH_CHO_PHEP.includes(file.type)) {
      setLoiAnh("Ảnh bìa chỉ hỗ trợ định dạng JPG, PNG hoặc WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > DUNG_LUONG_ANH_TOI_DA) {
      setLoiAnh("Ảnh bìa không được lớn hơn 2MB.");
      event.target.value = "";
      return;
    }

    setFileAnh(file);
    const url = URL.createObjectURL(file);
    urlAnhXemTruoc.current = url;
    setAnhXemTruoc(url);
  };

  return {
    fileAnh,
    anhXemTruoc,
    loiAnh,
    chonAnh,
    xoaAnh,
  };
}

export default useAnhXemTruoc;
