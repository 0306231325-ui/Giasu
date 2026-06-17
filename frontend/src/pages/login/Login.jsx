import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getRedirectPath } from "../../services/auth";

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
      background: "linear-gradient(to right, #020024, #090979, #000)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    box: {
      width: "420px",
      background: "#fff",
      padding: "40px",
      borderRadius: "15px",
      boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    },
    title: {
      textAlign: "center",
      marginBottom: "30px",
      fontSize: "32px",
      fontWeight: "bold",
      color: "#000",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    input: {
      padding: "15px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "16px",
      color: "#000",
      background: "#fff",
      outline: "none",
    },
    button: {
      padding: "15px",
      border: "none",
      borderRadius: "10px",
      background: "#2563eb",
      color: "#fff",
      fontSize: "18px",
      fontWeight: "bold",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
    },
    error: {
      padding: "12px",
      borderRadius: "8px",
      background: "#fee2e2",
      color: "#b91c1c",
      fontSize: "14px",
      textAlign: "center",
    },
    text: {
      textAlign: "center",
      marginTop: "20px",
      color: "#000",
    },
    register: {
      color: "#2563eb",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>Đăng Nhập</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="current-password"
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <p style={styles.text}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={styles.register}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
