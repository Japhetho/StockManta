import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TickerModel } from '../models/ticker.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  /**
   * This service is for fetching end-of-day stock price data from the Quandl API
   */
  tickersUrl: string = 'assets/data/tickers.json';

  constructor(private http: HttpClient) {}

  getTickerData(
    ticker: string,
    collapse: string,
    close: boolean,
    adjClose: boolean
  ): Observable<any> {
    /**
     * Fetches API data for a specific ticker/company either on a daily, weekly, monthly, quarterly or annual basis.
     * It also returns either the close price or the adjusted close price for that specific ticker/company.
     */
    const selectedTicker = ticker;
    const apiKey = '2sg42HWd2egYKWVwAqbb';
    let pricingColumn: number;
    if (adjClose) {
      pricingColumn = 11;
    } else {
      pricingColumn = 4;
    }
    const searchParams = new URLSearchParams({
      collapse: 'monthly',
      column_index: pricingColumn.toString(),
      api_key: apiKey,
      order: 'asc',
    });

    const finalUrl =
      environment.nasdaq + `${selectedTicker}.json?${searchParams}`;

    return this.http.get(finalUrl);
  }

  getAllTickers(): Observable<TickerModel[]> {
    /**
     * Fetches ticker symbols from json file stored in the assets folder.
     */
    return this.http.get<TickerModel[]>(this.tickersUrl);
  }

  getFilteredTickerData(
    ticker: string,
    collapse: string,
    close: boolean,
    adjClose: boolean,
    start: string,
    end: string
  ): Observable<any> {
    /**
     * Similar to getTickerData function but in addition this fetches filtered ticker data based on specific start/end dates.
     */
    const selectedTicker = ticker;
    const apiKey = '2sg42HWd2egYKWVwAqbb';
    let pricingColumn: number;
    if (adjClose) {
      pricingColumn = 11;
    } else {
      pricingColumn = 4;
    }
    const searchParams = new URLSearchParams({
      collapse: collapse,
      column_index: pricingColumn.toString(),
      api_key: apiKey,
      order: 'asc',
      start_date: start,
      end_date: end,
    });

    const finalUrl =
      environment.nasdaq + `${selectedTicker}.json?${searchParams}`;

    return this.http.get(finalUrl);
  }
}
