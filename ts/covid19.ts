const confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
const confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
const fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

interface DataManipulationFunction<T> {
    (data: T[], options: { startDateIndex: number; endDateIndex: number }): T[];
}

interface GetDescriptionFunction {
    (location: MyLocation, options: { startDateIndex: number; endDateIndex: number }, key: string): string;
}

interface ChartOptions<T> {
    readonly type: string;
    readonly dataAction?: DataManipulationFunction<T>;
    readonly maxY?: number;
    readonly getDescription?: GetDescriptionFunction;
}

interface ChartOptionsCollection { readonly [name: string]: ChartOptions<any> }

function SliceData<T>(x: T[], y: { startDateIndex: number; endDateIndex: number }): T[] {
    return x.slice(y.startDateIndex, y.endDateIndex + 1)
}

const chartOptions: ChartOptionsCollection = {
    confirmed: {
        type: 'line',
        dataAction: SliceData,
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
        dataAction: SliceData
    },
    RatioData: {
        type: 'bar',
        getDescription: function (location, options, key) {
            var data = location.data[key];
            var total = 0;
            data.forEach(x => total += x);
            var average = total / data.length;
            var percentage = average * 100;
            return `Average Ratio: ${average.toFixed(2)} (${percentage.toFixed(2)}%)`;
        }
    }
};

interface LocationCollection {
    [name: string]: MyLocation;
}

interface LocationDataCollection {
    [key: string]: number[];
}

interface LocationParent {
    children: LocationCollection;
    names: string[];
}
const timeKey = 'TimeData';
const ratioKey = 'RatioData';
const derivativeKey = '`';

class MyLocation implements LocationParent {
    children: LocationCollection;
    names: string[];
    data: LocationDataCollection;
    dataKeys: string[];
    readonly name: string;
    readonly key: string;
    latitude?: number;
    longitude?: number;
    population?: number;
    populationChecked?: boolean;

    constructor(locationData: string[], dataKey?: string, indexes?: number[]) {
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

    GetData(key: string, options?: { startDateIndex: number, endDateIndex: number, range: number, offset: number }) {
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
            let parentKey = key.substr(0, key.length - timeKey.length);
            return this.GetTimeData(parentKey, options);
        }

        if (key.substr(-ratioKey.length) == ratioKey) {
            let parentKeys = key.substr(0, key.length - ratioKey.length).split(';');
            return this.GetRatioData(parentKeys, options);
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

    GetDerivedData(key: string, options?: { startDateIndex: number, endDateIndex: number, range: number, offset: number }) {
        var data = this.GetData(key, options);
        let derivedData = [];
        for (let i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            derivedData.push(temp);
        }
        this.data[key + '`'] = derivedData;
        return this.data[key + '`'];
    }

    GetTimeData(key: string, options?: { startDateIndex: number, endDateIndex: number, range: number, offset: number }) {
        let data = this.GetData(key, options);
        let timeData = [];
        for (let i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            timeData.push(temp > 0 ? temp : 0);
        }
        this.data[key + 'TimeData'] = timeData;
        return this.data[key + 'TimeData'];
    }

    GetRatioData(keys: string[], options: { startDateIndex: number, endDateIndex: number, range: number, offset: number }) {
        let key = `${keys[0]};${keys[1]}RatioData`;
        let data1 = this.GetData(keys[0], options);
        let data2 = this.GetData(keys[1], options);
        this.data[key] = [];

        let { startDateIndex, endDateIndex, range, offset } = options;

        for (let i = startDateIndex; i <= endDateIndex - range - offset; i++) {
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
        let range = startIndex > 0 ? this.GetData(key)[endIndex] - this.GetData(key)[startIndex - 1] : this.GetData(key)[endIndex];
        return range > 0 ? range : this.data[key][startIndex - 1];
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
    options: ChartOptions<number>;
    constructor(key: string, name: string, location: MyLocation, options: ChartGroup, subDates: string[]) {
        this.key = key;
        this.name = name;
        this.id = Date.now();
        this.description = null;
        ko.track(this);
        this.options = chartOptions[key] ?? (key.substr(-ratioKey.length) == ratioKey ? chartOptions.RatioData : chartOptions['default']);
        var self = this;
        setTimeout(() => { self.createChart(); self.update(location, options, subDates); }, 0);
    }

    getData(data, options: { offset: number, range: number, startDateIndex: number, endDateIndex: number }) {
        return this.options.dataAction ? this.options.dataAction(data, options) : data;
    }

    createChart() {
        let ctx = document.getElementById(this.key + this.id) as HTMLCanvasElement;
        let color = randomColorString();
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
    }

    update(location: MyLocation, options: { offset: number, range: number, startDateIndex: number, endDateIndex: number }, subDates: string[]) {
        let data = this.getData(location.GetData(this.key), options);
        this.chart.data.datasets[0].data = data;
        if (this.options.getDescription) {
            this.description = this.options.getDescription(location, options, this.key);
        }
        this.chart.data.labels = subDates;
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
    locationRoot: LocationParent;
    dates: string[];

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
        this.endDateIndex = -1;
        this.charts = [];
        this.locationRoot = vm;
        this.dates = vm.dates;

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

        let subDates = this.dates.slice(this.startDateIndex, endDateIndex + 1);
        let index = this.charts.push(new MyChart(key, name, location, this, subDates)) - 1;
        // this.charts[index].createChart();
        // this.charts[index].update(location, this, subDates);
    }

    removeChart(chart) { this.charts.remove(chart); }

    updateCharts() {
        let location = this.getSelectedLocation();

        let titles = this.getTitles(location, this.startDateIndex, this.endDateIndex);
        let subDates = this.dates.slice(this.startDateIndex, this.endDateIndex + 1);

        if (this.charts?.length) {
            this.charts.forEach(x => { x.update(location, this, subDates); });
        }
    }

    private getSelectedLocation() {
        this.selectedCountry = this.locationRoot.children[this.selectedCountryName];
        this.selectedState = this.selectedCountry.children[this.selectedStateName];
        this.selectedCity = this.selectedState?.children[this.selectedCityName];

        let location = this.selectedCity ?? this.selectedState ?? this.selectedCountry;
        return location;
    }

    private getTitles(location: MyLocation, startDateIndex: number, endDateIndex: number) {
        let totalCases = location.GetRange('confirmed', startDateIndex, endDateIndex);
        let totalFatalCases = location.GetRange('fatality', startDateIndex, endDateIndex);
        let totalFatality = totalFatalCases / totalCases * 100;

        let popTitle = 'Total Confirmed';
        let fatTitle = 'Total Fatal';
        if (location.GetPopulation()) {
            let populationPercentage = totalCases / location.population * 100;
            let popFatPercentage = totalFatalCases / location.population * 100;
            popTitle += ` (${populationPercentage.toFixed(2)}% of Population)`;
            fatTitle += ` (${popFatPercentage.toFixed(2)}% of Population)`;
        }

        let titles = {
            confirmed: popTitle,
            confirmedTimeData: `Confirmed (${totalCases} total)`,
            fatalityTimeData: `Fatal (${totalFatalCases} total)`,
            fatalityRatioData: `Morality (${totalFatality.toFixed(2)}% total)`,
            fatality: fatTitle
        };
        return titles;
    }
}

function UpdateChart<T>(self: ChartGroup, chart: Chart, dataKey: string, data: T[], title: string, subDates: string[]) {
    let options = (chartOptions[dataKey] ?? chartOptions.default) as ChartOptions<T>;
    chart.data.datasets[0].data = options.dataAction ? options.dataAction(data, self) : data;
    chart.options.title.text = title;
    chart.data.labels = subDates;
    chart.update();
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

const dataKeys: ReadonlyArray<string> = ['confirmed', 'confirmedTimeData', 'fatality', 'fatalityTimeData', 'fatalityRatioData'];
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
class ViewModel implements LocationParent {
    children: LocationCollection;
    names: string[];
    chartGroups: ChartGroup[];
    lastID: number;
    dates: string[];
    countdown: number;
    selectedTab: string;
    temp: string;

    addGroup() {
        if (0 >= this.countdown--) {

            let chartGroup = new ChartGroup(this);
            chartGroup.selectedCountryName = 'US';
            this.chartGroups.push(chartGroup);
            chartGroup.addChart('confirmed', 'Total Confirmed');
            chartGroup.addChart('fatality', 'Total Fatal');
        }
    }

    addLocation(location: MyLocation, dataKey: string) {
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

    addLocations(csv: string, dataKey: string, indexes: number[]) {
        csv.split('\n').slice(1).filter(x => x).forEach(data => {
            var location = new MyLocation(GetLocationData(data), dataKey, indexes);
            this.addLocation(location, dataKey);
        });
    }

    constructor() {
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


        function getCOVID19JohnsHopkinsData(options: DataOptions, vm: ViewModel) {
            $.get(options.url).done(result => {
                vm.addLocations(result as string, options.dataKey, options.indexParams);
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

        dataOptions.forEach(x => x.getData(x, this));

        // ko.track(this.names);
        ko.track(this);
        ko.applyBindings(this);
    }
}

function GetLocationData(locationCSV: string) {
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

