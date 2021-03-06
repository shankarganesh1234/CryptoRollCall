import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import "rxjs/add/operator/toPromise";
// Import RxJs required methods
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import {CryptoPrice} from "../models/crypto-price";
import {CurrencyExchange} from "../models/currency-exchange";


@Injectable()
export class CurrencyService {

    private headers: Headers;
    private options: RequestOptions;
    private currencyExchange: Observable<CurrencyExchange>;

    constructor(private http: Http) {
        this.headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
        this.options = new RequestOptions({headers: this.headers});
    }

    /**
     *
     * @returns {Observable<R|T>}
     */
    getCurrExchRates(currency: string): Observable<CurrencyExchange> {

        let baseUrl = "crcserver/currency/";
        let url = baseUrl + currency;
        if(this.currencyExchange != null)
            return this.currencyExchange;

        return this.http
            .get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        let body = res.json();
        this.currencyExchange = body || {};
        return this.currencyExchange;
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }
}