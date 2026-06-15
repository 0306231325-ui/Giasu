import { useEffect, useState } from "react";
import api from "../../../services/api";

const initialOptions = {
    trinh_do: [],
    cap_hoc: [],
    mon_hoc: [],
    muc_kinh_nghiem: [],
};

function useTutorRegistrationOptions() {
    const [options, setOptions] = useState(initialOptions);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchOptions = async () => {
            try {
                const response = await api.get("/dang-ky-gia-su/danh-muc");

                if (!cancelled && response.data.success) {
                    setOptions(response.data.data);
                }
            } catch {
                if (!cancelled) {
                    setError("Không thể tải dữ liệu đăng ký. Vui lòng thử lại sau.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    return { options, loading, error };
}

export default useTutorRegistrationOptions;
