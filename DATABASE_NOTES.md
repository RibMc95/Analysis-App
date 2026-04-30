# Database Notes

I set up the FavoriteStocks table using DynamoDB Local. The table stores each user's favorite stocks and includes the stock ticker, company name, industry, growth rate, P/E ratio, growth over P/E, and date added.

The table uses userId as the partition key and ticker as the sort key. This allows each user to have their own saved favorite stocks.

I also added a secondary index called IndustryIndex. This index uses userId and industry so the app can filter a user's saved stocks by industry.

The backend will need to connect to this table when saving, viewing, filtering, or deleting favorite stocks. The frontend will need to send the stock data when the user clicks the favorite button. Login and authentication will need to provide the current userId.