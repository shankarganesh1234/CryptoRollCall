import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoPrices} from "../models/crypto-prices";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";

declare const $:any;
@Component({
    selector: 'crypto-prices',
    templateUrl: `./crypto-prices.component.html`,
    styleUrls: ['crypto-prices.component.css']
})


export class CryptoPricesComponent implements OnInit{

    cryptoPrices: CryptoPrice[];
    cryptoPricesCopy: CryptoPrice[];
    filterText: string;

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService){
        route.params.subscribe(val => {
            this.invokeCryptoService();
        });
    }

    ngOnInit(): void {
        //this.invokeCryptoService();
    }

    /**
     *
     */
    invokeCryptoService() : void {
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
    setResult(result : CryptoPrice[]) : void {
        this.cryptoPrices = result;
        this.cryptoPricesCopy = result;
    }

    /**
     *
     * @param filterText
     */
    filterResults(filterText: string) : void {
        console.log(this.cryptoPrices);
        if(filterText.trim() == '') {
            this.cryptoPrices = this.cryptoPricesCopy;
        } else {
            this.cryptoPrices = this.cryptoPricesCopy.filter(
                (cryptoPrice) => cryptoPrice.symbol.includes(filterText));
        }
    }
}

