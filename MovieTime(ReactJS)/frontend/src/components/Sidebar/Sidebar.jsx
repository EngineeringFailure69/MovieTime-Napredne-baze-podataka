import React, { useEffect, useState } from 'react'
import styles from './Sidebar.module.css'
import { Radio, RadioGroup } from "@/components/ui/radio"
import { VStack, Input, Box, Button } from "@chakra-ui/react"
import axios from 'axios'

const Sidebar = ({type, setFilteredMovies, setPrevFilteredMovies, 
                        setFilteredTVShows, setPrevFilteredTVShows, 
                        currentPage}) => {

  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: '', 
    yearOfRelease: '', 
    grade: '', 
    actorFirstName: '', 
    actorLastName: '', 
    directorFirstName: '', 
    directorLastName: ''
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        let url;
        if(type === 'movies') {
          url = 'http://localhost:5023/Movie/GetAllUniqueGenres';
        } else {
          url = 'http://localhost:5023/TVShow/GetAllUniqueGenres';
        }
        const genresResponse = await axios.get(url);
        setGenres(genresResponse.data);
      } catch (err) {
        console.error("Greska u pribavljanju zanrova filmova ili serija.");
      }
    }

    fetchGenres();
  }, []);

  const handleConfirmFilters = async () => {
    try {
      const filterRequest = {
        genre: filters.genre ? filters.genre : null,  
        yearOfRelease: filters.yearOfRelease ? parseInt(filters.yearOfRelease) : null, 
        grade: filters.grade ? parseFloat(filters.grade) : null, 
        actorFirstName: filters.actorFirstName ? filters.actorFirstName : null,  
        actorLastName: filters.actorLastName ? filters.actorLastName : null,  
        directorFirstName: filters.directorFirstName ? filters.directorFirstName : null, 
        directorLastName: filters.directorLastName ? filters.directorLastName : null,
        page: currentPage
      };

      let url;
      if (type === 'movies') {
        url = 'http://localhost:5023/Movie/GetMoviesFilter';
      } else {
        url = 'http://localhost:5023/TVShow/GetTVShowFilter'; 
      }

      const response = await axios.get(url, { params: filterRequest });

      if (response.status === 200) {
        if (type === 'movies') {
          setFilteredMovies(response.data);
          setPrevFilteredMovies(response.data);
        } else {
          setFilteredTVShows(response.data);
          setPrevFilteredTVShows(response.data);
        }
      } else {
        console.error('Greška u odgovoru:', response.status);
      }
    } catch (err) {
      console.error('Greška u slanju filtera:', err);
    }
  };

  return (
    <div className={`${styles.filterSection}`}>
      <div className="home-text">
        <p><strong>Žanr</strong></p>
      </div>
      <div>
        <RadioGroup 
          onChange={(e) => setFilters(prevState => ({ ...prevState, genre: e.target.value }))} 
          colorPalette='blue'>
          <VStack gap="4" style={{ alignItems: 'start' }}>
            {genres.map((genre) => (
              <Radio key={genre} value={genre} colorScheme="blue">{genre}</Radio>
            ))}
          </VStack>
        </RadioGroup>
      </div>
      
      <VStack gap='4' style={{ alignItems: 'start', marginTop: '20px', width: '100%' }}>
        <Box style={{ fontWeight: 'bold', fontSize: '18px' }}>Godina</Box>
        <Input 
          placeholder="Unesite godinu"
          value={filters.yearOfRelease}
          onChange={(e) => setFilters(prevState => ({
            ...prevState,
            yearOfRelease: e.target.value
          }))}
          style={{
            padding: '5px',
            color: 'white',
            backgroundColor: '#2a2629',
            width: '100%'
          }} 
          _placeholder={{ color: "#888888" }}
        />
      </VStack>

      <VStack gap='4' style={{ alignItems: 'start', marginTop: '20px', width: '100%' }}>
        <Box style={{ fontWeight: 'bold', fontSize: '18px' }}>Minimalna ocena</Box>
        <Input 
          placeholder="Unesite ocenu"
          value={filters.grade}
          onChange={(e) => setFilters(prevState => ({
            ...prevState,
            grade: e.target.value
          }))}
          style={{
            padding: '5px',
            color: 'white',
            backgroundColor: '#2a2629',
            width: '100%'
          }} 
          _placeholder={{ color: "#888888" }}
        />
      </VStack>

      <VStack gap='4' style={{ alignItems: 'start', marginTop: '20px', width: '100%' }}>
        <Box style={{ fontWeight: 'bold', fontSize: '18px' }}>Glumac</Box>
        <Input 
          placeholder="Unesite ime"
          value={filters.actorFirstName}
          onChange={(e) => setFilters(prevState => ({
            ...prevState,
            actorFirstName: e.target.value
          }))}
          style={{
            padding: '5px',
            color: 'white',
            backgroundColor: '#2a2629',
            width: '100%'
          }} 
          _placeholder={{ color: "#888888" }}
        />
        <Input 
          placeholder="Unesite prezime"
          value={filters.actorLastName}
          onChange={(e) => setFilters(prevState => ({
            ...prevState,
            actorLastName: e.target.value
          }))}
          style={{
            padding: '5px',
            color: 'white',
            backgroundColor: '#2a2629',
            width: '100%'
          }} 
          _placeholder={{ color: "#888888" }}
        />
      </VStack>

      <VStack gap='4' style={{ alignItems: 'start', marginTop: '20px', width: '100%' }}>
        <Box style={{ fontWeight: 'bold', fontSize: '18px' }}>Režiser</Box>
        <Input 
          placeholder="Unesite ime"
          value={filters.directorFirstName}
          onChange={(e) => setFilters(prevState => ({
            ...prevState,
            directorFirstName: e.target.value
          }))}
          style={{
            padding: '5px',
            color: 'white',
            backgroundColor: '#2a2629',
            width: '100%'
          }} 
          _placeholder={{ color: "#888888" }}
        />
        <Input 
          placeholder="Unesite prezime"
          value={filters.directorLastName}
          onChange={(e) => setFilters(prevState => ({
            ...prevState,
            directorLastName: e.target.value
          }))}
          style={{
            padding: '5px',
            color: 'white',
            backgroundColor: '#2a2629',
            width: '100%'
          }} 
          _placeholder={{ color: "#888888" }}
        />
      </VStack>

      <Button
        w='100%'
        marginTop={10}
        padding={3} 
        backgroundColor='#007bff'
        variant="solid"
        _hover={{
          bg: "#0056b3",
          color: "white",
          boxShadow: "md",
          transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
        }}
        onClick={handleConfirmFilters}
      >
        Primeni filtere
      </Button>
    </div>
  )
}

export default Sidebar;
