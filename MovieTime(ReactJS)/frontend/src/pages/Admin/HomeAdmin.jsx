import { Box } from "@chakra-ui/react"

export const HomeAdmin = () => {
  return (
    <Box 
      mb={50} 
      style={{
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',  
        height: '100vh', 
      }}
    >
      <div className="home-text">
        <h2><strong>Dobrodošli na Admin stranicu</strong></h2>
      </div>
    </Box>
  )
}
