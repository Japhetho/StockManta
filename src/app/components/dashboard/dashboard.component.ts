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
    // returns a list of ticker names. total ticker names is 3200
    this.dashboardService.getAllTickers().subscribe((res: TickerModel[]) => {
      this.allTickers = res;
    });
    // returns data (i.e. end of day stock prices) for a specific ticker either daily, weekly, monthly, quarterly or annually
    this.dashboardService
      .getTickerData('A', 'annual', this.closePrice, this.adjClosePrice)
      .subscribe((tickerRes: any) => {
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
        /** passes a specific ticker's end of day stock price and date to the chartjs canvas for visualization */
        this.getTickerChart(tickerLabels, tickerValues);
        /** Converts dates from Date objects to isostrings which is required for displaying in the form */
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
    /** adds start date and end date forms for filtering end of day stock prices for a specific ticker/company */
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
    /** This function creates a chart based on the api data passed to it as arguments */
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
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Period',
              color: '#51459E',
              font: {
                family: 'Times',
                size: 20,
                style: 'normal',
                lineHeight: 1.2,
              },
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'End of Day Price',
              color: '#51459E',
              font: {
                family: 'Times',
                size: 20,
                style: 'normal',
                lineHeight: 1.2,
              },
            },
          },
        },
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
    /** This function gets called whenever the user searches/selects a new ticker from the ticker list.
     * It filters API data based on the selected ticker, destroys the existing chart and creates a new chart based on the selected ticker.
     */
    this.chart.destroy();

    this.dashboardService
      .getTickerData(ticker, 'annual', this.closePrice, this.adjClosePrice)
      .subscribe((newTickerRes: any) => {
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
    /** This function takes the full ticker name from the API and removes irrelevant data e.g.
     * for Microsoft the API returns "Microsoft Corporation (MSFT) Prices, Dividends, Splits and Trading Volume",
     * this function splits the information after the opening ( and returns "Microsoft Corporation"
     */
    const splitTickerName = tickerName.split(') ');
    return splitTickerName[0];
  }

  getSelectedPriceType(priceType: string): any {
    /** This function sets the ticker price variable to either closing or adjusted closing price based on user selection
     * This is then displayed on the chart
     */
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
    /** This function is for filtering end-of-day stock price data based on selected start/end dates by the user */
    this.chart.destroy();

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
