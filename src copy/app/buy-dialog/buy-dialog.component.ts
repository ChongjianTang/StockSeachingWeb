import {Component, Input, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-buy-dialog',
    templateUrl: './buy-dialog.component.html',
    styleUrls: ['./buy-dialog.component.css']
})
export class BuyDialogComponent implements OnInit {

    @Input() result: any;

    @Input() ticker: any;
    @Input() currentPrice: any;
    @Input() name: any;

    quantity: any = 0;
    dialogBoxRef: any;
    myQuantity: any;
    myStock: any;
    myMoney: any;
    @Input() isBuyDialog: boolean = false;

    constructor(private modalService: NgbModal) {

    }

    open(content: any) {
        this.dialogBoxRef = this.modalService.open(content, {
            ariaLabelledBy: 'modal-basic-title'
        })
        this.myMoney = Number(localStorage.getItem("wallet"));
        this.myStock = JSON.parse(<string>localStorage.getItem("myStock"));
        this.myQuantity = 0;
        this.myStock.forEach((item: any) => {
            if (item.ticker == this.ticker) {
                this.myQuantity = item.quantity;
                return;
            }
        })

        console.log("OPEN this ticker", this.ticker);
        console.log("OPEN my stock: ", this.myStock);
        console.log("OPEN my quantity: ", this.myQuantity);
        console.log("OPEN my money: ", this.myMoney);

    }


    ngOnInit(): void {
        console.log("INIT input ticker", this.ticker);
        console.log("INIT input current price: ", this.currentPrice);
    }


    buyUpdate() {
        let totalPrice = Number(this.quantity * this.currentPrice);
        this.myMoney -= totalPrice;
        localStorage.setItem("wallet", String(this.myMoney));

        let existed = false;
        this.myStock.forEach((item: any) => {
            if (item.ticker == this.ticker) {
                item.quantity = item.quantity + this.quantity;
                item.totalCost = item.totalCost += totalPrice;
                existed = true;
                this.myQuantity = item.quantity;
                return;
            }
        })
        if (!existed) {
            this.myStock.push({
                ticker: this.ticker,
                name: this.name,
                quantity: this.quantity,
                totalCost: totalPrice
            })
            this.myQuantity = this.quantity;
        }

        console.log("BUY my stock: ", this.myStock);
        console.log("BUY my quantity: ", this.myQuantity);
        console.log("BUY my money: ", this.myMoney);
        localStorage.setItem("myStock", JSON.stringify(this.myStock))
        this.quantity = 0;
        this.result.buyNotice = true;
        this.result.sellNotice = false;
        this.result.ticker = this.ticker;
        this.dialogBoxRef.close();
        this.result.afterTransaction(this.ticker, this.myQuantity);
    }

    canBuy() {
        if (this.quantity <= 0 || this.quantity == null) {
            return false;
        }
        return !this.notEnoughMoney();
    }

    notEnoughMoney() {
        if (this.quantity == null) {
            return false;
        }
        let totalPrice = Number(this.quantity * this.currentPrice);
        return this.myMoney - totalPrice < 0;
    }

    sellUpdate() {
        let totalPrice = Number(this.quantity * this.currentPrice);

        this.myStock.forEach((item: any, index: any) => {
            if (item.ticker == this.ticker) {
                item.totalCost = item.totalCost - item.totalCost * this.quantity / item.quantity;
                item.quantity = item.quantity - this.quantity;
                this.myQuantity = item.quantity;
                if (item.quantity == 0) {
                    this.myStock.splice(index, 1);
                    this.myQuantity = 0;
                }
            }
        })
        localStorage.setItem("myStock", JSON.stringify(this.myStock))

        this.myMoney += totalPrice;
        localStorage.setItem("wallet", String(this.myMoney));

        console.log("SELL my stock: ", this.myStock);
        console.log("SELL my quantity: ", this.myQuantity);
        console.log("SELL my money: ", this.myMoney);
        this.quantity = 0;
        this.result.sellNotice = true;
        this.result.buyNotice = false;
        this.result.ticker = this.ticker;
        this.dialogBoxRef.close();
        this.result.afterTransaction(this.ticker, this.myQuantity);
    }

    canSell() {
        if (this.quantity <= 0 || this.quantity == null) {
            return false;
        }
        return !this.notEnoughStocks();
    }

    notEnoughStocks() {
        if (this.quantity == null) {
            return false;
        }
        console.log("my quantity in not enough stocks: ", this.myQuantity);
        return this.quantity > this.myQuantity;
    }
}
