const apiKey = '4834575a30d36d6b1c4bb6a36f7e7c6d';

function addToSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("weatherSearchHistory", JSON.stringify(history));
    renderSearchHistory();
  }
}

function renderSearchHistory() {
  const historyDiv = document.getElementById("searchHistory");
  historyDiv.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

  history.slice().reverse().forEach(city => {
    const button = document.createElement("button");
    button.innerHTML = `🕘 ${city}`;
    button.onclick = () => {
      document.getElementById("cityInput").value = city;
      getWeather();
    };
    historyDiv.appendChild(button);
  });
}

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  const resultDiv = document.getElementById('weatherResult');

  if (!city) {
    resultDiv.innerHTML = "Please enter a city name.";
    return;
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    if (data.cod === 404) {
      resultDiv.innerHTML = "City not found!";
      return;
    }

    resultDiv.innerHTML = `
      <h3>${data.name}, ${data.sys.country}</h3>
      <p>📍 Lat: ${data.coord.lat.toFixed(2)}, Lon: ${data.coord.lon.toFixed(2)}</p>
      <p>🌡️ Temp: ${data.main.temp} °C</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌥️ Weather: ${data.weather[0].description}</p>
    `;

    addToSearchHistory(data.name);
    localStorage.setItem("lastCity", data.name);
    getFiveDayForecast(data.name);

  } catch (error) {
    console.error('Fetch error:', error);
    resultDiv.innerHTML = "❌ Error fetching data. Please try again.";
  }
}

async function getWeatherByLocation() {
  const resultDiv = document.getElementById('weatherResult');
  resultDiv.innerHTML = "📍 Getting your location...";

  if (!navigator.geolocation) {
    resultDiv.innerHTML = " Geolocation not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      resultDiv.innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <p>📍 Lat: ${data.coord.lat.toFixed(2)}, Lon: ${data.coord.lon.toFixed(2)}</p>
        <p>🌡️ Temp: ${data.main.temp} °C</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>🌥️ Weather: ${data.weather[0].description}</p>
      `;

      addToSearchHistory(data.name);

    } catch (error) {
      console.error('Location fetch error:', error);
      resultDiv.innerHTML = " Failed to fetch weather by location.";
    }
  }, () => {
    resultDiv.innerHTML = " Unable to retrieve your location.";
  });
}

async function getFiveDayForecast(city) {
  const forecastDiv = document.getElementById('forecastResult');
  forecastDiv.innerHTML = "Loading forecast...";

  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error(`Forecast error: ${response.status}`);
    const data = await response.json();
    const dailyForecasts = data.list.filter(entry => entry.dt_txt.includes("12:00:00"));

    forecastDiv.innerHTML = "";

    dailyForecasts.slice(0, 5).forEach(day => {
      const date = new Date(day.dt_txt).toDateString();
      const temp = day.main.temp;
      const desc = day.weather[0].description;

      const dayCard = document.createElement("div");
      dayCard.classList.add("forecast-day");

      dayCard.innerHTML = `
        <strong>${date}</strong>
        <p>🌡️ ${temp} °C</p>
        <p>🌥️ ${desc}</p>
      `;

      forecastDiv.appendChild(dayCard);
    });

  } catch (error) {
    console.error("Forecast fetch error:", error);
    forecastDiv.innerHTML = "❌ Error loading forecast.";
  }
}

window.onload = () => {
  renderSearchHistory();

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === 'dark') {
    document.body.classList.add("dark-mode");
  }
};

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem("theme", isDark ? 'dark' : 'light');
});
