const apiFactory = (api, key) => {
	
	const makeUrl = (parameters) => {		
		const url = `${api}${parameters}${key}`;
		
		return url;
	}

	const getResponse = async(url) => {
		try {
			let response = await fetch(url, {mode: 'cors'});
			return await response.json();
		} catch (error) {
			console.log(error);
		}
	}

	const call = async(parameters) => {
		const url = makeUrl(parameters);		
		return await getResponse(url);
	}

	return { api, call}
}

const search = (() => {

	const getCoords = async(searchQuery) => {
		const coordsApi = apiFactory('https://maps.googleapis.com/maps/api/geocode/json?','AIzaSyB_k-eem1a7zR3TreDseKVgYSv5OoBmwlA');	
		const region = 'gb';
		const coordsParameters = `address=${searchQuery}&region=${region}&key=`
		console.log(coordsParameters)
		const coordsObj = await coordsApi.call(coordsParameters);
		console.log(coordsObj)
		
		return await coordsObj
	}
	
	const getWeather = async(lat, lng) => {
		const weatherApi = apiFactory('https://api.openweathermap.org/data/2.5/onecall?', '5d558b5f247acae9ec7adb3a750e4b79')
		const units = 'metric';
		const weatherParameters = `lat=${lat}&lon=${lng}&units=${units}&appid=`;
		const weatherObj = await weatherApi.call(weatherParameters);

		return await weatherObj
	}	

	const getLocation = async(lat, lng) => {
		const locationApi = apiFactory('https://maps.googleapis.com/maps/api/geocode/json?','AIzaSyB_k-eem1a7zR3TreDseKVgYSv5OoBmwlA')
		const locationParameters = `latlng=${lat},${lng}&key=`

		const locationObj = await locationApi.call(locationParameters);
		
		return await locationObj;
	}
	
	const event = async(searchQuery) => {		
		const locationObj = await getCoords(searchQuery);
		const coords = locationObj.results[0].geometry.location;
		const weatherObj = await getWeather(coords.lat, coords.lng);

	};

	return { getCoords, getWeather, getLocation }
})();

export {search};