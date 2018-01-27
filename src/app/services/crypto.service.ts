import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import "rxjs/add/operator/toPromise";
// Import RxJs required methods
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import {CryptoPrice} from "../models/crypto-price";
import {ChartDataList} from "../models/chart-data-list";
import {HistoDataList} from "../models/histo-data-list";
import {CryptoDetail} from "../models/crypto-detail";


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
        let baseUrl = "crcserver/ticker/";
        let url = baseUrl + 'list';
        return this.http
            .get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getPriceTickerForId(id: string): Observable<CryptoPrice> {
        let baseUrl = "crcserver/ticker/";
        let url = baseUrl + id;
        return this.http
            .get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getChartsHome(): Observable<ChartDataList> {
        let url = "crcserver/charts/home";
        return this.http
            .get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getHistoricalCharts(period: string, symbol: string): Observable<HistoDataList> {
        let url = "crcserver/charts/histo/" + period + "/" + symbol;
        return this.http
            .get(url)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getCryptoDetail(symbol: string): Observable<CryptoDetail> {
        let url = "crcserver/coindetail/"+ symbol;
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
        return Observable.throw(errMsg);
    }
}