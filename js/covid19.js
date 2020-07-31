const confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
const confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
const fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

var lastID = 0;
var dates = [];
var vm = {
    confirmedCases: LocationCollection(),
    fatalCases: LocationCollection(),
    chartGroups: []
};


function randomColorString() {
    var r = Math.floor(Math.random() * 255) - 1;
    var g = Math.floor(Math.random() * 255) - 1;
    var b = Math.floor(Math.random() * 255) - 1;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

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

function GetData(location) {
    if (location.data) {
        if (!location.dataChecked) {
            location.dataChecked = true;
            location.data = location.data.map(x => x * 1);
        }
        return location.data;
    }
    location.dataChecked = true;
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

function GetLocation(key, container) {
    var location = vm.fatalCases;
    key.split(', ').reverse().forEach(x => {
        location = location[x];
    });
    return location;
}

function GetFatalityLocation(key) {
    var faltalityLocation = vm.fatalCases;
    key.split(', ').reverse().forEach(x => {
        faltalityLocation = faltalityLocation[x];
    });
    return faltalityLocation;
}

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

function UpdateChart(chart, data, title, subDates) {
    chart.data.datasets[0].data = data;
    chart.options.title.text = title;
    chart.data.labels = subDates;
    chart.update();
}

function ChartGroup() {
    var self = {
        id: lastID++,
        selectedCountryName: '',
        selectedStateName: '',
        selectedCityName: '',
        selectedCountry: {},
        selectedState: {},
        selectedCity: {},
        offset: 5,
        range: 5,
        cutoffRate: 0.5,
        startDateIndex: 0,
        endDateIndex: vm.confirmedCases.Ireland.data.length - 1
    };

    self.updateCharts = function () {
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

        for(let index = self.startDateIndex * 1; index <= self.endDateIndex * 1; index++){
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

        if (self.startDateIndex == 0){
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

        var subDates = dates.slice(self.startDateIndex, self.endDateIndex * 1 + 1);

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
    };

    ko.track(self);
    return self;
};

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

function GetLocation(locationData, numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex) {
    var possibleNames = [cityIndex, stateIndex, countryIndex]
        .filter(x => x >= 0)
        .map(x => locationData[x])
        .filter(x => x)
        .map(x => x.replace(/;/g, ','));

    var population;
    if (populationIndex) {
        population = locationData[populationIndex];
    } else {
        population = 0;
    }

    var location = {
        name: possibleNames[0],
        latitude: locationData[latitudeIndex],
        longitude: locationData[longitudeIndex],
        population: population,
        key: possibleNames.join(', '),
        data: locationData.slice(numStartIndex),
        names: ['All']
    };
    location.timeData = GetTimeData(location.data);
    return location;
}

function AddLocations(csv, storage, numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex) {
    csv.split('\n').slice(1).filter(x => x).forEach(data => {
        var location = GetLocation(GetLocationData(data), numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex);
        storage.addLocation(location);
    });
}

var countdown = 3;
function Start() {
    if (0 >= countdown--) {
        var chartGroup = ChartGroup();
        chartGroup.selectedCountryName = 'US';
        vm.chartGroups.push(chartGroup);
        chartGroup.updateCharts();
    }
}

vm.addGroup = Start;