import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Box } from "@chakra-ui/react";
import { AspectRatio, HStack } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import { Rating } from "@/components/ui/rating"
import { FaHeart } from "react-icons/fa6";
import { RiDislikeFill } from "react-icons/ri";
import { FaReact } from "react-icons/fa";
import styles from './Movies.module.css';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import MenuSort from '../MenuSort/MenuSort';
import Sidebar from '../Sidebar/Sidebar';
import { UserFetch } from '../UserFetch/UserFetch';
import { useLocation, useNavigate } from 'react-router-dom';

const Movies = ({filterOpen,searchValue}) => {

    const [movies, setMovies] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [prevFilteredMovies, setPrevFilteredMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [userEmail, setUserEmail] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [emptyPage, setEmptyPage] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const moviesToDisplay = location.pathname === '/user-favourite-movies'
    ? favoriteMovies
    : filteredMovies.length > 0
    ? filteredMovies
    : movies;

    // sortiranje
    const [isSorted, setIsSorted] = useState(false);
    const [sortValue, setSortValue] = useState('');

    const fetchFavouriteMovies = async (userEmail) => {
      try {
        const favoriteMoviesResponse = await axios.get(`http://localhost:5023/User/GetFavoriteMovies/${userEmail}`);
        setFavoriteMovies(favoriteMoviesResponse.data);
        if(favoriteMovies.length === 0) {
          setEmptyPage(true);
        }
      } catch (error) {
        console.error('Greska u pribavljanju omiljenih filmova', error);
      }
    };
    
    useEffect(() => {

      const userFetch = async () => {
        const userData = await UserFetch();
        if(userData) {
          setUserEmail(userData.Email);
          setIsLoggedIn(true);
          await fetchFavouriteMovies(userData.Email);
        } else {
          setUserEmail('');
          setIsLoggedIn(false);
        }  
      };
      userFetch();

      const fetchMovies = async () => {
        try {
          let url;
          if (isSorted) {
            if (sortValue.value === 'asc' || sortValue.value === 'desc') {
              url = `http://localhost:5023/Movie/GetMoviesAlphabeticalOrder/${sortValue.value === 'asc' ? true : false}/${currentPage}`;
            } else {
              url = `http://localhost:5023/Movie/GetMoviesYearOrder/${sortValue.value === 'yearLatest' ? true : false}/${currentPage}`;
            }
          } else {
            url = `http://localhost:5023/Movie/GetPageMovies/${currentPage}`;
          }
          const moviesResponse = await axios.get(url);
          if(filteredMovies.length > 0) {
            const listSearchedMovies = moviesResponse.data;
            const newFiltered = listSearchedMovies.filter((movie) =>
              prevFilteredMovies.some((filteredMovie) => filteredMovie.name === movie.name)
            );
            setFilteredMovies(newFiltered);
          } else {
            setMovies(moviesResponse.data);
          }
        } catch (error) {
          console.error('Greska u pribavljanju filmova.', error);
        }
      };
    
      const fetchSearchMovies = async () => {
        try {
          const searchResponse = await axios.get(`http://localhost:5023/Movie/GetMoviesSearch/${searchValue}/${currentPage}`);
          if(filteredMovies.length > 0) {
            const listSearchedMovies = searchResponse.data;
            const newFiltered = listSearchedMovies.filter((movie) =>
              filteredMovies.some((filteredMovie) => filteredMovie.name === movie.name)
            );
            setFilteredMovies(newFiltered);
          } else {
            setMovies(searchResponse.data);
          }
        } catch (error) {
          console.error('Greska u pretrazi filmova.', error);
        }
      };
    
      if (searchValue !== '') {
        fetchSearchMovies();
      } else {
        fetchMovies();
      }


    }, [currentPage, sortValue, searchValue, isSorted]);

      const handleImageClick = (src) => {
        setSelectedMovie(src); 
        setOverlayVisible(true); 
      };
    
      const handleCloseDialog = () => {
        setOverlayVisible(false); 
        setSelectedMovie(null); 
      };
    
      const getYouTubeVideoId = (url) => {
        const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      const handlePageChange = async (src) => {
        const newPage = Number(src.page);
        setCurrentPage(newPage);
        await new Promise(resolve => setTimeout(resolve, 500));  
        const element = document.getElementById("movies");
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      const handleAddToFavourites = async (movieName, email) => {
        try {
          const addToFavouritesResponse = await axios.post(`http://localhost:5023/User/AddFavoriteMovie/${movieName}/${email}`);
          if(addToFavouritesResponse.status === 200) {
            setFavoriteMovies([...favoriteMovies, movieName]);
            alert(`Film ${movieName} je uspešno dodat u listu omiljenih filmova.`);
            setOverlayVisible(false);
            navigate('/user-favourite-movies');
          } else {
            alert('Film je već dodat u listu omiljenih filmova.');
          }
        } catch (error) {
          console.error('Greska pri dodavanju filma u listu omiljenih filmova.');
        }
      };

      const handleRemoveFromFavorites = async (movieName, email) => {
        try {
          const removeFromFavoritesResponse = await axios.post(`http://localhost:5023/User/RemoveFavoriteMovie/${movieName}/${email}`);
          if (removeFromFavoritesResponse.status === 200) {
            const newFavoriteMovies = favoriteMovies.filter(movie => movie.name !== movieName);
            setFavoriteMovies(newFavoriteMovies);
            if(newFavoriteMovies.length === 0) {
              setEmptyPage(true);
            }
            setCurrentPage(1);
            alert(`Film ${movieName} je uspešno uklonjen sa liste omiljenih filmova.`);
            setOverlayVisible(false);
            
          } else {
            alert('Došlo je do greške pri uklanjanju filma iz liste omiljenih.');
          }
        } catch (error) {
          console.error('Greska pri uklanjanju filma iz liste omiljenih filmova.', error);
        }
      };

      const handleRating = async (movieName, rating) => {
        try {
          const newRating = rating.target.value * 2;
          const response = await axios.post(`http://localhost:5023/User/RateMovie/${movieName}/${userEmail}/${newRating}/OK`);
          if (response.status === 200) {
            setMovies(prevMovies => 
              prevMovies.map(movie => movie.name === movieName 
                ? { ...movie, rating: rating }
                : movie))

            alert('Uspešno ste ocenili film.');
            handleCloseDialog();
            setCurrentPage(1);
          } else {
            alert('Došlo je do greške pri ocenjivanju.');
          }
        } catch (error) {
          console.error('Greska pri ocenjivanju filma:', error);
        }
      };

    return (
        <>
        <div className={!filterOpen ? 'sekcije' : `${styles.filterSekcije}`}>
          {filterOpen && (
            <Sidebar type='movies' 
            setFilteredMovies={setFilteredMovies} 
            setPrevFilteredMovies={setPrevFilteredMovies}
            currentPage={currentPage} />
          )}
            <section id="movies" className={moviesToDisplay.length > 0 ? '' : `${styles.emptySection}`}>
              {moviesToDisplay.length > 0 ? (
                <>
                  <div className={`${styles.programOptionsContainer}`}>
                    <div className="home-text">
                      <p><strong>Filmovi:</strong></p>
                    </div>
                    <div className={`${styles.menuContainer}`}>
                      <MenuSort sortValue={sortValue} setSortValue={setSortValue} setIsSorted={setIsSorted}/>
                    </div>
                  </div>
                  <div className="items-container">
                    <div className="menu-container">
                      {moviesToDisplay.map((movie, index) => (
                        <div className="image-container" key={index} onClick={() => handleImageClick(movie)}> 
                          <Image
                            alt={movie.name} 
                            src={movie.image ? `data:image/jpeg;base64,${movie.image}` : ''}
                            style={{
                              width: '200px',
                              height: '300px',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {location.pathname !== '/user-favourite-movies' && (
                    <section id="pagination">
                      <PaginationRoot count={10} pageSize={2} defaultPage={1} size='md' onPageChange={handlePageChange} >
                        <HStack justify="center">
                          <PaginationPrevTrigger style={{backgroundColor :'#007bff'}} _hover={{color: 'black'}}/>
                          <PaginationItems style={{backgroundColor :'#007bff' , fontWeight: 'bold'}} _hover={{color: 'black'}} />
                          <PaginationNextTrigger style={{backgroundColor :'#007bff'}} _hover={{color: 'black'}}/>
                        </HStack>
                      </PaginationRoot>
                    </section>
                  )}
                </>
                ) : (
                  <>
                  {emptyPage && (
                    <>
                      {location.pathname === '/user' ? (
                        <Box mb={50} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div className="home-text">
                            <h2><strong>Stigli ste do kraja</strong></h2>
                        </div>
                        <Button
                          padding={3} 
                          backgroundColor='#007bff'
                          variant="solid"
                          _hover={{
                            bg: "#0056b3",
                            color: "white",
                            boxShadow: "md",
                            transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                          }}
                          onClick={() => setCurrentPage(1)}
                        >
                          <FaReact size='lg'/> Nazad na početnu stranicu
                        </Button>
                      </Box>
                      ) : (
                        <Box mb={50} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div className="home-text">
                            <h2><strong>Lista omiljenih filmova je prazna</strong></h2>
                        </div>
                        </Box>
                      )}
                    </>
                  )}
                  </>
                )}
            </section>
        </div> 

        {overlayVisible && selectedMovie && (
          <>
            <Box
              position="fixed"
              top="0"
              left="0"
              width="100%"
              height="100%"
              background="rgba(0, 0, 0, 0.7)"
              zIndex="overlay"
              onClick={handleCloseDialog}
              backdropFilter="blur(10px)"
            />

            {/*Dijalog*/}

            <DialogRoot placement="center" open={overlayVisible} size='sm'>
              <DialogContent 
                  bg="#1e1a1d" 
                  color="white" 
                  fontSize='16px' 
                  borderRadius="md" 
                  p="6" 
                  boxShadow="lg"
                  scrollBehavior="inside">
                <DialogBody pt="4">
                  <DialogTitle fontSize='20px'>{selectedMovie.name}</DialogTitle>
                  <AspectRatio ratio={4 / 3} rounded="lg" overflow="hidden" mt={4} mb={4}>
                    {selectedMovie.link && getYouTubeVideoId(selectedMovie.link) ? (
                      <iframe
                        title={selectedMovie.name}
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedMovie.link)}?autoplay=1`}
                        allowFullScreen
                        allow="autoplay"
                      />
                    ) : (
                      <p>Video nije dostupan</p>
                    )}
                  </AspectRatio>

                  <Box display="flex" justifyContent="space-between" mb="4">
                    <Box>
                      <strong>Godina produkcije:</strong> {selectedMovie.yearOfRelease}
                    </Box>
                    <Box>
                      <strong>Trajanje:</strong> {selectedMovie.duration} min
                    </Box>
                  </Box>

                  <Box mb="4">
                    <strong>Žanr:</strong> {selectedMovie.genre}
                  </Box>

                  <Box mb="4">
                    <strong>Ocena:</strong> {selectedMovie.avgScore}
                  </Box>

                  <Box mb="4">
                    {selectedMovie.description}
                  </Box>

                  {isLoggedIn && (
                    <HStack justify="space-between" align="center">
                      {location.pathname !== '/user-favourite-movies' ? (
                        <>
                          <Button 
                            padding={3} 
                            colorPalette="whiteAlpha" 
                            variant="solid"
                            _hover={{
                              bg: "gray.700",
                              color: "white",
                              boxShadow: "md",
                              transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                            }}
                            onClick={() => handleAddToFavourites(selectedMovie.name,userEmail)}
                            disabled={favoriteMovies.some(movie => movie.name === selectedMovie.name)}>
                            <FaHeart style={{color: 'red'}} /> Dodaj u omiljene
                          </Button>
                          <Rating 
                          size="lg" 
                          colorPalette='yellow' 
                          allowHalf 
                          defaultValue={3.5} 
                          mr={3} 
                          onChange={(newRating) => handleRating(selectedMovie.name, newRating)}/>
                        </>
                      ) : (
                        <Button 
                          padding={3} 
                          colorPalette="whiteAlpha" 
                          variant="solid"
                          _hover={{
                            bg: "gray.700",
                            color: "white",
                            boxShadow: "md",
                            transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                          }}
                          onClick={() => handleRemoveFromFavorites(selectedMovie.name, userEmail)}>
                          <RiDislikeFill style={{color: 'red'}} /> Ukloni iz omiljenih
                        </Button>
                      )}
                    </HStack>
                  )}
                </DialogBody>

                <DialogCloseTrigger
                  color="white"
                  _hover={{ bg: "gray.600" }}
                  onClick={handleCloseDialog}
                />
              </DialogContent>
            </DialogRoot>
          </>
        )}
    </>
    )
}

export default Movies