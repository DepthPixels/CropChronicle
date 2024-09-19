import { fetchWeatherApi } from 'openmeteo';
	
const params = {
	"latitude": 28.8945,
	"longitude": 76.5892,
	"start_date": "2024-09-01",
	"end_date": "2024-09-17",
	"daily": ["temperature_2m_max", "temperature_2m_min", "sunshine_duration", "wind_speed_10m_max", "wind_gusts_10m_max", "et0_fao_evapotranspiration"],
	"timezone": "auto"
};
const url = "https://archive-api.open-meteo.com/v1/archive";
const responses = await fetchWeatherApi(url, params);

// Helper function to form time ranges
const range = (start, stop, step) =>
	Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

// Process first location. Add a for-loop for multiple locations or weather models
const response = responses[0];

// Attributes for timezone and location
const utcOffsetSeconds = response.utcOffsetSeconds();
const timezone = response.timezone();
const timezoneAbbreviation = response.timezoneAbbreviation();
const latitude = response.latitude();
const longitude = response.longitude();

const daily = response.daily();

// Note: The order of weather variables in the URL query and the indices below need to match!
export const weatherData = {
	time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
		(t) => new Date((t + utcOffsetSeconds) * 1000)
	),
	temperature2mMax: daily.variables(0).valuesArray(),
	temperature2mMin: daily.variables(1).valuesArray(),
	sunshineDuration: daily.variables(2).valuesArray(),
	windSpeed10mMax: daily.variables(3).valuesArray(),
	windGusts10mMax: daily.variables(4).valuesArray(),
	et0FaoEvapotranspiration: daily.variables(5).valuesArray(),

};

// `weatherData` now contains a simple structure with arrays for datetime and weather data
for (let i = 0; i < weatherData.time.length; i++) {
	console.log(
		weatherData.time[i].toISOString(),
		weatherData.temperature2mMax[i],
		weatherData.temperature2mMin[i],
		weatherData.sunshineDuration[i],
		weatherData.windSpeed10mMax[i],
		weatherData.windGusts10mMax[i],
		weatherData.et0FaoEvapotranspiration[i]
	);
}