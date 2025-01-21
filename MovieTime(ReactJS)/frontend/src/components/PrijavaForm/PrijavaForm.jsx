import React, { useState } from 'react';
import { Input, Button, Stack, Box, Text, HStack} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Radio, RadioGroup } from "@/components/ui/radio"
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';


const LoginForm = ({ loginDialogOpen, setLoginDialogOpen }) => {
  const [email, setEmail] = useState('');
  const [ime, setIme] = useState('');
  const [prezime, setPrezime] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState("user");
  const [error, setError] = useState('');
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    console.log(email);
    console.log(password);
  
    if (!email || !password) {
      setError('Sva polja su obavezna!');
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:5023/User/Login/${email}/${password}`
      );
  
      if (response.status === 200) {
        setLoginDialogOpen(false);
        const token = response.data;
        console.log(token);
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        const {TypeOfUser} = decoded;

        if(TypeOfUser === 'user') {
          navigate('/user');
        } else if (TypeOfUser === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Došlo je do greške prilikom prijavljivanja.');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
  
    if (!ime || !prezime || !email || !password) {
      setError('Sva polja su obavezna!');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5023/User/Register', {
        firstName: ime,
        lastName: prezime,
        email : email,
        password : password,
        typeOfUser : role
      });
      console.log(response.data);
      setRegisterDialogOpen(false);
      setIme('');
      setPrezime('');
      setEmail('');
      setPassword('');
      setError('');
    } catch (error) {
      setError(error.response?.data || 'Greška pri registraciji!');
    }
  };

  const handleChangeToLogin = (e) => {

    setIme('');
    setPrezime('');
    setEmail('');
    setPassword('');
    setRole('');

    e.preventDefault();
    setError('');
    setRegisterDialogOpen(false);
  };

  const handleChangeToRegistration = (e) => {

    setIme('');
    setPrezime('');
    setEmail('');
    setPassword('');


    e.preventDefault();
    setError('');
    setRegisterDialogOpen(true);
  };

  const handleOnChange = (event) => {
    const value = event.target.value;
    setRole(value);
  };

  return (
    <>
      {loginDialogOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          background="rgba(0, 0, 0, 0.5)"
          backdropBlur="10px"
          zIndex="overlay"
          onClick={() => setLoginDialogOpen(false)}
        />
      )}

      {loginDialogOpen && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          minWidth={370}
          transform="translate(-50%, -50%)"
          p={6}
          maxW="sm"
          borderWidth={1}
          borderRadius="md"
          boxShadow="lg"
          background="white"
          zIndex="modal"
        >
          
          {(loginDialogOpen && !registerDialogOpen) && <form onSubmit={handleLoginSubmit}>
            <Stack spacing={4}>
              <Box textAlign="center">
                <Text fontWeight="bold" color="black" fontSize="2xl">
                  Login
                </Text>
                <Box
                  height="2px"
                  width="50%"
                  background="black"
                  margin="10px auto"
                />
              </Box>

              <Box>
                <Input
                  id="email"
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Unesite email"
                  padding="10px"
                  color="black"
                />
                {error && !email && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  id="password"
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Unesite lozinku"
                  padding="10px"
                  color="black"
                />
                {error && !password && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Box>
              
              <Button colorScheme="blue" type="submit" width="full" mt={4}>
                Prijavi se
              </Button>
              <Button colorScheme="blue" width="full" mt={4} onClick={handleChangeToRegistration}>
                  Registrujte se
              </Button>
            </Stack>
          </form>}

          {(loginDialogOpen && registerDialogOpen) && <form onSubmit={handleRegisterSubmit}>
            <Stack spacing={4}>
              <Box textAlign="center">
                <Text fontWeight="bold" color="black" fontSize="2xl">
                  Register
                </Text>
                <Box
                  height="2px"
                  width="50%"
                  background="black"
                  margin="10px auto"
                />
              </Box>

              <Box>
                <Input
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  padding="10px"
                  color="black"
                  placeholder="Unesite ime"
                />
                {error && !ime && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  value={prezime}
                  onChange={(e) => setPrezime(e.target.value)}
                  padding="10px"
                  color="black"
                  placeholder="Unesite prezime"
                />
                {error && !prezime && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  id="email"
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Unesite email"
                  padding="10px"
                  color="black"
                />
                {error && !email && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Unesite lozinku"
                  padding="10px"
                  color="black"
                />
                {error && !password && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Box>

              <RadioGroup defaultValue="user" onChange={handleOnChange}>
                <HStack gap="6">
                  <Radio value="user" color="black">Korisnik</Radio>
                  <Radio value="admin" color="black">Admin</Radio>
                </HStack>
              </RadioGroup>
              
              <Button colorScheme="blue" width="full" mt={4} w={320} type='submit' mb={3}>
                  Registrujte se
              </Button>
              <Button colorScheme="blue" type="submit" width="full" onClick={handleChangeToLogin} w={320}>
                  Prijavi se
              </Button>
            </Stack>
          </form>}
        </Box>
      )}
    </>
  );
};

export default LoginForm;
