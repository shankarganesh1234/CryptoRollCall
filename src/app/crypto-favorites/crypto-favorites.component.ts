import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoFavorite} from "../models/crypto-favorite";
import {Title} from "@angular/platform-browser";
import {CurrencyExchange} from "../models/currency-exchange";
import {Currencies} from "../models/currencies";
import {CurrencyService} from "../services/currency.service";
import * as numeral from 'numeral';
import Chart from 'chart.js';



declare const $:any;
@Component({
    selector: 'crypto-favorites',
    templateUrl: `./crypto-favorites.component.html`,
    styleUrls: ['crypto-favorites.component.css']
})


export class CryptoFavoritesComponent implements OnInit{

    favs: CryptoFavorite[] = [];
    favsCopy: CryptoFavorite[] = [];
    filterText: string = '';
    totalPortfolio: number = 0;
    totalPortfolioUsd: number = 0;
    totalPortfolioStr: string;
    localStorageKey: string = "crypto_";

    // currency related changes
    currencyExchange: CurrencyExchange;
    staticCurrencies: Currencies = new Currencies();
    currStr: string = "USD";

    // chart related
    @ViewChild('donut') donut: ElementRef;
    @ViewChild('bar') bar: ElementRef;

    chartData: number[] = [];
    barChartData: number[] = [];
    chartLabels: string[] = [];
    itemLen: number = 0;

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService){
        route.params.subscribe(val => {
            this.invokeCurrencyService();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - Crypto portfolio manager and crypto tracker');
        this.initChart();
    }

    initChart(): void {
        this.itemLen = 0;
        this.chartData = [];
        this.barChartData = [];
        this.chartLabels = [];

        if(this.favsCopy.length == 0)
        {
            $('#chartContainer').hide();
            return;
        } else {
            $('#chartContainer').show();
        }

        for(let i=0; i<this.favsCopy.length; i++) {
            this.chartData.push(parseInt(this.favsCopy[i].total));
            this.barChartData.push(this.favsCopy[i].quantity);
            this.chartLabels.push(this.favsCopy[i].symbol);
        }
        this.initPieChart();
        this.initBarChart();
    }

    initBarChart(): void {

        let barCtx = this.bar.nativeElement.getContext('2d');
        var data = {
            labels: this.chartLabels,
            datasets: [
                {
                    "data": this.barChartData,   // Example data
                    "backgroundColor": [
                        "#1fc8f8",
                        "#76a346",
                        "#5787dd",
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
                "type": 'bar',
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
                        "text":'Coin distribution',
                        "fontSize":20
                    },
                    "showTooltips": false
                }
            }
        );
    }

    initPieChart() : void {

        let donutCtx = this.donut.nativeElement.getContext('2d');
        var data = {
            labels: this.chartLabels,
            datasets: [
                {
                    "data": this.chartData,   // Example data
                    "backgroundColor": [
                        "#1fc8f8",
                        "#76a346",
                        "#5787dd",
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
            donutCtx,
            {
                "type": 'doughnut',
                "data": data,
                "options": {
                    "cutoutPercentage": 50,
                    "animation": {
                        "animateScale": true,
                        "animateRotate": false
                    },
                    "title": {
                        "display":true,
                        "text": this.totalPortfolioStr + ' ' + this.currStr,
                        "fontSize":20
                    }
                }
            }
        );
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
        if(localStorage.getItem(this.localStorageKey + "currencyPreference") != null)
            this.currStr = localStorage.getItem(this.localStorageKey + "currencyPreference");

        this.getFavs();
    }

    /**
     *
     */
    getFavs() : void {

        this.totalPortfolio = 0;
        this.totalPortfolioStr = "0";
        this.favs = [];
        this.favsCopy = [];
        for(var i=0; i<localStorage.length; i++) {
            if(localStorage.key(i).includes(this.localStorageKey) && localStorage.key(i) != 'crypto_currencyPreference') {
                let fav: CryptoFavorite = JSON.parse(localStorage.getItem(localStorage.key(i)));

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
        } else {
            $('#chartContainer').show();
        }

    }

    setResult(result : any, fav: CryptoFavorite) : void {

        let q: number = fav.quantity;
        fav = result[0];

        fav.total_usd = (parseFloat(fav.price_usd) * q).toFixed(2);

        // curremcy changes for price and total
        if(this.currStr === "USD") {
            fav.price = fav.price_usd;
            fav.total = fav.total_usd;
        } else {
            fav.price = (parseFloat(fav.price_usd) * parseFloat(this.currencyExchange.rates[this.currStr])).toFixed(2);
            fav.total = (parseFloat(fav.total_usd) * parseFloat(this.currencyExchange.rates[this.currStr])).toFixed(2);
        }

        fav.total_btc = (parseFloat(fav.price_btc) * q).toFixed(2);

        this.totalPortfolio += parseFloat(fav.total);
        this.totalPortfolioUsd += parseFloat(fav.total_usd);

        this.totalPortfolioStr = this.totalPortfolio.toFixed(2);

        fav.quantity = q;
        this.favs.push(fav);
        this.favsCopy.push(fav);

         // total length equal
        if(this.itemLen == this.favsCopy.length) {
            this.initChart();
        }

        this.favs.sort(function(a,b) {
           return a.rank - b.rank;
        });

        this.favsCopy.sort(function(a,b) {
            return a.rank - b.rank;
        });
    }

    /**
     *
     * @param filterText
     */
    filterResults(filterText: string) : void {
        if(filterText.trim() == '') {
            this.favs = this.favsCopy;
        } else {
            this.favs = this.favsCopy.filter(
                (fav) => fav.symbol.includes(filterText.toUpperCase()));
        }
    }

    updateTotals(quantity: number, index: number) : void {
        this.favs[index].quantity = quantity;
        this.favs[index].total = (this.favs[index].quantity * parseFloat(this.favs[index].price)).toFixed(2);
        this.favs[index].total_btc = (this.favs[index].quantity * parseFloat(this.favs[index].price_btc)).toFixed(2);

        this.totalPortfolio = 0;
        this.totalPortfolioUsd = 0;
        for(var i=0; i<this.favs.length; i++) {
            this.totalPortfolio += parseFloat(this.favs[i].total);
            this.totalPortfolioUsd += parseFloat(this.favs[i].total_usd);
        }
        this.totalPortfolioStr = this.totalPortfolio.toFixed(2);
        let itemIndex = this.favsCopy.findIndex(item => item.symbol == this.favs[index].symbol);

        if(itemIndex >= 0) {
            this.favsCopy[itemIndex] = this.favs[index];
        }

        localStorage.removeItem(this.localStorageKey + this.favs[index].symbol);
        localStorage.setItem(this.localStorageKey + this.favs[index].symbol, JSON.stringify(this.favs[index]));
        this.initChart();
    }

    /**
     *
     * @param symbol
     */
    removeFavorite(symbol: string) : void {
        localStorage.removeItem(this.localStorageKey + symbol);
        $("#favRemoved").text(symbol + " removed from favorites");
        $("#favRemoved").addClass("in");
        window.setTimeout(function () {
            $("#favRemoved").removeClass("in");
        }, 2000);
        this.itemLen = 0;
        this.getFavs();
    }

    /**
     * Invoked when the currency dropdown is changed
     * All the prices need to be revised, based on the currency.
     * @param currency
     */
    currencyChanged(currency: string): void {


        let exchangeRate: number = this.currencyExchange.rates[currency];
        for (var i = 0; i < this.favs.length; i++) {

            if (currency == "USD") {
                this.favs[i].price = this.favs[i].price_usd;
                this.favs[i].total = this.favs[i].total_usd;
            } else {
                this.favs[i].price = (parseFloat(this.favs[i].price_usd) * exchangeRate).toFixed(2);
                this.favs[i].total = (parseFloat(this.favs[i].total_usd) * exchangeRate).toFixed(2);
            }
        }

        for (var i = 0; i < this.favsCopy.length; i++) {

                if (currency == "USD") {
                    this.favsCopy[i].price = this.favsCopy[i].price_usd;
                    this.favsCopy[i].total = this.favsCopy[i].total_usd;
                } else {
                    this.favsCopy[i].price = (parseFloat(this.favsCopy[i].price_usd) * exchangeRate).toFixed(2);
                    this.favsCopy[i].total = (parseFloat(this.favsCopy[i].total_usd) * exchangeRate).toFixed(2);
                }
        }

        if (currency == "USD") {
                this.totalPortfolioStr = this.totalPortfolioUsd.toFixed(2);
        } else {
                this.totalPortfolioStr = (this.totalPortfolioUsd * exchangeRate).toFixed(2);
        }
            // set choice in local storage
            localStorage.setItem(this.localStorageKey + "currencyPreference", currency);
            this.initChart();
    }

    /**
     *
     * @param sortField
     * @param sortDirection
     */
    sortData(sortField: string, sortDirection: string): void {
        if(sortDirection === 'up') {
            this.favs.sort(function(a,b) {
                return numeral(a[sortField]).value() < numeral(b[sortField]).value() ? 1 : -1;
            });
        } else if(sortDirection === 'down') {
            this.favs.sort(function(a,b) {
                return numeral(a[sortField]).value() > numeral(b[sortField]).value() ? 1 : -1;
            });
        }
    }
}

