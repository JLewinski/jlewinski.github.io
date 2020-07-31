const confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
const confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
const fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";









/**
 * Gets a string representing a random color
 */
function randomColorString() {
    var r = Math.floor(Math.random() * 255) - 1;
    var g = Math.floor(Math.random() * 255) - 1;
    var b = Math.floor(Math.random() * 255) - 1;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

/**
 * Creates a plot
 * @param {number} elementId Id of the HTML attribute
 * @param {number[]} data Data for the y-axis
 * @param {string} title Title of the graph
 * @param {string[]} subDates Data for the x-axis
 * @param {string} type Type of plot (default is 'bar')
 */
function CreatePlot(elementId, data, title, subDates, type) {
    var ctx = document.getElementById(elementId);
    var color = randomColorString();
    var dataset = {
        data: data,
        backgroundColor: color,
        borderColor: color
    };
    //default type is bar
    if (!type) { type = 'bar'; }
    return new Chart(ctx, {
        type: type,
        data: {
            labels: subDates,
            datasets: [dataset]
        },
        options: {
            legend: {
                display: false
            },
            // scales: {
            //     yAxes: [{
            //         ticks: {
            //             beginAtZero: true
            //         }
            //     }]
            // },
            title: {
                display: true,
                text: title
            }
        }
    });
}

/**
 * If the location doesn't have any data it
 * gets sums from the children data. It also
 * gets the population from the children.
 * It sets the population and data for the location
 * @param {MyLocation} location
 * @returns {number[]} Data representing the total number of confirmed cases
 */
function GetData(location) {
    if (location.data) {
        return location.data;
    }
    location.populationChecked = true;
    location.population = 0;
    location.data = Array(location[location.names[Math.floor(location.names.length / 2)]].data.length).fill(0);
    location.names.filter(x => x != 'All').forEach(x => {
        var childData = GetData(location[x]);
        if (!location.data.length) {
            childData.forEach(val => location.data.push(0));
        }
        for (var i = 0; i < location.data.length; i++) {
            location.data[i] += childData[i] * 1;
        }
        location.population += location[x].population;
    });
    return location.data;
}

/**
 * If the population isn't alread set it
 * gets it from it's children (currently
 * only locations contained in the fatalCases
 * have population data)
 * @param {MyLocation} location
 * @returns {number} population
 */
function GetPopulation(location) {
    if (location.population || location.populationChecked) {
        location.population *= 1;
        return location.population;
    }
    location.population = 0;
    location.populationChecked = true;
    location.names.filter(x => x != 'All').forEach(x => {
        var pop = GetPopulation(location[x]);
        location.population += pop;
    });
    location.population *= 1;
    return location.population;
}

/**
 * Gets the location from the given array.
 * @param {string} key A string containing a path to the location (area, state/province, country)
 * @param {LocationCollection} container Array of locations to search
 * @returns {MyLocation} Location with matching key
 */
function GetLocation(key, container) {
    var location = container;
    key.split(', ').reverse().forEach(x => {
        location = location[x];
    });
    return location;
}

/**
 * Gets the location from fatalCases with the given key
 * @param {string} key A string containing a path to the location (area, state/province, country)
 * @returns {MyLocation} Location from fatalCases with matching key
 */
function GetFatalityLocation(key) {
    var faltalityLocation = vm.fatalCases;
    key.split(', ').reverse().forEach(x => {
        faltalityLocation = faltalityLocation[x];
    });
    return faltalityLocation;
}

/**
 * Gets newly confirmed/fatal cases on a per-day basis from the origional data
 * @param {number[]} data Data representing the total number of confirmed/fatal cases over a given amount of time
 * @returns {number[]} new confirmed/fatal cases per day
 */
function GetTimeData(data) {
    var timeData = [];
    for (var i = 1; i < data.length; i++) {
        var temp = data[i] - data[i - 1];
        if (temp < 0) {
            temp = 0;
        }
        timeData.push(temp);
    }
    return timeData;
}

/**
 * Updates a given chart
 * @param {Chart} chart The Chart.js chart
 * @param {number[]} data y-axis data
 * @param {string} title Title of the chart
 * @param {string[]} subDates x-axis data
 */
function UpdateChart(chart, data, title, subDates) {
    chart.data.datasets[0].data = data;
    chart.options.title.text = title;
    chart.data.labels = subDates;
    chart.update();
}

/**
 * Updates the charts within the given ChartGroup. This is
 * called whenever one of the display parameters or location
 * parameters is changed. It will create the plots if they
 * do not yet exist.
 * @param {ChartGroup} self
 */
function UpdateCharts(self) {
    var location;

    self.selectedCountry = vm.confirmedCases[self.selectedCountryName];
    self.selectedState = self.selectedCountry[self.selectedStateName];

    if (self.selectedState) {
        self.selectedCity = self.selectedState[self.selectedCityName];
    } else {
        self.selectedCity = null;
    }

    if (self.selectedCity) {
        location = self.selectedCity;
    } else if (self.selectedState) {
        location = self.selectedState;
    } else {
        location = self.selectedCountry;
    }

    GetData(location);

    if (!location.timeData) {
        location.timeData = GetTimeData(GetData(location));
    }

    if (!location.fatalityData) {
        var fatalLocation = GetFatalityLocation(location.key);
        location.fatalityData = GetData(fatalLocation);
        location.population = GetPopulation(fatalLocation);
        location.fatalityTimeData = GetTimeData(location.fatalityData);
    }

    location.fatalityRatioData = [];

    for (let index = self.startDateIndex * 1; index <= self.endDateIndex * 1; index++) {
        let confirmed = 0;
        let fatal = 0;
        let offset = self.offset * 1;
        let range = self.range * 1;
        for (let i = index; i < index + range; i++) {
            confirmed += location.timeData[i];
            fatal += location.fatalityTimeData[i + offset];
        }
        let ratio;
        if (confirmed) {
            ratio = fatal / confirmed * 100;
        } else {
            ratio = fatal;
        }

        location.fatalityRatioData.push(ratio.toFixed(2) * 1);
    }
    var totalCases = location.data[self.endDateIndex] - location.data[self.startDateIndex * 1 - 1];
    var totalFatalCases = location.fatalityData[self.endDateIndex] - location.fatalityData[self.startDateIndex * 1 - 1];

    if (self.startDateIndex == 0) {
        totalCases = location.data[self.endDateIndex];
        totalFatalCases = location.fatalityData[self.endDateIndex];
    }

    var confirmedTitle = location.name + ' Confirmed Cases (' + totalCases + ' total)';
    var fatalityTitle = location.name + ' Fatal Cases (' + totalFatalCases + ' total)';
    var totalFatality = totalFatalCases / totalCases * 100;
    var fatalityRatioTitle = location.name + ' % Cases Fatal (' + totalFatality.toFixed(2) + '% of all cases fatal)';
    var popTitle = location.name + ' Total Cases';
    if (location.population) {
        var popPercentage = totalCases / location.population * 100;
        popTitle += ' (' + popPercentage.toFixed(2) + '% of Population)';
    }

    var subDates = vm.dates.slice(self.startDateIndex, self.endDateIndex * 1 + 1);

    if (!self.confirmedChart) {
        self.confirmedChart = CreatePlot('confirmedChart' + self.id, location.timeData.slice(self.startDateIndex, self.endDateIndex * 1 + 1), confirmedTitle, subDates);
        self.fatalityChart = CreatePlot('fatalityChart' + self.id, location.fatalityTimeData.slice(self.startDateIndex, self.endDateIndex * 1 + 1), fatalityTitle, subDates);
        self.fatalityRatioChart = CreatePlot('fatalityRatioChart' + self.id, location.fatalityRatioData, fatalityRatioTitle, subDates);
        // self.fatalityRatioChart.options.scales.yAxes[0].ticks.max = 25;
        self.fatalityRatioChart.options.scales.yAxes[0].scaleLabel.labelString = 'Percent Fatal'
        self.fatalityRatioChart.options.scales.yAxes[0].scaleLabel.display = true;
        self.fatalityRatioChart.update();
        self.populationChart = CreatePlot('populationChart' + self.id, location.data.slice(self.startDateIndex, self.endDateIndex * 1 + 1), popTitle, subDates, 'line');
    } else {
        UpdateChart(self.confirmedChart, location.timeData.slice(self.startDateIndex, self.endDateIndex * 1 + 1), confirmedTitle, subDates);
        UpdateChart(self.fatalityChart, location.fatalityTimeData.slice(self.startDateIndex, self.endDateIndex * 1 + 1), fatalityTitle, subDates);
        UpdateChart(self.fatalityRatioChart, location.fatalityRatioData, fatalityRatioTitle, subDates);
        UpdateChart(self.populationChart, location.data.slice(self.startDateIndex, self.endDateIndex * 1 + 1), popTitle, subDates);
    }
}

/**
 * @typedef ChartGroup An object containing 4 charts
 * @type {Object}
 * @property {number} id Unique id for the group
 * @property {string} selectedCountryName Name of the selected
 * country used by Knockout to select the country
 * @property {string} selectedStateName Name of the selected
 * state/province used by Knockout to select the state/province
 * @property {string} selectedCityName Name of the selected
 * county/city/area used by Knockout to select the county/city/area
 * @property {MyLocation} selectedCountry Selected country
 * @property {MyLocation} selectedState Selected state/province
 * @property {MyLocation} selectedCity Selected county/city/area
 * @property {number} offset The offset between the indexes of the
 * confirmed cases and fatal cases
 * @property {number} range The range of cases to look at when calculating
 * the fatality rate
 * @property {number} startDateIndex The start index of the data to display
 * @property {number} endDateIndex The end index of the data to display
 * @property {Function} updateCharts Updates all the contained charts
 */
/**
 * Creates a new chart group. Each chart group
 * contains 4 plots and the display parameters for
 * its plots.
 * @class
 */
function ChartGroup() {
    /**
     * @type {ChartGroup}
     */
    var self = {
        id: vm.lastID++,
        selectedCountryName: '',
        selectedStateName: '',
        selectedCityName: '',
        selectedCountry: {},
        selectedState: {},
        selectedCity: {},
        offset: 5,
        range: 5,
        startDateIndex: 42,
        endDateIndex: vm.confirmedCases.Ireland.data.length - 1
    };

    self.updateCharts = function () { UpdateCharts(self); };

    ko.track(self);
    return self;
};

/**
 * A collection of locations where each location is accessed by its name.
 * @typedef LocationCollection
 * @property {string[]} names An array of all the names of the contained locations
 * @property {Function} addLocation Adds a location to the collection. It will add
 * @property {Object<string, MyLocation>} children
 * all the necessary parents if they aren't already there (based on the Location's key)
 */
/**
 * @returns {LocationCollection} A collection of locations
 */
function LocationCollection() {
    var self = { names: ['All'] };
    self.addLocation = function (location) {
        var key = location.key.split(', ').reverse().filter(x => x);
        var i;
        var parent = self;
        var parentKey = '';
        for (i = 0; i < key.length - 1; i++) {
            if (parentKey) {
                parentKey = key[i] + ', ' + parentKey;
            } else {
                parentKey = key[i];
            }
            if (!parent[key[i]]) {
                parent.names.push(key[i]);
                parent[key[i]] = { names: ['All'], name: key[i], key: parentKey };
            }
            parent = parent[key[i]];
        }
        parent.names.push(key[i]);
        parent[key[i]] = location;
    };
    return self;
}

/**
 * Formats the CSV string to prevent values with ","'s from being treated like
 * more than one value
 * @param {string} locationCSV The (unformatted) CSV string of the location
 * @returns {string} Formatted CSV string
 */
function GetLocationData(locationCSV) {
    var temp = locationCSV.split('"');
    locationCSV = '';
    for (var i = 0; i < temp.length; i++) {
        if (i % 2) {
            locationCSV += temp[i].replace(/,/g, ';');
        } else {
            locationCSV += temp[i];
        }
    }
    return locationCSV.split(',');
}


/**
* A country, state/province, or county/city/area which contains data.
* It also functions as a LocationCollection
* @typedef MyLocation
* @property {string[]} names A list of names of the contained locations
* @property {number[]} data the total number of confirmed cases for the
* day and all days before but could instead be the fatalityData
* @property {number[]} [fatalityData] the total number of fatal cases for
* the day and all days before
* @property {number[]} [timeData] the number of newly confirmed cases for
* the day
* @property {number[]} [fatalityTimeData] the number of fatal cases for the
* day
* @property {boolean} [populationChecked] If the population has been properly
* calculated and formatted
* @property {string} key The full "path"
* @property {string} name
* @property {number} latitude
* @property {number} longitude
 * @property {Object<string, MyLocation>} children
*/
/**
 * Gets a location from the give values from the CSV string and indexes
 * of where the values are located
 * @param {string[]} locationData CSV values
 * @param {number} numStartIndex Index where the date data starts
 * @param {number} latitudeIndex
 * @param {number} longitudeIndex
 * @param {number} stateIndex
 * @param {number} countryIndex
 * @param {number} [cityIndex]
 * @param {number} [populationIndex]
 * @returns {MyLocation}
 */
function GetLocation(locationData, numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex) {
    var possibleNames = [cityIndex, stateIndex, countryIndex]
        .filter(x => x >= 0)
        .map(x => locationData[x])
        .filter(x => x)
        .map(x => x.replace(/;/g, ','));

    /**
     * @type number
     */
    var population;
    if (populationIndex) {
        population = locationData[populationIndex] * 1;
    } else {
        population = 0;
    }

    /**
     * @type {MyLocation}
     */
    var location = {
        name: possibleNames[0],
        latitude: locationData[latitudeIndex] * 1,
        longitude: locationData[longitudeIndex] * 1,
        population: population * 1,
        key: possibleNames.join(', '),
        data: locationData.slice(numStartIndex).map(x => x * 1),
        names: ['All']
    };
    location.children = location;
    return location;
}

/**
 * Adds all the locations in the given CSV to the LocationCollection
 * @param {string} csv Full csv data
 * @param {LocationCollection} storage Collection to store locations
 * @param {number} numStartIndex Index of where the date data starts
 * @param {number} latitudeIndex
 * @param {number} longitudeIndex
 * @param {number} stateIndex
 * @param {number} countryIndex
 * @param {number} [cityIndex]
 * @param {number} [populationIndex]
 */
function AddLocations(csv, storage, numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex) {
    csv.split('\n').slice(1).filter(x => x).forEach(data => {
        var location = GetLocation(GetLocationData(data), numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex);
        storage.addLocation(location);
    });
}

//Number of sources we're getting data from (don't want to start until they have all returned)
var countdown = 3;
function Start() {
    if (0 >= countdown--) {
        var chartGroup = ChartGroup();
        chartGroup.selectedCountryName = 'US';
        vm.chartGroups.push(chartGroup);
        chartGroup.updateCharts();
    }
}

/**
 * The View Model for this page
 * @typedef ViewModel
 * @type {Object}
 * @property {LocationCollection} confirmedCases locations which initially have
 * data containing the total number of confirmed cases by date
 * @property {LocationCollection} fatalCases locations which initially have
 * data containing the total number of fatal cases by date
 * @property {ChartGroup[]} chartGroups an array of all the created chart groups
 * @property {string[]} dates
 * @property {Function} addGroup Adds a new ChartGroup to its internal array
 */
/**
 * @class
 * @returns {ViewModel}
 */
function ViewModel(){
    vm = {
        confirmedCases: LocationCollection(),
        fatalCases: LocationCollection(),
        chartGroups: [],
        dates: [],
        lastID: 0,
        addGroup: Start
    };
    return vm;
}

/**
 * @type {ViewModel}
 */
var vm;