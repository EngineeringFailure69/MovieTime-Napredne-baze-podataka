import React from "react";
import { useState } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import { HomeUser } from "./pages/HomeUser";
import { FavouriteMovies } from "./pages/FavouriteMovies";
import PrivateRoutes from "./utils/PrivateRoutes";
import { HomeAdmin } from "./pages/HomeAdmin";


const App = () => {

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  return (
      <div className= 'container'>
        <div className={loginDialogOpen ? 'overlay' : ''}>
          <BrowserRouter>
            <Navbar setLoginDialogOpen={setLoginDialogOpen} />
              <Routes>
                <Route path="/" element={<Home loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>} />

                <Route element={<PrivateRoutes role = 'user' />}>
                  <Route path="/user" element={<HomeUser/>} />
                  <Route path="/user-favourite-movies" element={<FavouriteMovies/>} />
                </Route>
                <Route element={<PrivateRoutes role = 'admin' />}>
                  <Route path="/admin" element={<HomeAdmin/>} />
                </Route>
              </Routes>
          </BrowserRouter>
        </div>
      </div>
  );
};

export default App;
