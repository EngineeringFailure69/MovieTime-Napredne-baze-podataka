import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Box } from "@chakra-ui/react";
import { AspectRatio, HStack } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import { Rating } from "@/components/ui/rating"
import { FaHeart } from "react-icons/fa6";
import { RiDislikeFill } from "react-icons/ri";
import styles from './TVShows.module.css';
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

const TVShows = ({filterOpen,searchValue}) => {

  const [tvShows, setTvShows] = useState([]);
  const [favoriteTVShows, setFavoriteTVShows] = useState([]);
  const [prevFilteredTVShows, setPrevFilteredTVShows] = useState([]);
  const [filteredTVShows, setFilteredTVShows] = useState([]);
  const [selectedTVShow, setSelectedTVShow] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emptyPage, setEmptyPage] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const tvShowsToDisplay = location.pathname === '/user-favourite-tvShows'
  ? favoriteTVShows
    : filteredTVShows.length > 0
    ? filteredTVShows
    : tvShows;

  // sortiranje
  const [isSorted, setIsSorted] = useState(false);
  const [sortValue, setSortValue] = useState('');

  const fetchFavouriteTVShows = async (userEmail) => {
    try {
      const favoriteTVShowsResponse = await axios.get(`http://localhost:5023/User/GetFavoriteTVShows/${userEmail}`);
      setFavoriteTVShows(favoriteTVShowsResponse.data);
      if(favoriteTVShows.length === 0) {
        setEmptyPage(1);
      }
    } catch (error) {
      console.error('Greska u pribavljanju omiljenih serija', error);
    }
  };

  useEffect(() => {   
    const userFetch = async () => {
      const userData = await UserFetch();
      if(userData) {
        setUserEmail(userData.Email);
        setIsLoggedIn(true);
        await fetchFavouriteTVShows(userData.Email);
      } else {
        setUserEmail('');
        setIsLoggedIn(false);
      }  
    };
    userFetch();

    const fetchTVShows = async () => {
        try {
          let url;
          if(isSorted) {
              if(sortValue.value === 'asc' || sortValue.value === 'desc') {
                  url = `http://localhost:5023/TVShow/GetTVShowAlphabeticalOrder/${sortValue.value === 'asc' ? true : false}/${currentPage}`;
              } else {
                  url = `http://localhost:5023/TVShow/GetTVShowYearOrder/${sortValue.value === 'yearLatest' ? true : false}/${currentPage}`;
              }
          } else {
              url = `http://localhost:5023/TVShow/GetPageTVShows/${currentPage}`;
          }
          const tvShowsResponse = await axios.get(url);
          if(filteredTVShows.length > 0) {
            const listSearchedTVShows = tvShowsResponse.data;
            const newFiltered = listSearchedTVShows.filter((tvShow) =>
              prevFilteredTVShows.some((filteredTVShow) => filteredTVShow.name === tvShow.name)
            );
            setFilteredTVShows(newFiltered);
          } else {
            setTvShows(tvShowsResponse.data);
          }
        } catch (error) {
          console.error('Greska u pribavljanju serija.', error);
        }
      };

      const fetchSearchTVShows = async () => {
        try {
          const searchResponse = await axios.get(`http://localhost:5023/TVShow/GetTVShowSearch/${searchValue}/${currentPage}`);
          if(filteredTVShows.length > 0) {
            const listSearchedTVShows = searchResponse.data;
            const newFiltered = listSearchedTVShows.filter((tvShow) =>
              filteredTVShows.some((filteredTVShow) => filteredTVShow.name === tvShow.name)
            );
            setFilteredTVShows(newFiltered);
          } else {
            setMovies(searchResponse.data);
          }
        } catch (error) {
          console.error('Greska u pretrazi serija.', error);
        }
      };

      if (searchValue !== '') {
        fetchSearchTVShows();
      } else {
        fetchTVShows();
      }

  }, [currentPage, sortValue, searchValue, isSorted]);

  const handleImageClick = (src) => {
    setSelectedTVShow(src); 
    setOverlayVisible(true); 
  };

  const handleCloseDialog = () => {
    setOverlayVisible(false); 
    setSelectedTVShow(null); 
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
    const element = document.getElementById("tvShows");
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddToFavourites = async (tvShowName, email) => {
    try {
      const addToFavouritesResponse = await axios.post(`http://localhost:5023/User/AddFavoriteTVShow/${tvShowName}/${email}`);
      if(addToFavouritesResponse.status === 200) {
        console.log('Proso sam');
        setFavoriteTVShows([...favoriteTVShows, tvShowName]);
        alert(`Serija ${tvShowName} je uspešno dodata u listu omiljenih serija.`);
        setOverlayVisible(false);
        navigate('/user-favourite-tvShows');
      } else {
        alert('Serija je već dodata u listu omiljenih serija.');
      }
    } catch (error) {
      console.error('Greska pri dodavanju serije u listu omiljenih serija.');
    }
  };

  const handleRemoveFromFavorites = async (tvShowName, email) => {
    try {
      const removeFromFavoritesResponse = await axios.post(`http://localhost:5023/User/RemoveFavoriteTVShow/${tvShowName}/${email}`);
      if (removeFromFavoritesResponse.status === 200) {
        const newFavoriteTVShows = favoriteTVShows.filter(tvShow => tvShow.name !== tvShowName);
        setFavoriteTVShows(newFavoriteTVShows);
        if(newFavoriteTVShows.length === 0) {
          setEmptyPage(true);
        }
        setCurrentPage(1);
        alert(`Serija ${tvShowName} je uspešno uklonjena sa liste omiljenih serija.`);
        setOverlayVisible(false);
        
      } else {
        alert('Došlo je do greške pri uklanjanju serije iz liste omiljenih.');
      }
    } catch (error) {
      console.error('Greska pri uklanjanju serije iz liste omiljenih serija.', error);
    }
  };

  const handleRating = async (tvShowName, rating) => {
    try {
      const newRating = rating.target.value * 2;
      const response = await axios.post(`http://localhost:5023/User/RateTVShow/${tvShowName}/${userEmail}/${newRating}/OK`);
      if (response.status === 200) {
        setTvShows(prevTVShows => 
          prevTVShows.map(tvShow => tvShow.name === tvShowName 
            ? { ...tvShow, rating: rating }
            : tvShow))

        alert('Uspešno ste ocenili seriju.');
        handleCloseDialog();
        setCurrentPage(1);
      } else {
        alert('Došlo je do greške pri ocenjivanju.');
      }
    } catch (error) {
      console.error('Greska pri ocenjivanju serije:', error);
    }
  };

  return (
    <>
            <div className={!filterOpen ? 'sekcije' : `${styles.filterSekcije}`}>
              {filterOpen && (
                <Sidebar type='tvShows'
                 setFilteredTVShows={setFilteredTVShows}
                 setPrevFilteredTVShows={setPrevFilteredTVShows}
                 currentPage={currentPage} />
              )}
                <section id="tvshows" className={tvShowsToDisplay.length > 0 ? '' : `${styles.emptySection}`}>
                  {tvShowsToDisplay.length > 0 ? (
                  <>
                    <div className={`${styles.programOptionsContainer}`}>
                      <div className="home-text">
                        <p><strong>Serije:</strong></p>
                      </div>
                      <div className={`${styles.menuContainer}`}>
                        <MenuSort sortValue={sortValue} setSortValue={setSortValue} setIsSorted={setIsSorted}/>
                      </div>
                    </div>
                    <div className="items-container">
                      <div className="menu-container">
                        {tvShowsToDisplay.map((tvShow, index) => (
                          <div className="image-container" key={index} onClick={() => handleImageClick(tvShow)}>
                            <Image
                              alt={tvShow.name} 
                              src={tvShow.image ? `data:image/jpeg;base64,${tvShow.image}` : ''}
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
                    {location.pathname !== '/user-favourite-tvShows' && (
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
                          <h2><strong>Lista omiljenih serija je prazna</strong></h2>
                      </div>
                      </Box>
                    )}
                  </>
                )}
                </>
              )}
              </section>
            </div> 
    
            {overlayVisible && selectedTVShow && (
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
                      <DialogTitle fontSize='20px'>{selectedTVShow.name}</DialogTitle>
                      <AspectRatio ratio={4 / 3} rounded="lg" overflow="hidden" mt={4} mb={4}>
                        {selectedTVShow.link && getYouTubeVideoId(selectedTVShow.link) ? (
                          <iframe
                            title={selectedTVShow.name}
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedTVShow.link)}?autoplay=1`}
                            allowFullScreen
                            allow="autoplay"
                          />
                        ) : (
                          <p>Video nije dostupan</p>
                        )}
                      </AspectRatio>
    
                      <Box display="flex" justifyContent="space-between" mb="4">
                        <Box>
                          <strong>Godina produkcije:</strong> {selectedTVShow.yearOfRelease}
                        </Box>
                        <Box>
                          <strong>Broj sezona:</strong> {selectedTVShow.numOfSeasons}
                        </Box>
                      </Box>
    
                      <Box mb="4">
                        <strong>Žanr:</strong> {selectedTVShow.genre}
                      </Box>
    
                      <Box mb="4">
                        <strong>Ocena:</strong> {selectedTVShow.avgScore}
                      </Box>
    
                      <Box mb="4">
                        {selectedTVShow.description}
                      </Box>
                      
                      {isLoggedIn && (
                        <HStack justify="space-between" align="center">
                          {location.pathname !== '/user-favourite-tvShows' ? (
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
                                onClick={() => handleAddToFavourites(selectedTVShow.name,userEmail)}
                                disabled={favoriteTVShows.some(tvShow => tvShow.name === selectedTVShow.name)}>
                                <FaHeart style={{color: 'red'}} /> Dodaj u omiljene
                              </Button>
                              <Rating 
                              size="lg" 
                              colorPalette='yellow' 
                              allowHalf 
                              defaultValue={3.5} 
                              mr={3}
                              onChange={(newRating) => handleRating(selectedTVShow.name, newRating)} />
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
                                onClick={() => handleRemoveFromFavorites(selectedTVShow.name, userEmail)}>
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

export default TVShows