import { loadData } from "./organise.js";
import { dom } from "./dom.js"

const loadDefaultData = () => {		

	const success = async(pos) => {
		const coords = pos.coords;	
		loadData.onload(coords);		
	}

	const error = (err) => {
		console.error(err);
	}
			
	navigator.geolocation.getCurrentPosition(success, error);				
		
}
	
const domSetUp = (() => {		
	loadDefaultData();
})();


