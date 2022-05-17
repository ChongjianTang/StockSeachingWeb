import {
    Component,
    OnInit,
    Input,
    OnChanges,
    ViewChild,
    SimpleChanges,
    AfterViewInit, ElementRef
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from "@angular/common/http";
import * as Highcharts from 'highcharts/highstock';

import {Chart} from 'angular-highcharts';
import HC_exporting from 'highcharts/modules/exporting'
import indicatorsInit from 'highcharts/indicators/indicators-all'
import vbp from 'highcharts/indicators/volume-by-price';
import HStockTools from 'highcharts/modules/stock-tools';
import {colors} from "@angular/cli/utilities/color";

HC_exporting(Highcharts)
indicatorsInit(Highcharts)
vbp(Highcharts)
HStockTools(Highcharts)


@Component({
    selector: 'app-search-result',
    templateUrl: './search-result.component.html',
    styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements AfterViewInit {

    ticker: any;
    description: any;
    latestPrice: any;
    currentTime: any;
    symbol: any;
    isOpen: any;

    isSearching: any;

    @Input() inputText: any;


    @ViewChild("successBox") successBox: any
    @ViewChild("summaryChart") summaryChart!: ElementRef;
    @ViewChild("charts") charts!: ElementRef
    @ViewChild("sentiment") sentiment: any
    @ViewChild("trends") trends: any
    @ViewChild("chartEarnings") chartEarnings: any

    buyNotice = false;
    sellNotice = false;
    existed: any;
    companyPeers: any = [];
    newsInfo: any = [];
    chartTrends: any = {};
    sentimentInfo: any = {
        reddit: [],
        twitter: []
    }
    highcharts = Highcharts;

    summaryChartOptions: any = {
        exporting: {
            enabled: false
        },
        time: {
            timezoneOffset: "en-US"
        },

        title: {
            text: ""
        },

        xAxis: {
            type: 'datetime',
            labels: {
                formatter: function (this: any): any {
                    // return Highcharts.dateFormat('%H:%M', this.value);
                    const time = new Date(this.value);
                    return time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                }
            }
        },

        yAxis: {
            opposite: true,
            title: {
                text: undefined
            }
        },

        rangeSelector: {
            enabled: false
        },

        navigator: {
            enabled: false
        },

        series: [{
            name: "",
            type: 'line',
            data: [],
            threshold: null,
            tooltip: {
                valueDecimals: 2
            }
        }],

        plotOptions: {
            series: {
                pointWidth: 0,
                pointPlacement: 'on',
                pointInterval: 'hour'
            }
        }
    };
    chartOptions: any = {
        exporting: {
            enabled: false
        },
        rangeSelector: {
            selected: 2
        },

        title: {
            text: ""
        },

        subtitle: {
            text: 'With SMA and Volume by Price technical indicators'
        },

        yAxis: [{
            startOnTick: false,
            endOnTick: false,
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],

        tooltip: {
            split: true
        },

        plotOptions: {
            series: {
                dataGrouping: {
                    units: []
                }
            }
        },

        series: [{
            type: 'candlestick',
            name: '',
            id: 'aapl',
            zIndex: 2,
            data: []
        }, {
            type: 'column',
            name: 'Volume',
            id: 'volume',
            data: [],
            yAxis: 1
        }, {
            type: 'vbp',
            linkedTo: 'aapl',
            params: {
                volumeSeriesID: 'volume'
            },
            dataLabels: {
                enabled: false
            },
            zoneLines: {
                enabled: false
            }
        }, {
            type: 'sma',
            linkedTo: 'aapl',
            zIndex: 1,
            marker: {
                enabled: false
            }
        }]
    };

    nowInterval: any;

    buyNoticeTimer: any;
    sellNoticeTimer: any;

    addNoticeTimer: any;
    addNotice: any;

    removeNoticeTimer: any;
    removeNotice: any;
    priceList: any;

    oldPrice = -1;

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {
    }

    ngAfterViewInit() {
        // console.log("SEARCH RESULT ON INIT")

    }

    update() {
        this.getLatestPrice();
        this.getCharts();
    }

    ngOnInit(): void {
        // this.open = this.isOpenMarket();
        console.log(this.isOpen)

        this.isSearching = true;


        this.ticker = localStorage.getItem("ticker");

        this.activatedRoute.url.subscribe(url => {

            console.log("INIT 1");
            this.ticker = url[0].path;

            this.getDescription();
            this.getSentiment();
            this.getCompanyPeers();
            this.getTopNews();
            this.getTrends();
            this.getEarnings();
            this.checkWatchlist();

            this.update()

            this.getCandles();

            if (this.isOpen) {
                if (this.nowInterval != undefined) {
                    clearInterval(this.nowInterval);
                }
                this.runTimer();
            }
        });

    }

    runTimer() {
        this.nowInterval = setInterval(() => {
            this.update();
            this.currentTime = this.latestPrice.t;
            console.log("UPDATE!")
        }, 15000);
    }

    getSentiment() {
        this.http.get(`https://finnhub.io/api/v1/stock/social-sentiment?symbol=${this.ticker}&from=2022-01-01&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            // const result = data.result || [];
            const reddit = data.reddit[0]
            const twitter = data.twitter[0]
            this.sentimentInfo = Object.assign({}, this.sentimentInfo, data)
            if (this.sentimentInfo.reddit.length == 0) {
                this.sentimentInfo.reddit.push([{
                    mention: 0,
                    negativeMention: 0,
                    positiveMention: 0
                }])
            }
            if (this.sentimentInfo.twitter.length == 0) {
                this.sentimentInfo.twitter.push({
                    mention: 0,
                    negativeMention: 0,
                    positiveMention: 0
                })
            }
        })

    }

    getLatestPrice() {
        this.http.get(`https://finnhub.io/api/v1/quote?symbol=${this.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            this.latestPrice = data;

            if (this.oldPrice != -1) {
                this.latestPrice.c = this.oldPrice;
                this.oldPrice += 1;
            } else {
                this.oldPrice = this.latestPrice.c;
            }

            this.isOpen = this.isOpenMarket();
            if (this.isOpen) {
                this.currentTime = this.latestPrice.t;
            } else {
                this.currentTime = this.currentTime = new Date().valueOf() / 1000;
            }
        })
    }

    getDescription() {
        this.http.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${this.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            // const result = data.result || [];
            this.description = data;
        })
    }

    getCharts() {
        const startDate = new Date();
        var date_ob = new Date();
        const curTime = Math.floor(date_ob.getTime() / 1000);
        startDate.setFullYear(startDate.getFullYear() - 2);
        const history_endTime = Math.floor(startDate.getTime() / 1000);
        this.http.get(`https://finnhub.io/api/v1/stock/candle?symbol=${this.ticker}&resolution=D&from=${history_endTime}&to=${curTime}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {

            // split the data set into ohlc and volume
            const ohlc: any = [];
            const volume: any = [];
            const times = data.t;

            times.forEach((item: any, index: any) => {
                item = item * 1000;
                ohlc.push([item, data.o[index], data.h[index], data.l[index], data.c[index]])
                volume.push([item, data.v[index]])
            })

            // set the allowed units for data grouping
            const groupintUnits: any = [[
                'day',
                [1]
            ]];

            // create the chart
            this.chartOptions.title.text = this.ticker + " Historical";
            this.chartOptions.plotOptions.series.dataGrouping.units = groupintUnits;
            this.chartOptions.series[0].data = ohlc;
            this.chartOptions.series[1].data = volume;
            this.chartOptions.series[0].name = this.ticker;
        });
    }

    getCompanyPeers() {
        this.companyPeers = [];
        this.http.get(`https://finnhub.io/api/v1/stock/peers?symbol=${this.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            console.log("PEER: ", data)
            data.forEach((item: any) => {
                if (item.indexOf('.') == -1) {
                    this.companyPeers.push(item);
                }
            })
            console.log("PEER: ", this.companyPeers)
        })
    }

    getTopNews() {
        this.http.get(`https://finnhub.io/api/v1/company-news?symbol=${this.ticker}&from=2021-09-01&to=2021-09-09&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {

            data.forEach((item: any, index: any) => {
                if (item.image != "") {
                    this.newsInfo.push(item);
                }
            })

            if (this.newsInfo.length > 20) {
                this.newsInfo.length = 20;
            }
        })
    }

    getCandles() {
        const date_ob = new Date();
        const curTime = Math.floor(date_ob.getTime() / 1000);
        date_ob.setDate(date_ob.getDate() - 3);
        const startTime = Math.floor(date_ob.getTime() / 1000);
        this.http.get(`https://finnhub.io/api/v1/stock/candle?symbol=${this.ticker}&resolution=5&from=${startTime}&to=${curTime}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            const times = data.t;

            this.getLastSixHourPrices(data.t, data.c);

            this.summaryChartOptions.series[0].data = this.priceList;
            this.summaryChartOptions.series[0].name = this.ticker;

            if (this.latestPrice.d > 0) {
                this.summaryChartOptions.series[0].color = 'green';
            } else {
                this.summaryChartOptions.series[0].color = 'red';
            }
            this.summaryChartOptions.time.timezoneOffset = new Date().getTimezoneOffset();
            this.summaryChartOptions.title.text = this.ticker + " Hourly Price Variation"
        })

    }

    getLastSixHourPrices(timestamps: any, closePrice: any) {

        let curr = new Date(this.latestPrice.t * 1000);

        curr.setHours(curr.getHours() - 6);

        const startTime = curr.getTime();

        const combined = timestamps.map(function (item: number, index: number) {
            return [item * 1000, closePrice[index]];
        });
        this.priceList = combined.filter((pair: Number[]) => (pair[0] >= startTime && pair[0] <= this.latestPrice.t * 1000));
    }

    getTrends() {
        this.http.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${this.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            const series: any = []
            const trends = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"]
            console.log("TRENDS: ", data);
            for (let i = 0; i < 5; i++) {
                series.push({
                    type: "column",
                    name: trends[i],
                    data: [data[i].strongBuy, data[i].buy, data[i].hold, data[i].sell, data[i].strongSell]
                })
            }
            this.chartTrends = new Chart({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Recommendation Trends'
                },
                colors: ['rgb(23,94,42)', 'rgb(32,175,67)', 'rgb(169,122,23)', 'rgb(238,66,74)', 'rgb(109,34,37)'],
                xAxis: {
                    categories: ['2022-04', '2022-03', '2022-02', '2022-1'],
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'analysis'
                    },

                },

                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: series
            })

            console.log(this.chartTrends.addSeries(series))
        })
    }

    getEarnings() {
        this.http.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${this.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            const categories: any = [];
            const actual: any = [];
            const estimate: any = [];

            data.forEach((item: any) => {
                categories.push(item.period + "<br/>Surprise:" + item.surprise);
                actual.push(item.actual);
                estimate.push(item.estimate);
            })
            this.chartEarnings = new Chart({
                title: {
                    text: 'Historical EPS Surprises'
                },
                xAxis: {
                    categories: categories
                },
                yAxis: {
                    title: {
                        text: 'Quarterky EPS'
                    }
                },
                series: [{
                    type: "line",
                    name: "actual",
                    data: actual,
                }, {
                    type: "line",
                    name: "estimate",
                    data: estimate
                }]
            })
        })
    }

    // holdStock(ticker: any) {
    //     console.log(ticker, this.hold[ticker]);
    //     if (this.hold.hasOwnProperty(ticker)) {
    //         console.log("TRUE")
    //         return true;
    //     } else {
    //         console.log("FALSE")
    //         return false;
    //     }
    // }

    hideBuyNotice() {
        this.buyNotice = false;
    }

    hideSellNotice() {
        this.sellNotice = false;
    }

    hasKey(dict: any, key: any) {
        let flag = false;
        dict.forEach((value: any) => {
            if (value.company == key) {
                flag = true;
                return
            }
        })
        return flag;
    }

    checkMyStock() {
        let myStock = JSON.parse(<string>localStorage.getItem("myStock")) || [];
        let flag = false;
        myStock.forEach((item: any) => {
            if (item.ticker == this.ticker) {
                flag = true;
                return;
            }
        })
        return flag;
    }

    checkWatchlist() {
        this.existed = false;

        JSON.parse(<string>localStorage.getItem("watchlist")).forEach((item: any) => {
            if (item.ticker == this.ticker) {
                this.existed = true;
                return;
            }
        })
    }


    addToWatchlist() {
        this.existed = true;
        let watchlist = JSON.parse(<string>localStorage.getItem("watchlist"));
        watchlist.push({
            ticker: this.ticker,
            name: this.description.name
        });
        // console.log("WATCHLIST: ", watchlist);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        this.addNotice = true;
        this.runAddNoticeTimer();
    }

    removeFromWatchlist() {
        this.existed = false;
        let watchlist = JSON.parse(<string>localStorage.getItem("watchlist"));
        watchlist.splice({
            ticker: this.ticker,
            name: this.description.name
        }, 1);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        this.removeNotice = true;
        this.runRemoveNoticeTimer();
    }

    checkData() {
        if (this.description != undefined && this.latestPrice != undefined
            && this.sentimentInfo.reddit[0] != undefined) {
            this.isSearching = false;
            return true;
        }
        return false;
    }


    timestampToTime(timestamp: any) {
        let date = new Date(timestamp * 1000);
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return Y + M + D + h + m + s;
    }

    afterTransaction(ticker: any, newQuantity: any) {
        if (this.buyNotice) {
            this.runBuyNoticeTimer();
        } else {
            this.runSellNoticeTimer();
        }
    }

    isOpenMarket() {
        return Date.now() / 1000 - this.latestPrice.t <= 5 * 60;
    }

    runBuyNoticeTimer() {
        this.buyNoticeTimer = setInterval(() => {
            this.buyNotice = false;
            clearInterval(this.buyNoticeTimer);
        }, 5000);
    }

    runSellNoticeTimer() {
        this.sellNoticeTimer = setInterval(() => {
            this.sellNotice = false;
            clearInterval(this.sellNoticeTimer);
        }, 5000);
    }

    runAddNoticeTimer() {
        this.addNoticeTimer = setInterval(() => {
            this.addNotice = false;
            clearInterval(this.addNoticeTimer);
        }, 5000);
    }

    runRemoveNoticeTimer() {
        this.removeNoticeTimer = setInterval(() => {
            this.removeNotice = false;
            clearInterval(this.removeNoticeTimer);
        }, 5000);
    }

    hideAddNotice() {
        this.addNotice = false;
    }

    hideRemoveNotice() {
        this.removeNotice = false;
    }
}

