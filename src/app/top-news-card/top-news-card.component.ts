import {Component, OnInit, Input} from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-top-news-card',
    templateUrl: './top-news-card.component.html',
    styleUrls: ['./top-news-card.component.css']
})
export class TopNewsCardComponent implements OnInit {
    @Input() info: any;

    constructor(private modalService: NgbModal) {
    }

    open(content: any) {
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {

        }, (reason) => {
            ;
        });
    }


    ngOnInit(): void {
    }


    timestampToTime(timestamp: any) {
        let date = new Date(timestamp * 1000);
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let result: any = months[date.getMonth()];
        result += " ";
        result += date.getDate();
        result += ", ";
        result += date.getFullYear();
        return result;
    }
}
