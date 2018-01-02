import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {Title} from "@angular/platform-browser";

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

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title) {
        route.params.subscribe(val => {
            this.invokeCryptoService();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall : Converter - USD to ETH BTC XRP and all major crypto currency converter.');
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
        this.calculateToUsd(this.cryptoQuantity, this.cryptoStr);
        this.calculateFromUsd(this.usdQuantity, this.usdCryptoStr);
    }

    /**
     *
     * @param filterText
     */
    calculateToUsd(cryptoQuantity: string, cryptoStr: string): void {
        this.total = parseFloat(cryptoQuantity) * this.getCryptoPrice(cryptoStr);
    }

    /**
     *
     * @param usdQuantity
     * @param cryptoStr
     */
    calculateFromUsd(usdQuantity: string, cryptoStr: string) : void {
        this.cryptoTotal = parseFloat(usdQuantity)/this.getCryptoPrice(cryptoStr);
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

