import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { TICKER_PRICES } from 'src/assets/test_data/test-data';
import { FILTERED_TICKER_PRICES } from 'src/assets/test_data/test-filtered-data';
import { TICKER } from 'src/assets/test_data/tickers-test-data';

describe('DashboardService', () => {
  let dashboardService: DashboardService,
    httpTestingController: HttpTestingController;
  let tickerUrl =
    'https://data.nasdaq.com/api/v3/datasets/WIKI/MSFT.json?collapse=monthly&column_index=4&api_key=2sg42HWd2egYKWVwAqbb&order=asc';
  let filteredtickerUrl =
    'https://data.nasdaq.com/api/v3/datasets/WIKI/MSFT.json?collapse=monthly&column_index=4&api_key=2sg42HWd2egYKWVwAqbb&order=asc&start_date=1986-03-31&end_date=1986-06-30';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });
    dashboardService = TestBed.inject(DashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should retrieve all tickers', () => {
    expect(dashboardService).toBeTruthy();

    dashboardService.getAllTickers().subscribe((tickers) => {
      expect(tickers).withContext('No ticker prices returned').toBeTruthy();
      expect(tickers.length)
        .withContext('Incorrect number of tickers')
        .toBe(10);
      expect(tickers[0].ticker).toBe('A');
    });

    const req = httpTestingController.expectOne(dashboardService.tickersUrl);
    expect(req.request.method).toEqual('GET');
    expect(req.request.responseType).toEqual('json');
    req.flush(TICKER);
  });

  it('should return all data for one ticker for the entire time range', () => {
    dashboardService
      .getTickerData('MSFT', 'monthly', true, false)
      .subscribe((ticker_data) => {
        expect(ticker_data)
          .withContext('No ticker price data returned')
          .toBeTruthy();
        expect(ticker_data.dataset.data.length)
          .withContext('Incorrect number of ticker price data returned')
          .toBe(7);
        expect(ticker_data.dataset.data[0][1]).toBe(27.5);
      });

    const req = httpTestingController.expectOne((req) => req.url == tickerUrl);
    expect(req.request.method).toEqual('GET');
    expect(req.request.responseType).toEqual('json');
    req.flush(TICKER_PRICES);
  });

  it('should return all data for one ticker for a filtered time range', () => {
    dashboardService
      .getFilteredTickerData(
        'MSFT',
        'monthly',
        true,
        false,
        '1986-03-31',
        '1986-06-30'
      )
      .subscribe((ticker_data) => {
        expect(ticker_data)
          .withContext('No ticker price data returned')
          .toBeTruthy();
        expect(ticker_data.dataset.data.length)
          .withContext(
            'Incorrect number of filtered ticker price data returned'
          )
          .toBe(4);
        expect(ticker_data.dataset.data[0][0]).toBe('1986-03-31');
      });

    const req = httpTestingController.expectOne(
      (req) => req.url == filteredtickerUrl
    );
    expect(req.request.method).toEqual('GET');
    expect(req.request.responseType).toEqual('json');
    req.flush(FILTERED_TICKER_PRICES);
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
