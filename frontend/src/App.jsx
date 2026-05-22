import Home from "./pages/Home"
import { useEffect } from 'react'
import api from './services/api'
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
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

      </Route>
      

    </Routes>
  );
}

  

export default App