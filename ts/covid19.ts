function toggleStuff(element: HTMLSpanElement, id: string) {
    element.className = 'far fa-' + (element.className.indexOf('edit') == -1 ? 'edit' : 'save');
    let input = document.getElementById(id);
    input.toggleAttribute('readonly');
    input.className = 'mr-1 form-control' + (input.className.indexOf('plaintext') == -1 ? '-plaintext' : '');
}

function COVID19() {

    const confirmedUSDataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv';
    const confirmedGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    const fatalUSDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv";
    const fatalGlobalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

    /*
                                                   ,¿▒▒░░▒▒╝
                                                 ░░░░░░░▒╢╣╜
                                               ░░░░▒░░░░▒╫░╢
                                              ░░░░▒▒░▒░▒▒▒▒▒▒N╖
                                             ░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒@╗
                        ,,╓╖╥mµ╖,          .░▒▒▒▒▒▒╣╣╣▒▒▒▒▒▒▒╢▒▒▒▒▒▓,
                    ,╥╬╢╢╢╢▒╢╣╢╢╫╢▓N,      ░░▒╢╣▒╢╣╣╢╣╢╢╢╢▒▒▒▒▒▒╢╢╢╢▒@
                  ╓╬╣▒▒▒▒▒▒▒╣▓`▌█▓╣╣▓▓     ░▒╢  ░░░░░░░▓▓▓╣▓▓╣▒▒▒▒▒▒@╣╖
                 ╥╢▒▒╢▓╣╣▒╢╢╢▓▓██▒╣▓▓▓    @▒╫   »░░░░░░░░░▒▓▓╣▓▓▓▓╬╣╣╢╣
                ║╢▒╣▓▓▓▀╙▓▓▓▓▓▓▓▓▀╙"       ║Γ   ,░░░░░░░░░▒▒▓▓▓▓▓▓▓▓▓╢╢`
               ]╢▒╣▓▓▓    `▓▓▓██⌐          ║   ▐█▌░░░░░░░░░░░▒Ñ▓▓▓▓▓▓▓▒
               ╢╣╫▒╢▓`       ╙▀▀           ░   ▐█░░░░░░░▐██░░░▒▒▒▒▓▓▓▓╜
               ╢╢╢▒╢▓                              ░░░░░▐█▀░░░▒▒▒▒╣╢╢▒┐
               ╢╢▓╬╬▓                          ░ ░░▒░░░░░░░░▒▒▒▒▒╣╣▒╢░┘
               ╢╫▒▒╢▓                        ▒░░░░▄█░░░░▒▒▒▒▒▒╢▒▒▒▒▒╜
               ╟╢▒▒╢╢              ,,▓▒░░╫▒╟▓▓▄▒▒▒▀▀▒▒▒▒▒▒▒╢╢╢╢╜
               └╫╣▒▒╫▓            ░░░▒▒▒▒▒▓▒▓╫╫▓▓▒╢╢╢╢╢╢╣╣╢╩╜   ,,,
                ╙▓╢╢╢╢▓           ░░▒"░▒░▒╙▓▀║╙╣▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓@╖
                 ╙▓╢╢╢╢╢╗          ` ╓░░▓░╟@▓▓@▒░░░░╜╨▓▓▓▓▓▓╢▒▒▀``"╙▀▓▓╢▓▓
                  ╙▓╢╫╣╣╢▓╗          "╙╩╢╢╣╢▒▒╨╣╣╢╣╬@@░░░▒▒▓▓▒▒▓╗      ╙╣╣▓╕
                    ╚▓▓▓▓╢╢▓@,          ╬╣▓▓▓▓▒▒░░░░╜╩▓▓▓▓▓▓▓▓▓@▓▌      ]╣╢▓
                      ╙▓▓▓▓▓╣▓▓▓w,,   ╥▒▒▒▒▒▒╜╨╣╣╣╢╣╣@@▒▒▒▒▓█▓▓▒▒▒       ╣╢▓
                         ╙▀▓▓▓▓▓▓▓▓▓█▓▓▄▒▒╣╣╣╣╣@╖╖░░░░░░╜▓▓▓▀▓▓╣ÑN,  ,╖▒▒╫▓▀
                             "▀▀████▓▓▓▓▓▓▓▓▓▓▓▓█▄▄▄▄▓▓▓▓▓▓▓ "▓╣▒▒░▒N▒▒▓▓▄▒`
                                ,Æ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▌    "╨╣▒╟▓▒▓▒`
                                ▐███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▄     "`"╙`
                                 ▀████▌▓▓▓▓▓▓▓████████▓▓▓▓▓▓▓▓█▀
                                   ▀▀▀░▒╫▓▓▓▓██`▀██████▓▓▓▓▀`
                                   ]░▒▒╢▓▓█▓█"    "▓███▓▓▒▒[
                               , ,▒╢╢╣▓`              ╟╢╢╣╣
                            ,╢╢▓@╢▓▓▀`                ]╢▓▓▓
                            ▒▒╢║╣▓▓                  ╒╓╢▓▓▓╣b,
                           ║▒Ñ╨╨╢▓\                  ╟╢╢╢╢╢╫░░░▒
                           ║░░░░▒╫░░▒▒▒▒▒▒▒▒▒▒░░░▒▒▒▒▒▒▓▓▓▓▓▒▒▒▓L
                           '╙╩▓▓▓▓▒░░░░░░░░░░▒▒▒▒▒▒▒╜╜╙╙╙╙"'''
    
    ---
    ^[ [^ascii ^art ^generator](http://asciiart.club) ^]
    
    */

    interface ChartOptions {
        readonly type: string;
        readonly maxY?: number;
        readonly isRatio?: boolean;
        readonly getDescription?: (location: MyLocation, options: { startDateIndex: number; endDateIndex: number }, data: number[]) => string;
    }

    interface Dictionary<Tout> { [key: string]: Tout; }
    interface ReadOnlyDictionary<Tout> { readonly [name: string]: Tout }

    function SliceData<T>(x: T[], startIndex: number, endIndex: number): T[] {
        if (startIndex > (x?.length ?? -1)) {
            return x ?? [];
        }
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
        fatality: {
            type: 'line',
            getDescription: function (location, options) {
                if (location.GetPopulation()) {
                    var currentCases = location.GetRange('fatality', options.startDateIndex, options.endDateIndex);
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
        labels: Dictionary<string[] | number[]>;
        dataKeys: string[];
        readonly name: string;
        readonly key: string;
        latitude?: number;
        longitude?: number;
        population?: number;
        populationChecked?: boolean;

        constructor(name: string, key: string, dataKey?: string, labels?, data?, dataKeys?, children?, childrenNames?: string[]) {
            if (labels instanceof Array && dataKey) {
                this.labels = {};
                this.labels[dataKey] = labels;
            } else {
                this.labels = labels ?? {};
            }
            if (data instanceof Array && dataKey) {
                this.data = {};
                this.data[dataKey] = data;
            } else {
                this.data = data ?? {};
            }

            this.dataKeys = dataKeys?.length ? dataKeys : dataKey ? [dataKey] : [];

            this.name = name;
            this.key = key;
            this.children = children ?? {};
            this.names = childrenNames ?? ['All'];
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

            let data: number[];
            this.names.filter(x => x != 'All').forEach(x => {
                let childData = this.children[x].GetData(key);
                if (!this.labels[key]?.length) {
                    this.labels[key] = this.children[x].labels[key];
                }
                if (childData?.length) {
                    if (!data) {
                        data = childData.map(x => x);
                    } else {
                        childData.forEach((val, i) => data[i] += val);
                    }
                }
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
            this.data[key + derivativeKey] = derivedData;
            this.labels[key + derivativeKey] = this.labels[key];
            return this.data[key + derivativeKey];
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
                let i: number;
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
            let length = this.labels[keys[0]].length;
            if (length != this.labels[keys[1]].length) {
                return this.data[key];
            }

            for (let i = 0; i < length; i++) {
                if (this.labels[keys[0]][i] != this.labels[keys[1]][i]) {
                    return this.data[key];
                }
            }
            this.labels[key] = this.labels[keys[0]];

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
            this.chart.data.labels = SliceData(location.labels[this.key] as any[],
                options.startDateIndex, options.startDateIndex + data.length);
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
            if (data && (this.endDateIndex < this.startDateIndex || this.endDateIndex - this.startDateIndex >= data.length)) {
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

    const supportedCharts = [];

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

    var chartDates: string[];

    class ViewModel implements LocationParent {
        children: Dictionary<MyLocation>;
        names: string[];
        chartGroups: ChartGroup[];
        lastID: number;
        private countdown: number;
        selectedTab: string;
        temp: string;
        dates: string[];

        addGroup() {
            let chartGroup = new ChartGroup(this);
            chartGroup.selectedCountryName = 'US';
            this.chartGroups.push(chartGroup);
            return chartGroup;
        }

        addLocation(location: MyLocation) {
            let key = location.key.split(', ').filter(x => x).reverse();
            let name = key.pop();
            let parent = this as LocationParent;
            let currentKey = '';
            key.forEach(name => {
                currentKey = currentKey ? name + ', ' + currentKey : name;
                if (!parent.children[name]) {
                    parent.names.push(name);
                    parent.children[name] = new MyLocation(name, currentKey);
                }
                parent = parent.children[name];
            });

            if (parent.children[name]) {
                location.dataKeys.forEach(dataKey => {
                    if (!parent.children[name].data[dataKey]) {
                        parent.children[name].dataKeys.push(dataKey);
                    }
                    parent.children[name].data[dataKey] = location.data[dataKey];
                    parent.children[name].labels[dataKey] = location.labels[dataKey];
                });
            } else {
                parent.names.push(name);
                parent.children[name] = location;
            }
        }

        getShareLink() {
            let query = this.chartGroups.map(x => {
                var charts = x.charts.map(y => y.key + ']' + y.name).join(',');
                var location = x.selectedCity ?? x.selectedState ?? x.selectedCountry;
                return charts + '[' + location?.key;
            }).join('|');
            return window.location.origin + window.location.pathname + '?charts=' + encodeURIComponent(query);
        }

        private getDates(vm: ViewModel) {
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
        }

        private getData(vm: ViewModel) {

            interface DataOptions {
                readonly url: string;
                readonly indexParams?: ReadonlyArray<number>;
                readonly dataKey?: string;
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

            dataOptions.forEach(x => x.getData(x, vm));
        }

        setup() {
            if (--this.countdown != 0) {
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
            setTimeout(() => this.getDates(this), 0);
            setTimeout(() => this.getData(this), 0);

            ko.track(this);
            ko.applyBindings(this);
        }
    }

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

    //-------------------------------------------------------------

    interface USCovidDataAge {
        covid_19_deaths: string;
        age_group: string;
        indicator: string;
        sex: string;
        start_week: string;
        end_week: string;
    }

    //https://data.cdc.gov/resource/nr4s-juj3.json
    function getUSCovidDataAge(options: DataOptions, vm: ViewModel) {
        const ageGroups = ['0-4 years', '5-18 years', '19-44 years', '45-64 years', '65-74 years', '>75 years'];
        let ageData = [];
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var temp: USCovidDataAge[] = JSON.parse(request.responseText);
                    temp.forEach(getData);
                    vm.addLocation(new MyLocation('US', 'US', 'covidAge', ageGroups, ageData));
                    supportedCharts.push({ name: 'COVID-19', key: 'covidAge' });
                    vm.setup();
                } else {
                    console.error(request.statusText);
                }
            }
        }
        request.onerror = function (e) {
            console.error(request.statusText);
            vm.setup();
        }
        request.send(null);

        function getData(data: USCovidDataAge) {
            if (data.indicator == 'Age' && data.age_group != 'All ages') {
                ageData[ageGroups.indexOf(data.age_group)] = data.covid_19_deaths;
            }
        }
    }

    //--------------------------------------------------------------

    //TODO: create function for data from:
    //https://covidtracking.com/data/download
    //---------------------------------------------------------------




    //https://data.cdc.gov/resource/uggs-hy5q.json
    interface MortalityData {
        data_as_of: string;
        sex: string;
        age_group: string;
        state: string;
        place_of_death: string;
        start_week: string;
        end_week: string;
        covid_19_deaths: string;
        total_deaths: string;
        pneumonia_deaths: string;
        pneumonia_and_covid_19_deaths: string;
        influenza_deaths: string;
        pneumonia_influenza_or_covid19: string;
    }

    function getOverallMortalityData(options: DataOptions, vm: ViewModel) {
        const allAges = 'All ages';
        const illnessesString = 'Illnesses';
        const ageGroups = ['Under 1 year', '1-4 years', '5-14 years', '15-24 years', '25-34 years', '35-44 years', '45-54 years', '55-64 years', '65-74 years', '75-84 years', '85 years and over'];
        const illnesses = ['COVID-19', 'Pneumonia', 'Pneumonia and COVID-19', 'Influenza'];
        const dataKeyes = ageGroups.concat(illnesses);
        dataKeyes.push('All Ages');
        dataKeyes.forEach(key => supportedCharts.push({
            key: key,
            name: key
        }));
        const totalText = ' Total';
        let labels = {};
        ageGroups.forEach(ageGroup => labels[ageGroup] = illnesses);
        illnesses.forEach(illness => labels[illness] = ageGroups);
        labels['All Ages'] = illnesses;
        let ageGroupData: Dictionary<Dictionary<number[]>> = {};
        let stateNames: string[] = [];

        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var temp: MortalityData[] = JSON.parse(request.responseText);
                    temp.forEach(getData);
                    stateNames.forEach(name => {
                        ageGroups.forEach((ageGroup, agi) => {
                            ageGroupData[name][ageGroup].forEach((val, index) => {
                                ageGroupData[name][illnesses[index]][agi] = val;
                                ageGroupData[name]['All Ages'][index] += val;
                            });
                        });
                    });
                    stateNames.forEach(addLocations);
                    vm.setup();
                } else {
                    console.error(request.statusText);
                }
            }
        }
        request.onerror = function (e) {
            console.error(request.statusText);
            vm.setup();
        }
        request.send(null);

        function addLocations(name: string) {
            if (name == 'United States') {
                vm.addLocation(new MyLocation('US', 'US', null, labels, ageGroupData[name], dataKeyes));
                return;
            }

            let parentKey = name + ', US';
            vm.addLocation(new MyLocation(name, parentKey, null, labels, ageGroupData[name], dataKeyes));
        }

        function getDeathArr(row: MortalityData) {
            let t = [row.covid_19_deaths, row.pneumonia_deaths, row.pneumonia_and_covid_19_deaths, row.influenza_deaths].map(x => {
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

        function getData(row: MortalityData) {
            if (row.state.substr(-totalText.length) == totalText || row.sex == 'All' || row.age_group == allAges) {
                return;
            }
            if (!ageGroupData[row.state]) {
                ageGroupData[row.state] = {};
                illnesses.forEach(val => {
                    ageGroupData[row.state][val] = [];
                    ageGroups.forEach(x => ageGroupData[row.state][val].push(0));
                });
                stateNames.push(row.state);
                ageGroupData[row.state]['All Ages'] = [0, 0, 0, 0];
            }

            let tempData: number[] = getDeathArr(row);
            if (ageGroupData[row.state][row.age_group]?.length) {
                ageGroupData[row.state][row.age_group].forEach((x, i, arr) => arr[i] += tempData[i]);
            } else {
                ageGroupData[row.state][row.age_group] = tempData;
            }
        }
    }


    function getCOVID19JohnsHopkinsData(options: DataOptions, vm: ViewModel) {
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let already = false;
                    for (let i = 0; i < supportedCharts.length; i++) {
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
                        supportedCharts.push({ name: 'Mortality / Day', key: `fatality${derivativeKey};confirmed${derivativeKey}${ratioKey}` });
                    }
                    GetCSVData(request.responseText).slice(1).filter(x => x?.length)
                        .map(data => GetLocation(data, options.dataKey, options.indexParams))
                        .forEach(location => vm.addLocation(location));

                    vm.setup();
                } else {
                    console.error(request.statusText);
                }
            }
        }
        request.onerror = function (e) {
            console.error(request.statusText);
            vm.setup();
        }
        request.send(null);

        function GetLocation(locationData: string[], dataKey?: string, indexes?: ReadonlyArray<number>) {

            let possibleNames: string[];
            let latitude: number;
            let longitude: number;
            let population = 0;
            let data: number[];

            if (locationData.length > 4) {
                let [numStartIndex, latitudeIndex, longitudeIndex, stateIndex, countryIndex, cityIndex, populationIndex] = indexes;

                possibleNames = [cityIndex, stateIndex, countryIndex]
                    .filter(x => x >= 0)
                    .map(x => locationData[x])
                    .filter(x => x)
                    .map(x => x.replace(/;/g, ','));

                latitude = parseInt(locationData[latitudeIndex]);
                longitude = parseInt(locationData[longitudeIndex]);

                population = 0;
                if (populationIndex) {
                    population = parseInt(locationData[populationIndex]);
                }
                data = locationData.slice(numStartIndex).map(x => parseInt(x));
            }
            else {
                possibleNames = locationData;
            }
            let location = new MyLocation(possibleNames[0], possibleNames.join(', '), dataKey, chartDates, data);
            location.population = population;
            location.longitude = longitude;
            location.latitude = latitude;
            return location;
        }

    }

    function GetCSVData(locationCSV: string) {
        var temp = locationCSV.split('"');
        locationCSV = '';
        for (var i = 0; i < temp.length; i++) {
            if (i % 2) {
                locationCSV += temp[i].replace(/\,/g, '$|||$');
            } else {
                locationCSV += temp[i];
            }
        }
        return locationCSV.split(/\r?\n|\r/).map(str => str.split(',').map(x => x?.replace(/\$\|\|\|\$/g, ',')));
    }





}