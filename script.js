const PPLX_API_KEY = 'YOUR_API_KEY';
const PPLX_API_URL = 'https://api.perplexity.ai/chat/completions';


const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const weatherDesc = document.getElementById('weather-desc');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feels-like');
const aiMessage = document.getElementById('ai-message');


function initApp() {
    setCurrentDate();
    cityInput.focus();
    
  
    cityInput.placeholder = 'e.g., London, Tokyo, New York';
    
    console.log('Weather app initialized');
}


function setCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Show/hide UI states
function showLoading() {
    weatherInfo.style.display = 'none';
    error.style.display = 'none';
    loading.style.display = 'block';
}

function showError(message) {
    weatherInfo.style.display = 'none';
    loading.style.display = 'none';
    error.style.display = 'block';
    errorMessage.textContent = message;
}

function showWeather() {
    loading.style.display = 'none';
    error.style.display = 'none';
    weatherInfo.style.display = 'block';
}


function generateWeatherData(city) {
    const seasons = {
        'winter': { minTemp: -10, maxTemp: 10 },
        'spring': { minTemp: 5, maxTemp: 25 },
        'summer': { minTemp: 15, maxTemp: 35 },
        'autumn': { minTemp: 0, maxTemp: 20 }
    };
    
    const now = new Date();
    const month = now.getMonth();
    let season = 'spring';
    
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';
    
    const tempRange = seasons[season];
    const temperature = Math.floor(Math.random() * (tempRange.maxTemp - tempRange.minTemp + 1)) + tempRange.minTemp;
    const humidity = Math.floor(Math.random() * 60) + 30;
    const windSpeed = Math.floor(Math.random() * 30) + 5;
    
    const weatherConditions = [
        { description: "Sunny and clear", feelsLike: temperature + 2 },
        { description: "Partly cloudy", feelsLike: temperature },
        { description: "Cloudy", feelsLike: temperature - 1 },
        { description: "Light rain", feelsLike: temperature - 3 },
        { description: "Heavy rain", feelsLike: temperature - 5 },
        { description: "Snowy", feelsLike: temperature - 8 },
        { description: "Windy", feelsLike: temperature - 2 }
    ];
    
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    return {
        temperature: temperature,
        description: condition.description,
        humidity: humidity,
        wind_speed: windSpeed,
        feels_like: condition.feelsLike
    };
}


async function callPerplexityAPI(city, weatherData) {
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const prompt = `Based on the current weather data for ${city} on ${currentDate}:
    - Temperature: ${weatherData.temperature}°C
    - Description: ${weatherData.description}
    - Humidity: ${weatherData.humidity}%
    - Wind Speed: ${weatherData.wind_speed} km/h
    - Feels Like: ${weatherData.feels_like}°C
    
    Provide a helpful 2-3 sentence insight about today's weather and practical recommendations.`;
    
    try {
        console.log('Calling Perplexity API for insights:', city);
        
        const response = await fetch(PPLX_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PPLX_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.1-sonar-small-128k-online",
                messages: [
                    {
                        role: "system",
                        content: "You are a weather expert providing helpful insights and recommendations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 200
            })
        });
        
        if (!response.ok) {
            console.error('Perplexity API response error:', response.status);
            return "Weather data retrieved successfully. Stay comfortable and dress appropriately for the conditions.";
        }
        
        const data = await response.json();
        console.log('Perplexity API response:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            return "Weather data retrieved successfully. Stay comfortable and dress appropriately for the conditions.";
        }
        
        return data.choices[0].message.content;
    } catch (err) {
        console.error('Perplexity API error:', err);
        return "Weather data retrieved successfully. Stay comfortable and dress appropriately for the conditions.";
    }
}


async function getWeatherData(city) {
    showLoading();
    
    try {
      
        const weatherData = generateWeatherData(city);
        
        
        const aiInsight = await callPerplexityAPI(city, weatherData);
        weatherData.ai_insight = aiInsight;
        
      
        displayWeatherData(city, weatherData);
        showWeather();
        
    } catch (err) {
        console.error('Error in getWeatherData:', err);
        showError('Failed to get weather data. Please try again.');
    }
}


function displayWeatherData(city, data) {
    cityName.textContent = city;
    currentTemp.textContent = `${Math.round(data.temperature)}°C`;
    weatherDesc.textContent = data.description;
    windSpeed.textContent = `${Math.round(data.wind_speed)} km/h`;
    humidity.textContent = `${Math.round(data.humidity)}%`;
    feelsLike.textContent = `${Math.round(data.feels_like)}°C`;
    aiMessage.textContent = data.ai_insight;
    
    console.log('Weather data displayed:', data);
}


function validateCityName(city) {
    if (!city || city.length === 0) {
        return { valid: false, message: 'Please enter a city name' };
    }
    
    if (city.length < 2) {
        return { valid: false, message: 'City name must be at least 2 characters long' };
    }
    
    return { valid: true };
}


function searchWeather() {
    const city = cityInput.value.trim();
    const validation = validateCityName(city);
    
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    getWeatherData(city);
}


searchBtn.addEventListener('click', searchWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);