import React from 'react'
import TVShows from '../../components/TVShows/TVShows'

export const UserTVShows = ({filterOpen,searchValue}) => {
  return (
    <>
        <TVShows filterOpen={filterOpen} searchValue={searchValue}/>
    </>
  )
}
