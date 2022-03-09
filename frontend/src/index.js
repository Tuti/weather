import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import weatherIcons from './imports';

const default_CountryCode = 'US';

/* Function Components */
function App() {
    
    /* Hooks */
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [weatherData, setWeatherData] = useState('');
    const fetchData = useCallback(async () => {
          const json = await fetchWeatherData('Los Angeles, CA');
          setWeatherData(json);  
          setLoading(false);
    }, [])

    //runs on intial render
    useEffect(() => {
        fetchData()
        .catch(console.error);
    }, [fetchData]);

    if(loading) {
        return null;
    }
    
    return (
        <div className='app'>
            <Search 
                search={searchInput} 
                setSearch={setSearchInput} 
                setWeatherData={setWeatherData}
            />
            <Weather weatherData={weatherData}/>
        </div>
    );
}

function Weather({weatherData, setCity}) {
    return(
        <div className='weather'>
            <CurrentWeather weatherData={weatherData}/>
        </div>
    );
}

function CurrentWeather({weatherData}) {
    return (
        <div className='currentWeather'>
            <div className='col1'>
                <p>{weatherData.cityName}, {weatherData.stateCode}</p>
                <p>{weatherData.current?.temp}° F</p>
                <p>{weatherData.current?.weather[0].main}</p>
            </div>
            <div className='col2'>
                
            </div> 
            <div className='col3'>
                <img src={determineWeatherIcon({weatherData})} alt='sun alt placeholder'/>
            </div>
        </div>
    );
}

function Search({search, setSearch, setWeatherData}) {
    function handleSearchChange(event) {
        setSearch(event.target.value);
    }
    
    function handleSubmit(event) {
        event.preventDefault();
        fetchWeatherData(search)
        .then(json => setWeatherData(json))
        .catch(error => console.log(error));
    }

    return (
        <div className='search'>
            <form onSubmit={handleSubmit}>
                <input 
                    type='text' 
                    value={search} 
                    onChange={handleSearchChange} 
                    name='searchBar' 
                    placeholder='City Name, State Code'>
                </input>
                <button type='submit' className='searchButton'>
                    Search
                </button>
            </form>
        </div>
    );   
}

function footer() {
    return (
        <div>
            <h1>Tuti</h1>
        </div>
    );
}

/* Functions */
async function fetchWeatherData(searchInput) {
    
    let split = searchInput.split(",");
    let cityName = split[0];
    split = split.map(entry => entry.trim());
 
    const data = {
        cityName : cityName,
        cityNameTrimmed : split[0],
        stateCode : split[1],
        countryCode : default_CountryCode,
    }

    try {
        const response = await fetch('http://localhost:3001/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if(!response.ok) {
            throw new Error('fetch request failed!');
        }
        const json = await response.json();
        
        return json;  
    } catch (error) {
        console.log(error);
    }                   
}

function determineWeatherIcon({weatherData}) {
    const description = weatherData.current?.weather[0].main;
    if(!description) {
        return null;
    }

    if(description.includes('Clear')) {
        return weatherIcons[1];
    }
    if(description.includes('Clouds')) {
        return weatherIcons[2]
    }
    if(description.includes('Rain')) {
        return weatherIcons[3];
    }
    if(description.includes('ThunderStorm')) {
        return weatherIcons[4];
    }
    if(description.includes('Snow')) {
        return weatherIcons[5];
    }
    return weatherIcons[0]; //change to question mark icon
}

//=======================================
ReactDOM.render(
    <App />,
    document.getElementById('root')
);