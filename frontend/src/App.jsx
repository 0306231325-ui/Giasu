import Home from "./pages/Home"
import { useEffect } from 'react'
import api from './services/api'
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import BaiVietDetail from "./pages/BaiVietDetail";
function App() {

  useEffect(() => {

    api.get('/test')
      .then((response) => {

        console.log(response.data)

      })

  }, [])

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/home" element={<Home />} />

        <Route
          path="/baiviet/:slug"
          element={<BaiVietDetail />}
        />

      </Route>
      

    </Routes>
  );
}

  

export default App