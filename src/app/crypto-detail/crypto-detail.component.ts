import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {Title} from "@angular/platform-browser";
import {CurrencyService} from "../services/currency.service";
import Chart from "chart.js";
import {HistoDataList} from "../models/histo-data-list";
import {HistoData} from "../models/histo-data";
import {CryptoDetail} from "../models/crypto-detail";


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
    selectVal: string = "Bitcoin~BTC";
    cryptoCoinDetail: CryptoDetail;

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService) {

    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - Crypto currency source code links, faceboook, twitter, reddit, market cap, available supply, price changes');
        // hide the welcome message
        $('#welcomeMessage').hide();
        window.scrollTo(0, 0);
        this.route.params.subscribe(params => {
            this.symbol = params['symbol'];
            this.name = params['name'].replace(/\s/g,"-");
            this.selectVal = this.name + "~" + this.symbol;
            this.invokeCryptoServiceForSymbol(this.name);
            this.invokeCryptoServiceDetail(this.symbol);
            this.invokeHistoService(this.period, this.symbol);
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
     * @param symbol
     */
    invokeCryptoServiceDetail(symbol: string): void {
        this.cryptoService
            .getCryptoDetail(symbol)
            .subscribe(
                result => this.cryptoCoinDetail = result,
                error => this.cryptoCoinDetail = null
            )
    }

    /**
     *
     * @param result
     */
    setCrypto(result: CryptoPrice): void {
        this.cryptoPrice = result[0];
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
        if(histDataArr != null) {
            for (let i = 0; i < histDataArr.length; i++) {
                this.perfData.push(histDataArr[i][1]);
                this.perfLabels.push(new Date(histDataArr[i][0]));
            }
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
        let chartColors: string[] = ["#aa3bb3","#80509a","#1c5ba2","#fda00d","#c55a3a","#cb10d9","#bcc7f3","#27ddb9","#c7394e",
            "#A52A2A","#BE2625","#B22222","#CC1100","#EE5C42","#FF7256","#a0f75b","#fc5484","#14a51b",
            "#76c543","#c38aba", "#6b70a5","#6061ea", "#aa3bb3", "#80509a","#1c5ba2","#fda00d", "#c55a3a",
            "#cb10d9","#bcc7f3","#27ddb9","#c7394e", "#A52A2A","#a0f75b","#fc5484","#14a51b","#76c543","#3021d2",
            "#c38aba", "#6b70a5", "#6061ea","#CDC5BF","#EE8833","#FFCC11","#B3C95A","#AADD00","#BCEE68"];

        var data = {
            labels: this.perfLabels,
            datasets: [
                {
                    "data": this.perfData,   // Example data
                    "backgroundColor": chartColors[Math.floor(Math.random()*(52))],
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

    /**
     * Invoked when currency changed on detail page
     * @param selVal
     */
    coinChanged(selVal: string): void {
        let selArr: string[] = selVal.split("~");
        this.router.navigate(['/detail', selArr[0], selArr[1]]);
    }

}

