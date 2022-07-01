const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config.json');
const app = express();
const port = 3002;
const openWeatherAPI_key = config['openWeatherAPI-key'];

let weather_counter = 0;

const limiter = rateLimit({
    windowMs: 60 * 1000, // 60 seconds * 1000 miliseconds = 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(cors());
app.use(limiter);

app.get('/', (req, res) => {
   res.send('Hello World!');
})

app.post('/weather', cors(), async(req, res, next) => {

    const cityName = req.body.cityNameTrimmed;
    const stateCode = req.body.stateCode;
    const countryCode = 'US';
    const limit = 1;

    try {
        const geoCords = await getGeoCords(cityName, stateCode, countryCode, limit);
        const weatherData = await getWeatherData(geoCords.lat, geoCords.lon);
        weatherData.cityName = req.body.cityName;
        weatherData.stateCode = req.body.stateCode;
        res.json(weatherData);
    } catch (e) {
        console.error(e);
    }    
    
    weather_counter = weather_counter + 1;
    let date = new Date();
    let time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    console.log(`[${weather_counter}] post /weather successful [${time}]`);
})

app.listen(port, () => {
    console.log('server started...')
    console.log(`server listening on port ${port}...`);
})

/* Helper Functions */
async function getGeoCords(cityName, stateCode, countryCode, limit) {
    try {
        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=${limit}&appid=${openWeatherAPI_key}`)        
        return response.data[0];
    } catch(error) {
        console.error(error);
    }
}

async function getWeatherData(latitude, longitude) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&units=imperial&appid=${openWeatherAPI_key}`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
