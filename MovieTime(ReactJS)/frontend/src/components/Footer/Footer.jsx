import React from 'react'
import styles from './Footer.module.css'

import {
    BsGithub,
    BsFacebook,
    BsInstagram,
    BsYoutube,
  } from "react-icons/bs";

const Footer = () => {
  return (
        <footer className={`${styles.footer}` } id="contact">
              <p style={{ fontWeight: "bold", marginRight: "10px" }}>Kontaktirajte nas:</p>
              <div className={`${styles.footer}`}>
                <a href="https://www.facebook.com">
                  <BsFacebook />
                </a>
                <a href="https://www.instagram.com">
                  <BsInstagram />
                </a>
                <a href="https://www.youtube.com">
                  <BsYoutube />
                </a>
                <a href="https://www.github.com">
                  <BsGithub />
                </a>
              </div>
        </footer>
    )
}

export default Footer