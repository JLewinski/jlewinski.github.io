/// <reference path="./node_modules/knockout-es5"
var confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
var confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
var fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
var fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
var dataKeys = ['confirmed', 'confirmedTimeData', 'fatality', 'fatalityTimeData', 'fatalityRatioData'];
var basicDataKeys = ['confirmed', 'fatality'];
function SliceData(x, y) {
    return x.slice(y.startDateIndex, y.endDateIndex * 1 + 1);
}
var chartOptions = {
    confirmed: {
        type: 'line',
        dataAction: SliceData
    },
    confirmedTimeData: {
        type: 'bar',
        dataAction: SliceData
    },
    fatality: {
        type: 'bar',
        dataAction: SliceData
    },
    fatalityTimeData: {
        type: 'bar',
        dataAction: SliceData
    },
    fatalityRatioData: {
        type: 'bar',
        maxY: 25
    }
};
function CreatePlot(self, dataKey, data, title, subDates) {
    var options = chartOptions[dataKey];
    var ctx = document.getElementById(dataKey + self.id);
    var color = randomColorString();
    var dataset = {
        data: options.dataAction ? options.dataAction(data, self) : data,
        backgroundColor: color,
        borderColor: color
    };
    var chart = new Chart(ctx, {
        type: options.type,
        data: {
            labels: subDates,
            datasets: [dataset]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title
            }
        }
    });
    return chart;
}
var MyLocation = /** @class */ (function () {
    function MyLocation(locationData, dataKey, indexes) {
        var possibleNames;
        this.data = {};
        this.children = {};
        if (locationData.length > 4) {
            var numStartIndex = indexes[0], latitudeIndex = indexes[1], longitudeIndex = indexes[2], stateIndex = indexes[3], countryIndex = indexes[4], cityIndex = indexes[5], populationIndex = indexes[6];
            possibleNames = [cityIndex, stateIndex, countryIndex]
                .filter(function (x) { return x >= 0; })
                .map(function (x) { return locationData[x]; })
                .filter(function (x) { return x; })
                .map(function (x) { return x.replace(/;/g, ','); });
            this.latitude = parseInt(locationData[latitudeIndex]);
            this.longitude = parseInt(locationData[longitudeIndex]);
            this.population = 0;
            if (populationIndex) {
                this.population = parseInt(locationData[populationIndex]);
            }
            this.data[dataKey] = locationData.slice(numStartIndex).map(function (x) { return parseInt(x); });
        }
        else {
            possibleNames = locationData;
        }
        this.name = possibleNames[0];
        this.key = possibleNames.join(', ');
        this.names = ['All'];
    }
    MyLocation.prototype.GetData = function (key) {
        var _this = this;
        if (this.data[key]) {
            if (!this.populationChecked) {
                this.GetPopulation();
            }
            return this.data[key];
        }
        this.populationChecked = true;
        this.population = 0;
        var data;
        this.names.filter(function (x) { return x != 'All'; }).forEach(function (x) {
            var childData = _this.children[x].GetData(key);
            if (!data) {
                data = childData.map(function (x) { return x; });
            }
            else {
                childData.forEach(function (val, i) { return data[i] += val; });
            }
        });
        this.data[key] = data;
        return this.data[key];
    };
    MyLocation.prototype.GetPopulation = function () {
        var _this = this;
        if (this.populationChecked || this.population) {
            return this.population;
        }
        this.populationChecked = true;
        this.population = 0;
        this.names.filter(function (x) { return x != 'All'; }).forEach(function (x) {
            _this.population += _this.children[x].GetPopulation();
        });
        return this.population;
    };
    MyLocation.prototype.GetTimeData = function (key) {
        var data = this.data[key];
        var timeData = [];
        for (var i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            timeData.push(temp > 0 ? temp : 0);
        }
        this.data[key + 'TimeData'] = timeData;
        return this.data[key + 'TimeData'];
    };
    MyLocation.prototype.GetRange = function (key, startIndex, endIndex) {
        return this.data[key][endIndex] - startIndex > 0 ? this.data[key][startIndex - 1] : 0;
    };
    return MyLocation;
}());
function randomColorString() {
    function randRGB() { return Math.floor(Math.random() * 255) - 1; }
    return "rgb(" + randRGB() + "," + randRGB() + "," + randRGB() + ")";
}
/*
                                                                      ,,▄▄⌐
                                                               ,╓m%██████
                                                           ╓m▒▒▒▒▒▒████"
                                                j▓╗╦▄,,,m▒░▒▒▒▒▒▒▒██▀`
                 ,,,,              ,,,,,,,,     j▒╢▒▒▒▒▒▒▒▒▒▒▒▒▒▄▀▀
     ,▄▄▄████░▒▒▒▒▒▒▒▒▒▒▒░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒▒▒NÑ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒N╦▄,
      ▀▀██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒▒▒▒▒▒▒▒▒▒▒░▒▒N╦▄,
           ▀▀▀██▄▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒╢╣╫▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒▀
                ,,╫▄`-    ▐▒▒▒█▀'╙▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒▒▒▒▒╢╣╢╢▒╢▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
               v╢▒▒░▒▌    ▌▒▒███▄█▒▒▒▒▒▒▒▒▒▒▒▒▒█  ██▒▒▒▌╣╢╢╣╣╣▒╢▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╝
               █▒▒▒▒▒▒▒╦ ╣▒▒▒▒▒▀▀▒▒▒▒▒▒▒█▒▒▒▒▒▒█████▒▒▒▓╢╢╣╣╣╣╣╣▒╢▒▒▒▒▒▒▒▒▒▒▒▒▀
                █▒▒▒▒▒▒▒█▄▓▓▓▒▒▒▒▒▒▒▒▒▒▒▄▒▒▒▒▒▒▒▒▒▒▒▒▒▒▐╣█▀╩▒▒╢╢╣╢╣╢▒▒▒▒▒▒▒▒@
                 ░▒▒▒▒▒▒█▓▓▓▓╢▌▒▒▒░████▀▀█████▀▒▒▒▒▓▓▓▄▒▌▒▌   ▀╩╣▒╢╢╣╢▒▒▒▒▒▀
                 ╟▒▒▒▒▒▒█╢▓▓▓╫▒▒▒▒▒▒▌▒▒▒▒▒▒▒█▒▒▒▒▐╢▓▓▓╢██╢▒       '▀╣▒╣╢▒▒"
                  ▌▒▒▒▒▒▒█▀╩▀▒▒▒▒▒▒▒▒▒▒▒▒▒▒▀▒▒▒▒▒▐╣▓▓▓▓█▒╢╢█           ▀▀
                  ▐▒▒▒▒▒▒▒▀▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓█▀▒▒▒▒▌
                   ▐▒▒▒▒▒▒▒▒▀▒▒▒▒▒▒▒▒▒▒▒░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒N▄
                    ╚╢▒▒▒▒▒▒▒░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒N▄╦m
                     ▀▒╣▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█
                      `▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╢╢▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▌
                      ,▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╫Ñ╩╩╩╜╜""`
                      █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▐▓██
                      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████
                     ▐▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▐█▀
                     ▌▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒⌐
                    j▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▌
                    ▐▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓
                    ▐▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▐
                    ▐▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▐
                     ╣╣╢╢▒▒▒▒▒▒▒▒▒▒╣╢╢╢╢╢╢╢╢╢╢╣▒▒▒▒▒▒▒▒▒▐
                      ╚▒▒╢╢╢╣▒▒▒ÑÑ╣╝╩╩╩╩╩╩╩╩╩╝╣ÑÑ▒▒▒╢╢╢╢▌
                     Æ▒▒▒▒╣╨`                       ▀Ñ▒▒▒▒▄
                    '"`'                               `"╙▀

---
^[ [^ascii ^art ^generator](http://asciiart.club) ^]
*/
var ChartGroup = /** @class */ (function () {
    function ChartGroup(vm) {
        this.id = vm.lastID++;
        this.selectedCountryName = '';
        this.selectedStateName = '';
        this.selectedCityName = '';
        this.selectedCity = null;
        this.selectedState = null;
        this.selectedCountry = null;
        this.offset = 5;
        this.range = 5;
        this.startDateIndex = 42;
        this.endDateIndex = Number.MAX_VALUE;
        this.charts = [];
        this.locationRoot = vm;
        this.dates = vm.dates;
        ko.track(this);
    }
    ChartGroup.prototype.updateCharts = function () {
        var _this = this;
        var _a, _b, _c, _d;
        this.selectedCountry = this.locationRoot.children[this.selectedCountryName];
        this.selectedState = this.selectedCountry.children[this.selectedCityName];
        this.selectedCity = (_a = this.selectedState) === null || _a === void 0 ? void 0 : _a.children[this.selectedCityName];
        var location = (_c = (_b = this.selectedCity) !== null && _b !== void 0 ? _b : this.selectedState) !== null && _c !== void 0 ? _c : this.selectedCountry;
        basicDataKeys.forEach(function (x) { location.GetData(x); location.GetTimeData(x); });
        if (this.endDateIndex >= location.data.confirmedTimeData.length) {
            this.endDateIndex = location.data.confirmedTimeData.length - 1;
        }
        location.data.fatalityRatioData = [];
        for (var i = this.startDateIndex; i <= this.endDateIndex - this.range - this.offset; i++) {
            var confirmed = location.data.confirmedTimeData.slice(i, i + this.range).reduce(function (a, b) { return a + b; });
            var fatal = location.data.fatalityTimeData.slice(i + this.offset, i + this.offset + this.range).reduce(function (a, b) { return a + b; });
            var ratio = confirmed ? fatal / confirmed * 100 : fatal;
            location.data.fatalityRatioData.push(ratio);
        }
        var totalCases = location.GetRange('confirmed', this.startDateIndex, this.endDateIndex);
        var totalFatalCases = location.GetRange('confirmed', this.startDateIndex, this.endDateIndex);
        var totalFatality = totalFatalCases / totalCases * 100;
        var popTitle = location.name + ' Total Cases';
        var fatTitle = location.name + ' Total Fatal Cases';
        if (location.population) {
            var populationPercentage = totalCases / location.population * 100;
            var popFatPercentage = totalFatalCases / location.population * 100;
            popTitle += " (" + populationPercentage.toFixed(2) + "% of Population)";
            fatTitle += " (" + popFatPercentage.toFixed(2) + "% of Population)";
        }
        var titles = {
            confirmed: popTitle,
            confirmedTimeData: location.name + " Confirmed Cases (" + totalCases + " total)",
            fatalityTimeData: location.name + " Fatal Cases (" + totalFatalCases + " total)",
            fatalityRatioData: location.name + " Morality Rate (" + totalFatality.toFixed(2) + "% total morality rate)",
            fatality: fatTitle
        };
        var subDates = this.dates.slice(this.startDateIndex, this.endDateIndex + 1);
        if (!this.charts) {
            this.charts = [];
        }
        if ((_d = this.charts) === null || _d === void 0 ? void 0 : _d.length) {
            this.charts.forEach(function (x) { return UpdateChart(_this, x.chart, x.name, location.data[x.name], titles[x.name], subDates); });
        }
        else {
            dataKeys.forEach(function (x, i) {
                _this.charts.push({ name: x });
                _this.charts[i].chart = CreatePlot(_this, x, location.data[x], titles[x], subDates);
            });
        }
    };
    return ChartGroup;
}());
function UpdateChart(self, chart, dataKey, data, title, subDates) {
    var options = chartOptions[dataKey];
    chart.data.datasets[0].data = options.dataAction ? options.dataAction(data, self) : data;
    chart.options.title.text = title;
    chart.data.labels = subDates;
    chart.update();
}
var ViewModel = /** @class */ (function () {
    function ViewModel() {
        var _this = this;
        this.children = {};
        this.chartGroups = [];
        this.names = [];
        this.lastID = 0;
        this.dates = [];
        this.countdown = 3;
        var tempDate = moment(new Date('1/22/20'));
        while (tempDate < moment()) {
            this.dates.push(tempDate.format('l'));
            tempDate.add(1, 'days');
        }
        function getCOVID19JohnsHopkinsData(options, vm) {
            $.get(options.url).done(function (result) {
                vm.addLocations(result, options.dataKey, options.indexParams);
                vm.addGroup();
            });
        }
        var dataOptions = [
            {
                url: confirmedGlobalDataUrl,
                indexParams: [4, 2, 3, 0, 1],
                dataKey: 'confirmed',
                getData: getCOVID19JohnsHopkinsData
            },
            {
                url: confirmedUSDataUrl,
                indexParams: [11, 8, 9, 6, 7, 5],
                dataKey: 'confirmed',
                getData: getCOVID19JohnsHopkinsData
            },
            {
                url: fatalGlobalDataUrl,
                indexParams: [4, 2, 3, 0, 1],
                dataKey: 'fatality',
                getData: getCOVID19JohnsHopkinsData
            },
            {
                url: fatalUSDataUrl,
                indexParams: [12, 8, 9, 6, 7, 5, 11],
                dataKey: 'fatality',
                getData: getCOVID19JohnsHopkinsData
            }
        ];
        dataOptions.forEach(function (x) { return x.getData(x, _this); });
        // ko.track(this.names);
        ko.track(this);
        ko.applyBindings(this);
    }
    ViewModel.prototype.addGroup = function () {
        if (0 >= this.countdown--) {
            var chartGroup = new ChartGroup(this);
            chartGroup.selectedCountryName = 'US';
            this.chartGroups.push(chartGroup);
            chartGroup.updateCharts();
        }
    };
    ViewModel.prototype.addLocation = function (location, dataKey) {
        var key = location.key.split(', ').reverse().filter(function (x) { return x; });
        var i;
        var parent = this;
        var parentKey = '';
        for (i = 0; i < key.length - 1; i++) {
            if (parentKey) {
                parentKey = key[i] + ', ' + parentKey;
            }
            else {
                parentKey = key[i];
            }
            if (!parent.children[key[i]]) {
                parent.names.push(key[i]);
                parent.children[key[i]] = new MyLocation(parentKey.split(', '));
            }
            parent = parent.children[key[i]];
        }
        parent.names.push(key[i]);
        if (parent.children[key[i]]) {
            parent.children[key[i]].data[dataKey] = location.data[dataKey];
            if (!parent.children[key[i]].population) {
                parent.children[key[i]].population = location.population;
            }
        }
        else {
            parent.children[key[i]] = location;
        }
    };
    ViewModel.prototype.addLocations = function (csv, dataKey, indexes) {
        var _this = this;
        csv.split('\n').slice(1).filter(function (x) { return x; }).forEach(function (data) {
            var location = new MyLocation(GetLocationData(data), dataKey, indexes);
            _this.addLocation(location, dataKey);
        });
    };
    return ViewModel;
}());
function GetLocationData(locationCSV) {
    var temp = locationCSV.split('"');
    locationCSV = '';
    for (var i = 0; i < temp.length; i++) {
        if (i % 2) {
            locationCSV += temp[i].replace(/,/g, ';');
        }
        else {
            locationCSV += temp[i];
        }
    }
    return locationCSV.split(',');
}
//# sourceMappingURL=covid19.js.map