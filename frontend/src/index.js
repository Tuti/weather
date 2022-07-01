import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function App() {
  const [intialLoad, setInitalLoad] = useState(true);
  const [search, setSearch] = useState('');
  const [weatherResponse, setWeatherResponse] = useState('');
  const [status, setStatus] = useState('Enter a location!');
  const [location, setLocation] = useState('To find the weather');
  const [wind, setWind] = useState('TBD');
  const [temperature, setTemperature] = useState('TBD');
  const [humidity, setHumidity] = useState('TBD');
  const [weatherIcon, setweatherIcon] = useState('http://openweathermap.org/img/wn/01d@2x.png');

  const fetchData = useCallback(async () => {
    const response = await fetchWeather(search);
    setWeatherResponse(response);
    setInitalLoad(false);
  }, [search]);

  useEffect(() => {
    const listener = event => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        fetchData()
        .catch(e => console.error(e));
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [fetchData]);

  useEffect(() => {
    if(intialLoad) return;
    setStatus(weatherResponse.current?.weather[0].main);
    setLocation(weatherResponse.cityName + ', ' + weatherResponse.stateCode);
    setWind(weatherResponse.current?.wind_speed + ' MPH');
    setTemperature(weatherResponse.current?.temp + ' F°');
    setHumidity(weatherResponse.current?.humidity + '%');
    setweatherIcon(`http://openweathermap.org/img/wn/${weatherResponse.current?.weather[0].icon}@2x.png`);
  }, [intialLoad, weatherResponse]);

  function handleChange(event) {
    setSearch(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return(
    <div className='container'>
      <div className='weather'>
        <div className='header'>
          <div className='weatherIcon'>
            <img src={weatherIcon} alt='weather icon'></img>
          </div>
        </div>
        <div className='information'> 
          <div className='subcontainer'>
            <div className='general-info'>
              <div className='status'>{status}</div>
              <div className='location'>{location}</div>
            </div>
            <div className='weather-info'>
              <div className='wind'>
                <p className='subheading'>Wind:</p>
                <p>{wind}</p>
              </div>
              <div className='temperature'>
                <p className='subheading'>Temperature: </p>
                <p>{temperature}</p>
              </div>
              <div className='humidity'>
                <p className='subheading'>Humidity: </p>
                <p>{humidity}</p>
              </div>
            </div>
            <div className='search-box'>
              <form onSubmit={handleSubmit}>
                <input 
                  type='text'
                  onChange={handleChange}
                  name='searchBar'
                  placeholder='City, State Code'
                />
              </form>
            </div>
          </div> 
        </div>
      </div>
      <div className='footer'>
        <a href='https://openweathermap.org/api'>Powered by OpenWeather api</a>
      </div>
    </div>
    
  );
}

async function fetchWeather(search) {
    
  let split = search.split(",");
  let cityName = split[0];
  split = split.map(entry => entry.trim());

  const data = {
      cityName : cityName,
      cityNameTrimmed : split[0],
      stateCode : split[1],
  }

  try {
      const response = await fetch('http://localhost:3002/weather', {
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
      console.log('fetch successful!');

      return json;  
  } catch (error) {
      console.log(error);
  }                   
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);