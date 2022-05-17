import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
import {PortfolioComponent} from './portfolio/portfolio.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HighchartsChartModule} from 'highcharts-angular';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {SearchResultComponent} from './home/search-result/search-result.component';
import {TopNewsCardComponent} from './top-news-card/top-news-card.component';
import {BuyDialogComponent} from './buy-dialog/buy-dialog.component';
import {SellDialogComponent} from './sell-dialog/sell-dialog.component';
import {ChartModule} from "angular-highcharts";

import {SimpleReuseStrategy} from './SimpleReuseStrategy';
import {RouteReuseStrategy} from "@angular/router";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        WatchlistComponent,
        PortfolioComponent,
        SearchResultComponent,
        TopNewsCardComponent,
        BuyDialogComponent,
        SellDialogComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        MatToolbarModule,
        MatAutocompleteModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatTabsModule,
        HighchartsChartModule,
        MatMenuModule,
        MatButtonModule,
        MatDialogModule,
        ChartModule,
        MatProgressSpinnerModule,
        MatCardModule
    ],
    providers: [{provide: RouteReuseStrategy, useClass: SimpleReuseStrategy}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
