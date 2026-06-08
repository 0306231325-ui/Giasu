import { useEffect, useRef, useState } from "react";

function useAnhXemTruoc() {
  const [fileAnh, setFileAnh] = useState(null);
  const [anhXemTruoc, setAnhXemTruoc] = useState("");
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
  };

  const chonAnh = (event) => {
    const file = event.target.files?.[0] || null;
    xoaAnh();

    setFileAnh(file);
    if (file) {
      const url = URL.createObjectURL(file);
      urlAnhXemTruoc.current = url;
      setAnhXemTruoc(url);
    }
  };

  return {
    fileAnh,
    anhXemTruoc,
    chonAnh,
    xoaAnh,
  };
}

export default useAnhXemTruoc;
