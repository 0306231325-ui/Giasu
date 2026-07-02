import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { getRedirectPath } from "../../../services/auth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirect = new URLSearchParams(location.search).get("redirect");
  const redirectPath = redirect?.startsWith("/") ? redirect : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });

      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);
        navigate(redirectPath || getRedirectPath(user.vai_tro), { replace: true });
      }
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors?.email?.[0]) {
        setError(data.errors.email[0]);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Không thể đăng nhập. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
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
      maxWidth: "450px",
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

    errorBox: {
      padding: "14px 16px",
      borderRadius: "12px",
      background: "#fef2f2",
      color: "#dc2626",
      fontSize: "14px",
      marginBottom: "20px",
      border: "1px solid #fecaca",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      animation: "slideDown 0.3s ease-out",
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
    },

    inputContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },

    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      fontSize: "15px",
      color: "#1f2937",
      background: "#f9fafb",
      outline: "none",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
      boxSizing: "border-box",
    },

    togglePassword: {
      position: "absolute",
      right: "14px",
      cursor: "pointer",
      fontSize: "18px",
      color: "#9ca3af",
      transition: "color 0.2s ease",
    },

    rememberContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      color: "#6b7280",
    },

    checkbox: {
      width: "18px",
      height: "18px",
      cursor: "pointer",
      accentColor: "#667eea",
    },

    forgotLink: {
      fontSize: "13px",
      color: "#3b82f6",
      textDecoration: "none",
      fontWeight: "600",
      transition: "color 0.3s ease",
    },

    button: {
      padding: "14px 16px",
      border: "none",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
      transition: "all 0.3s ease",
      marginTop: "10px",
      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
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
      transition: "color 0.3s ease",
    },

    divider: {
      textAlign: "center",
      margin: "24px 0",
      fontSize: "14px",
      color: "#d1d5db",
    },

    socialButtons: {
      display: "flex",
      gap: "12px",
      marginBottom: "24px",
    },

    socialButton: {
      flex: 1,
      padding: "11px 14px",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      background: "#f9fafb",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      color: "#6b7280",
      transition: "all 0.3s ease",
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        a:hover {
          color: #5568d3 !important;
        }

        .social-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.box}>
            <div style={styles.header}>
              <p style={styles.logo}>📚 TRUNG TÂM GIA SƯ</p>
              <h1 style={styles.title}>Đăng Nhập</h1>
              <p style={styles.subtitle}>Chào mừng bạn trở lại</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={styles.form}>
              {/* Email */}
              <div style={styles.formGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Mật khẩu */}
              <div style={styles.formGroup}>
                <label style={styles.label}>🔐 Mật Khẩu</label>
                <div style={styles.inputContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                    autoComplete="current-password"
                  />
                  <span
                    style={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                }}
              >
                <label style={styles.rememberContainer}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Nhớ mật khẩu</span>
                </label>
                <a href="#forgot" style={styles.forgotLink}>
                  Quên mật khẩu?
                </a>
              </div>

              {/* Nút đăng nhập */}
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "⏳ Đang xử lý..." : "🚀 Đăng Nhập"}
              </button>
            </form>

            {/* Footer */}
            <div style={styles.footer}>
              Chưa có tài khoản?{" "}
              <Link to="/register" style={styles.footerLink}>
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
