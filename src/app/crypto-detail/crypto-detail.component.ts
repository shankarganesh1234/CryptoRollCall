import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {Title} from "@angular/platform-browser";
import {CurrencyService} from "../services/currency.service";
import Chart from "chart.js";
import {HistoDataList} from "../models/histo-data-list";
import {HistoData} from "../models/histo-data";


declare const $: any;
@Component({
    selector: 'crypto-prices',
    templateUrl: `./crypto-detail.component.html`,
    styleUrls: ['crypto-detail.component.css']
})


export class CryptoDetailComponent implements OnInit {

    cryptoPrice: CryptoPrice;
    @ViewChild('timeline1') timeline1: ElementRef;
    perfData: number[] = [];
    perfLabels: Date[] = [];
    symbol: string;
    name: string;
    period: string = "YEAR";
    chart: any;

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService) {

    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - Crypto currency tracker, portfolio manager and more');
        // hide the welcome message
        $('#welcomeMessage').hide();
        window.scrollTo(0, 0);
        this.route.params.subscribe(params => {
            this.symbol = params['symbol'];
            this.name = params['name'].replace(" ","-");
            this.invokeCryptoServiceForSymbol(this.name);
        });
    }

    /**
     *
     * @param id
     */
    invokeCryptoServiceForSymbol(id: string): void {

        this.cryptoService
            .getPriceTickerForId(id)
            .subscribe(
                result => this.setCrypto(result),
                error => console.log(error),
            );
    }

    /**
     *
     * @param result
     */
    setCrypto(result: CryptoPrice): void {
        this.cryptoPrice = result[0];
        this.invokeHistoService(this.period, this.symbol);
    }

    /**
     *
     */
    invokeHistoService(period: string, symbol:string): void {
        this.cryptoService
            .getHistoricalCharts(period, symbol)
            .subscribe(
                histoDataList => this.setHisto(histoDataList),
                error => console.log(error),
            );
    }

    setHisto(result: HistoDataList): void {
        this.perfData = [];
        this.perfLabels = [];
        let histDataArr: HistoData[] = result['price'];
        for(let i=0; i<histDataArr.length; i+=5) {
            this.perfData.push(histDataArr[i][1]);
            this.perfLabels.push(new Date(histDataArr[i][0]));
        }

        if(this.chart != null)
            this.chart.destroy();

        this.initPerfChart();
    }

   /**
     *
     */
    initPerfChart(): void {

        let timeCtx = this.timeline1.nativeElement.getContext('2d');
        var data = {
            labels: this.perfLabels,
            datasets: [
                {
                    "data": this.perfData,   // Example data
                    "backgroundColor": "#119C9C",
                    "lineTension":0
                }]
        };

        this.chart = new Chart(
            timeCtx,
            {
                "type": 'line',
                "data": data,
                "options": {
                    "fill": false,
                    "responsive": true,
                    "legend":{
                        "display": false
                    },
                    "title": {
                        "display":true,
                        "text":'Price performance over time',
                        "fontSize":20
                    },
                    "tooltips": {
                        "enabled": true,
                        "mode": 'nearest',
                        "intersect": false
                    },
                    "scales": {
                        "xAxes": [{
                            "type": 'time',
                            "display": true,
                            "scaleLabel": {
                                "display": true,
                                "labelString": "Date/Time"
                            }
                        }]
                    }
                }
            }
        );
    }

}

