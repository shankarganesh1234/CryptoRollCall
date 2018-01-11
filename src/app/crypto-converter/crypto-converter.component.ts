import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {Title} from "@angular/platform-browser";
import {CurrencyExchange} from "../models/currency-exchange";
import {Currencies} from "../models/currencies";
import {CurrencyService} from "../services/currency.service";

declare const $: any;
@Component({
    selector: 'crypto-prices',
    templateUrl: `./crypto-converter.component.html`,
    styleUrls: ['crypto-converter.component.css']
})

export class CryptoConverterComponent implements OnInit{

    cryptoPrices: CryptoPrice[] = [];
    cryptoQuantity: string = "1";
    usdQuantity: string = "100";
    cryptoStr: string = "BTC";
    usdCryptoStr: string = "BTC";
    total: number;
    cryptoTotal: number;

    currencyExchange: CurrencyExchange;
    staticCurrencies: Currencies = new Currencies();
    currStr: string = "USD";
    currStrFiat: string = "USD";


    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService) {
        route.params.subscribe(val => {
            this.invokeCurrencyService();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - Convert ETH XRP BTC to/from USD');
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
        this.calculateToFIAT(this.cryptoQuantity, this.cryptoStr, this.currStr);
        this.calculateFromFiat(this.usdQuantity, this.usdCryptoStr, this.currStrFiat);
    }

    /**
     *
     * @param filterText
     */
    calculateToFIAT(cryptoQuantity: string, cryptoStr: string, currency: string): void {
        let exchangeRate: number;

        if(currency == "USD")
            exchangeRate = 1;
        else
            exchangeRate = this.currencyExchange.rates[currency];

        this.total = exchangeRate * parseFloat(cryptoQuantity) * this.getCryptoPrice(cryptoStr);
    }

    /**
     *
     * @param usdQuantity
     * @param cryptoStr
     */
    calculateFromFiat(usdQuantity: string, cryptoStr: string, currStrFiat: string) : void {

        let exchangeRate: number;

        if(currStrFiat == "USD")
            exchangeRate = 1;
        else
            exchangeRate = this.currencyExchange.rates[currStrFiat];

        this.cryptoTotal = parseFloat(usdQuantity) / (this.getCryptoPrice(cryptoStr) * exchangeRate);

    }

    /**
     *
     * @param cryptoStr
     * @returns {CryptoPrice}
     */
    getCryptoPrice(cryptoStr: string): number {
       let cryptoItem = this.cryptoPrices.find(function(item) {
            return item.symbol === cryptoStr;
        });
       return parseFloat(cryptoItem.price_usd);
    }


}

