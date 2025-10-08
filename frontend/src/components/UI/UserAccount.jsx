import React, { useState } from 'react'
import styles from './UserAccount.module.css';

function Account({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
  } 

  const handleLogout = () => {
    console.log('Logout clicked')
    setIsOpen(false)
    if (onLogout) {
      onLogout()
    } else {
      // Fallback logout logic
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <img
        src="https://cdn.pixabay.com/photo/2020/05/11/15/38/tom-5158824_1280.png"
        alt="Account"
        className={styles.logo}
        onClick={handleClick}
      />
      {isOpen && (
        <div className={styles.sidebar}>
          <img
            src="https://cdn.pixabay.com/photo/2020/05/11/15/38/tom-5158824_1280.png"
            alt="Profile"
            className={styles.profilePicture}
          />
          <hr style={{ width: '100%', margin: '10px 0' }} />
          <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>
      )}
    </>
  )
}

export default Account
