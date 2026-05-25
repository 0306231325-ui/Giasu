import Hero from "../components/Hero";
import BaiVietMoi from "../components/BaiVietMoi";
import Login from "./login/Login";

function Home() {
  return (
    <>
      <Hero />
      <BaiVietMoi />
      <Login />
    </>
  );
}

export default Home;