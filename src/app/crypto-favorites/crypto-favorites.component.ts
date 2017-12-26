import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoFavorite} from "../models/crypto-favorite";

declare const $:any;
@Component({
    selector: 'crypto-favorites',
    templateUrl: `./crypto-favorites.component.html`
})


export class CryptoFavoritesComponent implements OnInit{

    favs: CryptoFavorite[] = [];
    favsCopy: CryptoFavorite[] = [];
    filterText: string;
    totalPortfolio: number = 0;
    totalPortfolioStr: string;
    localStorageKey: string = "crypto_";

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService){
        route.params.subscribe(val => {
            this.getFavs();
        });
    }

    ngOnInit(): void {
        //this.invokeCryptoService();
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
            if(localStorage.key(i).includes(this.localStorageKey)) {
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

        fav.total_usd = parseFloat(fav.price_usd) * q;
        fav.total_btc = parseFloat(fav.price_btc) * q;

        this.totalPortfolio += fav.total_usd;
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
                (fav) => fav.symbol.includes(filterText));
        }
    }

    updateTotals(quantity: number, index: number) : void {
        this.favs[index].quantity = quantity;
        this.favs[index].total_usd = this.favs[index].quantity * parseFloat(this.favs[index].price_usd);
        this.favs[index].total_btc = this.favs[index].quantity * parseFloat(this.favs[index].price_btc);

        this.totalPortfolio = 0;
        for(var i=0; i<this.favs.length; i++) {
            this.totalPortfolio += this.favs[i].total_usd;
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
        this.getFavs();
    }


}

