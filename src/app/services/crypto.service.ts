import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import "rxjs/add/operator/toPromise";
// Import RxJs required methods
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import {CryptoPrice} from "../models/crypto-price";


@Injectable()
export class CryptoService {

    private headers: Headers;
    private options: RequestOptions;

    constructor(private http: Http) {
        this.headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin' : '*'
        });
        this.options = new RequestOptions({headers: this.headers});
    }

    getPriceTicker(): Observable<CryptoPrice[]> {
        let url = 'coinmarketcap/v1/ticker?limit=0';
        return this.http
            .get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getPriceTickerForId(id: string): Observable<CryptoPrice> {
        let url = 'coinmarketcap/v1/ticker/' + id;
        return this.http
            .get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        let body = res.json();
        return body || {};
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}