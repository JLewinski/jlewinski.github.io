const confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
const confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
const fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

interface ChartOptions {
    readonly type: string;
    readonly maxY?: number;
    readonly isRatio?: boolean;
    readonly getDescription?: (location: MyLocation, options: { startDateIndex: number; endDateIndex: number }, data: number[]) => string;
}

interface Dictionary<Tout> { [key: string]: Tout; }
interface ReadOnlyDictionary<Tout> { readonly [name: string]: Tout }

function SliceData<T>(x: T[], startIndex: number, endIndex: number): T[] {
    return endIndex < x.length ? x.slice(startIndex, endIndex) : x.slice(startIndex);
}

const chartOptions: ReadOnlyDictionary<ChartOptions> = {
    confirmed: {
        type: 'line',
        getDescription: function (location, options) {
            if (location.GetPopulation()) {
                var currentCases = location.GetRange('confirmed', options.startDateIndex, options.endDateIndex);
                var percentage = currentCases / location.population * 100;
                return `${percentage.toFixed(2)}% of Population`;
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
            let sum = 0;
            data.forEach(x => sum += x);
            let average = sum / data.length;
            return `Avarage: ${average.toFixed(2)}`;
        }
    },
    RatioData: {
        type: 'bar',
        getDescription: function (location, options, data) {
            // var data = SliceData(location.GetData(key), options.startDateIndex, options.endDateIndex);
            var total = 0;
            data.forEach(x => total += x);
            var average = total / data.length;
            var percentage = average * 100;
            return `Average Ratio: ${average.toFixed(2)} (${percentage.toFixed(2)}%)`;
        },
        isRatio: true
    }
};

interface LocationParent {
    children: Dictionary<MyLocation>;
    names: string[];
}

const timeKey = 'TimeData';
const ratioKey = 'RatioData';
const derivativeKey = '`';

class MyLocation implements LocationParent {
    children: Dictionary<MyLocation>;
    names: string[];
    data: Dictionary<number[]>;
    dataKeys: string[];
    readonly name: string;
    readonly key: string;
    latitude?: number;
    longitude?: number;
    population?: number;
    populationChecked?: boolean;

    constructor(locationData: string[], dataKey?: string, indexes?: ReadonlyArray<number>) {
        let possibleNames: string[];
        this.data = {};
        this.dataKeys = [];
        this.children = {};
        if (locationData.length > 4) {
            let [numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex] = indexes;

            possibleNames = [cityIndex, stateIndex, countryIndex]
                .filter(x => x >= 0)
                .map(x => locationData[x])
                .filter(x => x)
                .map(x => x.replace(/;/g, ','));


            this.latitude = parseInt(locationData[latitudeIndex]);
            this.longitude = parseInt(locationData[longitudeIndex]);

            this.population = 0;
            if (populationIndex) {
                this.population = parseInt(locationData[populationIndex]);
            }
            this.data[dataKey] = locationData.slice(numStartIndex).map(x => parseInt(x));
        }
        else {
            possibleNames = locationData;
        }

        this.name = possibleNames[0];
        this.key = possibleNames.join(', ');
        this.names = ['All'];
    }

    GetData(key: string, options?: { range: number, offset: number }) {
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
            let parentKey = key.substr(0, key.length - timeKey.length);
            return this.GetTimeData(parentKey, options);
        }

        if (key.substr(-derivativeKey.length) == derivativeKey) {
            let parentKey = key.substring(0, key.length - derivativeKey.length);
            return this.GetDerivedData(parentKey, options);
        }

        this.populationChecked = true;
        this.population = 0;
        let data: number[];
        this.names.filter(x => x != 'All').forEach(x => {
            let childData = this.children[x].GetData(key);
            if (!data) {
                data = childData.map(x => x);
            } else {
                childData.forEach((val, i) => data[i] += val);
            }
            this.population += this.children[x].GetPopulation();
        });
        this.data[key] = data;
        return this.data[key];
    }

    GetDerivedData(key: string, options?: { range: number, offset: number }) {
        var data = this.GetData(key, options);
        let derivedData = [];
        for (let i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            derivedData.push(temp);
        }
        this.data[key + '`'] = derivedData;
        return this.data[key + '`'];
    }

    GetTimeData(key: string, options?: { range: number, offset: number }) {
        let data = this.GetData(key, options);
        let timeData = [];
        for (let i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            timeData.push(temp > 0 ? temp : 0);
        }
        this.data[key + 'TimeData'] = timeData;
        return this.data[key + 'TimeData'];
    }

    GetRatioData(key: string, options: { range: number, offset: number }) {
        var keys = key.substr(0, key.length - ratioKey.length).split(';');
        if (keys.length > 2) {
            let i;
            let temp1 = '';
            for (i = 0; i < keys.length / 2; i++) {
                temp1 += keys[i] + ';';
            }
            temp1 = temp1.substr(0, temp1.length - 1);
            let temp2 = '';
            for (i; i < keys.length; i++) {
                temp2 += keys[i] + ';';
            }
            temp2 = temp2.substr(0, temp2.length - 1);
            keys = [temp1, temp2];
        }

        let data1 = this.GetData(keys[0], options);
        let data2 = this.GetData(keys[1], options);
        this.data[key] = [];

        let { range, offset } = options;

        for (let i = 0; i <= Math.min(data1.length, data2.length) - range - offset; i++) {
            let d1 = data1.slice(i, i + range).reduce((a, b) => a + b);
            let d2 = data2.slice(i + offset, i + offset + range).reduce((a, b) => a + b);
            let ratio = d2 ? d1 / d2 : d1;
            this.data[key].push(ratio);
        }
        return this.data[key];
    }

    GetPopulation() {
        if (this.populationChecked || this.population) {
            return this.population;
        }
        this.populationChecked = true;
        this.population = 0;
        this.names.filter(x => x != 'All').forEach(x => {
            this.population += this.children[x].GetPopulation()
        });
        return this.population;
    }

    GetRange(key: string, startIndex: number, endIndex: number) {
        if (endIndex >= this.GetData(key).length) {
            endIndex = this.data[key].length - 1;
        }
        let range = startIndex > 0 ? this.data[key][endIndex] - this.data[key][startIndex - 1] : this.data[key][endIndex];
        return range > 0 ? range : startIndex > 0 ? this.data[key][startIndex - 1] : 0;
    }
}

function randomColorString() {
    function randRGB() { return Math.floor(Math.random() * 255) - 1 }
    return `rgb(${randRGB()},${randRGB()},${randRGB()})`;
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

class MyChart {
    readonly key: string;
    readonly name: string;
    readonly id: number;
    description: string;
    chart?: Chart;
    options: ChartOptions;

    constructor(key: string, name: string, location: MyLocation, options: ChartGroup) {
        this.key = key;
        this.name = name;
        this.id = Date.now();
        this.description = null;
        ko.track(this);
        this.options = chartOptions[key] ??
            (key.substr(-ratioKey.length) == ratioKey
                ? chartOptions.RatioData
                : (key.substr(-derivativeKey.length) == derivativeKey
                    ? chartOptions.DerivativeData
                    : chartOptions.default));
        var self = this;
        setTimeout(() => { self.createChart(); self.update(location, options); }, 0);
    }

    private createChart() {
        let ctx = document.getElementById(this.key + this.id) as HTMLCanvasElement;
        let color = randomColorString();
        this.chart = new Chart(ctx, {
            data: { datasets: [{ backgroundColor: color, borderColor: color }] },
            type: this.options.type,
            options: { legend: { display: false } }
        });
    }

    update(location: MyLocation, options: { offset: number, range: number, startDateIndex: number, endDateIndex: number }) {
        let data = SliceData(location.GetData(this.key, options), options.startDateIndex, options.endDateIndex);
        this.chart.data.datasets[0].data = data;
        if (this.options.getDescription) {
            this.description = this.options.getDescription(location, options, data);
        }
        this.chart.data.labels = SliceData(chartDates, options.startDateIndex, options.startDateIndex + data.length);
        this.chart.update();
    }
}

class ChartGroup {
    id: number;
    selectedCountryName: string;
    selectedStateName?: string;
    selectedCityName?: string;
    selectedCountry?: MyLocation;
    selectedState?: MyLocation;
    selectedCity?: MyLocation;
    offset: number;
    range: number;
    startDateIndex: number;
    endDateIndex: number;
    charts: MyChart[];
    locationRoot: ViewModel;

    constructor(vm: ViewModel) {
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

    getSupportedCharts() {
        return supportedCharts.filter(x => !this.charts.some(y => y.key == x.key));
    }

    addChart(key: string, name: string) {
        let location = this.getSelectedLocation();

        var data = location.GetData(key, this);
        let endDateIndex = this.endDateIndex;
        if (this.endDateIndex < this.startDateIndex || this.endDateIndex - this.startDateIndex >= data.length) {
            endDateIndex = data.length - 1;
            if (this.endDateIndex < 0) {
                this.endDateIndex = endDateIndex;
            }
        }

        this.charts.push(new MyChart(key, name, location, this));
    }

    removeChart(chart: MyChart) { this.charts.remove(chart); if (!this.charts.length) this.locationRoot.chartGroups.remove(this); }

    updateCharts() {
        let location = this.getSelectedLocation();
        if (this.charts?.length) {
            this.charts.forEach(x => { x.update(location, this); });
        }
    }

    private getSelectedLocation() {
        this.selectedCountry = this.locationRoot.children[this.selectedCountryName];
        this.selectedState = this.selectedCountry.children[this.selectedStateName];
        this.selectedCity = this.selectedState?.children[this.selectedCityName];

        return this.selectedCity ?? this.selectedState ?? this.selectedCountry;
    }
}

interface GetDataFunction {
    (data: DataOptions, vm: ViewModel): void;
}

interface DataOptions {
    url: string;
    indexParams: number[];
    dataKey: string;
    getData: GetDataFunction;
}

const supportedCharts = [
    {
        name: 'Total Confirmed',
        key: 'confirmed'
    },
    {
        name: 'Total Fatal',
        key: 'fatality'
    }
];

var chartDates: string[];

class ViewModel implements LocationParent {
    children: Dictionary<MyLocation>;
    names: string[];
    chartGroups: ChartGroup[];
    lastID: number;
    countdown: number;
    selectedTab: string;
    temp: string;
    dates: string[];

    addGroup() {
        let chartGroup = new ChartGroup(this);
        chartGroup.selectedCountryName = 'US';
        this.chartGroups.push(chartGroup);
        return chartGroup;
    }

    private addLocation(location: MyLocation, dataKey: string) {
        var key = location.key.split(', ').reverse().filter(x => x);
        var i: number;
        var parent = this as LocationParent;
        var parentKey = '';
        for (i = 0; i < key.length - 1; i++) {
            if (parentKey) {
                parentKey = key[i] + ', ' + parentKey;
            } else {
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
        } else {
            parent.children[key[i]] = location;
        }
    }

    private addLocations(csv: string, dataKey: string, indexes: ReadonlyArray<number>) {
        csv.split('\n').slice(1).filter(x => x).forEach(data => {
            var location = new MyLocation(this.getLocationData(data), dataKey, indexes);
            this.addLocation(location, dataKey);
        });
    }

    getShareLink() {
        let query = this.chartGroups.map(x => {
            var charts = x.charts.map(y => y.key + ']' + y.name).join(',');
            var location = x.selectedCity ?? x.selectedState ?? x.selectedCountry;
            return charts + '[' + location?.key;
        }).join('|');
        return window.location.origin + window.location.pathname + '?charts=' + encodeURIComponent(query);
    }

    private async getDates() {
        if (!chartDates) {
            chartDates = [];
            var tempDate = moment(new Date('1/22/20'));
            while (tempDate < moment()) {
                chartDates.push(tempDate.format('l'));
                tempDate.add(1, 'days');
            }
            this.dates = chartDates;
        }
        return chartDates;
    }

    private getData() {
        function getCOVID19JohnsHopkinsData(options: DataOptions, vm: ViewModel) {
            var request = new XMLHttpRequest();
            request.open('GET', options.url, true);
            request.onload = function (e) {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        vm.addLocations(request.responseText, options.dataKey, options.indexParams);
                        vm.setup();
                    } else {
                        console.error(request.statusText);
                    }
                }
            }
            request.onerror = function (e) {
                console.error(request.statusText);
                vm.countdown--;
            }
            request.send(null);
        }

        interface DataOptions {
            readonly url: string;
            readonly indexParams: ReadonlyArray<number>;
            readonly dataKey: string;
            readonly getData: (x: DataOptions, vm: ViewModel) => void;
        }

        const dataOptions: ReadonlyArray<DataOptions> = [
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

        dataOptions.forEach(x => x.getData(x, this));
    }

    private getLocationData(locationCSV: string) {
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

    private setup() {
        if (--this.countdown) {
            return;
        }

        var query = new URLSearchParams(window.location.search);

        if (!query.has('charts')) {
            let chartGroup = this.addGroup();
            chartGroup.addChart('confirmed', 'Total Confirmed');
            chartGroup.addChart('fatality', 'Total Fatal');
            return this.chartGroups.length;
        }

        query.get('charts').split('|').forEach(groupStr => {
            let [chartsStr, locationKey] = groupStr.split('[');
            let group = this.addGroup();
            [group.selectedCountryName, group.selectedStateName, group.selectedCityName] = locationKey.split(', ').reverse();
            chartsStr.split(',').forEach(chartStr => {
                let [key, name] = chartStr.split(']');
                group.addChart(key, name);
            });
        });

        return this.chartGroups.length;
    }

    constructor() {
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
}