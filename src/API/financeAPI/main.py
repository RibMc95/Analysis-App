from flask import Flask, jsonify
import yfinance as yf

app = Flask(__name__)

@app.route("/stock/<ticker>", methods=["GET"])
def get_stock_data(ticker):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info:
            return jsonify({"error": "Could not retrieve data for ticker", "ticker": ticker}), 404

        data = {
            "currentPrice": info.get("currentPrice"),
            "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
            "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
            "trailingPE": info.get("trailingPE"),
            "fiveYearAvgEarningsGrowth": info.get("fiveYearAvgEarningsGrowth") # This field is often not available for all stocks.
        }
        
        # Filter out None values for cleaner output
        data = {k: v for k, v in data.items() if v is not None}

        if not data:
            return jsonify({"error": "No relevant data found for ticker", "ticker": ticker}), 404

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e), "ticker": ticker}), 500

if __name__ == "__main__":
    app.run(debug=True)
