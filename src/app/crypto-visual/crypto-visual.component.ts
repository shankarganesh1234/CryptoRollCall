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
import { Meta } from '@angular/platform-browser';

declare const $: any;
@Component({
    selector: 'crypto-visual',
    templateUrl: `./crypto-visual.component.html`,
    styleUrls: ['crypto-visual.component.css']
})


export class CryptoVisualComponent implements OnInit {

    pair: string = "nanobtc";
    sellChart: any;
    buyChart: any;
    ws: any;
    totalSold: number = 0;
    totalQuantitySold: number = 0;

    totalBought: number = 0;
    totalQuantityBought: number = 0;

    MIN_XY: number= 0;
    MAX_XY: number = 100;

    minimum: number = 3;
    maximum: number = 10;

    constructor(private route: ActivatedRoute, private router: Router, private cryptoService: CryptoService, private titleService: Title, private currencyService: CurrencyService, private meta: Meta) {

    }

    ngOnInit(): void {
        // hide the welcome message
        $('#welcomeMessage').hide();
        window.scrollTo(0, 0);
        this.initWebsocket();
        this.initChart();
        //this.addDataset(1);
    }

    /**
     * Init websocket with binance
     */
    initWebsocket() : void {
        let pair = 'nanobtc';
        if ("WebSocket" in window) {
            //alert("WebSocket is supported by your Browser!");
            let _this = this;
            // Let us open a web socket
            this.ws = new WebSocket("wss://stream.binance.com:9443/ws/" + pair + "@trade");

            this.ws.onopen = function() {

                // Web Socket is connected, send data using send()
                //ws.send("Message to send");
                //alert("Message is sent...");
            };

            this.ws.onmessage = function (evt) {
                //alert("Message is received...");
                let received_msg = evt.data;
                console.log(received_msg);
                let q = JSON.parse(received_msg).q;



                if(JSON.parse(received_msg)['m']=== false) {
                    _this.addBuyDataset(q);
                    _this.totalBought++;
                    _this.totalQuantityBought += + q;
                } else {
                    _this.addSellDataset(q);
                    _this.totalSold++;
                    _this.totalQuantitySold += + q;
                }
            };

            this.ws.onclose = function() {

                // websocket is closed.
                //alert("Connection is closed...");
            };
        } else {

            // The browser doesn't support WebSocket
            //alert("WebSocket NOT supported by your Browser!");
        }
    }

    /**
     *
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    rand (min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Adds data to dataset
     * @param q
     */
    addSellDataset(q: number) : void {

        this.sellChart.data.datasets[0].data.push({
            "x": this.rand(this.MIN_XY, this.MAX_XY),
            "y": this.rand(this.MIN_XY, this.MAX_XY),
            "r": this.getNormalizedRadius(q),
            "label" : 'Quantity Sold : ' + q
        });
        this.sellChart.update();
    }

    addBuyDataset(q: number) : void {

        this.buyChart.data.datasets[0].data.push({
            "x": this.rand(this.MIN_XY, this.MAX_XY),
            "y": this.rand(this.MIN_XY, this.MAX_XY),
            "r": this.getNormalizedRadius(q),
            "label" : 'Quantity Bought : ' + q
        });
        this.buyChart.update();
    }

    /**
     * Get normalized radius within min max range
     * @param {number} q
     * @returns {number}
     */
    getNormalizedRadius(q: number) :  number {
        var result: number = 3;
        result = Math.abs(q - this.minimum)/ (this.maximum - this.minimum);

        if(result < 3)
            result = 3;
        else if(result > 100)
            result = 100;

        return result;
     }


    /**
     *
     */
    resetCharts(): void {
        this.totalQuantityBought = 0;
        this.totalQuantitySold = 0;
        this.totalBought = 0;
        this.totalSold = 0;
        this.initChart();
     }

    /**
     *
     */
    initChart(): void {

      this.sellChart = new Chart('chart-0',
            {
                "type": 'bubble',
                "data": {
                    "datasets": [{
                        "label": this.pair + " Sell Activity",
                        "data": [{
                            "x": 0,
                            "y": 0,
                            "r": 0
                        }],
                        "backgroundColor": "#c31432"
                    }]
                },
                "options": {
                    "aspectRatio": 1,
                    "responsive": true,
                    "tooltips": {
                        "callbacks": {
                            "label": function(t, d) {
                                return d.datasets[0].data[t.index].label;
                            }
                        }
                    },
                    "scales": {
                        "display": false,
                        "xAxes": [{
                            "gridLines": {
                                "display":true
                            },
                            "ticks": {
                                "display": false
                            }
                        }],
                        "yAxes": [{
                            "gridLines": {
                                "display":true
                            },
                            "ticks": {
                                "display": false
                            }
                        }]
                    }
                }
            }
        );

        this.buyChart = new Chart('chart-1',
            {
                "type": 'bubble',
                "data": {
                    "datasets": [{
                        "label": this.pair + " Buy Activity",
                        "data": [{
                            "x": 0,
                            "y": 0,
                            "r": 0
                        }],
                        "backgroundColor": "#0b6623"
                    }]
                },
                "options": {
                    "aspectRatio": 1,
                    "responsive": true,
                    "tooltips": {
                        "callbacks": {
                            "label": function(t, d) {
                                return d.datasets[0].data[t.index].label;
                            }
                        }
                    },
                    "scales": {
                        "display": false,
                        "xAxes": [{
                            "gridLines": {
                                "display":true
                            },
                            "ticks": {
                                "display": false
                            }
                        }],
                        "yAxes": [{
                            "gridLines": {
                                "display":true
                            },
                            "ticks": {
                                "display": false
                            }
                        }]
                    }
                }
            }
        );
    }


}

