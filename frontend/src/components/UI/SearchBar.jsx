import React, { useState, useRef, useEffect } from 'react'
import styles from './SearchBar.module.css'

function SearchBar({ onSearch, onFindMyBus }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchMode, setSearchMode] = useState('route') // 'route' or 'find'
  const [currentLocation, setCurrentLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [findMyBusQuery, setFindMyBusQuery] = useState('')
  const [findSearchType, setFindSearchType] = useState('number') // 'number' or 'route'
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const [recentRouteSearches, setRecentRouteSearches] = useState([])
  const [recentFindSearches, setRecentFindSearches] = useState([])
  const expandedContainerRef = useRef(null)

  // Load recent searches on component mount
  useEffect(() => {
    const savedRouteSearches = JSON.parse(localStorage.getItem('recentRouteSearches') || '[]')
    const savedFindSearches = JSON.parse(localStorage.getItem('recentFindSearches') || '[]')
    setRecentRouteSearches(savedRouteSearches)
    setRecentFindSearches(savedFindSearches)
  }, [])

  const handleSearchClick = () => {
    setIsExpanded(true)
    setShowRecentSearches(true)
  }

  const handleRouteSubmit = (e) => {
    e.preventDefault()
    if (onSearch && currentLocation && destination) {
      onSearch(currentLocation, destination)
      
      // Save to recent route searches
      const searchQuery = `${currentLocation} → ${destination}`
      const newSearches = [searchQuery, ...recentRouteSearches.filter(s => s !== searchQuery)].slice(0, 5)
      setRecentRouteSearches(newSearches)
      localStorage.setItem('recentRouteSearches', JSON.stringify(newSearches))
      
      handleClose()
    }
  }

  const handleFindMyBusSubmit = (e) => {
    e.preventDefault()
    if (onFindMyBus && findMyBusQuery.trim()) {
      onFindMyBus(findMyBusQuery.trim(), findSearchType)
      
      // Save to recent find searches
      const searchData = {
        query: findMyBusQuery.trim(),
        type: findSearchType,
        label: `${findSearchType === 'number' ? 'Bus #' : 'Route'} ${findMyBusQuery.trim()}`
      }
      const newSearches = [
        searchData, 
        ...recentFindSearches.filter(s => s.query !== searchData.query || s.type !== searchData.type)
      ].slice(0, 5)
      setRecentFindSearches(newSearches)
      localStorage.setItem('recentFindSearches', JSON.stringify(newSearches))
      
      handleClose()
    }
  }

  const handleClose = () => {
    setIsExpanded(false)
    setShowRecentSearches(false)
    setCurrentLocation('')
    setDestination('')
    setFindMyBusQuery('')
  }

  const selectRecentRouteSearch = (searchQuery) => {
    const parts = searchQuery.split(' → ')
    if (parts.length === 2) {
      setCurrentLocation(parts[0])
      setDestination(parts[1])
    }
    setShowRecentSearches(false)
  }

  const selectRecentFindSearch = (searchData) => {
    setFindMyBusQuery(searchData.query)
    setFindSearchType(searchData.type)
    setShowRecentSearches(false)
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
        {/* Search Mode Toggle */}
        <div className={styles.searchModeToggle}>
          <button 
            className={`${styles.modeBtn} ${searchMode === 'route' ? styles.active : ''}`}
            onClick={() => {
              setSearchMode('route')
              setShowRecentSearches(true)
            }}
          >
            🗺️ Route Search
          </button>
          <button 
            className={`${styles.modeBtn} ${searchMode === 'find' ? styles.active : ''}`}
            onClick={() => {
              setSearchMode('find')
              setShowRecentSearches(true)
            }}
          >
            🔍 Find My Bus
          </button>
        </div>

        {/* Route Search Mode */}
        {searchMode === 'route' && (
          <form onSubmit={handleRouteSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="From (Current Location)"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className={styles.input}
              onFocus={() => setShowRecentSearches(true)}
              required
            />
            <input
              type="text"
              placeholder="To (Destination)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={styles.input}
              onFocus={() => setShowRecentSearches(true)}
              required
            />
            <button type="submit" className={styles.searchButton}>
              🚌 Find Buses
            </button>
          </form>
        )}

        {/* Find My Bus Mode */}
        {searchMode === 'find' && (
          <div className={styles.findBusSection}>
            <div className={styles.findToggle}>
              <button 
                className={`${styles.findToggleBtn} ${findSearchType === 'number' ? styles.active : ''}`}
                onClick={() => setFindSearchType('number')}
              >
                Bus Number
              </button>
              <button 
                className={`${styles.findToggleBtn} ${findSearchType === 'route' ? styles.active : ''}`}
                onClick={() => setFindSearchType('route')}
              >
                Route/Name
              </button>
            </div>
            
            <form onSubmit={handleFindMyBusSubmit} className={styles.form}>
              <input
                type="text"
                placeholder={findSearchType === 'number' ? 
                  'Enter bus number (e.g., DL01AB1234)' : 
                  'Enter route or bus name (e.g., City Express)'
                }
                value={findMyBusQuery}
                onChange={(e) => setFindMyBusQuery(e.target.value)}
                className={styles.input}
                onFocus={() => setShowRecentSearches(true)}
                required
              />
              <button type="submit" className={styles.findButton}>
                📍 Track Bus
              </button>
            </form>
          </div>
        )}

        {/* Recent Searches */}
        {showRecentSearches && (
          <div className={styles.recentSearches}>
            {searchMode === 'route' && recentRouteSearches.length > 0 && (
              <div className={styles.recentSection}>
                <h4>🕰️ Recent Route Searches</h4>
                <div className={styles.recentList}>
                  {recentRouteSearches.map((search, index) => (
                    <div 
                      key={index} 
                      className={styles.recentItem}
                      onClick={() => selectRecentRouteSearch(search)}
                    >
                      <span className={styles.recentIcon}>🗺️</span>
                      <span className={styles.recentText}>{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {searchMode === 'find' && recentFindSearches.length > 0 && (
              <div className={styles.recentSection}>
                <h4>🕰️ Recent Bus Searches</h4>
                <div className={styles.recentList}>
                  {recentFindSearches.map((search, index) => (
                    <div 
                      key={index} 
                      className={styles.recentItem}
                      onClick={() => selectRecentFindSearch(search)}
                    >
                      <span className={styles.recentIcon}>🔍</span>
                      <span className={styles.recentText}>{search.label}</span>
                      <span className={styles.recentType}>
                        {search.type === 'number' ? '#' : 'R'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {((searchMode === 'route' && recentRouteSearches.length === 0) ||
              (searchMode === 'find' && recentFindSearches.length === 0)) && (
              <div className={styles.noRecent}>
                <p>💭 No recent searches</p>
                <p>Your search history will appear here</p>
              </div>
            )}
          </div>
        )}
        
        <button type="button" onClick={handleClose} className={styles.closeButton}>×</button>
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

export default SearchBar
