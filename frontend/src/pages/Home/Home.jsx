import React from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import Searchbar from '../../components/Searchbar/Searchbar'
import { useState } from 'react'
import Searchresultlist from '../../components/Searchbar/Searchresultlist'

const Home = () => {

  const [results, setResults] = useState([]);
  return (
    <div>
      <Header/>
      {/*<Searchbar setResults={setResults}/> 
      <Searchresultlist results={results}/> */}
    </div>
  )
}

export default Home
