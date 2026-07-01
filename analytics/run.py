import sys
import json
from engine import StockAnalytics

if __name__ == '__main__':
    ticker = sys.argv[1]

    try:
        analytics = StockAnalytics(ticker)
        analytics.run_all()
        result = analytics.summary()
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)