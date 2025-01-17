import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

const yourAPIKey = "2f51c4eadb841d227aed0b146e7ef028";

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async(req, res)=>{
  try{
    const [geoData, weatherData, weatherForecast] = await axios.all([
      axios.get("http://api.openweathermap.org/geo/1.0/zip",{
        params:{
          zip: "E14,GB",
          appid: yourAPIKey,
        },
      }),
      axios.get("https://api.openweathermap.org/data/2.5/weather",{
        params:{
          lat: 51.4969,
          lon: -0.0087,
          appid: yourAPIKey,
        },
      }),
      axios.get("https://api.openweathermap.org/data/2.5/forecast",{
        params:{
          lat: 51.4969,
          lon: -0.0087,
          appid: yourAPIKey,
        }
      })
    ]);
    //Current Weather
    const unixTimestamp = weatherData.data.dt;
    const date = new Date(unixTimestamp * 1000);
    const formattedDate = date.toLocaleDateString("en-US");
    const formattedTime = date.toLocaleTimeString("en-US");
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    const kelvinTemp = weatherData.data.main.temp; 
    const celsiusTemp = ((kelvinTemp - 273.15).toFixed(2));
    const mainWeather = weatherData.data.weather[0].main;
    const imageSource = `image/${mainWeather}.svg`;
    // Process Forecast Weather
    const forecastList = weatherForecast.data.list.map((item)=>{
      const forecastdate = new Date(item.dt * 1000);
      return{
        date: forecastdate.toLocaleDateString("en-US"),
        time: forecastdate.toLocaleTimeString("en-US"),
        temp: ((item.main.temp - 273.15).toFixed(2)),
        weather: item.weather[0].description,
        image: `image/${item.weather[0].main}.svg`,
      };
    });
    res.render("index.ejs", {
      city: geoData.data.name,
      country: geoData.data.country,
      todayDate: formattedDateTime,
      currentTemp: celsiusTemp,
      mainWeather: weatherData.data.weather[0].main,
      wind: weatherData.data.wind.speed,
      humidity: weatherData.data.main.humidity,
      seaLevel: weatherData.data.main.sea_level,
      mainWeatherImg: imageSource,
      forecastList,
    })
  }catch(error){
    console.error(error.response || error.message)
  }
});

app.post("/",async(req, res)=>{
  console.log(req.body);
  try{
    console.log(req.body);
    const zip = req.body.zip;
    const country = req.body.country;
    
    const geoData = await axios.get("http://api.openweathermap.org/geo/1.0/zip",{
      params:{
        zip: `${zip},${country}`,
        appid: yourAPIKey,
      },
    });



    const [weatherData, weatherForecast] = await axios.all([
      axios.get("https://api.openweathermap.org/data/2.5/weather",{
        params:{
          lat: geoData.data.lat,
          lon: geoData.data.lon,
          appid: yourAPIKey,
        },
      }),
      axios.get("https://api.openweathermap.org/data/2.5/forecast",{
        params:{
          lat: geoData.data.lat,
          lon: geoData.data.lon,
          appid: yourAPIKey,
        }
      })
    ]);
    //Current Weather
    const unixTimestamp = weatherData.data.dt;
    const date = new Date(unixTimestamp * 1000);
    const formattedDate = date.toLocaleDateString("en-US");
    const formattedTime = date.toLocaleTimeString("en-US");
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    const kelvinTemp = weatherData.data.main.temp; 
    const celsiusTemp = ((kelvinTemp - 273.15).toFixed(2));
    const mainWeather = weatherData.data.weather[0].main;
    const imageSource = `image/${mainWeather}.svg`;
    // Process Forecast Weather
    const forecastList = weatherForecast.data.list.map((item)=>{
      const forecastdate = new Date(item.dt * 1000);
      return{
        date: forecastdate.toLocaleDateString("en-US"),
        time: forecastdate.toLocaleTimeString("en-US"),
        temp: ((item.main.temp - 273.15).toFixed(2)),
        weather: item.weather[0].description,
        image: `image/${item.weather[0].main}.svg`,
      };
    });
    res.render("index.ejs", {
      city: geoData.data.name,
      country: geoData.data.country,
      todayDate: formattedDateTime,
      currentTemp: celsiusTemp,
      mainWeather: weatherData.data.weather[0].main,
      wind: weatherData.data.wind.speed,
      humidity: weatherData.data.main.humidity,
      seaLevel: weatherData.data.main.sea_level,
      mainWeatherImg: imageSource,
      forecastList,
    })
  }catch(error){
    console.error(error.response || error.message);
  }
});

app.listen(port, ()=>{
  console.log(`Server is running on port ${port}`);
})

