import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
    showPortfolio: any;
    myMoney: any;
    myStock: any;
    myStockInfo: any = [];

    ticker: any;
    buyNotice: any;
    sellNotice: any;

    buyNoticeTimer: any;
    sellNoticeTimer: any;

    timer: any;

    constructor(private http: HttpClient) {
    }

    ngOnInit(): void {
        this.myMoney = Number(localStorage.getItem("wallet"))
        this.myStock = JSON.parse(<string>localStorage.getItem("myStock"));
        this.showPortfolio = this.myStock.length != 0;
        this.myStock.forEach((item: any) => {
            this.http.get(`https://finnhub.io/api/v1/quote?symbol=${item.ticker}&token=c87dfmaad3i9lkntl8gg`).subscribe((data: any) => {
                // const result = data.result || [];
                this.myStockInfo.push({
                    ticker: item.ticker,
                    name: item.name,
                    quantity: item.quantity,
                    totalCost: item.totalCost,
                    currentPrice: data.c,
                    avg: item.totalCost / item.quantity
                });
            })
        })
        console.log("PORTFOLIO INIT", this.myStock, this.myStockInfo);
    }

    hideBuyNotice() {
        this.buyNotice = false;
    }

    hideSellNotice() {
        this.sellNotice = false;
    }

    checkData() {
        return this.myStockInfo.length == this.myStock.length;
    }

    afterTransaction(ticker: any, newQuantity: any) {
        let originalLength = this.myStock.length;
        this.myStock = JSON.parse(<string>localStorage.getItem("myStock"));
        let removed = originalLength != this.myStock.length;
        this.showPortfolio = this.myStock.length != 0;
        console.log("AFTER works", ticker, newQuantity, removed);
        this.myStockInfo.forEach((item: any, index: any) => {
            if (item.ticker == ticker) {
                if (removed) {
                    this.myStockInfo.splice(index, 1);
                } else {
                    item.quantity = newQuantity;
                    item.totalCost = item.quantity * item.avg;
                }
            }
        })
        this.myMoney = Number(localStorage.getItem("wallet"));
        console.log("AFTER my stock info", this.myStockInfo);

        if (this.buyNotice) {
            this.runBuyNoticeTimer();
        } else {
            this.runSellNoticeTimer();
        }
    }

    runBuyNoticeTimer() {
        this.buyNoticeTimer = setInterval(() => {
            this.buyNotice = false;
            clearInterval(this.buyNoticeTimer);
        }, 5000);
    }

    runSellNoticeTimer() {
        this.sellNoticeTimer = setInterval(() => {
            this.sellNotice = false;
            clearInterval(this.sellNoticeTimer);
        }, 5000);
    }
}
