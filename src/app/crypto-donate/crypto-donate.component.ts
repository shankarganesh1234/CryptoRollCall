import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {CryptoFavorite} from "../models/crypto-favorite";
import {isUndefined} from "util";

declare const $:any;
@Component({
    selector: 'crypto-donate',
    templateUrl: `./crypto-donate.component.html`
})


export class CryptoDonateComponent implements OnInit{

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService){
        route.params.subscribe(val => {

        });
    }

    ngOnInit(): void {
        //this.invokeCryptoService();
    }

}

