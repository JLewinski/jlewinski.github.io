var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
var confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
var fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
var fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
function SliceData(x, startIndex, endIndex) {
    return endIndex < x.length ? x.slice(startIndex, endIndex) : x.slice(startIndex);
}
var chartOptions = {
    confirmed: {
        type: 'line',
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
        getDescription: function (location, options, data) {
            return 'Total: ' + data[data.length - 1];
        }
    },
    DerivativeData: {
        type: 'bar',
        getDescription: function (location, options, data) {
            var sum = 0;
            data.forEach(function (x) { return sum += x; });
            var average = sum / data.length;
            return "Avarage: " + average.toFixed(2);
        }
    },
    RatioData: {
        type: 'bar',
        getDescription: function (location, options, data) {
            // var data = SliceData(location.GetData(key), options.startDateIndex, options.endDateIndex);
            var total = 0;
            data.forEach(function (x) { return total += x; });
            var average = total / data.length;
            var percentage = average * 100;
            return "Average Ratio: " + average.toFixed(2) + " (" + percentage.toFixed(2) + "%)";
        },
        isRatio: true
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
        //Always update ratio data
        if (key.substr(-ratioKey.length) == ratioKey) {
            return this.GetRatioData(key, options);
        }
        if (this.data[key] && key.indexOf(ratioKey) == -1) {
            if (!this.populationChecked) {
                this.GetPopulation();
            }
            return this.data[key];
        }
        if (key.substr(-timeKey.length) == timeKey) {
            var parentKey = key.substr(0, key.length - timeKey.length);
            return this.GetTimeData(parentKey, options);
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
    MyLocation.prototype.GetRatioData = function (key, options) {
        var keys = key.substr(0, key.length - ratioKey.length).split(';');
        if (keys.length > 2) {
            var i = void 0;
            var temp1 = '';
            for (i = 0; i < keys.length / 2; i++) {
                temp1 += keys[i] + ';';
            }
            temp1 = temp1.substr(0, temp1.length - 1);
            var temp2 = '';
            for (i; i < keys.length; i++) {
                temp2 += keys[i] + ';';
            }
            temp2 = temp2.substr(0, temp2.length - 1);
            keys = [temp1, temp2];
        }
        var data1 = this.GetData(keys[0], options);
        var data2 = this.GetData(keys[1], options);
        this.data[key] = [];
        var range = options.range, offset = options.offset;
        for (var i = 0; i <= Math.min(data1.length, data2.length) - range - offset; i++) {
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
        if (endIndex >= this.GetData(key).length) {
            endIndex = this.data[key].length - 1;
        }
        var range = startIndex > 0 ? this.data[key][endIndex] - this.data[key][startIndex - 1] : this.data[key][endIndex];
        return range > 0 ? range : startIndex > 0 ? this.data[key][startIndex - 1] : 0;
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
    function MyChart(key, name, location, options) {
        var _a;
        this.key = key;
        this.name = name;
        this.id = Date.now();
        this.description = null;
        ko.track(this);
        this.options = (_a = chartOptions[key]) !== null && _a !== void 0 ? _a : (key.substr(-ratioKey.length) == ratioKey
            ? chartOptions.RatioData
            : (key.substr(-derivativeKey.length) == derivativeKey
                ? chartOptions.DerivativeData
                : chartOptions.default));
        var self = this;
        setTimeout(function () { self.createChart(); self.update(location, options); }, 0);
    }
    MyChart.prototype.createChart = function () {
        var ctx = document.getElementById(this.key + this.id);
        var color = randomColorString();
        this.chart = new Chart(ctx, {
            data: { datasets: [{ backgroundColor: color, borderColor: color }] },
            type: this.options.type,
            options: { legend: { display: false } }
        });
    };
    MyChart.prototype.update = function (location, options) {
        var data = SliceData(location.GetData(this.key, options), options.startDateIndex, options.endDateIndex);
        this.chart.data.datasets[0].data = data;
        if (this.options.getDescription) {
            this.description = this.options.getDescription(location, options, data);
        }
        this.chart.data.labels = SliceData(chartDates, options.startDateIndex, options.startDateIndex + data.length);
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
        this.endDateIndex = chartDates.length - 1;
        this.charts = [];
        this.locationRoot = vm;
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
        this.charts.push(new MyChart(key, name, location, this));
    };
    ChartGroup.prototype.removeChart = function (chart) { this.charts.remove(chart); if (!this.charts.length)
        this.locationRoot.chartGroups.remove(this); };
    ChartGroup.prototype.updateCharts = function () {
        var _this = this;
        var _a;
        var location = this.getSelectedLocation();
        if ((_a = this.charts) === null || _a === void 0 ? void 0 : _a.length) {
            this.charts.forEach(function (x) { x.update(location, _this); });
        }
    };
    ChartGroup.prototype.getSelectedLocation = function () {
        var _a, _b, _c;
        this.selectedCountry = this.locationRoot.children[this.selectedCountryName];
        this.selectedState = this.selectedCountry.children[this.selectedStateName];
        this.selectedCity = (_a = this.selectedState) === null || _a === void 0 ? void 0 : _a.children[this.selectedCityName];
        return (_c = (_b = this.selectedCity) !== null && _b !== void 0 ? _b : this.selectedState) !== null && _c !== void 0 ? _c : this.selectedCountry;
    };
    return ChartGroup;
}());
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
var chartDates;
var ViewModel = /** @class */ (function () {
    function ViewModel() {
        this.children = {};
        this.chartGroups = [];
        this.names = [];
        this.lastID = 0;
        this.countdown = 3;
        this.selectedTab = 'Basic';
        this.temp = '2';
        this.dates = chartDates;
        this.getDates();
        this.getData();
        ko.track(this);
        ko.applyBindings(this);
    }
    ViewModel.prototype.addGroup = function () {
        var chartGroup = new ChartGroup(this);
        chartGroup.selectedCountryName = 'US';
        this.chartGroups.push(chartGroup);
        return chartGroup;
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
            var location = new MyLocation(_this.getLocationData(data), dataKey, indexes);
            _this.addLocation(location, dataKey);
        });
    };
    ViewModel.prototype.getShareLink = function () {
        var query = this.chartGroups.map(function (x) {
            var _a, _b;
            var charts = x.charts.map(function (y) { return y.key + ']' + y.name; }).join(',');
            var location = (_b = (_a = x.selectedCity) !== null && _a !== void 0 ? _a : x.selectedState) !== null && _b !== void 0 ? _b : x.selectedCountry;
            return charts + '[' + (location === null || location === void 0 ? void 0 : location.key);
        }).join('|');
        return window.location.origin + window.location.pathname + '?charts=' + encodeURIComponent(query);
    };
    ViewModel.prototype.getDates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tempDate;
            return __generator(this, function (_a) {
                if (!chartDates) {
                    chartDates = [];
                    tempDate = moment(new Date('1/22/20'));
                    while (tempDate < moment()) {
                        chartDates.push(tempDate.format('l'));
                        tempDate.add(1, 'days');
                    }
                    this.dates = chartDates;
                }
                return [2 /*return*/, chartDates];
            });
        });
    };
    ViewModel.prototype.getData = function () {
        var _this = this;
        function getCOVID19JohnsHopkinsData(options, vm) {
            var request = new XMLHttpRequest();
            request.open('GET', options.url, true);
            request.onload = function (e) {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        vm.addLocations(request.responseText, options.dataKey, options.indexParams);
                        vm.setup();
                    }
                    else {
                        console.error(request.statusText);
                    }
                }
            };
            request.onerror = function (e) {
                console.error(request.statusText);
                vm.countdown--;
            };
            request.send(null);
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
        this.countdown = dataOptions.length;
        dataOptions.forEach(function (x) { return x.getData(x, _this); });
    };
    ViewModel.prototype.getLocationData = function (locationCSV) {
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
    };
    ViewModel.prototype.setup = function () {
        var _this = this;
        if (--this.countdown) {
            return;
        }
        var query = new URLSearchParams(window.location.search);
        if (!query.has('charts')) {
            var chartGroup = this.addGroup();
            chartGroup.addChart('confirmed', 'Total Confirmed');
            chartGroup.addChart('fatality', 'Total Fatal');
            return this.chartGroups.length;
        }
        query.get('charts').split('|').forEach(function (groupStr) {
            var _a;
            var _b = groupStr.split('['), chartsStr = _b[0], locationKey = _b[1];
            var group = _this.addGroup();
            _a = locationKey.split(', ').reverse(), group.selectedCountryName = _a[0], group.selectedStateName = _a[1], group.selectedCityName = _a[2];
            chartsStr.split(',').forEach(function (chartStr) {
                var _a = chartStr.split(']'), key = _a[0], name = _a[1];
                group.addChart(key, name);
            });
        });
        return this.chartGroups.length;
    };
    return ViewModel;
}());
//# sourceMappingURL=covid19.js.map