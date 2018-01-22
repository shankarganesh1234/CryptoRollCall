import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {CryptoFavorite} from "../models/crypto-favorite";
import {Title} from "@angular/platform-browser";
import {isUndefined} from "util";
import {CurrencyService} from "../services/currency.service";
import {CurrencyExchange} from "../models/currency-exchange";
import {Currencies} from "../models/currencies";
import * as numeral from "numeral";
import Chart from "chart.js";
import {ChartDataList} from "../models/chart-data-list";


declare const $: any;
@Component({
    selector: 'crypto-prices',
    templateUrl: `./crypto-prices.component.html`,
    styleUrls: ['crypto-prices.component.css']
})


export class CryptoPricesComponent implements OnInit {

    cryptoPrices: CryptoPrice[] = [];
    cryptoPricesCopy: CryptoPrice[] = [];

    filterText: string;
    localStorageKey: string = "crypto_";

    // currency related
    currencyExchange: CurrencyExchange;
    staticCurrencies: Currencies = new Currencies();
    currStr: string = "USD";

    // chart related
    @ViewChild('horbar1') horbar1: ElementRef;
    @ViewChild('horbar2') horbar2: ElementRef;
    @ViewChild('horbar3') horbar3: ElementRef;

    gainersHourData: number[] = [];
    gainersHourLabels: string[] = [];

    gainersDayData: number[] = [];
    gainersDayLabels: string[] = [];

    gainersWeekData: number[] = [];
    gainersWeekLabels: string[] = [];

    recordsPerPage: number = 100;

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService) {

        route.params.subscribe(val => {
            this.invokeCurrencyService();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - Crypto currency tracker, portfolio manager and more');
    }

    /**
     *
     */
    invokeCurrencyService(): void {
        // hide the welcome message
        $('#welcomeMessage').show();
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
        if(localStorage.getItem(this.localStorageKey + "currencyPreference") != null)
            this.currStr = localStorage.getItem(this.localStorageKey + "currencyPreference");

        this.invokeCryptoService();
    }

    /**
     *
     */
    invokeCryptoService(): void {
        this.cryptoService
            .getPriceTicker()
            .subscribe(
                result => this.setResult(result),
                error => console.log(error),
            );
    }

    invokeChartService(): void {
        this.cryptoService
            .getChartsHome()
            .subscribe(
                result => this.setCharts(result),
                error => console.log(error),
            );
    }

    setCharts(result: ChartDataList): void {

        this.gainersHourLabels = [];
        this.gainersDayLabels = [];
        this.gainersWeekLabels = [];

        this.gainersHourData = [];
        this.gainersDayData = [];
        this.gainersWeekData = [];


        for(let i=0; i<5; i++) {
            this.gainersHourLabels.push(result['hourlyList'][i].label);
            this.gainersHourData.push(result['hourlyList'][i].data);

            this.gainersDayLabels.push(result['dailyList'][i].label);
            this.gainersDayData.push(result['dailyList'][i].data);

            this.gainersWeekLabels.push(result['weeklyList'][i].label);
            this.gainersWeekData.push(result['weeklyList'][i].data);
        }

        this.initChart();
    }
    /**
     *
     * @param result
     */
    setResult(result: CryptoPrice[]): void {

        this.cryptoPrices = result;
        for (var i = 0; i < this.cryptoPrices.length; i++) {

            if (localStorage.getItem(this.localStorageKey + this.cryptoPrices[i].symbol) != null && !isUndefined(localStorage.getItem(this.localStorageKey + this.cryptoPrices[i].symbol))) {
                this.cryptoPrices[i].isFavorite = true;
            } else {
                this.cryptoPrices[i].isFavorite = false;
            }

            if(this.currStr === "USD")
                this.cryptoPrices[i].price = this.cryptoPrices[i].price_usd;
            else
                this.cryptoPrices[i].price = (parseFloat(this.cryptoPrices[i].price_usd) * parseFloat(this.currencyExchange.rates[this.currStr])).toFixed(2);

            if(this.cryptoPrices[i].market_cap_usd != '') {
                this.cryptoPrices[i].market_cap_usd = numeral(parseInt(this.cryptoPrices[i].market_cap_usd)).format('0.0a');
            }

        }
        this.cryptoPricesCopy = this.cryptoPrices;

        // chart related
        this.invokeChartService();
    }



    /**
     *
     * @param filterText
     */
    filterResults(filterText: string): void {
        if (filterText.trim() == '') {
            this.cryptoPrices = this.cryptoPricesCopy;
        } else {
            this.cryptoPrices = this.cryptoPricesCopy.filter(
                (cryptoPrice) => cryptoPrice.symbol.includes(filterText.toUpperCase()));
        }
    }

    /**
     *
     * @param item
     */
    addToFavorites(item: CryptoPrice): void {

        if (item.isFavorite) {
            localStorage.removeItem(this.localStorageKey + item.symbol);
            item.isFavorite = false;

            $("#favRemoved").text(item.symbol + " removed from Portfolio");
            $("#favRemoved").addClass("in");
            window.setTimeout(function () {
                $("#favRemoved").removeClass("in");
                //$("#favRemoved").addCLass("out");
            }, 2000);

        } else {
            let cryptoFavorite: CryptoFavorite = new CryptoFavorite();
            cryptoFavorite.id = item.id;
            cryptoFavorite.symbol = item.symbol;
            cryptoFavorite.quantity = 1;
            cryptoFavorite.rank = item.rank;
            localStorage.setItem(this.localStorageKey + cryptoFavorite.symbol, JSON.stringify(cryptoFavorite));
            item.isFavorite = true;

            // alert for adding to favorites
            $("#favAdded").text(item.symbol + " added to Portfolio");
            $("#favAdded").addClass("in");
            window.setTimeout(function () {
                $("#favAdded").removeClass("in");
                //$("#favAdded").addCLass("out");
            }, 2000);

        }
    }

    /**
     * Invoked when the currency dropdown is changed
     * All the prices need to be revised, based on the currency.
     * @param currency
     */
    currencyChanged(currency: string): void {


        let exchangeRate: number = this.currencyExchange.rates[currency];
        for (var i = 0; i < this.cryptoPrices.length; i++) {

            if(currency == "USD")
                this.cryptoPrices[i].price = this.cryptoPrices[i].price_usd;
            else
                this.cryptoPrices[i].price = (parseFloat(this.cryptoPrices[i].price_usd) * exchangeRate).toFixed(2);
        }
        for (var i = 0; i < this.cryptoPricesCopy.length; i++) {
            if(currency == "USD")
                this.cryptoPricesCopy[i].price = this.cryptoPricesCopy[i].price_usd;
            else
                this.cryptoPricesCopy[i].price = (parseFloat(this.cryptoPricesCopy[i].price_usd) * exchangeRate).toFixed(2);        }

        // set choice in local storage
        localStorage.setItem(this.localStorageKey + "currencyPreference", currency);
    }

    /**
     *
     * @param sortField
     * @param sortDirection
     */
    sortData(sortField: string, sortDirection: string): void {
        if(sortDirection === 'up') {
            this.cryptoPrices.sort(function(a,b) {
                return numeral(a[sortField]).value() < numeral(b[sortField]).value() ? 1 : -1;
            });
        } else if(sortDirection === 'down') {
            this.cryptoPrices.sort(function(a,b) {
                return numeral(a[sortField]).value() > numeral(b[sortField]).value() ? 1 : -1;
            });
        }
    }


    initChart(): void {
        this.initGainersHourChart();
        this.initGainersDayChart();
        this.initGainersWeekChart();
    }

    /**
     *
     */
    initGainersHourChart(): void {

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

        var chart = new Chart(
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
                        "text":'Top 5 Gain (Hourly)',
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

        var chart = new Chart(
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
                        "text":'Top 5 Gain (Daily)',
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

        var chart = new Chart(
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
                        "text":'Top 5 Gain (Weekly)',
                        "fontSize":20
                    },
                    "showTooltips": false
                }
            }
        );
    }

}

