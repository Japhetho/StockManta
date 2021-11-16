describe('Dashboard page', () => {
  it('should display a list of tickers', () => {
    cy.fixture('tickers.json').as('tickersJSON');
    cy.server();
    cy.route('assets/data/tickers.json', '@tickersJSON').as('tickers');
    cy.visit('/');
    cy.contains('Stock Manta');
    cy.wait('@tickers');
    cy.get('.ticker-item').should('have.length', 14);
  });

  it('should display a chart of time against end of day stock price', () => {
    cy.fixture('tickercloseprice.json').as('tickerPriceJSON');
    cy.request({
      method: 'GET',
      url: 'https://data.nasdaq.com/api/v3/datasets/WIKI/MSFT.json?collapse=annual&column_index=4&api_key=2sg42HWd2egYKWVwAqbb&order=asc',
      failOnStatus: false,
    }).then((resp) => {
      expect(resp.status).to.eq(200);
    });
    cy.visit('/');
    cy.get('#tickerChart').should('have.length', 1);
  });
});
