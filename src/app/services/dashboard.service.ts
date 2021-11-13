import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TickerModel } from '../models/ticker.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  tickersUrl: string = 'assets/data/tickers.json';

  constructor(private http: HttpClient) {}

  getTickerData(
    ticker: string,
    collapse: string,
    close: boolean,
    adjClose: boolean
  ): Observable<any> {
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
