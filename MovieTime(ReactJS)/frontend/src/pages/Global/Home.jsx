import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/PrijavaForm/PrijavaForm';
import { jwtDecode } from 'jwt-decode';
import Movies from '../../components/Movies/Movies';

export const Home = ({loginDialogOpen,setLoginDialogOpen,filterOpen,searchValue}) => {

  const navigate = useNavigate();

  useEffect(() => {

    const redirectToCorrectPage = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const { TypeOfUser, exp } = decoded;

        if (exp * 1000 < Date.now()) {
          localStorage.removeItem('token'); 
          return;
        }

        switch (TypeOfUser) {
          case 'user':
            navigate('/user');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Invalid token', error);
      }
    };

    redirectToCorrectPage();
  }, [navigate]);

  return (
    <>
        {loginDialogOpen && (
            <div className='prijava-container'>
                <LoginForm loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>
            </div>
        )}
        <Movies filterOpen={filterOpen} searchValue={searchValue}/>
    </> 
  );
}
