import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { boDauTiengViet } from "../../utils/string";

const DanhSachMonHoc = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [monHocs, setMonHocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const filterMonId = searchParams.get("mon") || "";

    useEffect(() => {
        let cancelled = false;

        const fetchMonHoc = async () => {
            try {
                const response = await api.get("/mon-hoc");

                if (!cancelled && response.data.success) {
                    setMonHocs(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API danh sách môn học:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchMonHoc();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredMonHocs = useMemo(() => {
        const keyword = boDauTiengViet(searchText.trim());

        return monHocs.filter((mon) => {
            const matchFilter =
                !filterMonId || String(mon.id) === filterMonId;

            const tenMonKhongDau = boDauTiengViet(mon.ten_mon);
            const matchSearch =
                !keyword || tenMonKhongDau.includes(keyword);

            return matchFilter && matchSearch;
        });
    }, [monHocs, filterMonId, searchText]);

    const handleFilterChange = (e) => {
        const value = e.target.value;

        if (value) {
            setSearchParams({ mon: value });
        } else {
            setSearchParams({});
        }
    };

    const handleClearFilters = () => {
        setSearchText("");
        setSearchParams({});
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-white text-lg">Đang tải danh sách môn học...</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-10">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-white mb-3">
                    Danh Sách Môn Học
                </h1>
                <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
                <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
                    Khám phá các môn học đang có trên hệ thống và số lượng
                    gia sư đang giảng dạy từng môn.
                </p>
            </div>

            <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Gõ chữ cái để tìm "
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#0d1854] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />

                <select
                    value={filterMonId}
                    onChange={handleFilterChange}
                    className="sm:w-56 px-4 py-2.5 rounded-xl bg-[#0d1854] border border-white/10 text-white focus:outline-none focus:border-blue-400"
                >
                    <option value="">Tất cả môn học</option>
                    {monHocs.map((mon) => (
                        <option key={mon.id} value={mon.id}>
                            {mon.ten_mon}
                        </option>
                    ))}
                </select>

                {(filterMonId || searchText) && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors"
                    >
                        Xóa lọc
                    </button>
                )}
            </div>

            {monHocs.length === 0 ? (
                <p className="text-center text-gray-300 text-lg">
                    Chưa có môn học nào trên hệ thống.
                </p>
            ) : filteredMonHocs.length === 0 ? (
                <p className="text-center text-gray-300 text-lg">
                    Không tìm thấy môn học phù hợp.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {filteredMonHocs.map((mon) => (
                        <div
                            key={mon.id}
                            className="bg-[#0d1854] border border-white/10 rounded-2xl p-6 shadow-lg hover:border-blue-400/40 transition-colors duration-200"
                        >
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {mon.ten_mon}
                            </h2>

                            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                                {mon.mo_ta || "Chưa có mô tả"}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-blue-400 font-semibold">
                                     {mon.giasus_count} gia sư
                                </span>

                                <Link
                                    to="/gia-su"
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Xem gia sư →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DanhSachMonHoc;
