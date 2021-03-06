;(function (undefined) {
/**
* Return Promice
* get coordinates object
*/
function getLocation() {
  return new Promise((resolve, reject) => {
     if(navigator.geolocation) {
       getGeoLocation().then(resolve, () => {
         getLocationByIp().then(resolve)
       })
     } else {
       getLocationByIp().then(resolve);
     }
  });
 }

/**
* Gey promise with geplocation coords
*/
function getGeoLocation () {
      return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((data) => {
        resolve({
           latitude: data.coords.latitude,
           longitude: data.coords.longitude,
           source: 'geo'
         });
      }, reject);
    });
}

/**
* Get promice with location by ip addr
*/
function getLocationByIp () {
    return new Promise((resolve, reject) => {
      requestJSON('GET', 'https://ipinfo.io/geo', (data) => {
        let ipCoord = data.loc.split(',');
          resolve({
            latitude: +ipCoord[0],
            longitude: +ipCoord[1],
            source: 'ip'
          });
      } )
  });
} 

/**
* Get Promice with weather info by location
*/
async function getWeatherInfo(lat, long) {
	return new Promise((resolve, reject) => {
	requestJSON('GET',
                `https://fcc-weather-api.glitch.me/api/current?lat=${lat}&lon=${long}`,
                resolve);
  });
}

function requestJSON (method, url, callback) {
   let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
    if(xhr.readyState === 4) {
        callback(xhr.response);
    }
  };
    xhr.send();
}

	const currentUnit = { 
	     temp : 'celsius',
	      press : 'hPa',
		  update: function (param, newValue) {
			this[param] = newValue;
			  localStorage.setItem(`fcc_local_weather_${param}`, newValue)
		  },
		load: function () {
			this.temp = localStorage.getItem('fcc_local_weather_temp') || 'celsius';
			this.press = localStorage.getItem('fcc_local_weather_press') || 'hPa';
		}
	};


async function App () {
/*	const currentUnit = { 
	     temp : 'celsius',
	      press : 'hPa';
		  update: function (param, newValue) {
			this[param] = newValue
		  }
	}; */
	currentUnit.load();

	try {
		const pos = await getLocation();
		const weather = await getWeatherInfo(pos.latitude, pos.longitude);
		const weatherBlock = document.querySelector('#weather');

		View.render(weatherBlock, weather, currentUnit, template);
    
		weatherBlock.addEventListener('click', (e) => {
			values = {
				temp: weather.main.temp,
				press: weather.main.pressure
			}
			if(e.target.dataset.action === 'toggle-unit') {
				const param = e.target.dataset.parameter;
				const units = Unit.getUnitsKeys(param);
				let unitIndex = units.indexOf(currentUnit[param]);
				currentUnit.update(param, units[(unitIndex + 1) % units.length]);
				const currentParam = Unit.getParam(param, currentUnit[param]);
				View.setParameter(param, weatherBlock, currentParam.convert(values[param]), currentParam.mark)
			}
		});
	} catch (e) {
		console.error('Something wrong!!!');
		console.error(e);
	}
}
  

function View () {}

View.setParameter = function (parameter, parent, temp, unitMark) {
	parent.querySelector(`.${parameter}-value`).innerHTML = (temp).toFixed(1);
	parent.querySelector(`.${parameter}-unit`).innerHTML = unitMark;
}

View.render = function (element, data, current, templateFunc) {
		let weatherInfo = element.querySelector('.weather-info');
		weatherInfo.innerHTML = templateFunc(data);
  
		View.setParameter('temp', weatherInfo, Unit.getParam('temp',current.temp).convert(data.main.temp), Unit.getParam('temp',current.temp).mark);
  
		View.setParameter('press', weatherInfo, Unit.getParam('press',current.press).convert(data.main.pressure), Unit.getParam('press',current.press).mark);

		element.appendChild(weatherInfo);

}

App();
  
function template(data) {
  return `
  <h2 class="location">
    <span class="city">${data.name}</span>,
    <span class="country">${data.sys.country}</span>
  </h2>
  <div class="weather-main">
      <div class="weather-status">
        <span class="cloud-desc">${data.weather[0].main}</span>
        <image class="weather-icon" src="${data.weather[0].icon}" alt="${data.weather[0].description}" >
      </div>
      <div class="temperature">
         <span class="temp-value"></span>
         <button class="temp-unit" data-action="toggle-unit" data-parameter="temp"></button>
      </div>
 </div>
 <div class="secondary-info">
   <span>Pressure:</span>
   <span class="press-value"></span>
   <button class="press-unit" data-action="toggle-unit" data-parameter="press"></button>
 </div>
 <div class="secondary-info">
   <span>Wind:</span>
   <span class="wind-speed">${data.wind.speed} m/s</span>,
   <span class="wind-direction">${data.wind.deg}deg</span>
 </div>
`;
}
})();
