import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";

declare const $: any;
@Component({
    selector: 'crypto-about',
    templateUrl: `./crypto-howto.component.html`,
    styleUrls: ['crypto-howto.component.css']
})

export class CryptoHowToComponent implements OnInit{

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

