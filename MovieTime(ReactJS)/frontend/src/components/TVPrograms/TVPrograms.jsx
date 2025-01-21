import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Image, Box } from "@chakra-ui/react";
import { AspectRatio, HStack } from "@chakra-ui/react"
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


const TVPrograms = () => {
    const [movies, setMovies] = useState([]);
    const [tvShows, setTvShows] = useState([]);
    const [selectedTVProgram, setSelectedTVProgram] = useState(null);
    const [programType, setProgramType] = useState('');
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); 

    const navigate = useNavigate();

    useEffect(() => {   
        const fetchTVPrograms = async () => {
          try {
            const moviesResponse = await axios.get(`http://localhost:5023/Movie/GetPageMovies/${currentPage}`);
            setMovies(moviesResponse.data);
    
            const tvShowsResponse = await axios.get('http://localhost:5023/TVShow/GetAll');
            setTvShows(tvShowsResponse.data);
          } catch (error) {
            console.error('Greska u pribavljanju filmova ili serija.', error);
          }
        };
    
        fetchTVPrograms();

      }, [currentPage]);

      const handleImageClick = (src, type) => {
        setSelectedTVProgram(src); 
        setOverlayVisible(true); 
        setProgramType(type);
      };
    
      const handleCloseDialog = () => {
        setOverlayVisible(false); 
        setSelectedTVProgram(null); 
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
  
      return (
        <>
            <div className='sekcije'>
              <section id="movies">
              <div className="home-text">
                <p><strong>Filmovi:</strong></p>
              </div>
                <div className="items-container">
                  <div className="menu-container">
                    {movies.map((movie, index) => (
                      <div className="image-container" key={index} onClick={() => handleImageClick(movie,'movie')}> 
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
              </section>
              <section id="tvshows">
              <div className="home-text">
                <p><strong>Serije:</strong></p>
              </div>
                <div className="items-container">
                  <div className="menu-container">
                    {tvShows.map((tvShow, index) => (
                      <div className="image-container" key={index} onClick={() => handleImageClick(tvShow,'tvShow')}>
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
              </section>
              <section id="pagination">
                <PaginationRoot count={10} pageSize={2} defaultPage={1} size='md' onPageChange={handlePageChange} >
                  <HStack justify="center">
                    <PaginationPrevTrigger style={{backgroundColor :'#007bff'}} _hover={{color: 'black'}}/>
                    <PaginationItems style={{backgroundColor :'#007bff' , fontWeight: 'bold'}} _hover={{color: 'black'}} />
                    <PaginationNextTrigger style={{backgroundColor :'#007bff'}} _hover={{color: 'black'}}/>
                  </HStack>
                </PaginationRoot>
              </section>
            </div> 
    
            {overlayVisible && selectedTVProgram && (
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
                      <DialogTitle fontSize='20px'>{selectedTVProgram.name}</DialogTitle>
                      <AspectRatio ratio={4 / 3} rounded="lg" overflow="hidden" mt={4} mb={4}>
                        {selectedTVProgram.link && getYouTubeVideoId(selectedTVProgram.link) ? (
                          <iframe
                            title={selectedTVProgram.name}
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedTVProgram.link)}?autoplay=1`}
                            allowFullScreen
                            allow="autoplay"
                          />
                        ) : (
                          <p>Video nije dostupan</p>
                        )}
                      </AspectRatio>
    
                      <Box display="flex" justifyContent="space-between" mb="4">
                        <Box>
                          <strong>Godina produkcije:</strong> {selectedTVProgram.yearOfRelease}
                        </Box>
                        {programType === 'movie' ? (
                          <Box>
                            <strong>Trajanje:</strong> {selectedTVProgram.duration} min
                          </Box>
                        ) : programType === 'tvShow' ? (
                          <Box>
                            <strong>Broj sezona:</strong> {selectedTVProgram.numOfSeasons}
                          </Box>
                        ) : null}
                      </Box>
    
                      <Box mb="4">
                        <strong>Žanr:</strong> {selectedTVProgram.genre}
                      </Box>
    
                      <Box mb="4">
                        <strong>Ocena:</strong> {selectedTVProgram.avgScore}
                      </Box>
    
                      <Box mb="4">
                        {selectedTVProgram.description}
                      </Box>
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
      );
}

export default TVPrograms