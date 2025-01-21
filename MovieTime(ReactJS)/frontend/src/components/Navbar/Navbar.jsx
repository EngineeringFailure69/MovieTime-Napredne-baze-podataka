import React, { useEffect, useState } from 'react';
import { BsList } from 'react-icons/bs'; 
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { HashLink } from 'react-router-hash-link';
import { jwtDecode } from 'jwt-decode';

const Navbar = ({ setLoginDialogOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserType(decoded.TypeOfUser);
      } catch (error) {
        console.error('Invalid token', error);
        setUserType('');
      }
    } else {
      setUserType('');
    }
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
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const getMenuItems = () => {
    switch(userType) {
      case 'user':
        return (
          <>
              <li><HashLink to="/user#movies" onClick={handleMenuClick}>Filmovi</HashLink></li>
              <li><HashLink to="/user#tvshows" onClick={handleMenuClick}>Serije</HashLink></li>
              <li><HashLink to="/user-favourite-movies" onClick={handleMenuClick}>Omiljeni filmovi</HashLink></li>
              <li><HashLink to="/" onClick={handleLogout}>Odjava</HashLink></li>
          </>
        );
      case 'admin':
        return (
          <>
              <li><HashLink to="/admin" onClick={handleMenuClick}>Admin Panel</HashLink></li>
              <li><HashLink to="/" onClick={handleLogout}>Odjava</HashLink></li>
          </>
        );
      default:
      return (
        <>
            <li><HashLink to="#movies" onClick={handleMenuClick}>Filmovi</HashLink></li>
            <li><HashLink to="#tvshows" onClick={handleMenuClick}>Serije</HashLink></li>
            <li><HashLink to="#movies" onClick={handleLoginClick}>Prijava</HashLink></li>
        </>
      );
    }
  };

  return (
    <header>
      <div className={`${styles.navbarOverlay}`}></div>

      <HashLink to="#home" className="logo">
        MovieTime
      </HashLink>
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
