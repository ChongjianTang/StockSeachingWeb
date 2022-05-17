import {Component, Input, OnInit} from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-sell-dialog',
    templateUrl: './sell-dialog.component.html',
    styleUrls: ['./sell-dialog.component.css']
})
export class SellDialogComponent implements OnInit {

    @Input() result: any;
    quantity: any = 0;
    dialogBoxRef: any;

    constructor(private modalService: NgbModal) {
    }

    open(content: any) {
        this.dialogBoxRef = this.modalService.open(content, {
            ariaLabelledBy: 'modal-basic-title'
        })
    }


    ngOnInit(): void {
    }

    getWallet() {
        return Number(localStorage.getItem("wallet")).toFixed(2);
    }


    update() {
        let money = Number(localStorage.getItem("wallet"));
        let totalPrice = Number(this.quantity * this.result.latestPrice.c);
        money = money + totalPrice;
        localStorage.setItem("wallet", String(money));
        this.quantity = 0;
        this.dialogBoxRef.close();
        this.result.buyNotice = true;
    }

    canSell() {
        if (this.quantity == 0 || this.quantity == null) {
            return false;
        }
        return !this.notEnoughStocks();
    }

    notEnoughStocks() {
        if (this.quantity == null) {
            return false;
        }
        return this.quantity > this.result.hold[this.result.description.ticker];
    }
}
