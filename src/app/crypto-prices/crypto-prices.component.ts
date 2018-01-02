import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {CryptoFavorite} from "../models/crypto-favorite";
import { Title } from '@angular/platform-browser';
import {isUndefined} from "util";

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

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title) {
        route.params.subscribe(val => {
            this.invokeCryptoService();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall : Home - Track crypto currencies and get real time updates on Bitcoin, Litecoin, Ripple and all major crypto currencies');
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
        }
        this.cryptoPricesCopy = this.cryptoPrices;
    }

    /**
     *
     * @param filterText
     */
    filterResults(filterText: string): void {
        console.log(this.cryptoPrices);
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

            $("#favRemoved").text(item.symbol + " removed from favorites");
            $("#favRemoved").addClass("in");
            window.setTimeout(function () {
                $("#favRemoved").removeClass("in");
                $("#favRemoved").addCLass("out");
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
            $("#favAdded").text(item.symbol + " added to favorites");
            $("#favAdded").addClass("in");
            window.setTimeout(function () {
                $("#favAdded").removeClass("in");
                $("#favAdded").addCLass("out");
            }, 2000);

        }
    }
}

