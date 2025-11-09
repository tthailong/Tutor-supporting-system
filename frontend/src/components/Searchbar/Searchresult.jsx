import React from 'react'
import './Searchresult.css'

const Searchresult = ({result}) => {
  return (
    <div className = "search-result" onClick={(e) => alert(`You clicked on ${result.name}`)}>
      {result.name}
    </div>
  )
}

export default Searchresult