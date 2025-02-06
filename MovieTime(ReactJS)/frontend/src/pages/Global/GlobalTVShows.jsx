import React from 'react';
import LoginForm from '../../components/PrijavaForm/PrijavaForm';
import TVShows from '../../components/TVShows/TVShows';

export const GlobalTVShows = ({loginDialogOpen,setLoginDialogOpen,filterOpen,searchValue}) => {
  return (
    <>
        {loginDialogOpen && (
            <div className='prijava-container'>
                <LoginForm loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>
            </div>
        )}
        <TVShows filterOpen={filterOpen} searchValue={searchValue}/>
    </> 
  );
}
