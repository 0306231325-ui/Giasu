import { Link } from "react-router-dom";

function GioiThieu() {
    return (
        <section className="relative bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:py-16 min-h-screen">

            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-950 to-slate-50" />

            <div className="relative mx-auto max-w-6xl z-10">

                <div className="mx-auto mb-20 max-w-3xl text-center text-white">

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Hệ Thống Gia Sư Trực Tuyến
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-blue-100">
                        Nền tảng kết nối trực tiếp giữa những gia sư tài năng và các học viên có nhu cầu học tập,
                        giúp tiết kiệm thời gian, tối ưu chi phí và đảm bảo chất lượng giảng dạy.
                    </p>
                </div>



                <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200 mb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Liên hệ hỗ trợ</h2>
                            <div className="space-y-6 text-slate-600 mb-10 text-lg">
                                <p className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </span>
                                    <span>27 Chấn Hưng, Phường 6, Quận Tân Bình, TP.HCM</span>
                                </p>
                                <p className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </span>
                                    <span className="font-semibold text-slate-800">0328 778 433</span>
                                </p>
                                <p className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <span className="font-semibold text-slate-800">0306231325@gmail.com</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/tim-gia-su-theo-yeu-cau" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20">
                                    Tìm gia sư ngay
                                </Link>
                                <Link to="/dang-ky-lam-gia-su" className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all border border-slate-300 shadow-sm">
                                    Đăng ký làm gia sư
                                </Link>
                            </div>
                        </div>

                        <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3223214923596!2d106.66124237594732!3d10.786606789362825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ecdf1db3511%3A0x6b2b6f8d6344da43!2zMjcgQ2jhuqVuIEjGsG5nLCBUw6JuIEjDsmEsIEjhu5MgQ2jDrSBNaW5oIDcyNTE1LCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1784529748679!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>


                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-12">Tại sao chọn chúng tôi?</h2>
                    <div className="grid md:grid-cols-2 gap-8">

                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                            <h3 className="text-xl font-bold text-blue-700 mb-8 flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                Dành cho Học viên
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    { t: "Gia sư được kiểm duyệt 100%", d: "Bằng cấp, chứng chỉ và thẻ sinh viên đều được Admin xét duyệt kỹ càng." },
                                    { t: "Học thử miễn phí", d: "Cơ chế đặt gói học thử 0đ giúp đánh giá sự phù hợp trước khi thanh toán." },
                                    { t: "Lịch học linh hoạt", d: "Dễ dàng xin đổi lịch, học bù ngay trên hệ thống một cách minh bạch." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="mt-1 bg-emerald-50 rounded-full p-1 border border-emerald-100">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{item.t}</h4>
                                            <p className="text-slate-600 mt-1.5 leading-relaxed">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>


                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                            <h3 className="text-xl font-bold text-amber-600 mb-8 flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                Dành cho Gia sư
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    { t: "Thu nhập minh bạch", d: "Bảng giá tự động tính toán dựa trên kinh nghiệm, cấp học và chuyên môn của bạn." },
                                    { t: "Bảo vệ quyền lợi", d: "Có hợp đồng rõ ràng, hệ thống tự động ghi nhận hoàn thành buổi dạy, không lo bị quỵt tiền." },
                                    { t: "Chủ động thời gian", d: "Tự quyết định nhận lớp, từ chối lớp và tự sắp xếp thời khóa biểu cá nhân." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="mt-1 bg-emerald-50 rounded-full p-1 border border-emerald-100">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{item.t}</h4>
                                            <p className="text-slate-600 mt-1.5 leading-relaxed">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default GioiThieu;
