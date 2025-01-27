import React from 'react'
import styles from './Sidebar.module.css'
import { Radio, RadioGroup } from "@/components/ui/radio"
import { AspectRatio, HStack } from "@chakra-ui/react"

const Sidebar = ({type}) => {
  return (
    <div className={`${styles.filterSection}`}>
                <div className="home-text">
                    <p><strong>Žanr</strong></p>
                  </div>
                <div className={`${styles.filterGenre}`}>
                <RadioGroup defaultValue="action" colorPalette='blue'>
                  <HStack gap="6" style={{display: 'flex', flexDirection: 'column', alignItems: 'start'}}>
                    <Radio value="action" colorScheme="blue">Akcija</Radio>
                    <Radio value="drama" >Drama</Radio>
                    <Radio value="fantasy" >Fantasy</Radio>
                    <Radio value="scifi" >Science Fiction</Radio>
                    <Radio value="thriller" >Thriller</Radio>
                    <Radio value="romance" >Romance</Radio>
                    <Radio value="adventure" >Adventure</Radio>
                    <Radio value="horror" >Horror</Radio>
                  </HStack>
                </RadioGroup>
              </div>
            </div>
  )
}

export default Sidebar