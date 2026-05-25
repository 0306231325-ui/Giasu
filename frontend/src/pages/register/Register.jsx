import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    console.log(formData);

    alert("Đăng ký thành công");
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
      width: "450px",
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

    select: {
      padding: "15px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "16px",
      color: "#000",
      background: "#fff",
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>Đăng Ký</h1>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Nhập họ tên"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="student">Học viên</option>
            <option value="tutor">Gia sư</option>
          </select>

          <button type="submit" style={styles.button}>
            Đăng Ký
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;