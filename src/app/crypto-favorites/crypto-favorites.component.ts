import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoFavorite} from "../models/crypto-favorite";
import {Title} from "@angular/platform-browser";
import {CurrencyExchange} from "../models/currency-exchange";
import {Currencies} from "../models/currencies";
import {CurrencyService} from "../services/currency.service";

declare const $:any;
@Component({
    selector: 'crypto-favorites',
    templateUrl: `./crypto-favorites.component.html`,
    styleUrls: ['crypto-favorites.component.css']
})


export class CryptoFavoritesComponent implements OnInit{

    favs: CryptoFavorite[] = [];
    favsCopy: CryptoFavorite[] = [];
    filterText: string;
    totalPortfolio: number = 0;
    totalPortfolioUsd: number = 0;
    totalPortfolioStr: string;
    localStorageKey: string = "crypto_";

    // currency related changes
    currencyExchange: CurrencyExchange;
    staticCurrencies: Currencies = new Currencies();
    currStr: string = "USD";

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService){
        route.params.subscribe(val => {
            this.invokeCurrencyService();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - Crypto portfolio manager and crypto tracker');
    }

    /**
     *
     */
    invokeCurrencyService(): void {
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
            }
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
            $("#favRemoved").addCLass("out");
        }, 2000);
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
        }
    }
}

