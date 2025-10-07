import React, { useState, useRef, useEffect } from 'react'
import usePlacesAutocomplete from 'use-places-autocomplete';
import styles from './searchbar.module.css'

function SearchBar({ onSearch }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Autocomplete for Current Location
  const {
    ready: currentReady,
    value: currentValue,
    suggestions: { status: currentStatus, data: currentData },
    setValue: setCurrentValue,
    clearSuggestions: clearCurrentSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    requestOptions: { types: ['geocode'] }
  });

  // Autocomplete for Destination
  const {
    ready: destReady,
    value: destValue,
    suggestions: { status: destStatus, data: destData },
    setValue: setDestValue,
    clearSuggestions: clearDestSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    requestOptions: { types: ['geocode'] }
  });

  const expandedContainerRef = useRef(null)

  const handleSearchClick = () => {
    setIsExpanded(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(currentValue, destValue)
    }
    setIsExpanded(false)
    setCurrentValue('')
    setDestValue('')
  }

  const handleClose = () => {
    setIsExpanded(false)
    setCurrentValue('')
    setDestValue('')
  }

  const handleSelect = (field) => (address) => {
    const setValue = field === 'current' ? setCurrentValue : setDestValue;
    const clearSuggestions = field === 'current' ? clearCurrentSuggestions : clearDestSuggestions;
    setValue(address, false);
    clearSuggestions();
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
      <div className={styles.expandedContainer} ref={expandedContainerRef} style={{ width: 'calc(100% + 100px)', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} className={styles.form} style={{ position: 'relative' }}>
          <div className={styles.inputWrapper} style={{ zIndex: currentStatus === 'OK' ? 20 : 1 }}>
            <input
              type="text"
              placeholder="Current Location"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              disabled={!currentReady}
              className={styles.input}
              style={{ padding: '15px', fontSize: '16px' }}
              required
            />
            {currentStatus === 'OK' && (
              <ul className={styles.suggestions}>
                {currentData.map(({ place_id, description }) => (
                  <li key={place_id} onClick={() => handleSelect('current')(description)}>
                    {description}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.inputWrapper} style={{ zIndex: destStatus === 'OK' ? 20 : 1 }}>
            <input
              type="text"
              placeholder="Destination"
              value={destValue}
              onChange={(e) => setDestValue(e.target.value)}
              disabled={!destReady}
              className={styles.input}
              style={{ padding: '15px', fontSize: '16px' }}
              required
            />
            {destStatus === 'OK' && (
              <ul className={styles.suggestions}>
                {destData.map(({ place_id, description }) => (
                  <li key={place_id} onClick={() => handleSelect('destination')(description)}>
                    {description}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
        style={{ padding: '18px 20px', fontSize: '16px', width: 'calc(100% + 100px)', maxWidth: '600px' }}
        readOnly
      />
    </div>
  )
}

export default SearchBar
