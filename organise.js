import { search } from "./search.js"
import { dom } from "./dom.js"

const organiseWeather = (weatherObj) => {	

	const dailyWeatherFactory = (date, high, low, desc, icon, sunrise, sunset) => {
		return {date, high, low, desc, icon, sunrise, sunset}
	}

	const hourlyWeatherFactory = (time, temp, icon) => {
		return {time, temp, icon}
	}

	const nth = function(d) {
		if (d > 3 && d < 21) return 'th';
		switch (d % 10) {
			case 1: return 'st';
			case 2: return 'nd';
			case 3: return 'rd';
			default: return 'th';
		}
	}

	const formatDate = (date) => {
		
		const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		const day = dayNames[date.getDay()];
		const dd = date.getDate();
		const ordinal = nth(dd); 
		const mmm = monthNames[date.getMonth()];
		const yyyy = date.getFullYear();
		const formatedDate = `${day} ${dd}${ordinal}`
		return formatedDate
	} 

	const formatTime = (date) => {
		let time = date.toLocaleTimeString("en-gb");
		time = time.slice(0, 5);		
		return time;
	}

	const timestampToDate = (timestamp) => {
		const date = new Date(timestamp * 1000);
		return date;
	}

	const getDate = (timestamp) => {
		const formattedDate = formatDate(timestampToDate(timestamp));
		return formattedDate
	}

	const getTime = (timestamp) => {
		const time = formatTime(timestampToDate(timestamp));	
		return time
	}


	const getDailyWeather = (weatherObj) => {

		const dailyWeather = [];


		for (let d in weatherObj.daily) {
			const date = getDate(weatherObj.daily[d].dt);
			const high = weatherObj.daily[d].temp.max;
			const low = weatherObj.daily[d].temp.min;
			const desc = weatherObj.daily[d].weather[0].description;
			const icon = weatherObj.daily[d].weather[0].id;
			const sunrise = getTime(weatherObj.daily[d].sunrise);
			const sunset = getTime(weatherObj.daily[d].sunset);			
			dailyWeather.push(dailyWeatherFactory(date, high, low, desc, icon, sunrise, sunset))
		}

		return dailyWeather;	
	}

	const getHourlyWeather = (weatherObj) => {

		const hourlyWeather = [];		
		
		let hit5AM= false;		

		let i = 0;
		do { 
			const time = getTime(weatherObj.hourly[i].dt)
			const temp = weatherObj.hourly[i].temp;
			const icon = weatherObj.hourly[i].weather[0].id;
			hourlyWeather.push(hourlyWeatherFactory(time, temp, icon));
			if (time === "05:00") { hit5AM = true };
			i++;
		} while (!(hit5AM))		
		
		return hourlyWeather;
	}

	const weather = {
		daily: getDailyWeather(weatherObj),
		hourly: getHourlyWeather(weatherObj)
	}

	return weather;

}

const organiseCoords = (coordsObj) => {

	const coordsFactory = (latitude, longitude) => {
		return {latitude, longitude}
	}
	
	const coords = coordsFactory(coordsObj.results[0].geometry.location.lat, coordsObj.results[0].geometry.location.lng)
	console.log(coords)
	return coords
}

const loadData = (() => {
	const getLocationName = async(coords) => {

		const isPostalTown = (addressComponent) => {
			return addressComponent.types[0] === "postal_town"
		}

		console.log(coords)
		const locationObj = await search.getLocation(coords.latitude, coords.longitude);
		console.log(locationObj.results[0].address_components)
		const addressComponent = locationObj.results[0].address_components.find(isPostalTown)
		const locationName = addressComponent.long_name;
		return locationName
	}

	const getWeather = async(coords) => {
		const weatherObj = await search.getWeather(coords.latitude, coords.longitude);
		const weather = organiseWeather(weatherObj);
		return weather;
	}

	const populate = async(coords) => {
		const locationName = await getLocationName(coords);
		const weather = await getWeather(coords);
		dom.populateDom(weather, locationName)
	}

	const onload = async(coords) => {
		const locationName = await getLocationName(coords);
		const weather = await getWeather(coords);
		dom.onloadDom(weather, locationName);
	}

	return {populate, onload};
})();

export { organiseWeather, organiseCoords, loadData }