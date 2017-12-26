import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {CryptoFavorite} from "../models/crypto-favorite";
import {isUndefined} from "util";

declare const $:any;
@Component({
    selector: 'crypto-contact',
    templateUrl: `./crypto-contact.component.html`
})


export class CryptoContactComponent implements OnInit{

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService){
        route.params.subscribe(val => {

        });
    }

    ngOnInit(): void {
        //this.invokeCryptoService();
    }

}

