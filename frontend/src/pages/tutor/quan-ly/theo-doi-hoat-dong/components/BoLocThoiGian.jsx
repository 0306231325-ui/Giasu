import { boLocThoiGianOptions } from "../constants";

function BoLocThoiGian({ value, onChange }) {
    return (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            {boLocThoiGianOptions.map(([giaTri, nhan]) => (
                <button
                    key={giaTri}
                    type="button"
                    onClick={() => onChange(giaTri)}
                    className={[
                        "rounded-xl px-4 py-2 text-sm font-bold transition",
                        value === giaTri
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                            : "text-white/55 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                >
                    {nhan}
                </button>
            ))}
        </div>
    );
}

export default BoLocThoiGian;
