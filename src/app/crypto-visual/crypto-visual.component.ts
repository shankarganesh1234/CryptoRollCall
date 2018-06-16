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

    pair: string = "btcnano";
    chart: any;
    ws: any;
    totalTrades: number = 0;
    totalQuantity: number = 0;
    MIN_XY: number= 0;
    MAX_XY: number = 100;

    minimum: number = 5;
    maximum: number = 15;

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
        let pair = 'bnbbtc';
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
                let q = JSON.parse(received_msg).q;

                _this.addDataset(q);
                _this.totalTrades++;
                _this.totalQuantity += + q;
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
    addDataset(q: number) : void {

        this.chart.data.datasets[0].data.push({
            "x": this.rand(this.MIN_XY, this.MAX_XY),
            "y": this.rand(this.MIN_XY, this.MAX_XY),
            "r": this.getNormalizedRadius(q),
            "label" : 'Quantity Traded : ' + q
        });
        this.chart.update();
    }

    /**
     * Get normalized radius within min max range
     * @param {number} q
     * @returns {number}
     */
    getNormalizedRadius(q: number) :  number {
        var result: number = 5;
        result = Math.abs(q - this.minimum)/ (this.maximum - this.minimum);

        if(result < 5)
            result = 7;

        return result;
     }


    /**
     *
     */
    initChart(): void {

      this.chart = new Chart('chart-0',
            {
                "type": 'bubble',
                "data": {
                    "datasets": [{
                        "label": this.pair + " Trade Activity",
                        "data": [{
                            "x": 0,
                            "y": 0,
                            "r": 0
                        }],
                        "backgroundColor": "rgb(30, 144, 255)"
                    }]
                },
                "options": {
                    "aspectRatio": 2,
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
                                "display":false
                            },
                            "ticks": {
                                "display": false
                            }
                        }],
                        "yAxes": [{
                            "gridLines": {
                                "display":false
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

