import React, { useState } from 'react'
import { Text, Input, Box, Grid, VStack, HStack } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css';

export const AdminActor = () => {
  const [currentAction, setCurrentAction] = useState('read');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [awards, setAwards] = useState(['']);
  const [awardsValue, setAwardsValue] = useState('');
  const [actors, setActors] = useState([]);

  // LINK
  const [movieName, setMovieName] = useState('');
  const [tvShowName, setTvShowName] = useState('');
  const [roleType, setRoleType] = useState('');

  const handleDateChange = (date) => {
    const formattedDate = new Date(date.target.value).toISOString();
    console.log(formattedDate); 
    setDateOfBirth(formattedDate);
  };

  const handleAddActor = async () => {
    try {
      const awardsArray = awardsValue.replace(/\s+/g, '').split(',');
      setAwards(awardsArray);
      const response = await axios.post('http://localhost:5023/Actor/AddActor', {
        firstName,
        lastName,
        dateOfBirth,
        awards: awards
      });

      if (response.status === 200) {
        alert(`Uspešno dodavanje glumca ${firstName} ${lastName}`);
      }
    } catch (error) {
      console.error('Error adding Actor:', error);
    }
  };

  const handleUpdateActor = async () => {
    try {
      const awardsArray = awardsValue.replace(/\s+/g, '').split(',');
      setAwards(awardsArray);
      const response = await axios.post('http://localhost:5023/Actor/UpdateActor', {
        firstName,
        lastName,
        dateOfBirth,
        awards: awards
      });

      if (response.status === 200) {
        alert(`Uspešno ažuriranje glumca ${firstName} ${lastName}`);
      }
    } catch (error) {
      console.error('Error updating Actor:', error);
    }
  };

  const handleGetActors = async () => {
    try {
    const response = await axios.get('http://localhost:5023/Actor/GetAll');
    setActors(response.data);
    setCurrentAction('read');

    } catch (error) {
      console.error('Error fetching actors:', error);
    }
  };

  const handleDeleteActor = async () => {
    try {
      const response = await axios.delete(`http://localhost:5023/Actor/DeleteActor/${firstName}/${lastName}`);
        if(response.status === 200) {
            alert(`Uspešno brisanje glumca ${firstName} ${lastName}`);
        }
    } catch (error) {
        console.error("Error deleting actor.");
    }
  }

  const handleLinkActorToMovie = async () => {
    try {
      const response = await axios.post(`http://localhost:5023/Actor/LinkActorToMovie/${firstName}/${lastName}/${movieName}/${roleType}`);
      if(response.status === 200) {
        alert(`Uspešno povezivanje glumca ${firstName} ${lastName} sa filmom: ${movieName}`);
      } else {
        alert(`Neuspešno povezivanje glumca ${firstName} ${lastName} sa filmom: ${movieName}`);
      }
      } catch (error) {
        console.error('Error linking actors with movie:', error);
      }
  }

  const handleLinkActorToTVShow = async () => {
    try {
      const response = await axios.post(`http://localhost:5023/Actor/LinkActorToTVShow/${firstName}/${lastName}/${tvShowName}/${roleType}`);
      if(response.status === 200) {
        alert(`Uspešno povezivanje glumca ${firstName} ${lastName} sa serijom: ${tvShowName}`);
      } else {
        alert(`Neuspešno povezivanje glumca ${firstName} ${lastName} sa serijom: ${tvShowName}`);
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
                <Text width="150px">Ime glumca :</Text>
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
                <Text width="150px">Prezime glumca :</Text>
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
                <Text width="150px">Nagrade :</Text>
                <Input
                  value={awardsValue}
                  onChange={(e) => setAwardsValue(e.target.value)}
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
                  onClick={handleAddActor} 
                >
                  Dodaj
                </Button>
              </HStack>
            </>
          );
        case 'read':
          return(
          <>
          {actors.map((actor,index) => {
              return <Text key={index} width="150px">{actor.firstName} {actor.lastName}</Text>
          })}
          </>
          );
        case 'update':
          return (
              <>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Ime glumca :</Text>
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
                <Text width="150px">Prezime glumca :</Text>
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
                <Text width="150px">Nagrade :</Text>
                <Input
                  value={awardsValue}
                  onChange={(e) => setAwardsValue(e.target.value)}
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
                  onClick={handleUpdateActor} 
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
                <Text width="150px">Ime glumca :</Text>
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
              <Text width="150px">Prezime glumca :</Text>
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
                  onClick={handleDeleteActor} 
                >
                  Obriši
                </Button>
              </HStack>
              </>
          );
        case 'linkActorToMovie':
          return (
            <>
            <HStack width="100%" spacing={4}>
                <Text width="150px">Ime glumca :</Text>
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
              <Text width="150px">Prezime glumca :</Text>
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
              <Text width="150px">Tip uloge :</Text>
                <Input
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
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
                  onClick={handleLinkActorToMovie} 
                >
                  Poveži
                </Button>
              </HStack>
            </>
          );
        case 'linkActorToTVShow':
          return (
            <>
            <HStack width="100%" spacing={4}>
                <Text width="150px">Ime glumca :</Text>
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
              <Text width="150px">Prezime glumca :</Text>
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
              <Text width="150px">Tip uloge :</Text>
                <Input
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
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
                  onClick={handleLinkActorToTVShow} 
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
              Dodaj glumca
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
              onClick={() => setCurrentAction('linkActorToMovie')}
            >
              Poveži glumca sa filmom
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
              onClick={() => setCurrentAction('linkActorToTVShow')}
            >
              Poveži glumca sa serijom
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
              onClick={handleGetActors}
            >
              Vrati sve glumce
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
              Ažuriraj glumca
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
              Obriši glumca
            </Button>
          </Grid>
          <VStack mt={20} align="flex-start" spacing={4} gap={4}>
            {renderContent()}
          </VStack>
        </Box>
  )
}
