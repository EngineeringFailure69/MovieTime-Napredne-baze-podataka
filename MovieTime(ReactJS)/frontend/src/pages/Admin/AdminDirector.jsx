import React from 'react'
import { Text, Input, Box, Grid } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"

export const AdminDirector = () => {
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
            Create
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
            onClick={() => setCurrentAction('create')}
        >
            Read
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
            Update
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
            Delete
        </Button>
        </Grid>
    </Box>
  )
}
