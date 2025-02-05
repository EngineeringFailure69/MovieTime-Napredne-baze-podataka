import React, { useState } from 'react'
import { Text, Input, Box, Grid, VStack, HStack } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import axios from 'axios'

export const AdminMovie = () => {
  const [currentAction, setCurrentAction] = useState('read');
  
  // CREATE / UPDATE
  const [duration, setDuration] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState(null);
  // READ
  const [movies, setMovies] = useState([]); 

  const handleFileChange = (event) => {
    const { value, files } = event.target;
    setImage(files ? files[0] : value);
  }

  const handleAddMovie = async () => {
    try {
      const formData = new FormData();
      
      formData.append('Duration', parseInt(duration));
      formData.append('Name', title);
      formData.append('YearOfRelease', parseInt(year));
      formData.append('Genre', genre);
      formData.append('AvgScore', parseFloat(rating));
      formData.append('Description', description);
      formData.append('Link', link);
      
      if (image) {
        formData.append('image', image);
      }

      console.log(formData);

      const response = await axios.post('http://localhost:5023/Movie/AddMovie', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response.data);
      if (response.status === 200) {
        alert(`Uspešno dodavanje filma ${title}`);
      }
    } catch (error) {
      console.error('Error adding Movie:', error);
    }
  };

  const handleUpdateMovie = async () => {
    try {
      const formData = new FormData();
      
      formData.append('Duration', parseInt(seasons));
      formData.append('Name', title);
      formData.append('YearOfRelease', parseInt(year));
      formData.append('Genre', genre);
      formData.append('AvgScore', parseFloat(rating));
      formData.append('Description', description);
      formData.append('Link', link);
      
      if (image) {
        formData.append('image', image);
      }

      console.log(formData);

      const response = await axios.put('http://localhost:5023/Movie/UpdateMovie', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response.data);
      if (response.status === 200) {
        alert(`Uspešno ažuriranje filma ${title}`);

      }
    } catch (error) {
      console.error('Error updating Movie:', error);
    }
  };

  const handleGetMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5023/Movie/GetPageMovies/1'); 
      setMovies(response.data); 
      setCurrentAction('read'); 
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleDeleteMovie = async () => {
    try {
        const response = await axios.delete(`http://localhost:5023/Movie/DeleteMovie/${title}`);
        if(response.status === 200) {
            alert(`Uspešno brisanje filma ${title}`);
        }
    } catch (error) {
        console.error("Error deleting movie.");
    }
  }

  const renderContent = () => {
      switch (currentAction) {
        case 'create':
          return (
            <>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Trajanje filma :</Text>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Naziv filma :</Text>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Godina produkcije :</Text>
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Žanr :</Text>
                <Input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Prosečna ocena :</Text>
                <Input
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Opis filma :</Text>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Link :</Text>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Slika :</Text>
                <Input 
                  type="file" 
                  id="dodatni-input" 
                  accept=".jpg" 
                  width='25%'
                  bg='#2a2629'
                  name="dodatniInput" 
                  onChange={handleFileChange}
              />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Button
                  padding={3}
                  backgroundColor='#007bff'
                  width='200px'
                  variant="solid"
                  _hover={{
                    bg: "#0056b3",
                    color: "white",
                    boxShadow: "md",
                    transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onClick={handleAddMovie} 
                >
                  Dodaj
                </Button>
              </HStack>
            </>
          );
        case 'read':
          return(
          <>
          {movies.map((movie) => {
              return <Text key={movie.name} width="150px">{movie.name}</Text>
          })}
          </>
          );
        case 'update':
          return (
              <>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Trajanje filma :</Text>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Naziv filma :</Text>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Godina produkcije :</Text>
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Žanr :</Text>
                <Input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Prosečna ocena :</Text>
                <Input
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Opis filma :</Text>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Link :</Text>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Slika :</Text>
                <Input 
                  type="file" 
                  id="dodatni-input" 
                  accept=".jpg" 
                  width='25%'
                  bg='#2a2629'
                  name="dodatniInput" 
                  onChange={handleFileChange}
              />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Button
                  padding={3}
                  backgroundColor='#007bff'
                  width='200px'
                  variant="solid"
                  _hover={{
                    bg: "#0056b3",
                    color: "white",
                    boxShadow: "md",
                    transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onClick={handleUpdateMovie} 
                >
                  Ažuriraj
                </Button>
              </HStack>
            </>
          );
        case 'delete':
          return (
              <>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Naziv filma :</Text>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Button
                  padding={3}
                  backgroundColor='#007bff'
                  width='200px'
                  variant="solid"
                  _hover={{
                    bg: "#0056b3",
                    color: "white",
                    boxShadow: "md",
                    transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onClick={handleDeleteMovie} 
                >
                  Obriši
                </Button>
              </HStack>
              </>
          );
        default:
          return <Text>Izaberite akciju</Text>;
      }
    };
    
  return (
    <div className='sekcije'>
    <Box padding={20}>
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
        <Button
          padding={3}
          colorPalette="green"
          variant="solid"
          _hover={{
            bg: 'dark-green',
            color: 'white',
            boxShadow: 'md',
            transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
          }}
          onClick={() => setCurrentAction('create')}
        >
          Dodaj film
        </Button>
        <Button 
          padding={3}
          colorPalette="blue"
          variant="solid"
          _hover={{
            bg: 'dark-blue',
            color: 'white',
            boxShadow: 'md',
            transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
          }}
          onClick={handleGetMovies}
        >
          Vrati prvih 10
        </Button>
        <Button
          padding={3}
          backgroundColor='#fca130'
          variant="solid"
          _hover={{
            bg: '#e58f28 ',
            color: 'white',
            boxShadow: 'md',
            transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
          }}
          onClick={() => setCurrentAction('update')}
        >
          Ažuriraj film
        </Button>
        <Button 
          padding={3}
          colorPalette="red"
          variant="solid"
          _hover={{
            bg: 'dark-red',
            color: 'white',
            boxShadow: 'md',
            transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
          }}
          onClick={() => setCurrentAction('delete')}
        >
          Obriši film
        </Button>
      </Grid>
      <VStack mt={20} align="flex-start" spacing={4} gap={4}>
        {renderContent()}
      </VStack>
    </Box>
    </div>
  )
}
