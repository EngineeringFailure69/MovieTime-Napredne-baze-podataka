import React from 'react'
import Movies from '../../components/Movies/Movies'

export const FavouriteMovies = ({filterOpen,searchValue}) => {
  return (
    <>
      <Movies filterOpen={filterOpen} searchValue={searchValue} />
    </>
  )
}
