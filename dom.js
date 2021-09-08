import { search } from "./search.js";
import { loadData, organiseCoords } from "./organise.js";

const dom = (() => {
	const elementCreator = (tag, parent, ...attributes) => {
		const parentElement = document.querySelector(parent);
		const domElement = document.createElement(tag);

		(attributes).forEach(attribute => {
			domElement.setAttribute(attribute[0], attribute[1]);
		});

		parentElement.appendChild(domElement);
	}

	const onload = (() => {

		const createForm = () => {
			elementCreator("div", "body", ["id", "form-container"]);
			elementCreator("form", "#form-container", ["id", "search-form"]);
			elementCreator("label", "#search-form", ["id", "search-label"]);
			elementCreator("div", "#search-form", ["id", "search-bar"]);
			elementCreator("input", "#search-bar", ["type", "text"], ["id", "search-input"]);
			elementCreator("input", "#search-bar", ["type", "submit"], ["id", "submit-btn"], ["value", "submit"]);

			document.getElementById("search-label").textContent = "Enter a city to see its weather";
		}

		const createLocationEl = () => {
			elementCreator("h1", "#weather-container", ["id", "location"]);
		}
		
		const createDailySummary = () => {
			
			elementCreator("div", "#weather-container", ["id", "summary-container"]);

			for (let d = 0; d < 8; d++) {
				elementCreator("div", "#summary-container", ["id", `weather-summary-day-${d}`]);
				elementCreator("p", `#weather-summary-day-${d}`, ["class", "weather-date"]);
				elementCreator("i", `#weather-summary-day-${d}`, ["class", "icon"]);
				if (d === 0) {
					elementCreator("h3", `#weather-summary-day-${d}`, ["class", "current-temp"]);
				}
				elementCreator("div", `#weather-summary-day-${d}`, ["class", "high-low"]);
			}
		}

		const createHourlyContainer = () => {
			elementCreator("div", "#weather-container", ["id", "todays-hourly-container"]);
			elementCreator("h2", "#todays-hourly-container", ["id", "todays-hourly-heading"]);
			document.getElementById("todays-hourly-heading").textContent = "Todays Hourly Breakdown";
			elementCreator("ul", "#todays-hourly-container", ["id", "todays-weather-hourly-list"]);
		};
		
		const createElements = () => {
					
			createForm();
			elementCreator("div", "body", ["id", "weather-container"]);
			createLocationEl();
			createDailySummary();
			createHourlyContainer();
		}		

		return {createElements};
	})();

	const populate = (() => {
		const location = (locationName) => {
			document.getElementById("location").textContent = locationName;
		}

		const getUnit = () => {
			return `${String.fromCharCode(176)}C`
		}

		const getDayNight = (time, sunrise, sunset) => {
			return (time > sunrise && time < sunset ? "day" : "night")
		}

		const dailySummary = (() => {
			const createHighLow = (weather, d, parentEl) => {				
					if (!(parentEl.hasChildNodes())) {
						const high = document.createElement("p");
						const low = document.createElement("p");
	
						high.setAttribute("class", "high");
						low.setAttribute("class", "low");
	
						parentEl.appendChild(high);
						parentEl.appendChild(low);
	
					}
					console.log(parentEl)
					const high = parentEl.firstChild;
					const low = parentEl.lastChild;

					high.textContent = `H:${weather.daily[d].high}${getUnit()}`;
					low.textContent = `L:${weather.daily[d].low}${getUnit()}`;

				}

				const createDate = (weather, d, dateEl) => {
					if (d === "0") {
						dateEl.textContent = "Today"
					} else {
						dateEl.textContent = `${weather.daily[d].date}`
					}
				}
	
				const createCurrentTemp = (weather, tempEl) => {				
					tempEl.textContent = `${weather.hourly[0].temp}${getUnit()}`;
				}
	
				const createIcon = (weather, d, element) => {
					let date = new Date;
					let time = date.toLocaleTimeString()
					
					let dayNight = "day";
	
					if (d === "0") {
						dayNight = getDayNight(time, parseInt(weather.daily[0].sunrise), parseInt(weather.daily[0].sunset));
					}
	
					element.className = `wi wi-owm-${dayNight}-${weather.daily[d].icon}`;
				}
	
				const card  = (weather, d) => {
					const summaryChildren = document.querySelector(`#weather-summary-day-${d}`).children;					
					for (let c in summaryChildren) {
						switch (summaryChildren[c].className) {
							case "weather-date": 
								createDate(weather, d, summaryChildren[c]);
								break;
							case "icon":
								createIcon(weather, d, summaryChildren[c]);
								break;
							case "current-temp":
								createCurrentTemp(weather, summaryChildren[c]);
								break;
							case "high-low":
								createHighLow(weather, d, summaryChildren[c]);
								break;
							default:
								if (typeof summaryChildren[c] === "object") {
									console.log("cant find")
									console.log(typeof summaryChildren[c].nodeName)
								} 
								break;
						}
					}
				}
				return {card}
			})();
			
			const hourly = (weather) => {
				const ulEl = document.getElementById("todays-weather-hourly-list");
				const sunrise = parseInt(weather.daily[0].sunrise);
				const sunset = parseInt(weather.daily[0].sunset);
				for (let h in weather.hourly) {
					const icon = weather.hourly[h].icon;
					const time = weather.hourly[h].time;
					if (!(document.getElementById(`liEl${h}`))) { 
						elementCreator("li", "#todays-weather-hourly-list",["id", `liEl${h}`]);
						elementCreator("p", `#liEl${h}`, ["class", "time"]);
						elementCreator("i", `#liEl${h}`, ["class", `wi wi-owm-${getDayNight(time, sunrise, sunset)}-${icon}`])
						elementCreator("p", `#liEl${h}`, ["class", "temp"]);
					}
					
					const liEl = document.getElementById(`liEl${h}`);
					for (let c in liEl.children) {
						switch(liEl.children[c].className) {
							case "time":
								liEl.children[c].textContent = time;
								break;
							case "temp":
								liEl.children[c].textContent = `${weather.hourly[h].temp}${getUnit()}`
								break;
							}
					}
				}
			}
			
			return {location, dailySummary, hourly}
		})();

		const events = (() => {
			const readInput = () => {
				let input = document.getElementById("search-input").value;
				return input;
			}

			const submit = async () => {
				const input = readInput();
				const coordsObj = await search.getCoords(input);
				const coords = organiseCoords(coordsObj)
				loadData.populate(coords)
			}

			const addListeners = () => {
				const submitBtn = document.querySelector("#submit-btn");

				submitBtn.addEventListener("click", function() {
					submit();
				})

				const searchForm = document.querySelector("#search-form");

				searchForm.addEventListener("submit", function(event) {
					event.preventDefault();
					if (event.keyCode === 13) {
						event();
					}
				})
			}
			return {addListeners}
		})();

		const populateDom = (weather, locationName) => {
			populate.location(locationName)
			for (let d in weather.daily) {
				populate.dailySummary.card(weather, d);
			}			
			populate.hourly(weather);	
		}

		const onloadDom = (weather, locationName) => {				
			onload.createElements();
			events.addListeners();
			populateDom(weather, locationName);	
			
		}

		return {onloadDom, populateDom};
	})();

	export{dom};


