import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Router} from '@angular/router';
import {debounceTime} from "rxjs";


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    constructor(private http: HttpClient, private router: Router) {
    }


    description: any = {};
    historicalData: any;
    latestPrice: any = {};
    control = new FormControl();
    ticker = "";
    isHighcharts: boolean = false;
    filteredStreets: any = {};
    isLoading = false;
    noInputNotice: any;
    noDataNotice: any;


    autoCompleteTimer: any;


    ngOnInit() {
        console.log("HOME ON INIT")
        if (!localStorage.getItem("wallet")) {
            localStorage.setItem("wallet", "25000");
            let myStock: any = [];
            localStorage.setItem("myStock", JSON.stringify(myStock));
            let watchlist: any = [];
            localStorage.setItem("watchlist", JSON.stringify(watchlist));
        }

        if (this.router.routerState.snapshot) {
            const url = this.router.routerState.snapshot.url;
            const urls = url.split("/");
            if (urls[1] === 'search' && urls[2] !== "home") {
                this.control.setValue(urls[2]);
            }
        }


        this.control.valueChanges.subscribe(data => {
            if (this.control.value == "" || this.control.value == null) {
                clearInterval(this.autoCompleteTimer);
                this.filteredStreets = [];
                this.isLoading = false;
            } else {
                clearInterval(this.autoCompleteTimer);
                this.filteredStreets = [];
                this.isLoading = true;

                this.autoCompleteTimer = setInterval(() => {


                    console.log("INPUT:", this.control.value);


                    this.http.get(`https://finnhub.io/api/v1/search?q=${data.toUpperCase()}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
                        const result = data.result || [];
                        result.forEach((stockInfo: any) => {
                            if (stockInfo.type === 'Common Stock' && stockInfo.symbol.indexOf('.') === -1) {
                                return this.filteredStreets.push({
                                    symbol: stockInfo.symbol,
                                    description: stockInfo.description
                                })
                            } else {
                                return false
                            }
                        })
                        this.isLoading = false;
                    })
                    clearInterval(this.autoCompleteTimer);
                }, 500);
            }

        })
    }

    onSubmit(ticker:any) {
        this.noInputNotice = false;
        this.noDataNotice = false;
        this.isLoading = false;
        if (ticker!=''){
            this.control.setValue(ticker);
        }
        clearInterval(this.autoCompleteTimer);
        if (this.control.value == null || this.control.value == "") {
            this.noInputNotice = true;
            return;
        }


        console.log("INPUT: ", this.control.value.toUpperCase());
        this.http.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${this.control.value.toUpperCase()}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
            // const result = data.result || [];
            this.description = data;
            console.log("on submit: ", JSON.stringify(data), this.control.value);
            if (JSON.stringify(data) == "{}") {
                console.log("on submit 1: ");
                this.noDataNotice = true;
                return;
            } else {
                console.log("on submit 2: ");
                localStorage.setItem("ticker", this.control.value.toUpperCase());
                this.router.navigate(["search", this.control.value.toUpperCase()]);
            }
        })
    }

    hideNoDataNotice() {
        this.noDataNotice = false;
    }

    hideNoInputNotice() {
        this.noInputNotice = false;
    }

    clear() {
        this.router.navigate(["search"])
        this.filteredStreets = [];
        this.noDataNotice = false;
        this.noInputNotice = false;
        this.control.reset();
        localStorage.setItem('ticker', "");
    }
}


