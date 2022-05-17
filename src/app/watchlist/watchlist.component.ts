import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist.component.html',
    styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

    showWatchlist: any;

    watchlist: any;

    latestPriceArray: any = [];

    isOpen: any;

    timer: any;

    count: any = 0;

    constructor(private http: HttpClient) {
    }

    ngOnInit(): void {
        this.watchlist = JSON.parse(<string>localStorage.getItem("watchlist"));

        this.showWatchlist = this.watchlist.length != 0;

        this.watchlist.forEach((item: any) => {
            this.http.get(`https://finnhub.io/api/v1/quote?symbol=${item.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
                // const result = data.result || [];
                if (this.isOpen == undefined) {
                    this.isOpen = Date.now() / 1000 - data.t <= 5 * 60;
                }
                this.latestPriceArray.push(data);
            })
        })

        if (this.isOpen) {
            this.runTimer();
        }

        console.log(this.watchlist)
        console.log(this.latestPriceArray)
    }

    runTimer() {
        this.timer = setInterval(() => {
            this.latestPriceArray = [];
            this.watchlist.forEach((item: any) => {
                this.http.get(`https://finnhub.io/api/v1/quote?symbol=${item.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
                    // const result = data.result || [];
                    data.c = this.count;
                    this.count++;
                    this.latestPriceArray.push(data);
                })
            })
            console.log("UPDATE DATE: ", this.latestPriceArray);
        }, 15000);
    }

    removeFromWatchlist(index: any) {
        this.watchlist.splice(index, 1);
        this.latestPriceArray.splice(index, 1);
        localStorage.setItem("watchlist", JSON.stringify(this.watchlist));
    }

    checkData() {
        return this.latestPriceArray != undefined;
    }
}
