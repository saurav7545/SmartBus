import React, { useState } from 'react'
import MapView from './component/mapview'
import Searchbar from './component/searchbar'
import Account from './accountbox/account'
import BusCount from './component/buscount'

function bus() {
  const [showBuses, setShowBuses] = useState(false)
  const [buses, setBuses] = useState([])

  const handleSearch = (currentLocation, destination) => {
    // Mock bus data
    const mockBuses = [
      {
        route: `${currentLocation} to ${destination}`,
        departureTime: '10:00 AM',
        arrivalTime: '12:00 PM',
        seats: 15
      },
      {
        route: `${currentLocation} to ${destination}`,
        departureTime: '2:00 PM',
        arrivalTime: '4:00 PM',
        seats: 8
      },
      {
        route: `${currentLocation} to ${destination}`,
        departureTime: '6:00 PM',
        arrivalTime: '8:00 PM',
        seats: 22
      }
    ]
    setBuses(mockBuses)
    setShowBuses(true)
  }

  const handleCloseBuses = () => {
    setShowBuses(false)
  }

  return (
    <div style={{ position: 'relative', height: '100vh', width: 'calc(100vw - 20px)', left: '20px' }}>
      <MapView/>
      <Searchbar onSearch={handleSearch}/>
      <Account/>
      {showBuses && <BusCount buses={buses} onClose={handleCloseBuses}/>}
    </div>
  )
}

export default bus
