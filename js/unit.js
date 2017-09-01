const Unit = (function (undefined) {
/*let units = {temp: ['celsius', 'fahrenheit', 'kelvin'],
             press: ['hPa', 'mmHg', 'bar']
};*/

const Units = {
  temp: {
  celsius: {
    mark: 'C',
    convert: (temp) => temp
  },
  fahrenheit: {
    mark: 'F',
    convert: (temp) => temp * 1.8 + 32
  },
  kelvin: {
    mark: 'K',
    convert: (temp) => temp + 273.15
  }
  },
  press: {
    hPa : {
      mark: 'hPa',
      convert: (press) => press,
    },
    bar : {
      mark: 'bars',
      convert: (press) => press / 1000,
    },
    mmHg : {
      mark: 'mmHg',
      convert: (press) => press / 1.3332239
    }
  }
};

return {
	getUnitsKeys: (param) => Object.keys(Units[param]),
	getParam: (param, value) => Units[param][value]
}

})();
