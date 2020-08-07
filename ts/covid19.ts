const confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
const confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
const fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

const basicDataKeys: ReadonlyArray<string> = ['confirmed', 'fatality'];

interface DataManipulationFunction<T> {
    (data: T[], chartGroup: ChartGroup): T[];
}

interface ChartOptions<T> {
    readonly type: string;
    readonly dataAction?: DataManipulationFunction<T>;
    readonly maxY?: number;
}

interface ChartOptionsCollection { readonly [name: string]: ChartOptions<any> }

function SliceData<T>(x: T[], y: ChartGroup): T[] {
    return x.slice(parseInt(y.startDateIndex), parseInt(y.endDateIndex) + 1)
}

const chartOptions: ChartOptionsCollection = {
    confirmed: {
        type: 'line',
        dataAction: SliceData
    },
    fatalityRatioData: {
        type: 'bar',
        maxY: 25
    },
    default: {
        type: 'bar',
        dataAction: SliceData
    }
};

function CreatePlot<T>(self: ChartGroup, dataKey: string, data: T[], title: string, subDates: string[]) {
    let options = (chartOptions[dataKey] ?? chartOptions.default) as ChartOptions<T>;
    let ctx = document.getElementById(dataKey + self.id) as HTMLCanvasElement;
    let color = randomColorString();
    let dataset = {
        data: options.dataAction ? options.dataAction(data, self) : data,
        backgroundColor: color,
        borderColor: color
    };

    let chart = new Chart(ctx, {
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
                display: false,
                text: title
            }
        }
    });

    return chart;
}

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

    GetData(key: string, startDateIndex?: number, endDateIndex?: number, range?: number, offset?: number) {

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
            let parentKey = key.substr(0, key.length-timeKey.length);
            return this.GetTimeData(parentKey, startDateIndex, endDateIndex, range, offset);
        }

        if (key.substr(-ratioKey.length) == ratioKey) {
            let parentKeys = key.substr(0, key.length-ratioKey.length).split(';');
            return this.GetRatioData(parentKeys, startDateIndex, endDateIndex, range, offset);
        }

        if (key.substr(-derivativeKey.length) == derivativeKey) {
            let parentKey = key.substring(0, key.length - derivativeKey.length);
            return this.GetDerivedData(parentKey, startDateIndex, endDateIndex, range, offset);
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
        });
        this.data[key] = data;
        return this.data[key];
    }

    GetDerivedData(key: string, startDateIndex: number, endDateIndex: number, range: number, offset: number) {
        var data = this.GetData(key, startDateIndex, endDateIndex, range, offset);
        let derivedData = [];
        for (let i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            derivedData.push(temp);
        }
        this.data[key + '`'] = derivedData;
        return this.data[key + '`'];
    }

    GetTimeData(key: string, startDateIndex: number, endDateIndex: number, range: number, offset: number) {
        let data = this.GetData(key, startDateIndex, endDateIndex, range, offset);
        let timeData = [];
        for (let i = 1; i < data.length; i++) {
            var temp = data[i] - data[i - 1];
            timeData.push(temp > 0 ? temp : 0);
        }
        this.data[key + 'TimeData'] = timeData;
        return this.data[key + 'TimeData'];
    }

    GetRatioData(keys: string[], startDateIndex: number, endDateIndex: number, range: number, offset: number) {
        let key = `${keys[0]};${keys[1]}RatioData`;
        let data1 = this.GetData(keys[0], startDateIndex, endDateIndex, range, offset);
        let data2 = this.GetData(keys[1], startDateIndex, endDateIndex, range, offset);
        this.data[key] = [];

        for (let i = startDateIndex; i <= endDateIndex - range - offset; i++) {
            let confirmed = data1.slice(i, i + range).reduce((a, b) => a + b);
            let fatal = data2.slice(i + offset, i + offset + range).reduce((a, b) => a + b);
            let ratio = confirmed ? fatal / confirmed * 100 : fatal;
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

class ChartGroup {
    id: number;
    selectedCountryName: string;
    selectedStateName?: string;
    selectedCityName?: string;
    selectedCountry?: MyLocation;
    selectedState?: MyLocation;
    selectedCity?: MyLocation;
    offset: string;
    range: string;
    startDateIndex: string;
    endDateIndex: string;
    charts: { readonly name: string; title?: string; chart?: Chart }[];
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
        this.offset = '5';
        this.range = '5';
        this.startDateIndex = '42';
        this.endDateIndex = '-1';
        this.charts = [];
        this.locationRoot = vm;
        this.dates = vm.dates;

        var self = this;
        ko.track(this);
    }

    getSupportedCharts() {
        return supportedCharts.filter(x => !this.charts.some(y => y.name == x.key));
    }

    addChart(key: string) {
        let { location, endDateIndex, startDateIndex, range, offset } = this.getDataForCharts();

        var data = location.GetData(key, startDateIndex, endDateIndex, range, offset);
        if (endDateIndex >= data.length || endDateIndex < startDateIndex) {
            var temp = data.length - 1;
            if (endDateIndex < 0) {
                this.endDateIndex = temp.toString();
            }
            endDateIndex = temp;
        }
        let titles = this.getTitles(location, startDateIndex, endDateIndex);
        let subDates = this.dates.slice(startDateIndex, endDateIndex + 1);
        let index = this.charts.push({ name: key, title: titles[key] }) - 1;
        this.charts[index].chart = CreatePlot(this, key, location.data[key], titles[key], subDates);
    }

    removeChart(chart) { this.charts.remove(chart); }

    updateCharts() {
        let { location, endDateIndex, startDateIndex, range, offset } = this.getDataForCharts();

        // basicDataKeys.forEach(x => { location.GetData(x); location.GetTimeData(x); });
        // if (endDateIndex >= location.data.confirmedTimeData.length || endDateIndex < startDateIndex) {
        //     endDateIndex = location.data.confirmedTimeData.length - 1;
        //     this.endDateIndex = endDateIndex.toString();
        // }

        // location.data.fatalityRatioData = [];
        // for (let i = startDateIndex; i <= endDateIndex - range - offset; i++) {
        //     let confirmed = location.data.confirmedTimeData.slice(i, i + range).reduce((a, b) => a + b);
        //     let fatal = location.data.fatalityTimeData.slice(i + offset, i + offset + range).reduce((a, b) => a + b);
        //     let ratio = confirmed ? fatal / confirmed * 100 : fatal;
        //     location.data.fatalityRatioData.push(ratio);
        // }

        let titles = this.getTitles(location, startDateIndex, endDateIndex);

        let subDates = this.dates.slice(startDateIndex, endDateIndex + 1);


        if (this.charts?.length) {
            this.charts.forEach(x => { UpdateChart(this, x.chart, x.name, location.data[x.name], titles[x.name], subDates); x.title = titles[x.name] });
        }
    }

    private getDataForCharts() {
        let startDateIndex = parseInt(this.startDateIndex);
        let endDateIndex = parseInt(this.endDateIndex);


        let range = parseInt(this.range);
        let offset = parseInt(this.offset);

        this.selectedCountry = this.locationRoot.children[this.selectedCountryName];
        this.selectedState = this.selectedCountry.children[this.selectedStateName];
        this.selectedCity = this.selectedState?.children[this.selectedCityName];

        let location = this.selectedCity ?? this.selectedState ?? this.selectedCountry;
        return { location, endDateIndex, startDateIndex, range, offset };
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
    },
    {
        name: 'Mortality Rate',
        key: 'confirmed;fatalityRatioData'
    },
    {
        name: 'New Confirmed Cases',
        key: 'confirmedTimeData'
    },
    {
        name: 'New Fatalities',
        key: 'fatalityTimeData'
    }
];
class ViewModel implements LocationParent {
    children: LocationCollection;
    names: string[];
    chartGroups: ChartGroup[];
    lastID: number;
    dates: string[];
    countdown: number;

    addGroup() {
        if (0 >= this.countdown--) {
            let chartGroup = new ChartGroup(this);
            chartGroup.selectedCountryName = 'US';
            this.chartGroups.push(chartGroup);
            chartGroup.updateCharts();
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

