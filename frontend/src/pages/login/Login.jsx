import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    alert("Đăng nhập thành công");
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
      cursor: "pointer",
    },

    text: {
      textAlign: "center",
      marginTop: "20px",
      color: "#000",
    },

    register: {
      color: "#2563eb",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>Đăng Nhập</h1>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Đăng Nhập
          </button>
        </form>

        <p style={styles.text}>
          Chưa có tài khoản?{" "}
          <span style={styles.register}>Đăng ký</span>
        </p>
      </div>
    </div>
  );
}

export default Login;