import React from 'react'
import TVShows from '../../components/TVShows/TVShows'

export const FavouriteTVShows = ({filterOpen,searchValue}) => {
  return (
    <>
      <TVShows filterOpen={filterOpen} searchValue={searchValue} />
    </>
  )
}
