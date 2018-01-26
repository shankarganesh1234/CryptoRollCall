import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CryptoService} from "../services/crypto.service";
import {CryptoPrice} from "../models/crypto-price";
import {Title} from "@angular/platform-browser";

declare const $: any;
@Component({
    selector: 'crypto-referral',
    templateUrl: `./crypto-referral.component.html`,
    styleUrls: ['crypto-referral.component.css']
})

export class CryptoReferralComponent implements OnInit{

    isGetStarted: boolean  = false;

    constructor(private route: ActivatedRoute, private router: Router,private titleService: Title) {
        route.params.subscribe(val => {
            // hide the welcome message
            $('#welcomeMessage').hide();
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle('CryptoRollCall - About us and how to use crypto roll call');
    }
}

