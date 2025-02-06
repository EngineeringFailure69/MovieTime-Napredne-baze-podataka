import React from "react";
import { useState } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from "./pages/Global/Home";
import Navbar from "./components/Navbar/Navbar";
import { HomeUser } from "./pages/User/HomeUser";
import { FavouriteMovies } from "./pages/User/FavouriteMovies";
import PrivateRoutes from "./utils/PrivateRoutes";
import { GlobalTVShows } from "./pages/Global/GlobalTVShows";
import { UserTVShows } from "./pages/User/UserTVShows";
import { FavouriteTVShows } from "./pages/User/FavouriteTVShows";
import { HomeAdmin } from "./pages/Admin/HomeAdmin";
import { AdminActor } from "./pages/Admin/AdminActor";
import { AdminDirector } from "./pages/Admin/AdminDirector";
import { AdminMovie } from "./pages/Admin/AdminMovie";
import { AdminTVShow } from "./pages/Admin/AdminTVShow";

const App = () => {

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  return (
      <div className= 'container'>
        <div className={loginDialogOpen ? 'overlay' : ''}>
          <BrowserRouter>
            <Navbar 
              setLoginDialogOpen={setLoginDialogOpen} 
              filterOpen={filterOpen} 
              setFilterOpen={setFilterOpen}
              searchValue={searchValue}
              setSearchValue={setSearchValue}/>
              <Routes>
                <Route path="/" element={<Home loginDialogOpen={loginDialogOpen} 
                                               setLoginDialogOpen={setLoginDialogOpen} 
                                               filterOpen={filterOpen}
                                               searchValue={searchValue}/>} />
                <Route path="/tvShows" element={<GlobalTVShows 
                                                loginDialogOpen={loginDialogOpen} 
                                                setLoginDialogOpen={setLoginDialogOpen} 
                                                filterOpen={filterOpen}
                                                searchValue={searchValue}/>} />

                <Route element={<PrivateRoutes role = 'user' />}>
                  <Route path="/user" element={<HomeUser filterOpen={filterOpen} searchValue={searchValue}/>} />
                  <Route path="/user-tvShows" element={<UserTVShows filterOpen={filterOpen} searchValue={searchValue}/>} />
                  <Route path="/user-favourite-movies" element={<FavouriteMovies filterOpen={filterOpen} searchValue={searchValue}/>} />
                  <Route path="/user-favourite-tvShows" element={<FavouriteTVShows filterOpen={filterOpen} searchValue={searchValue}/>} />
                </Route>
                <Route element={<PrivateRoutes role = 'admin' />}>
                  <Route path="/admin" element={<HomeAdmin/>} />
                  <Route path="/admin-actor" element={<AdminActor/>} />
                  <Route path="/admin-director" element={<AdminDirector/>} />
                  <Route path="/admin-movie" element={<AdminMovie/>} />
                  <Route path="/admin-tvShow" element={<AdminTVShow/>} />
                </Route>
              </Routes>
          </BrowserRouter>
        </div>
      </div>
  );
};

export default App;
