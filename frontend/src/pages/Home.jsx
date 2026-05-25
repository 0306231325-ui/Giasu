import Hero from "../components/Hero";
import BaiVietMoi from "../components/BaiVietMoi";
import Login from "./login/Login";
import Register from "./register/Register";

function Home() {
  return (
    <>
      <Hero />
      <BaiVietMoi />
      <Login />
      <Register />
    </>
  );
}

export default Home;