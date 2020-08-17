function toggleStuff(element, id) {
    element.className = 'far fa-' + (element.className.indexOf('edit') == -1 ? 'edit' : 'save');
    var input = document.getElementById(id);
    input.toggleAttribute('readonly');
    input.className = 'mr-1 form-control' + (input.className.indexOf('plaintext') == -1 ? '-plaintext' : '');
}
function COVID19() {
    var confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
    var confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    var fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
    var fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
    function SliceData(x, startIndex, endIndex) {
        var _a;
        if (startIndex > ((_a = x === null || x === void 0 ? void 0 : x.length) !== null && _a !== void 0 ? _a : -1)) {
            return x !== null && x !== void 0 ? x : [];
        }
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
        fatality: {
            type: 'line',
            getDescription: function (location, options) {
                if (location.GetPopulation()) {
                    var currentCases = location.GetRange('fatality', options.startDateIndex, options.endDateIndex);
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
        function MyLocation(name, key, dataKey, labels, data, dataKeys, children, childrenNames) {
            if (labels instanceof Array && dataKey) {
                this.labels = {};
                this.labels[dataKey] = labels;
            }
            else {
                this.labels = labels !== null && labels !== void 0 ? labels : {};
            }
            if (data instanceof Array && dataKey) {
                this.data = {};
                this.data[dataKey] = data;
            }
            else {
                this.data = data !== null && data !== void 0 ? data : {};
            }
            this.dataKeys = (dataKeys === null || dataKeys === void 0 ? void 0 : dataKeys.length) ? dataKeys : dataKey ? [dataKey] : [];
            this.name = name;
            this.key = key;
            this.children = children !== null && children !== void 0 ? children : {};
            this.names = childrenNames !== null && childrenNames !== void 0 ? childrenNames : ['All'];
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
            var data;
            this.names.filter(function (x) { return x != 'All'; }).forEach(function (x) {
                var _a;
                var childData = _this.children[x].GetData(key);
                if (!((_a = _this.labels[key]) === null || _a === void 0 ? void 0 : _a.length)) {
                    _this.labels[key] = _this.children[x].labels[key];
                }
                if (childData === null || childData === void 0 ? void 0 : childData.length) {
                    if (!data) {
                        data = childData.map(function (x) { return x; });
                    }
                    else {
                        childData.forEach(function (val, i) { return data[i] += val; });
                    }
                }
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
            this.data[key + derivativeKey] = derivedData;
            this.labels[key + derivativeKey] = this.labels[key];
            return this.data[key + derivativeKey];
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
            var length = this.labels[keys[0]].length;
            if (length != this.labels[keys[1]].length) {
                return this.data[key];
            }
            for (var i = 0; i < length; i++) {
                if (this.labels[keys[0]][i] != this.labels[keys[1]][i]) {
                    return this.data[key];
                }
            }
            this.labels[key] = this.labels[keys[0]];
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
            this.chart.data.labels = SliceData(location.labels[this.key], options.startDateIndex, options.startDateIndex + data.length);
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
            if (data && (this.endDateIndex < this.startDateIndex || this.endDateIndex - this.startDateIndex >= data.length)) {
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
    var supportedCharts = [];
    /*
                                       ▐▀▄
                                       █ ░▌
                                      ▄▌ ▒▒█▓▀▀▓▓▓▄▄
                                   ▄▀ ▐C ░╢▓▓▓╣╢╢╢╢╢▒▓▄
                                 ▄▀  ░░▌░▒▒╢▓▌╢╢╢╢╢╢╢╢▓▓▓,
                                ▄   ░░░░▀▀▀▒▒╢╢╢╢╢╢╢╢╢╢▓▓▓▄
                               ▓   ░░░░░░░░▒▒╢╢╢╢╢╢╢╢╢╢╢▓▓▓█
                              ▐C  ▄▀▄░░░░░░▒╢╢▓▓▒╢╢╢╢╢╢╢╢▓▓▓▌
                              █  ▐▄,▌░░░░░░▒╢▓▄,▌╢╢╢╢╢╢╢╢▓▓▓▓U
                             j▌  ░░░░░░░░░░▒╢╢▒▒╢╢╢╢╢╢▓▓▓▓▓▓▓▌▄,
                            ▄▀▌  ▄░░░░░░░░▒╢╢╢╢╢╢╢╢╢▓▓▓▓▀▀░░░▒╫▓█ç
                        ╒▄, ▌j▌  ▌░▄░░,░░░░▒▓╣╫▓▓▓╢▓▓█░  ░░▒▒╢▓▓▓█
                        ▐░▄█▌▒█░ ▀▄█▀▀░░▀░░▀▓▌▓▓█╢╢▓▓█  ░░░▒╢╢▓▓▓▓▌
                       ,▓▀,j▌▒╫▌░ "▀░░░░░░░▒▓▓▓▓╢╢▓▓▓▌  ░░░▒╢▓▓▓▓▓▀▀▀N▄ ▄▄▄
                    ▐▌▀▀▀▓▓▒█▒▓▓█░░,▄▄▄▄▄▄▄▄▓▓╢╢╢╣╢▓▀░,░▒▒╢▓▓▓▀░▒▄░░░▓▀░▒╢█
                    ╓█▄░▒╫╢█▓▒░▒▀█▌▌▓ ▓j▌▒▌█▓██▓▓▓▓▄▄▓▓▓╢▓╣█└░▄▀░▒▌▒█,░▒╫▓▌
                 ,Æ▀  ░▀▓▓█▓▓▓█`  ▀▀╨MA@▓▓▓▓▓▓▓▓▓▓██╣╢╢╢╢▒▀ ]▀ ,▒╫█╣╣▓▄▓█▓█▄,
              ,▄Ñ▀' `█NK█▄░░░▐⌐▀&▄    ░▒▒╢▒▓▓▀▀╢▓▓▓▌╢╢╢╢▒▌  ░▓▄▒╢█▓╢▓▓▓▓▓▓██▀
            ▄▓▀     ▄"╓▄▒▒█▓▄░█    ▀M▄@▀▀▒▒╢╢╢▓▓▓█╣╢╢╢╢╣▓▒  ░░░▄▓▀▀░░░░▒╢▓█
        ▄AM▀▐▌░░░░░░▌ ░░▒╢█▓╣█░▀,  ░░j▌▒▒╢╣╢╫▓▓▓█╣╢╢╢╢▓▓▓█▄▄▄█▌     '░░▒╫▓█
        ▀Ñ▄░▄▀░░▒▒╢█░ ░░▒▓█▓▓█░░░▓, ░░█▒▒╢╢▓▓█▓╣╢╢╢╢╢▓▓██████▄  '▀▀MNN▄▄▓▓█▌
        ╓@▀░░░▓▒▒╢▒▌  ░▒▓█▓█░░░░░░░▀▄░▐▌▒▒▓▓╣╢╢╢╢╢╢╢╢▓████████▀,  ░░░▒▒╫▓▓▓▓▌
         "▀▀▓██╢╢╢▓▌░░███▓█▀Ç ░░░░░░░░▀▀▀░▒╢╢╢╢╢╢╢╢╢╢████████▌ "▌   ░░░▒╢╢▓▓▓L
              ▀▀▓▓▓▓▓▓▓▓▓▀  ▀Ç ░)█@▄▄▄▄▄▄▓▓▓▓▓▓██▓╣╢╫███▓████-  ▄▀▀▀▀▀N▄▄▓▓▓▓█,
                     `       ▀▄ █ ▀▄  ░░▌╢▓▓▓▓█╢▓▓▓▓▓██▓▓███▌  ▐"  ░░░░░▒▓╫▓▓▓█
                              "█    ▀N▄░▐▒▓▓▓█╣╢╢╢▓▓▓▓█▓██▓█  ╔▀  ░░░░░░▒▓█▓▓▓█,
                                ▓,     ▀▀▀▀▀▒▒╢╢╢╢╢╢╢╢▓▓▓▓▓▌ ╓▌  ░░░░░░░░░░,,░░█
                                 ▌╩w╖,,,,░░▄▄▄╥WÅ▒▒▒▓▓▓▓█▀▀▌╓▀  ░░░░░░░░░▒▒╢╢▓▀
                                ▓╙W,,¿,,,,,,╓▒▒▒▒▒▒▄▀▀▐▀ ▄▀  ▀▄▄░░░░░░▒░░░▀▀▀█▀
                               ▓╙L └▓▒▒▓▓▒▒▒▒▒▒▒▒▓▀  ░░▌▐░░▓░░░░▓▄▒╢╢╫▓▓▓▓▓▀`
                               ▌ ▐  ░▓▒▒▒▒▒▒▒▒▒▓▀   ░░░▀▄▀█░░▓▒╢▓▓▓█▓▓█"
                               █  ▓░  ░▀▒▒▒▒▒▒▀   ░░░░░▒▒▀▓▀▀▓▓██▓▓▓▀▀@,
                               ╘▌ ░▓▒░  '░▒▒▓`   ░░░░░▒╢╢╢╣▓▓▓▓▓▌▒▒▒▒▒▒▒▓╖
                                ▐µ ▒▓▒▒,  ▄▄▌▄▄▄░░░░░▒╢╢╢▓▓▓▓▓▓▌▒▒▒▒▒▒▒▓╩╜^
                                 ▀▄ ▒▒▓▒▄▀ ▄▀░▒▒╢▓▓▓▒╢╢╫▓▓▓▓▓█▀▒▒▒▒▒▓╜
                                   ▀▄▄▒▓█ ▐░░░▒╢▓▓▓▓▓█╣▓▓▓▓▓▀▒▒▒▒▒▀
                                     ▓▓█▀▄▐░░░▒╢╢▓▓█▓▓█▓▓▀▀▒▒▒▒▒▀
                              ,▄,     ]▌ ╙▓▄▄@▓▀▒╢▓▓▓▓█▓▓▌▒▒▒╩"
                             ▄▀ ╙▄    █   ░░░▒╢╢╢▓▓▓▓█▓▓▓▓▓
                             ▌  ░░▓  ▓   ░░░▒╢╢╢▓▓▓▓█▓▓▓▓▓█
                             ▌  ░▒╢▓▄▌  ░░░▒╢╢╢▓▓▓▓█▓▒╫▓▓█
                             █  ░▒╢╫▓▓▄▒▒░▒╢╢▓▓▓▓█▀▌▒▒╢▓▀
                              ▌ ░▒╢╢▓▓▓▓█▒╢╫▓▓▓█▀  ▀ÑÑ▀
                               ▀▄░▒╢╢▓▓▓▓█▓█▓▀
                                ╙▌▒▒╢╫▓▓▓▓▓▀
                                 ╙▌▒╢╢▓▓█▀
                                   ▀▀▀▀`
    ---
    ^[ [^ascii ^art ^generator](http://asciiart.club) ^]
    */
    var chartDates;
    var ViewModel = /** @class */ (function () {
        function ViewModel() {
            var _this = this;
            this.children = {};
            this.chartGroups = [];
            this.names = [];
            this.lastID = 0;
            this.countdown = 3;
            this.selectedTab = 'Basic';
            this.temp = '2';
            this.dates = chartDates;
            setTimeout(function () { return _this.getDates(_this); }, 0);
            setTimeout(function () { return _this.getData(_this); }, 0);
            ko.track(this);
            ko.applyBindings(this);
        }
        ViewModel.prototype.addGroup = function () {
            var chartGroup = new ChartGroup(this);
            chartGroup.selectedCountryName = 'US';
            this.chartGroups.push(chartGroup);
            return chartGroup;
        };
        ViewModel.prototype.addLocation = function (location) {
            var key = location.key.split(', ').filter(function (x) { return x; }).reverse();
            var name = key.pop();
            var parent = this;
            var currentKey = '';
            key.forEach(function (name) {
                currentKey = currentKey ? name + ', ' + currentKey : name;
                if (!parent.children[name]) {
                    parent.names.push(name);
                    parent.children[name] = new MyLocation(name, currentKey);
                }
                parent = parent.children[name];
            });
            if (parent.children[name]) {
                location.dataKeys.forEach(function (dataKey) {
                    if (!parent.children[name].data[dataKey]) {
                        parent.children[name].dataKeys.push(dataKey);
                    }
                    parent.children[name].data[dataKey] = location.data[dataKey];
                    parent.children[name].labels[dataKey] = location.labels[dataKey];
                });
            }
            else {
                parent.names.push(name);
                parent.children[name] = location;
            }
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
        ViewModel.prototype.getDates = function (vm) {
            if (!chartDates) {
                chartDates = [];
                var tempDate = moment(new Date('1/22/20'));
                while (tempDate < moment()) {
                    chartDates.push(tempDate.format('l'));
                    tempDate.add(1, 'days');
                }
                vm.dates = chartDates;
            }
            return chartDates;
        };
        ViewModel.prototype.getData = function (vm) {
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
                },
                // {
                //     url: 'https://data.cdc.gov/resource/9bhg-hcku.json',
                //     getData: getOverallMortalityData
                // },
                {
                    url: 'https://data.cdc.gov/resource/nr4s-juj3.json',
                    getData: getUSCovidDataAge
                }
            ];
            vm.countdown = dataOptions.length;
            dataOptions.forEach(function (x) { return x.getData(x, vm); });
        };
        ViewModel.prototype.setup = function () {
            var _this = this;
            if (--this.countdown != 0) {
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
    /*                                    ,▄▄▄▄,
                                       ▄▄█╢▓▓▓╢▓██▄
                                     ▄█╢▓▓▓▓▓███▓▓▓█,  ▄█▌
                                   ▄█╢▓▓▓▓▓▓▓╢████▓▓▓█▓▓█
                                 ▄█╢▓▓▓▓▓▓▓▓▓▓▓▓▓████▓██
        You're a wizard         ██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█████
                              ╓█╢▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▀▀
                             ╓█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▄
                            ¿█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██
                           ╓█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▄
                          ╒█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
                          █▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▌
                         ██▓▓▓███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▌
        ███▓▄▄▄         ▐██████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▄,
     ,▄██▓▀▒▒▓▓█▄     ,▄██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓████████▄▄,
     ▀▌▓▓▓█▓▓▓▓▓█r  ▄██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▄
      ▀█▓▓╢▓▓▓▓█▀,▄█▓▓▓▓▓▓▓▓▓▓▓▓▀▀█▀▀▀░▒░░░░░░░░░░▓███▀▀▀▀▀▓█▓▓▓▓▓▓▓▓█▄
     ▄█▓▓▓▀▒╢▓▓▓██▓▓▓▓██▓█▌░░▒▒▄▓▒▒▒▒▓▀█▌░░░▒▄▓▓▒▒▒▄▓▓▓▓▄░▒▒█╢╣▀████████▄▄
      ██▓▓▓▓▓███▓██████╢╢╬▌░░▄█▓▀▀░▒▓▓▀▀░░░░░░▓▓▀▀▄▄▄░░░▒▀▀░█╢╢╢▒██████████
      ▄█▓▓▓▓███████████▌╢╢█░░╥▄▄▓▓█▀█▀░░░░░░░░░░▀▐▌▓█▌║█╜▀░░█╢╢╢╫▓▓███████┘
     ▄▌╫▓▓▓╣▓█████████▒╢╢╢█░▐▀ █▓▓█▓█▄░░░░░░░░░░▀▄█▓▓▓▓█▄▒░░█╢╢╢╣████████
     ▀██▓▓▓▓▓▓███████▌╢╢╢╢╫▌░░░▀▀▀▀▀▓░░░▄░░░░░░░░░▀▓▄░░░░░░█▒╢╣█▒▒██████
       █▓▓▓▓▓▓▓█▀███▀╢╣█▒╢╢▓▄░░▒▒Ä▀░░░░░█░░░░░░░░░░░░░░░░░▄▒╢╢╬██▌▒███▀
       ██▓▓▓▓▓▓█▌╓██▒╢▓██╢╢╢▒▓░░░░░░░░░g█░░░░░▄░░░░░░░░░░█▒╢╢╢╬████▓█
      ▄██▓▓▓▓▒▓▓█  █▒▒██▌█▓▓╢╢▀▄░░░░▄▄▄█▄▄░░░░▄█▓▓▓▀▓N▄▄▀╢╢╢╢╢▓█▀" ██
      █▓▓╢▓▓▓██▀   █▒█┌█▒╢▒▀╢╢╢╢▒█▓▒╢╣╣╣╢▒▒▒▒▒▒╣╣╣╣╣╣╢▒▀█▒╢╢╢╢▒█    ▀
       ▐█▓▓▓▓▓█     ▀██▒╢╣╢╢╢╢▒▓▀▒╣╢╢╢╣▒▓▀▀▀▀▓▄▒╣╣╢╢▒▄▄█▓█▌╢╢╣╣▒█
        █▓▓▓▓▓█      ▐█▌╢╣╢╢╢▒▀▓▓▓▓▓▓▓▓▀██████▒▒▀▓▓▓▒╢╢╢╢╢╢╢╢╣╢▓██▄
        █▓▓▓▓▓█       █▒█▒╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢▒▒╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢▒▒████▄
        ▐█▓▓▓▓█▄▄     ▀██▒╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╫█▒╢█████
      ▄██▀▀▀▀▓█░▓▌   ▄███╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢▓██▒██▓▓█
     ▐█▌╜▀▀▀▀M█▒████ ╙██▌╣╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢▓████████▌
     █▓▌▄▄ÑÑ▀▀██▓█▓▓█▄███▒╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢▓██▓▓▓▓█▓█⌐
     ▐█▓▄▄@▀▀██▓▓██▓▓█▓▓███▒╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╣╢╢██████▓▓▓▓█
      ████▓▓▓▓▓█▓███▓██▓▓▓▓██╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╣▒╣╢███████▓▓▓███,
      ▐█▓██▓▓▓▓████▓█▓▓█▓▓████▄╢╣╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╢╣╢╢╣╣▒╣▒███▓██▓█▓▓▓▓▓▓▓▌
      ]████▓▓▓▓████▓▓█▓▓█████████▒╢╣╢╢╢╢╢╢╢╢╢╢╢╢╢╣╣▒╣▄╢▒██▓█████▓███▓▓▓▓█`
       ████▓▓▓▓▓███▓▓▓███▓█▓████████▒▒▒╢╢╢╢╢╢╢▒╢▒╣╣╣╣█▒█▓███▓███████▓▓██▌
       ████▌▓▓▓▓█▓██▓▓▓████▓█████████▌████▒▒╣╣▒█▒╣╣╣╫██▓██▓███████▓███▓▓█▌
       █████▓▓▓█▓███▓▓▓▓███████████████▓█▓███▒╣▓█▒╣╢▓█████▓█▓▓▓▓██▓██▓████
       █████▓▓▓█▓████▓▓▓█████████████████████████▌╢▓██████▓▓▓▓▓▓▓▓▓██▓████▄
       ██████▓▓▓▓▓████▓▓▓████████████████████████▌███▓▒▓█████▓▓▓▓▓▓▓▓▓▓▓▓█▀
       ▐████▓▓▓▓▓██████▓▓▓████████████▓██████████████████████▓██▓▓▓▓▓▓▓█▀
        ████▓▓▓▓▓██████▓▓▓█████████████▓▓█▓▓▓▓▓▓█▓▓▓▓▓███████▓█████▓▓▓█`
        ████▓▓▓▓▓███████▓▓▓████████████▓▓█▓▓▓▓▓█▓▓▓▓▓▓██▓▓▓▓▓▓▓███▓▓█▀
        ████▓▓▓▓▓█▓█████▓▓▓████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▓▓▓▓▓▓▓█▄
        ████▓▓▓▓███▓▓█▓█▓▓▓█████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓▓█▌
        ████▓▓▓▓███▓▓▓█▓█▓▓█████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓▓▓▓█
          ╙█▌▓▓▓▓██▓▓▓▓▓████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓▓▓█
            █▓▓▓▓███▓▓▓▓▓███████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓█▓▓▓▓▓▓▓▓▓▓█
            █▓▓▓▓███▓▓▓▓▓▓███████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓██▓▓▓▓▓▓▓▓▓▓▓█
            ▐▌▓▓▓██████▓▓▓▓██████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓████▓▓▓▓▓▓▓▓▓▓▓█
             █▓▓▓▓▓██████▓▓██████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███▓█▓▓▓▓▓▓▓▓▓▓▓█▄
             █▓▓▓▓█▓██████████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓████▓█▓▓▓▓▓▓▓▓▓▓▓█▄
             █▓▓▓█▓▓█▄"██▀████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓█████▓█▓▓▓▓▓▓▓▓▓▓▓█▄
    ---
    ^[ [^ascii ^art ^generator](http://asciiart.club) ^]
    */
    return new ViewModel();
    //https://data.cdc.gov/resource/nr4s-juj3.json
    function getUSCovidDataAge(options, vm) {
        var ageGroups = ['0-4 years', '5-18 years', '19-44 years', '45-64 years', '65-74 years', '>75 years'];
        var ageData = [];
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var temp = JSON.parse(request.responseText);
                    temp.forEach(getData);
                    vm.addLocation(new MyLocation('US', 'US', 'covidAge', ageGroups, ageData));
                    supportedCharts.push({ name: 'COVID-19', key: 'covidAge' });
                    vm.setup();
                }
                else {
                    console.error(request.statusText);
                }
            }
        };
        request.onerror = function (e) {
            console.error(request.statusText);
            vm.setup();
        };
        request.send(null);
        function getData(data) {
            if (data.indicator == 'Age' && data.age_group != 'All ages') {
                ageData[ageGroups.indexOf(data.age_group)] = data.covid_19_deaths;
            }
        }
    }
    function getOverallMortalityData(options, vm) {
        var allAges = 'All ages';
        var illnessesString = 'Illnesses';
        var ageGroups = ['Under 1 year', '1-4 years', '5-14 years', '15-24 years', '25-34 years', '35-44 years', '45-54 years', '55-64 years', '65-74 years', '75-84 years', '85 years and over'];
        var illnesses = ['COVID-19', 'Pneumonia', 'Pneumonia and COVID-19', 'Influenza'];
        var dataKeyes = ageGroups.concat(illnesses);
        dataKeyes.push('All Ages');
        dataKeyes.forEach(function (key) { return supportedCharts.push({
            key: key,
            name: key
        }); });
        var totalText = ' Total';
        var labels = {};
        ageGroups.forEach(function (ageGroup) { return labels[ageGroup] = illnesses; });
        illnesses.forEach(function (illness) { return labels[illness] = ageGroups; });
        labels['All Ages'] = illnesses;
        var ageGroupData = {};
        var stateNames = [];
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var temp = JSON.parse(request.responseText);
                    temp.forEach(getData);
                    stateNames.forEach(function (name) {
                        ageGroups.forEach(function (ageGroup, agi) {
                            ageGroupData[name][ageGroup].forEach(function (val, index) {
                                ageGroupData[name][illnesses[index]][agi] = val;
                                ageGroupData[name]['All Ages'][index] += val;
                            });
                        });
                    });
                    stateNames.forEach(addLocations);
                    vm.setup();
                }
                else {
                    console.error(request.statusText);
                }
            }
        };
        request.onerror = function (e) {
            console.error(request.statusText);
            vm.setup();
        };
        request.send(null);
        function addLocations(name) {
            if (name == 'United States') {
                vm.addLocation(new MyLocation('US', 'US', null, labels, ageGroupData[name], dataKeyes));
                return;
            }
            var parentKey = name + ', US';
            vm.addLocation(new MyLocation(name, parentKey, null, labels, ageGroupData[name], dataKeyes));
        }
        function getDeathArr(row) {
            var t = [row.covid_19_deaths, row.pneumonia_deaths, row.pneumonia_and_covid_19_deaths, row.influenza_deaths].map(function (x) {
                var temp = x ? parseInt(x) : 0;
                if (temp == NaN || temp < 0) {
                    debugger;
                }
                return temp;
            });
            t[0] -= t[2];
            t[1] -= t[2];
            return t;
        }
        function getData(row) {
            var _a;
            if (row.state.substr(-totalText.length) == totalText || row.sex == 'All' || row.age_group == allAges) {
                return;
            }
            if (!ageGroupData[row.state]) {
                ageGroupData[row.state] = {};
                illnesses.forEach(function (val) {
                    ageGroupData[row.state][val] = [];
                    ageGroups.forEach(function (x) { return ageGroupData[row.state][val].push(0); });
                });
                stateNames.push(row.state);
                ageGroupData[row.state]['All Ages'] = [0, 0, 0, 0];
            }
            var tempData = getDeathArr(row);
            if ((_a = ageGroupData[row.state][row.age_group]) === null || _a === void 0 ? void 0 : _a.length) {
                ageGroupData[row.state][row.age_group].forEach(function (x, i, arr) { return arr[i] += tempData[i]; });
            }
            else {
                ageGroupData[row.state][row.age_group] = tempData;
            }
        }
    }
    function getCOVID19JohnsHopkinsData(options, vm) {
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var already = false;
                    for (var i = 0; i < supportedCharts.length; i++) {
                        already = supportedCharts[i].key == 'confirmed';
                        if (already) {
                            break;
                        }
                    }
                    if (!already) {
                        supportedCharts.push({ name: 'Total Confirmed', key: 'confirmed' });
                        supportedCharts.push({ name: 'Total Fatal', key: 'fatality' });
                        supportedCharts.push({ name: 'Confirmed Cases / Day', key: 'confirmed' + derivativeKey });
                        supportedCharts.push({ name: 'Fatal Cases / Day', key: 'fatality' + derivativeKey });
                        supportedCharts.push({ name: 'Mortality', key: 'fatality;confirmed' + ratioKey });
                        supportedCharts.push({ name: 'Mortality / Day', key: "fatality" + derivativeKey + ";confirmed" + derivativeKey + ratioKey });
                    }
                    GetCSVData(request.responseText).slice(1).filter(function (x) { return x === null || x === void 0 ? void 0 : x.length; })
                        .map(function (data) { return GetLocation(data, options.dataKey, options.indexParams); })
                        .forEach(function (location) { return vm.addLocation(location); });
                    vm.setup();
                }
                else {
                    console.error(request.statusText);
                }
            }
        };
        request.onerror = function (e) {
            console.error(request.statusText);
            vm.setup();
        };
        request.send(null);
        function GetLocation(locationData, dataKey, indexes) {
            var possibleNames;
            var latitude;
            var longitude;
            var population = 0;
            var data;
            if (locationData.length > 4) {
                var numStartIndex = indexes[0], latitudeIndex = indexes[1], longitudeIndex = indexes[2], stateIndex = indexes[3], countryIndex = indexes[4], cityIndex = indexes[5], populationIndex = indexes[6];
                possibleNames = [cityIndex, stateIndex, countryIndex]
                    .filter(function (x) { return x >= 0; })
                    .map(function (x) { return locationData[x]; })
                    .filter(function (x) { return x; })
                    .map(function (x) { return x.replace(/;/g, ','); });
                latitude = parseInt(locationData[latitudeIndex]);
                longitude = parseInt(locationData[longitudeIndex]);
                population = 0;
                if (populationIndex) {
                    population = parseInt(locationData[populationIndex]);
                }
                data = locationData.slice(numStartIndex).map(function (x) { return parseInt(x); });
            }
            else {
                possibleNames = locationData;
            }
            var location = new MyLocation(possibleNames[0], possibleNames.join(', '), dataKey, chartDates, data);
            location.population = population;
            location.longitude = longitude;
            location.latitude = latitude;
            return location;
        }
    }
    function GetCSVData(locationCSV) {
        var temp = locationCSV.split('"');
        locationCSV = '';
        for (var i = 0; i < temp.length; i++) {
            if (i % 2) {
                locationCSV += temp[i].replace(/\,/g, '$|||$');
            }
            else {
                locationCSV += temp[i];
            }
        }
        return locationCSV.split(/\r?\n|\r/).map(function (str) { return str.split(',').map(function (x) { return x === null || x === void 0 ? void 0 : x.replace(/\$\|\|\|\$/g, ','); }); });
    }
}
//# sourceMappingURL=covid19.js.map