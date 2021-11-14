import { Component, OnInit } from '@angular/core';
import { TickerModel } from '../../models/ticker.model';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  allTickers: TickerModel[] = [];
  searchText = '';
  collapseAnnual = true;
  closePrice = true;
  adjClosePrice = false;

  tickerPrice: string = 'Close Price';
  selectedTickerName: string = '';
  selectedTicker: string = '';
  chart: any;
  ctx: any;
  dataStartDate = '';
  dataEndDate = '';

  oldestDate = '';
  newestDate = '';

  selectedCollapsePeriod = 'monthly';
  dailyCollapseSelected = false;

  filterDateForm = this.formBuilder.group({
    dataStart: ['', [Validators.required]],
    dataEnd: ['', Validators.required],
  });

  constructor(
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.dashboardService.getAllTickers().subscribe((res: TickerModel[]) => {
      this.allTickers = res;
      console.log('tickers', res[0].ticker);
    });
    this.dashboardService
      .getTickerData('A', 'annual', this.closePrice, this.adjClosePrice)
      .subscribe((tickerRes: any) => {
        console.log(tickerRes);
        this.selectedTicker = tickerRes.dataset.dataset_code;
        this.selectedTickerName =
          this.getSelectedTickerName(tickerRes.dataset.name) + `)`;
        // this.getTickerChart(tick)

        const tickerData = tickerRes.dataset.data;
        let tickerLabels: string[] = [];
        let tickerValues: number[] = [];

        tickerData.forEach((ticker: any) => {
          tickerLabels.push(ticker[0]);
          tickerValues.push(ticker[1]);
        });

        console.log('Ticker labels', tickerLabels);
        console.log('Ticker values', tickerValues);

        this.getTickerChart(tickerLabels, tickerValues);

        console.log(tickerLabels.slice(-1));
        console.log(tickerLabels[0]);

        this.dataStartDate = dayjs(
          `${tickerLabels[0]}`,
          'YYYY-MM-DD'
        ).toISOString();
        this.dataEndDate = dayjs(
          `${tickerLabels.slice(-1)}`,
          'YYYY-MM-DD'
        ).toISOString();

        this.oldestDate = tickerRes.dataset.oldest_available_date;
        this.newestDate = tickerRes.dataset.newest_available_date;

        this.filterDateForm.get('dataStart')?.setValue(this.oldestDate);
        this.filterDateForm.get('dataEnd')?.setValue(this.newestDate);
      });

    this.ctx = document.getElementById('tickerChart');
  }

  openPickers(): any {
    flatpickr('#dataStartDate', {
      minDate: dayjs(`${this.oldestDate}`).toISOString(),
      maxDate: dayjs(`${this.newestDate}`).toISOString(),
      defaultDate: dayjs(`${this.oldestDate}`).toISOString(),
      inline: true,
    });
    flatpickr('#dataEndDate', {
      minDate: dayjs(`${this.oldestDate}`).toISOString(),
      maxDate: dayjs(`${this.newestDate}`).toISOString(),
      defaultDate: dayjs(`${this.newestDate}`).toISOString(),
      inline: true,
    });
  }

  getTickerChart(labels: string[], data: number[]): any {
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Stock Price',
            data: data,
            fill: false,
            borderColor: '#51459E',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Price Trend Chart',
          },
        },
      },
    });
  }

  getNewTickerData(ticker: string): void {
    this.chart.destroy();

    this.dashboardService
      .getTickerData(ticker, 'annual', this.closePrice, this.adjClosePrice)
      .subscribe((newTickerRes: any) => {
        console.log(newTickerRes);
        this.selectedTicker = newTickerRes.dataset.dataset_code;
        this.selectedTickerName =
          this.getSelectedTickerName(newTickerRes.dataset.name) + `)`;

        const tickerData = newTickerRes.dataset.data;
        let tickerLabels: string[] = [];
        let tickerValues: number[] = [];

        tickerData.forEach((ticker: any) => {
          tickerLabels.push(ticker[0]);
          tickerValues.push(ticker[1]);
        });

        console.log('Ticker labels', tickerLabels);
        console.log('Ticker values', tickerValues);

        this.getTickerChart(tickerLabels, tickerValues);

        this.dataStartDate = dayjs(
          `${tickerLabels[0]}`,
          'YYYY-MM-DD'
        ).toISOString();
        this.dataEndDate = dayjs(
          `${tickerLabels.slice(-1)}`,
          'YYYY-MM-DD'
        ).toISOString();

        this.oldestDate = newTickerRes.dataset.oldest_available_date;
        this.newestDate = newTickerRes.dataset.newest_available_date;
      });
  }

  getSelectedTickerName(tickerName: string): string {
    const splitTickerName = tickerName.split(') ');
    return splitTickerName[0];
  }

  getSelectedPriceType(priceType: string): any {
    if (priceType === 'closing') {
      this.tickerPrice = 'Close Price';
      this.adjClosePrice = false;
      this.closePrice = true;
      // this.getNewTickerData(this.selectedTicker);
      this.onFilter();
    } else if (priceType === 'adj-closing') {
      this.tickerPrice = 'Adj. Close Price';
      this.adjClosePrice = true;
      this.closePrice = false;
      // this.getNewTickerData(this.selectedTicker)
      this.onFilter();
    }
  }

  onFilter(): void {
    this.chart.destroy();

    console.log('Start date', this.filterDateForm.value.dataStart);
    console.log('End date', this.filterDateForm.value.dataEnd);

    const start_date = this.filterDateForm.value.dataStart;
    const end_date = this.filterDateForm.value.dataEnd;

    this.dashboardService
      .getFilteredTickerData(
        this.selectedTicker,
        this.selectedCollapsePeriod,
        this.closePrice,
        this.adjClosePrice,
        start_date,
        end_date
      )
      .subscribe((newTickerRes: any) => {
        console.log(newTickerRes);
        this.selectedTicker = newTickerRes.dataset.dataset_code;
        this.selectedTickerName =
          this.getSelectedTickerName(newTickerRes.dataset.name) + `)`;

        const tickerData = newTickerRes.dataset.data;
        let tickerLabels: string[] = [];
        let tickerValues: number[] = [];

        tickerData.forEach((ticker: any) => {
          tickerLabels.push(ticker[0]);
          tickerValues.push(ticker[1]);
        });

        console.log('Ticker labels', tickerLabels);
        console.log('Ticker values', tickerValues);

        this.getTickerChart(tickerLabels, tickerValues);

        this.dataStartDate = dayjs(
          `${tickerLabels[0]}`,
          'YYYY-MM-DD'
        ).toISOString();
        this.dataEndDate = dayjs(
          `${tickerLabels.slice(-1)}`,
          'YYYY-MM-DD'
        ).toISOString();

        this.oldestDate = newTickerRes.dataset.oldest_available_date;
        this.newestDate = newTickerRes.dataset.newest_available_date;
      });
  }

  selectCollapsePeriod(period: string): any {
    this.selectedCollapsePeriod = period;
    this.dailyCollapseSelected = period === 'daily';
  }
}
