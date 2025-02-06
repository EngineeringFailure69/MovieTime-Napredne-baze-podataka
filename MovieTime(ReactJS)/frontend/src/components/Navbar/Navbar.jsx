import React, { useEffect, useState } from 'react';
import { BsList } from 'react-icons/bs'; 
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { HashLink } from 'react-router-hash-link';
import { LuClapperboard } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar"
import { UserFetch } from '../UserFetch/UserFetch';
import Search from '../Search/Search';

const Navbar = ({ setLoginDialogOpen, filterOpen, setFilterOpen, searchValue, setSearchValue }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userType, setUserType] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await UserFetch();
          setUser(userData);
          setUserType(userData.TypeOfUser);
        } catch (error) {
          console.error('Invalid token', error);
          setUser(null);
          setUserType('');
        }
      } else {
        setUser(null);
        setUserType('');
      }
    };

    fetchUser();

  }, [navigate]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    setMenuOpen(false);
    setLoginDialogOpen(true);
    setFilterOpen(false);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleFilterClick = () => {
    setFilterOpen(!filterOpen);
    setLoginDialogOpen(false);
  };

  const getMenuItems = () => {
    switch(userType) {
      case 'user':
        return (
          <>
              <li><HashLink to="/user" onClick={handleMenuClick}>Filmovi</HashLink></li>
              <li><HashLink to="/user-tvShows" onClick={handleMenuClick}>Serije</HashLink></li>
              <li><HashLink to="/user-favourite-movies" onClick={handleMenuClick}>Omiljeni filmovi</HashLink></li>
              <li><HashLink to="/user-favourite-tvShows" onClick={handleMenuClick}>Omiljene serije</HashLink></li>
              <li><HashLink to="/" onClick={handleLogout}>Odjava</HashLink></li>
              <li className={styles.avatarContainer}>
                  <Avatar
                    className={styles['avatar-padding']}
                    size="sm"
                    variant="subtle"
                    name={`${user?.FirstName || ''} ${user?.LastName || ''}`}
                  />
                  <span className={styles.userData}><strong>{user.FirstName} {user.LastName}</strong></span>
              </li>
          </>
        );
      case 'admin':
        return (
          <>
              <li><HashLink to="/admin" onClick={handleMenuClick}>Početna</HashLink></li>
              <li><HashLink to="/admin-actor" onClick={handleMenuClick}>Glumac</HashLink></li>
              <li><HashLink to="/admin-director" onClick={handleMenuClick}>Režiser</HashLink></li>
              <li><HashLink to="/admin-movie" onClick={handleMenuClick}>Film</HashLink></li>
              <li><HashLink to="/admin-tvShow" onClick={handleMenuClick}>Serija</HashLink></li>
              <li><HashLink to="/" onClick={handleLogout}>Odjava</HashLink></li>
          </>
        );
      default:
      return (
        <>
            <li><HashLink to="/" onClick={handleMenuClick}>Filmovi</HashLink></li>
            <li><HashLink to="/tvShows" onClick={handleMenuClick}>Serije</HashLink></li>
            <li><HashLink to="/" onClick={handleLoginClick}>Prijava</HashLink></li>
        </>
      );
    }
  };

  return (
    <header>
      <div className={`${styles.navbarOverlay}`}></div>

      <div className={`${styles.titleAndFilter}`}>
      <LuClapperboard
        className="filter-icon"
        style={{
          fontSize: '30px',
          cursor: 'pointer',
          color: filterOpen ? '#007bff' : 'white', 
          transition: 'color 0.3s ease, transform 0.3s ease',
          transform: filterOpen ? 'scale(1.2)' : 'scale(1)', 
        }}
        onClick={handleFilterClick}
      />
      <HashLink to="/" className="logo">
        MovieTime
      </HashLink>
      </div>
      <div className={`${styles.search}`}>
      <Search searchValue={searchValue} setSearchValue={setSearchValue} />
      </div>
      <div
        className={`${styles.burgerMenu} bx bx-menu ${menuOpen ? "open" : ""}`}
        id="menu-icon"
        onClick={toggleMenu}
      >
        <BsList className={`${styles.svgIcon}`} />
      </div>
      <ul className={menuOpen ? "navbar open" : "navbar"}>
        {getMenuItems()}
      </ul>
    </header>
  );
};

export default Navbar;
