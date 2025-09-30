import React, { useState, useRef, useEffect } from 'react'
import styles from './searchbar.module.css'

function searchbar({ onSearch }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState('')
  const [destination, setDestination] = useState('')
  const expandedContainerRef = useRef(null)

  const handleSearchClick = () => {
    setIsExpanded(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(currentLocation, destination)
    }
    setIsExpanded(false)
    setCurrentLocation('')
    setDestination('')
  }

  const handleClose = () => {
    setIsExpanded(false)
    setCurrentLocation('')
    setDestination('')
  }

  // Handle clicks outside the expanded container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedContainerRef.current && !expandedContainerRef.current.contains(event.target)) {
        handleClose()
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  if (isExpanded) {
    return (
      <div className={styles.expandedContainer} ref={expandedContainerRef}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Current Location"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>Search</button>
          {/* <button type="button" onClick={handleClose} className={styles.closeButton}>×</button> */}
        </form>
      </div>
    )
  }

  return (
    <div>
        <input
          type="text"
          placeholder='Find bus'
          className={styles.searchbar}
          onClick={handleSearchClick}
          readOnly
        />
    </div>
  )
}

export default searchbar
