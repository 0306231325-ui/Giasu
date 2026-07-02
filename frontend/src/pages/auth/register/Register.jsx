import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength("weak");
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setPasswordStrength("medium");
      return;
    }

    setPasswordStrength("strong");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Họ tên phải có ít nhất 3 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/register", {
        ho_ten: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        vai_tro: "hoc_vien",
      });

      if (response.data.success) {
        alert("✅ Đăng ký thành công! Chuyển hướng đến trang đăng nhập...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);
      }
    } catch (err) {
      const data = err.response?.data;
      console.log("Lỗi API:", data);

      if (data?.errors) {
        // Map Laravel errors to form fields
        const mappedErrors = {};
        
        if (data.errors.email) {
          mappedErrors.email = data.errors.email[0]
            ?.replace("The email has already been taken.", "Email này đã được đăng ký.")
            ?.replace("The email field is required.", "Vui lòng nhập email.")
            || "Email không hợp lệ";
        }
        
        if (data.errors.password) {
          mappedErrors.password = data.errors.password[0]
            ?.replace("The password field is required.", "Vui lòng nhập mật khẩu.")
            || "Mật khẩu không hợp lệ";
        }
        
        if (data.errors.ho_ten) {
          mappedErrors.name = data.errors.ho_ten[0]
            ?.replace("The ho_ten field is required.", "Vui lòng nhập họ tên.")
            || "Họ tên không hợp lệ";
        }
        
        if (data.errors.vai_tro) {
          mappedErrors.role = data.errors.vai_tro[0] || "Vui lòng chọn vai trò";
        }

        setErrors(mappedErrors);
      } else if (data?.message) {
        setErrors({ general: data.message });
      } else {
        setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại." });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "strong":
        return "#10b981";
      default:
        return "#e5e7eb";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case "weak":
        return "Yếu";
      case "medium":
        return "Trung bình";
      case "strong":
        return "Mạnh";
      default:
        return "";
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "#040B3D",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },

    wrapper: {
      width: "100%",
      maxWidth: "500px",
    },

    box: {
      background: "#fff",
      padding: "50px 40px",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      animation: "slideUp 0.6s ease-out",
    },

    header: {
      textAlign: "center",
      marginBottom: "35px",
    },

    logo: {
      fontSize: "13px",
      color: "#3b82f6",
      fontWeight: "700",
      letterSpacing: "2.5px",
      marginBottom: "12px",
      textTransform: "uppercase",
    },

    title: {
      fontSize: "36px",
      fontWeight: "700",
      color: "#1f2937",
      margin: "0",
      letterSpacing: "-0.5px",
    },

    subtitle: {
      fontSize: "14px",
      color: "#9ca3af",
      marginTop: "8px",
      marginBottom: "0",
      fontWeight: "500",
    },

    form: {
      display: "flex",
      flexDirection: "column",
      gap: "18px",
    },

    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    label: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "2px",
    },

    input: {
      padding: "12px 16px",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      fontSize: "15px",
      color: "#1f2937",
      background: "#f9fafb",
      outline: "none",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
    },

    inputError: {
      borderColor: "#ef4444",
      background: "#fef2f2",
    },

    errorText: {
      fontSize: "13px",
      color: "#ef4444",
      marginTop: "4px",
      fontWeight: "500",
    },

    passwordStrengthBar: {
      height: "5px",
      borderRadius: "3px",
      background: getPasswordStrengthColor(),
      transition: "all 0.3s ease",
      marginTop: "6px",
    },

    passwordStrengthText: {
      fontSize: "12px",
      color: getPasswordStrengthColor(),
      marginTop: "4px",
      fontWeight: "600",
    },

    button: {
      padding: "14px 16px",
      border: "none",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "10px",
      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
    },

    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.5)",
    },

    footer: {
      textAlign: "center",
      marginTop: "28px",
      fontSize: "14px",
      color: "#6b7280",
    },

    footerLink: {
      color: "#3b82f6",
      fontWeight: "600",
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 0.3s ease",
    },
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input:focus {
          outline: none;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          background: #fff !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5) !important;
        }
        
        button:active {
          transform: translateY(0);
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.box}>
            <div style={styles.header}>
              <p style={styles.logo}>📚 TRUNG TÂM GIA SƯ</p>
              <h1 style={styles.title}>Tạo Tài Khoản</h1>
              <p style={styles.subtitle}>Bắt đầu hành trình học tập của bạn</p>
            </div>

            {errors.general && (
              <div style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: "14px",
                textAlign: "center",
                marginBottom: "20px",
                border: "1px solid #fecaca",
              }}>
                ❌ {errors.general}
              </div>
            )}

            <form onSubmit={handleRegister} style={styles.form}>
              {/* Họ tên */}
              <div style={styles.formGroup}>
                <label style={styles.label}>👤 Họ và Tên</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập họ và tên của bạn"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.name ? styles.inputError : {}),
                  }}
                />
                {errors.name && <span style={styles.errorText}>⚠️ {errors.name}</span>}
              </div>

              {/* Email */}
              <div style={styles.formGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {}),
                  }}
                />
                {errors.email && <span style={styles.errorText}>⚠️ {errors.email}</span>}
              </div>

              {/* Mật khẩu */}
              <div style={styles.formGroup}>
                <label style={styles.label}>🔐 Mật Khẩu</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.password ? styles.inputError : {}),
                  }}
                />
                {formData.password && (
                  <>
                    <div style={styles.passwordStrengthBar}></div>
                    <span style={styles.passwordStrengthText}>
                      Độ mạnh: {getPasswordStrengthText()}
                    </span>
                  </>
                )}
                {errors.password && <span style={styles.errorText}>⚠️ {errors.password}</span>}
              </div>

              {/* Xác nhận mật khẩu */}
              <div style={styles.formGroup}>
                <label style={styles.label}>🔁 Xác Nhận Mật Khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.confirmPassword ? styles.inputError : {}),
                  }}
                />
                {errors.confirmPassword && (
                  <span style={styles.errorText}>⚠️ {errors.confirmPassword}</span>
                )}
              </div>
              {/* Nút đăng ký */}
              <button 
                type="submit" 
                style={{
                  ...styles.button, 
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }} 
                disabled={loading}
              >
                {loading ? "⏳ Đang xử lý..." : "✨ Đăng Ký Ngay"}
              </button>
            </form>

            {/* Footer */}
            <div style={styles.footer}>
              Đã có tài khoản?{" "}
              <Link to="/login" style={styles.footerLink}>
                Đăng nhập tại đây
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
