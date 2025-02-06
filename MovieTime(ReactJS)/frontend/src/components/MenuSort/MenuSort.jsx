"use client"

import { Button } from "@/components/ui/button"
import {
  MenuContent,
  MenuRadioItem,
  MenuRadioItemGroup,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { useState } from "react"
import { HiSortAscending } from "react-icons/hi"

const MenuSort = ({ sortValue, setSortValue, setIsSorted }) => {
  
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          style={{
            backgroundColor: 'white',
            width: '120px',
            padding: '10px',
            marginRight: '35px',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <HiSortAscending />
          <span style={{ color: 'black', fontWeight: 'bold' }}>Sortiraj</span>
        </Button>
      </MenuTrigger>
      <MenuContent
        style={{
          padding: '10px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          minWidth: '180px',
          border: '1px solid #ccc',
        }}
      >
        <MenuRadioItemGroup
          value={sortValue}
          onValueChange={(value) => {
            setSortValue(value);
            setIsSorted(true);
          }}
          style={{ marginTop: '5px' }}
        >
          <MenuRadioItem
            value="asc"
            style={{
              fontSize: '16px',
              padding: '8px 30px',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginBottom: '5px',
              marginRight: '25px',
            }}
          >
            A-Z
          </MenuRadioItem>
          <MenuRadioItem
            value="desc"
            style={{
              fontSize: '16px',
              padding: '8px 30px',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginBottom: '5px',
              marginRight: '25px',
            }}
          >
            Z-A
          </MenuRadioItem>
          <MenuRadioItem
            value="yearLatest"
            style={{
              fontSize: '16px',
              padding: '8px 30px',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginBottom: '5px',
              marginRight: '25px',
            }}
          >
            Po godini najnovije
          </MenuRadioItem>
          <MenuRadioItem
            value="yearOldest"
            style={{
              fontSize: '16px',
              padding: '8px 30px',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginBottom: '5px',
              marginRight: '25px',
            }}
          >
            Po godini najstarije
          </MenuRadioItem>
        </MenuRadioItemGroup>
      </MenuContent>
    </MenuRoot>
  );
}

export default MenuSort;
