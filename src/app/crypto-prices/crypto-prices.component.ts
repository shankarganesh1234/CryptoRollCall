import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {CryptoFavorite} from "../models/crypto-favorite";
import { Title } from '@angular/platform-browser';
import {isUndefined} from "util";
import {CurrencyService} from "../services/currency.service";
import {CurrencyExchange} from "../models/currency-exchange";
import {Currencies} from "../models/currencies";
import * as numeral from 'numeral';
import Chart from 'chart.js';



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
    gainersData: number[] = [];
    gainersLabels: string[] = [];
    losersData: number[] = [];
    losersLabels: string[] = [];
    cryptoPricesGainers : CryptoPrice[] = [];
    cryptoPricesLosers : CryptoPrice[] = [];

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
        this.initChart(this.cryptoPrices);
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


    initChart(cryptoPrices: CryptoPrice[]): void {

        // reset all fields
        this.cryptoPricesGainers = [];
        this.cryptoPricesLosers = [];
        this.gainersLabels = [];
        this.gainersData = [];
        this.losersLabels = [];
        this.losersData = [];

        this.cryptoPricesGainers = cryptoPrices;
        this.cryptoPricesLosers = cryptoPrices;
        // top 5 charts
        this.cryptoPricesGainers = this.cryptoPricesGainers.slice().sort(function(a,b) {
            return numeral(a['percent_change_24h']).value() < numeral(b['percent_change_24h']).value() ? 1 : -1;
        }).slice(0,5);

        this.cryptoPricesLosers = this.cryptoPricesLosers.slice().sort(function(a,b) {
            return numeral(a['percent_change_24h']).value() > numeral(b['percent_change_24h']).value() ? 1 : -1;
        }).slice(0,5);

        for(let i=0; i<this.cryptoPricesGainers.length; i++) {
            this.gainersLabels.push(this.cryptoPricesGainers[i].name);
            this.gainersData.push(parseFloat(this.cryptoPricesGainers[i].percent_change_24h));
        }

        for(let i=0; i<this.cryptoPricesLosers.length; i++) {
            this.losersLabels.push(this.cryptoPricesLosers[i].name);
            this.losersData.push(parseFloat(this.cryptoPricesLosers[i].percent_change_24h));
        }
        this.initGainersChart();
        this.initLosersChart();
    }

    /**
     *
     */
    initGainersChart(): void {

        let barCtx = this.horbar1.nativeElement.getContext('2d');
        var data = {
            labels: this.gainersLabels,
            datasets: [
                {
                    "data": this.gainersData,   // Example data
                    "backgroundColor": [
                        "#7CFC00",
                        "#32CD32",
                        "#228B22",
                        "#006400",
                        "#ADFF2F",
                        "#00FF7F",
                        "#98FB98"
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
                        "text":'Top 5 Gain (24h)',
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
    initLosersChart(): void {

        let barCtx = this.horbar2.nativeElement.getContext('2d');
        var data = {
            labels: this.losersLabels,
            datasets: [
                {
                    "data": this.losersData,   // Example data
                    "backgroundColor": [
                        "#FA8072",
                        "#DC143C",
                        "#FF0000",
                        "#ff0000",
                        "#800000",
                        "#FF4500",
                        "#FF6347"
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
                        "text":'Top 5 Loss (24h)',
                        "fontSize":20
                    },
                    "showTooltips": false
                }
            }
        );
    }

}

