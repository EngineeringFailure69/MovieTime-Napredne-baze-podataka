import { Button } from "@/components/ui/button"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuTriggerItem,
} from "@/components/ui/menu"
import { MdFilterAlt } from "react-icons/md";

const MenuFilter = () => {
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
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',  // Blaga senka
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <MdFilterAlt /> <span style={{ color: 'black', fontWeight: 'bold' }}>Filtriraj</span>
        </Button>
      </MenuTrigger>
      <MenuContent
        style={{
          padding: '10px',
          backgroundColor: '#ffffff',
          borderRadius: '8px', 
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',  // Senka
          minWidth: '180px',
          border: '1px solid #ccc',
        }}
      >
        {/* Žanr */}
        <MenuRoot positioning={{ placement: "right-start", gutter: 10 }}>
          <MenuTriggerItem
            value="open-recent"
            style={{
              fontSize: '16px',
              padding: '8px 16px',
              fontWeight: '500',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginBottom: '5px',
              marginRight: '25px',
            }}
          >
            Žanr
          </MenuTriggerItem>
          <MenuContent>
            <MenuItem
              value="panda"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Panda
            </MenuItem>
            <MenuItem
              value="ark"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Ark UI
            </MenuItem>
            <MenuItem
              value="chakra"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Chakra v3
            </MenuItem>
          </MenuContent>
        </MenuRoot>

        {/* Godina */}
        <MenuRoot positioning={{ placement: "right-start", gutter: 10 }}>
          <MenuTriggerItem
            value="open-recent"
            style={{
              fontSize: '16px',
              padding: '8px 16px',
              fontWeight: '500',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginBottom: '5px',
              marginRight: '25px',
            }}
          >
            Godina
          </MenuTriggerItem>
          <MenuContent>
            <MenuItem
              value="panda"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Panda
            </MenuItem>
            <MenuItem
              value="ark"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Ark UI
            </MenuItem>
            <MenuItem
              value="chakra"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Chakra v3
            </MenuItem>
          </MenuContent>
        </MenuRoot>

        {/* Ocena */}
        <MenuRoot positioning={{ placement: "right-start", gutter: 10 }}>
          <MenuTriggerItem
            value="open-recent"
            style={{
              fontSize: '16px',
              padding: '8px 16px',
              fontWeight: '500',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginBottom: '5px',
              marginRight: '25px',
            }}
          >
            Ocena
          </MenuTriggerItem>
          <MenuContent>
            <MenuItem
              value="panda"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Panda
            </MenuItem>
            <MenuItem
              value="ark"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Ark UI
            </MenuItem>
            <MenuItem
              value="chakra"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                marginBottom: '5px',
                marginRight: '25px',
              }}
            >
              Chakra v3
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </MenuContent>
    </MenuRoot>
  )
}

export default MenuFilter
