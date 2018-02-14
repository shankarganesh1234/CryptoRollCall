import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {Title} from "@angular/platform-browser";
import {CurrencyExchange} from "../models/currency-exchange";
import {Currencies} from "../models/currencies";
import {CurrencyService} from "../services/currency.service";
import * as numeral from "numeral";
import Chart from "chart.js";
import {CryptoPrice} from "../models/crypto-price";


declare const $:any;
@Component({
    selector: 'crypto-watch',
    templateUrl: `./crypto-watch.component.html`,
    styleUrls: ['crypto-watch.component.css']
})


export class CryptoWatchComponent implements OnInit{

    watchList: CryptoPrice[] = [];
    watchListCopy: CryptoPrice[] = [];
    filterText: string = '';
    localStorageWatchKey: string = "cryptowatch_";

    // currency related changes
    currencyExchange: CurrencyExchange;
    staticCurrencies: Currencies = new Currencies();
    currStr: string = "USD";

    chartData: number[] = [];
    barChartData: number[] = [];
    chartLabels: string[] = [];

    hourChart: any;
    dayChart: any;
    weekChart: any;

    itemLen: number = 0;

    @ViewChild('horbar1') horbar1: ElementRef;
    @ViewChild('horbar2') horbar2: ElementRef;
    @ViewChild('horbar3') horbar3: ElementRef;

    gainersHourData: number[] = [];
    gainersHourLabels: string[] = [];

    gainersDayData: number[] = [];
    gainersDayLabels: string[] = [];

    gainersWeekData: number[] = [];
    gainersWeekLabels: string[] = [];

    cryptoHourGainers : CryptoPrice[] = [];
    cryptoDayGainers : CryptoPrice[] = [];
    cryptoWeekGainers : CryptoPrice[] = [];

    // local storage keys
    crypto_currencyPreference: string = "crypto_currencyPreference";
    crypto_amountInvested: string = "crypto_amountInvested";


    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService){
        route.params.subscribe(val => {
            this.invokeCurrencyService();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - Crypto portfolio manager and crypto tracker');
    }

    initChart(cryptoPrices: CryptoPrice[]): void {
        this.itemLen = 0;
        this.chartData = [];
        this.barChartData = [];
        this.chartLabels = [];

        if(this.watchListCopy.length == 0)
        {
            $('#chartContainer').hide();
            $('#chartContainer1').hide();

            return;
        } else {
            $('#chartContainer').show();
            $('#chartContainer1').show();

        }

        for(let i=0; i<this.watchListCopy.length; i++) {
            this.chartLabels.push(this.watchListCopy[i].symbol);
        }

        // reset all fields
        this.cryptoHourGainers = [];
        this.cryptoDayGainers = [];
        this.cryptoWeekGainers = [];

        this.gainersHourLabels = [];
        this.gainersDayLabels = [];
        this.gainersWeekLabels = [];

        this.gainersHourData = [];
        this.gainersDayData = [];
        this.gainersWeekData = [];


        this.cryptoHourGainers = cryptoPrices;
        this.cryptoDayGainers = cryptoPrices;
        this.cryptoWeekGainers = cryptoPrices;

        // top 5 charts
        this.cryptoHourGainers = this.cryptoHourGainers.slice().sort(function(a,b) {
            return numeral(a['percent_change_1h']).value() < numeral(b['percent_change_1h']).value() ? 1 : -1;
        }).slice(0,5);

        this.cryptoDayGainers = this.cryptoDayGainers.slice().sort(function(a,b) {
            return numeral(a['percent_change_24h']).value() < numeral(b['percent_change_24h']).value() ? 1 : -1;
        }).slice(0,5);

        this.cryptoWeekGainers = this.cryptoWeekGainers.slice().sort(function(a,b) {
            return numeral(a['percent_change_7d']).value() < numeral(b['percent_change_7d']).value() ? 1 : -1;
        }).slice(0,5);

        for(let i=0; i<this.cryptoHourGainers.length; i++) {
            this.gainersHourLabels.push(this.cryptoHourGainers[i].name);
            this.gainersHourData.push(parseFloat(this.cryptoHourGainers[i].percent_change_1h));
        }

        for(let i=0; i<this.cryptoDayGainers.length; i++) {
            this.gainersDayLabels.push(this.cryptoDayGainers[i].name);
            this.gainersDayData.push(parseFloat(this.cryptoDayGainers[i].percent_change_24h));
        }

        for(let i=0; i<this.cryptoWeekGainers.length; i++) {
            this.gainersWeekLabels.push(this.cryptoWeekGainers[i].name);
            this.gainersWeekData.push(parseFloat(this.cryptoWeekGainers[i].percent_change_7d));
        }

        this.initGainersHourChart();
        this.initGainersDayChart();
        this.initGainersWeekChart();
    }

    /**
     *
     */
    invokeCurrencyService(): void {
        // hide the welcome message
        $('#welcomeMessage').hide();
        this.currencyService
            .getCurrExchRates(this.currStr)
            .subscribe(
                currExch => this.setCurrency(currExch),
                error => console.log(error),
            );
    }

    setCurrency(currExch: CurrencyExchange): void {
        this.currencyExchange = currExch;

        // get from local storage if present
        if(localStorage.getItem(this.crypto_currencyPreference) != null)
            this.currStr = localStorage.getItem(this.crypto_currencyPreference);

        this.getWatchList();
    }

    /**
     *
     */
    getWatchList() : void {

        this.watchList = [];
        this.watchListCopy = [];
        for(var i=0; i<localStorage.length; i++) {
            if(localStorage.key(i).includes(this.localStorageWatchKey) && localStorage.key(i) != this.crypto_currencyPreference && localStorage.key(i) != this.crypto_amountInvested) {
                let fav: CryptoPrice = JSON.parse(localStorage.getItem(localStorage.key(i)));

                this.cryptoService
                    .getPriceTickerForId(fav.id)
                    .subscribe(
                        result => this.setResult(result, fav),
                        error => console.log(error),
                    );
                this.itemLen = this.itemLen + 1;
            }
        }
        if(this.itemLen == 0) {
            $('#chartContainer').hide();
            $('#chartContainer1').hide();

        } else {
            $('#chartContainer').show();
            $('#chartContainer1').show();
        }
    }

    setResult(result : any, fav: CryptoPrice) : void {

        if(fav == null || fav === undefined)
            return;

        fav = result[0];

        // curremcy changes for price and total
        if(this.currStr === "USD") {
            fav.price = fav.price_usd;
        } else {
            fav.price = (parseFloat(fav.price_usd) * parseFloat(this.currencyExchange.rates[this.currStr])).toFixed(2);
        }

        if(fav.market_cap_usd != '') {
            fav.market_cap_usd = numeral(parseInt(fav.market_cap_usd)).format('0.0a');
        }

        if(fav.available_supply != '') {
            fav.available_supply = numeral(parseInt(fav.available_supply)).format('0.0a');
        }

        this.watchList.push(fav);
        this.watchListCopy.push(fav);

        // total length equal
        if(this.itemLen == this.watchListCopy.length) {
            this.initChart(this.watchListCopy);
        }

        this.watchList.sort(function(a, b) {
            return a.rank - b.rank;
        });

        this.watchListCopy.sort(function(a, b) {
            return a.rank - b.rank;
        });
    }

    /**
     *
     * @param filterText
     */
    filterResults(filterText: string) : void {
        if(filterText.trim() == '') {
            this.watchList = this.watchListCopy;
        } else {
            this.watchList = this.watchListCopy.filter(
                (fav) => fav.symbol.includes(filterText.toUpperCase()));
        }
    }

    /**
     *
     * @param symbol
     */
    removeWatch(symbol: string) : void {
        localStorage.removeItem(this.localStorageWatchKey + symbol);
        $("#favRemoved").text(symbol + " removed from Watch List");
        $("#favRemoved").addClass("in");
        window.setTimeout(function () {
            $("#favRemoved").removeClass("in");
        }, 2000);
        this.itemLen = 0;
        this.getWatchList();
    }

    /**
     * Invoked when the currency dropdown is changed
     * All the prices need to be revised, based on the currency.
     * @param currency
     */
    currencyChanged(currency: string): void {


        let exchangeRate: number = this.currencyExchange.rates[currency];
        for (var i = 0; i < this.watchList.length; i++) {

            if (currency == "USD") {
                this.watchList[i].price = this.watchList[i].price_usd;
            } else {
                this.watchList[i].price = (parseFloat(this.watchList[i].price_usd) * exchangeRate).toFixed(2);
            }
        }

        for (var i = 0; i < this.watchListCopy.length; i++) {

            if (currency == "USD") {
                this.watchListCopy[i].price = this.watchListCopy[i].price_usd;
            } else {
                this.watchListCopy[i].price = (parseFloat(this.watchListCopy[i].price_usd) * exchangeRate).toFixed(2);
            }
        }

        // set choice in local storage
        localStorage.setItem(this.crypto_currencyPreference, currency);
        this.initChart(this.watchListCopy);
    }

    /**
     *
     * @param sortField
     * @param sortDirection
     */
    sortData(sortField: string, sortDirection: string): void {
        if(sortDirection === 'up') {
            this.watchList.sort(function(a, b) {
                return numeral(a[sortField]).value() < numeral(b[sortField]).value() ? 1 : -1;
            });
        } else if(sortDirection === 'down') {
            this.watchList.sort(function(a, b) {
                return numeral(a[sortField]).value() > numeral(b[sortField]).value() ? 1 : -1;
            });
        }
    }

    /**
     *
     */
    initGainersHourChart(): void {

        if(this.hourChart != null)
            this.hourChart.destroy();

        let barCtx = this.horbar1.nativeElement.getContext('2d');
        var data = {
            labels: this.gainersHourLabels,
            datasets: [
                {
                    "data": this.gainersHourData,   // Example data
                    "backgroundColor": [
                        "#aa3bb3",
                        "#80509a",
                        "#1c5ba2",
                        "#fda00d",
                        "#c55a3a",
                        "#cb10d9",
                        "#bcc7f3",
                        "#27ddb9",
                        "#c7394e",
                        "#A52A2A",
                        "#BE2625",
                        "#B22222",
                        "#330000",
                        "#CC1100",
                        "#EE5C42",
                        "#FF7256",
                        "#3a2974",
                        "#a0f75b",
                        "#fc5484",
                        "#14a51b",
                        "#133d48",
                        "#76c543",
                        "#3021d2",
                        "#c38aba",
                        "#6b70a5",
                        "#6061ea",
                        "#aa3bb3",
                        "#80509a",
                        "#1c5ba2",
                        "#fda00d",
                        "#c55a3a",
                        "#cb10d9",
                        "#bcc7f3",
                        "#27ddb9",
                        "#c7394e",
                        "#A52A2A",
                        "#a0f75b",
                        "#fc5484",
                        "#14a51b",
                        "#133d48",
                        "#76c543",
                        "#3021d2",
                        "#c38aba",
                        "#6b70a5",
                        "#6061ea",
                        "#CDC5BF",
                        "#EE8833",
                        "#FFCC11",
                        "#B3C95A",
                        "#AADD00",
                        "#BCEE68"
                    ]
                }]
        };

        this.hourChart = new Chart(
            barCtx,
            {
                "type": 'horizontalBar',
                "data": data,
                "options": {
                    "legend":{"display": false},
                    "cutoutPercentage": 100,
                    "animation": {
                        "animateScale": true,
                        "animateRotate": false
                    },
                    "title": {
                        "display":true,
                        "text":'Top 5 Change (Hourly)',
                        "fontSize":20
                    },
                    "showTooltips": false
                }
            }
        );
    }

    /**
     *
     */
    initGainersDayChart(): void {

        if(this.dayChart != null)
            this.dayChart.destroy();

        let barCtx = this.horbar2.nativeElement.getContext('2d');
        var data = {
            labels: this.gainersDayLabels,
            datasets: [
                {
                    "data": this.gainersDayData,   // Example data
                    "backgroundColor": [
                        "#1c5ba2",
                        "#fda00d",
                        "#c55a3a",
                        "#cb10d9",
                        "#bcc7f3",
                        "#27ddb9",
                        "#3a2974",
                        "#a0f75b",
                        "#fc5484",
                        "#14a51b",
                        "#133d48",
                        "#76c543",
                        "#3021d2",
                        "#c38aba",
                        "#6b70a5",
                        "#6061ea",
                        "#aa3bb3",
                        "#80509a",
                        "#c7394e",
                        "#A52A2A",
                        "#a0f75b",
                        "#fc5484",
                        "#14a51b",
                        "#133d48",
                        "#76c543",
                        "#3021d2",
                        "#c38aba",
                        "#6b70a5",
                        "#6061ea",
                        "#aa3bb3",
                        "#80509a",
                        "#1c5ba2",
                        "#fda00d",
                        "#c55a3a",
                        "#cb10d9",
                        "#bcc7f3",
                        "#27ddb9",
                        "#c7394e",
                        "#A52A2A",
                        "#BE2625",
                        "#B22222",
                        "#330000",
                        "#CC1100",
                        "#EE5C42",
                        "#FF7256",
                        "#CDC5BF",
                        "#EE8833",
                        "#FFCC11",
                        "#B3C95A",
                        "#AADD00",
                        "#BCEE68"
                    ]
                }]
        };

        this.dayChart = new Chart(
            barCtx,
            {
                "type": 'horizontalBar',
                "data": data,
                "options": {
                    "legend":{"display": false},
                    "cutoutPercentage": 100,
                    "animation": {
                        "animateScale": true,
                        "animateRotate": false
                    },
                    "title": {
                        "display":true,
                        "text":'Top 5 Change (Daily)',
                        "fontSize":20
                    },
                    "showTooltips": false
                }
            }
        );
    }

    /**
     *
     */
    initGainersWeekChart(): void {

        if(this.weekChart != null)
            this.weekChart.destroy();

        let barCtx = this.horbar3.nativeElement.getContext('2d');
        var data = {
            labels: this.gainersWeekLabels,
            datasets: [
                {
                    "data": this.gainersWeekData,   // Example data
                    "backgroundColor": [
                        "#133d48",
                        "#76c543",
                        "#3021d2",
                        "#B22222",
                        "#330000",
                        "#CC1100",
                        "#EE5C42",
                        "#FF7256",
                        "#CDC5BF",
                        "#EE8833",
                        "#FFCC11",
                        "#B3C95A",
                        "#AADD00",
                        "#BCEE68",
                        "#c38aba",
                        "#6b70a5",
                        "#6061ea",
                        "#aa3bb3",
                        "#80509a",
                        "#1c5ba2",
                        "#fda00d",
                        "#c55a3a",
                        "#cb10d9",
                        "#bcc7f3",
                        "#27ddb9",
                        "#3a2974",
                        "#a0f75b",
                        "#fc5484",
                        "#14a51b",
                        "#133d48",
                        "#76c543",
                        "#3021d2",
                        "#c38aba",
                        "#6b70a5",
                        "#6061ea",
                        "#aa3bb3",
                        "#80509a",
                        "#1c5ba2",
                        "#fda00d",
                        "#c55a3a",
                        "#cb10d9",
                        "#bcc7f3",
                        "#27ddb9",
                        "#c7394e",
                        "#A52A2A",
                        "#a0f75b",
                        "#fc5484",
                        "#14a51b",
                        "#c7394e",
                        "#A52A2A",
                        "#BE2625",
                    ]
                }]
        };

        this.weekChart = new Chart(
            barCtx,
            {
                "type": 'horizontalBar',
                "data": data,
                "options": {
                    "legend":{"display": false},
                    "cutoutPercentage": 100,
                    "animation": {
                        "animateScale": true,
                        "animateRotate": false
                    },
                    "title": {
                        "display":true,
                        "text":'Top 5 Change (Weekly)',
                        "fontSize":20
                    },
                    "showTooltips": false
                }
            }
        );
    }
}

