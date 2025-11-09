import React from 'react'
import './Searchresultlist.css'
import  Searchresult  from './Searchresult.jsx'

const Searchresultlist = ({results}) => {
  return (
    <div className = "results-list">
        {
            results.map((result,id) => {
                return <Searchresult result={result} key={id}/>
            })
        }
    </div>
  )
}

export default Searchresultlist
