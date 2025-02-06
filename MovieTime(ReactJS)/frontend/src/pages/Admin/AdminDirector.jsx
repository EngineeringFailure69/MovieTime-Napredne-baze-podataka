import React, { useState } from 'react'
import { Text, Input, Box, Grid, VStack, HStack } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css';

export const AdminDirector = () => {
    const [currentAction, setCurrentAction] = useState('read');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [moviesMade, setMoviesMade] = useState(0);
    const [directors, setDirectors] = useState([]);

    // LINKDirector
    const [movieName, setMovieName] = useState('');
    const [tvShowName, setTvShowName] = useState('');

    const handleDateChange = (date) => {
        const formattedDate = new Date(date.target.value).toISOString();
        console.log(formattedDate); 
        setDateOfBirth(formattedDate);
    };

    const handleAddDirector = async () => {
        try {
          const response = await axios.post('http://localhost:5023/Director/AddDirector', {
            firstName,
            lastName,
            dateOfBirth,
            moviesMade: moviesMade
          });
    
          if (response.status === 200) {
            alert(`Uspešno dodavanje režisera ${firstName} ${lastName}`);
          }
        } catch (error) {
          console.error('Error adding Director:', error);
        }
      };
    
      const handleUpdateDirector = async () => {
        try {
          const response = await axios.post('http://localhost:5023/Director/UpdateDirector', {
            firstName,
            lastName,
            dateOfBirth,
            awards: awards
          });
    
          if (response.status === 200) {
            alert(`Uspešno ažuriranje režisera ${firstName} ${lastName}`);
          }
        } catch (error) {
          console.error('Error updating Director:', error);
        }
      };
    
      const handleGetDirectors = async () => {
        try {
        const response = await axios.get('http://localhost:5023/Director/GetAll');
        setDirectors(response.data);
        setCurrentAction('read');
    
        } catch (error) {
          console.error('Error fetching directors:', error);
        }
      };
    
      const handleDeleteDirector = async () => {
        try {
          const response = await axios.delete(`http://localhost:5023/Director/DeleteDirector/${firstName}/${lastName}`);
            if(response.status === 200) {
                alert(`Uspešno brisanje režisera ${firstName} ${lastName}`);
            }
        } catch (error) {
            console.error("Error deleting director.");
        }
      }
    
      const handleLinkDirectorToMovie = async () => {
        try {
          const response = await axios.post(`http://localhost:5023/Director/LinkDirectorToMovie/${firstName}/${lastName}/${movieName}`);
          if(response.status === 200) {
            alert(`Uspešno povezivanje režisera ${firstName} ${lastName} sa filmom: ${movieName}`);
          } else {
            alert(`Neuspešno povezivanje režisera ${firstName} ${lastName} sa filmom: ${movieName}`);
          }
          } catch (error) {
            console.error('Error linking director with movie:', error);
          }
      }
    
      const handleLinkDirectorToTVShow = async () => {
        try {
          const response = await axios.post(`http://localhost:5023/Director/LinkDirectorToTvShow/${firstName}/${lastName}/${tvShowName}`);
          if(response.status === 200) {
            alert(`Uspešno povezivanje režisera ${firstName} ${lastName} sa serijom: ${tvShowName}`);
          } else {
            alert(`Neuspešno povezivanje režisera ${firstName} ${lastName} sa serijom: ${tvShowName}`);
          }
          } catch (error) {
            console.error('Error linking actors with TVShow:', error);
          }
      }
    
      const renderContent = () => {
          switch (currentAction) {
            case 'create':
              return (
                <>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Ime režisera :</Text>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Prezime režisera :</Text>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Datum rođenja :</Text>
                      <Input 
                        type='date'
                        width='25%'
                        selected={dateOfBirth}
                        onChange={handleDateChange}
                        className="custom-datepicker"
                      />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Broj režisiranih filmova :</Text>
                    <Input
                      value={moviesMade}
                      onChange={(e) => setMoviesMade(e.target.value)}
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
                      onClick={handleAddDirector} 
                    >
                      Dodaj
                    </Button>
                  </HStack>
                </>
              );
            case 'read':
              return(
              <>
              {directors.map((director,index) => {
                  return <Text key={index} width="150px">{director.firstName} {director.lastName}</Text>
              })}
              </>
              );
            case 'update':
              return (
                  <>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Ime režisera :</Text>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Prezime režisera :</Text>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Datum rođenja :</Text>
                      <Input 
                        type='date'
                        width='25%'
                        selected={dateOfBirth}
                        onChange={handleDateChange}
                        className="custom-datepicker"
                      />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                    <Text width="150px">Broj režisiranih filmova :</Text>
                    <Input
                      value={moviesMade}
                      onChange={(e) => setMoviesMade(e.target.value)}
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
                      onClick={handleUpdateDirector} 
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
                    <Text width="150px">Ime režisera :</Text>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                  <Text width="150px">Prezime režisera :</Text>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
                      onClick={handleDeleteDirector} 
                    >    
                      Obriši
                    </Button>
                  </HStack>
                  </>
              );
            case 'linkDirectorToMovie':
              return (
                <>
                <HStack width="100%" spacing={4}>
                    <Text width="150px">Ime režisera :</Text>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                  <Text width="150px">Prezime režisera :</Text>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                  <Text width="150px">Ime filma :</Text>
                    <Input
                      value={movieName}
                      onChange={(e) => setMovieName(e.target.value)}
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
                      onClick={handleLinkDirectorToMovie} 
                    >
                      Poveži
                    </Button>
                  </HStack>
                </>
              );
            case 'linkDirectorToTVShow':
              return (
                <>
                <HStack width="100%" spacing={4}>
                    <Text width="150px">Ime režisera :</Text>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                  <Text width="150px">Prezime režisera :</Text>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      width="25%"
                      color='white'
                      p={3}
                      bg='#2a2629'
                    />
                  </HStack>
                  <HStack width="100%" spacing={4}>
                  <Text width="150px">Ime serije :</Text>
                    <Input
                      value={tvShowName}
                      onChange={(e) => setTvShowName(e.target.value)}
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
                      onClick={handleLinkDirectorToTVShow} 
                    >
                      Poveži
                    </Button>
                  </HStack>
                </>
              );
            default:
              return <Text>Izaberite akciju</Text>;
          }
        };
  return (
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
            Dodaj režisera
        </Button>
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
            onClick={() => setCurrentAction('linkDirectorToMovie')}
        >
            Poveži režisera sa filmom
        </Button>
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
            onClick={() => setCurrentAction('linkDirectorToTVShow')}
        >
            Poveži režisera sa serijom
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
            onClick={handleGetDirectors}
        >
            Vrati sve režisere
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
            Ažuriraj režisera
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
            Obriši režisera
        </Button>
        </Grid>
        <VStack mt={20} align="flex-start" spacing={4} gap={4}>
          {renderContent()}
        </VStack>
    </Box>
  )
}
