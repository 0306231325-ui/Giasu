import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="bg-[#040B3D] min-h-screen text-white overflow-hidden flex flex-col">
      
      
      <Navbar />
      
      <main className="flex-grow">
        <Outlet /> 
      </main>

      <Footer />
      
    </div>
  );
}

export default MainLayout;