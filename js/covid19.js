var confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
var confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
var fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
var fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
function SliceData(x, y) {
    return x.slice(y.startDateIndex, y.endDateIndex + 1);
}
var chartOptions = {
    confirmed: {
        type: 'line',
        dataAction: SliceData,
        getDescription: function (location, options) {
            if (location.GetPopulation()) {
                var currentCases = location.GetRange('confirmed', options.startDateIndex, options.endDateIndex);
                var percentage = currentCases / location.population * 100;
                return percentage.toFixed(2) + "% of Population";
            }
            return null;
        }
    },
    default: {
        type: 'bar',
        dataAction: SliceData
    },
    RatioData: {
        type: 'bar',
        getDescription: function (location, options, key) {
            var data = location.data[key];
            var total = 0;
            data.forEach(function (x) { return total += x; });
            var average = total / data.length;
            var percentage = average * 100;
            return "Average Ratio: " + average.toFixed(2) + " (" + percentage.toFixed(2) + "%)";
        }
    }
};
var timeKey = 'TimeData';
var ratioKey = 'RatioData';
var derivativeKey = '`';
var MyLocation = /** @class */ (function () {
    function MyLocation(locationData, dataKey, indexes) {
        var possibleNames;
        this.data = {};
        this.dataKeys = [];
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
    MyLocation.prototype.GetData = function (key, options) {
        var _this = this;
        if (this.dataKeys.indexOf(key) < 0) {
            this.dataKeys.push(key);
        }
        if (this.data[key]) {
            if (!this.populationChecked) {
                this.GetPopulation();
            }
            return this.data[key];
        }
        if (key.substr(-timeKey.length) == timeKey) {
            var parentKey = key.substr(0, key.length - timeKey.length);
            return this.GetTimeData(parentKey, options);
        }
        if (key.substr(-ratioKey.length) == ratioKey) {
            var parentKeys = key.substr(0, key.length - ratioKey.length).split(';');
            return this.GetRatioData(parentKeys, options);
        }
        if (key.substr(-derivativeKey.length) == derivativeKey) {
            var parentKey = key.substring(0, key.length - derivativeKey.length);
            return this.GetDerivedData(parentKey, options);
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
            _this.population += _this.children[x].GetPopulation();
        });
        this.data[key] = data;
        return this.data[key];
    };
    MyLocation.prototype.GetDerivedData = function (key, options) {
        var data = this.GetData(key, options);
        var derivedData = [];
        for (var i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            derivedData.push(temp);
        }
        this.data[key + '`'] = derivedData;
        return this.data[key + '`'];
    };
    MyLocation.prototype.GetTimeData = function (key, options) {
        var data = this.GetData(key, options);
        var timeData = [];
        for (var i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            timeData.push(temp > 0 ? temp : 0);
        }
        this.data[key + 'TimeData'] = timeData;
        return this.data[key + 'TimeData'];
    };
    MyLocation.prototype.GetRatioData = function (keys, options) {
        var key = keys[0] + ";" + keys[1] + "RatioData";
        var data1 = this.GetData(keys[0], options);
        var data2 = this.GetData(keys[1], options);
        this.data[key] = [];
        var startDateIndex = options.startDateIndex, endDateIndex = options.endDateIndex, range = options.range, offset = options.offset;
        for (var i = startDateIndex; i <= endDateIndex - range - offset; i++) {
            var d1 = data1.slice(i, i + range).reduce(function (a, b) { return a + b; });
            var d2 = data2.slice(i + offset, i + offset + range).reduce(function (a, b) { return a + b; });
            var ratio = d2 ? d1 / d2 : d1;
            this.data[key].push(ratio);
        }
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
    MyLocation.prototype.GetRange = function (key, startIndex, endIndex) {
        var range = startIndex > 0 ? this.GetData(key)[endIndex] - this.GetData(key)[startIndex - 1] : this.GetData(key)[endIndex];
        return range > 0 ? range : this.data[key][startIndex - 1];
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
var MyChart = /** @class */ (function () {
    function MyChart(key, name, location, options, subDates) {
        var _a;
        this.key = key;
        this.name = name;
        this.id = Date.now();
        this.description = null;
        ko.track(this);
        this.options = (_a = chartOptions[key]) !== null && _a !== void 0 ? _a : (key.substr(-ratioKey.length) == ratioKey ? chartOptions.RatioData : chartOptions['default']);
        var self = this;
        setTimeout(function () { self.createChart(); self.update(location, options, subDates); }, 0);
    }
    MyChart.prototype.getData = function (data, options) {
        return this.options.dataAction ? this.options.dataAction(data, options) : data;
    };
    MyChart.prototype.createChart = function () {
        var ctx = document.getElementById(this.key + this.id);
        var color = randomColorString();
        this.chart = new Chart(ctx, {
            type: this.options.type,
            data: {
                datasets: [{
                        backgroundColor: color,
                        borderColor: color
                    }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: false,
                }
            }
        });
    };
    MyChart.prototype.update = function (location, options, subDates) {
        var data = this.getData(location.GetData(this.key), options);
        this.chart.data.datasets[0].data = data;
        if (this.options.getDescription) {
            this.description = this.options.getDescription(location, options, this.key);
        }
        this.chart.data.labels = subDates;
        this.chart.update();
    };
    return MyChart;
}());
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
        this.endDateIndex = -1;
        this.charts = [];
        this.locationRoot = vm;
        this.dates = vm.dates;
        ko.track(this);
    }
    ChartGroup.prototype.getSupportedCharts = function () {
        var _this = this;
        return supportedCharts.filter(function (x) { return !_this.charts.some(function (y) { return y.key == x.key; }); });
    };
    ChartGroup.prototype.addChart = function (key, name) {
        var location = this.getSelectedLocation();
        var data = location.GetData(key, this);
        var endDateIndex = this.endDateIndex;
        if (this.endDateIndex < this.startDateIndex || this.endDateIndex - this.startDateIndex >= data.length) {
            endDateIndex = data.length - 1;
            if (this.endDateIndex < 0) {
                this.endDateIndex = endDateIndex;
            }
        }
        var subDates = this.dates.slice(this.startDateIndex, endDateIndex + 1);
        var index = this.charts.push(new MyChart(key, name, location, this, subDates)) - 1;
        // this.charts[index].createChart();
        // this.charts[index].update(location, this, subDates);
    };
    ChartGroup.prototype.removeChart = function (chart) { this.charts.remove(chart); };
    ChartGroup.prototype.updateCharts = function () {
        var _this = this;
        var _a;
        var location = this.getSelectedLocation();
        var titles = this.getTitles(location, this.startDateIndex, this.endDateIndex);
        var subDates = this.dates.slice(this.startDateIndex, this.endDateIndex + 1);
        if ((_a = this.charts) === null || _a === void 0 ? void 0 : _a.length) {
            this.charts.forEach(function (x) { x.update(location, _this, subDates); });
        }
    };
    ChartGroup.prototype.getSelectedLocation = function () {
        var _a, _b, _c;
        this.selectedCountry = this.locationRoot.children[this.selectedCountryName];
        this.selectedState = this.selectedCountry.children[this.selectedStateName];
        this.selectedCity = (_a = this.selectedState) === null || _a === void 0 ? void 0 : _a.children[this.selectedCityName];
        var location = (_c = (_b = this.selectedCity) !== null && _b !== void 0 ? _b : this.selectedState) !== null && _c !== void 0 ? _c : this.selectedCountry;
        return location;
    };
    ChartGroup.prototype.getTitles = function (location, startDateIndex, endDateIndex) {
        var totalCases = location.GetRange('confirmed', startDateIndex, endDateIndex);
        var totalFatalCases = location.GetRange('fatality', startDateIndex, endDateIndex);
        var totalFatality = totalFatalCases / totalCases * 100;
        var popTitle = 'Total Confirmed';
        var fatTitle = 'Total Fatal';
        if (location.GetPopulation()) {
            var populationPercentage = totalCases / location.population * 100;
            var popFatPercentage = totalFatalCases / location.population * 100;
            popTitle += " (" + populationPercentage.toFixed(2) + "% of Population)";
            fatTitle += " (" + popFatPercentage.toFixed(2) + "% of Population)";
        }
        var titles = {
            confirmed: popTitle,
            confirmedTimeData: "Confirmed (" + totalCases + " total)",
            fatalityTimeData: "Fatal (" + totalFatalCases + " total)",
            fatalityRatioData: "Morality (" + totalFatality.toFixed(2) + "% total)",
            fatality: fatTitle
        };
        return titles;
    };
    return ChartGroup;
}());
function UpdateChart(self, chart, dataKey, data, title, subDates) {
    var _a;
    var options = ((_a = chartOptions[dataKey]) !== null && _a !== void 0 ? _a : chartOptions.default);
    chart.data.datasets[0].data = options.dataAction ? options.dataAction(data, self) : data;
    chart.options.title.text = title;
    chart.data.labels = subDates;
    chart.update();
}
var dataKeys = ['confirmed', 'confirmedTimeData', 'fatality', 'fatalityTimeData', 'fatalityRatioData'];
var supportedCharts = [
    {
        name: 'Total Confirmed',
        key: 'confirmed'
    },
    {
        name: 'Total Fatal',
        key: 'fatality'
    }
];
var ViewModel = /** @class */ (function () {
    function ViewModel() {
        var _this = this;
        this.children = {};
        this.chartGroups = [];
        this.names = [];
        this.lastID = 0;
        this.dates = [];
        this.countdown = 3;
        this.selectedTab = 'Basic';
        this.temp = '2';
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
            chartGroup.addChart('confirmed', 'Total Confirmed');
            chartGroup.addChart('fatality', 'Total Fatal');
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
            parent.children[key[i]].dataKeys.push(dataKey);
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