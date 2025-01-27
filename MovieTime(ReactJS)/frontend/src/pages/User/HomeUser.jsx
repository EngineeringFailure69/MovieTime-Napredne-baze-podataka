import React, { useState } from 'react'
import Movies from '../../components/Movies/Movies'

export const HomeUser = ({filterOpen,searchValue}) => {

  return (
    <>
      <Movies filterOpen={filterOpen} searchValue={searchValue}/>
    </>
  )
}
