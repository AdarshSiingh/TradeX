
import pandas as pd
import numpy as np
import ta
import os
from pathlib import Path
from sqlalchemy import text
from sqlalchemy import create_engine
from dotenv import dotenv_values

ENV_PATH = Path(__file__).resolve().parent / ".env"
DATABASE_URL = os.environ.get("ANALYTICS_DATABASE_URL") or dotenv_values(ENV_PATH).get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured for analytics")

engine = create_engine(DATABASE_URL)


def load_stock_data(ticker: str) -> pd.DataFrame:
    query = text("SELECT * FROM stock_data WHERE ticker = :ticker ORDER BY date ASC")
    df = pd.read_sql(query, engine, params={"ticker": ticker.upper()})
    df['date'] = pd.to_datetime(df['date'])
    return df


class StockAnalytics:

    def __init__(self, ticker: str):
        self.ticker = ticker.upper()
        self.df = load_stock_data(self.ticker)

        if self.df.empty:
            raise ValueError(f"No data found for {self.ticker}. Only AAPL, AMZN, GOOGL, GS, JPM, META, MSFT, NVDA, TSLA and V are currently supported.")

        print(f"Loaded {len(self.df)} rows for {self.ticker}")


    def add_moving_averages(self):
        self.df['sma_20'] = ta.trend.sma_indicator(close=self.df['close'], window=20)
        self.df['sma_50'] = ta.trend.sma_indicator(close=self.df['close'], window=50)
        self.df['ema_12'] = ta.trend.ema_indicator(close=self.df['close'], window=12)
        self.df['ema_26'] = ta.trend.ema_indicator(close=self.df['close'], window=26)
        return self


    def add_rsi(self):
        self.df['rsi_14'] = ta.momentum.rsi(close=self.df['close'], window=14)
        return self


    def add_macd(self):
        macd = ta.trend.MACD(
            close=self.df['close'],
            window_slow=26,
            window_fast=12,
            window_sign=9
        )
        self.df['macd']        = macd.macd()
        self.df['macd_signal'] = macd.macd_signal()
        self.df['macd_hist']   = macd.macd_diff()
        return self


    def add_bollinger_bands(self):
        bb = ta.volatility.BollingerBands(
            close=self.df['close'],
            window=20,
            window_dev=2
        )
        self.df['bb_upper']  = bb.bollinger_hband()
        self.df['bb_middle'] = bb.bollinger_mavg()
        self.df['bb_lower']  = bb.bollinger_lband()
        return self


    def add_volume_analysis(self):
        self.df['obv']         = ta.volume.on_balance_volume(
                                     close=self.df['close'],
                                     volume=self.df['volume']
                                 )
        self.df['vol_sma_20']  = ta.trend.sma_indicator(
                                     close=self.df['volume'].astype(float),
                                     window=20
                                 )
        self.df['vol_ratio']   = self.df['volume'] / self.df['vol_sma_20']
        return self


    def add_returns(self):
        self.df['daily_return']  = self.df['close'].pct_change()
        self.df['rolling_std']   = self.df['daily_return'].rolling(window=20).std()
        self.df['annual_vol']    = self.df['rolling_std'] * np.sqrt(252)
        return self


    def generate_signals(self):
        df = self.df
        df['signal'] = 'hold'

        golden_cross = (
            (df['sma_20'] > df['sma_50']) &
            (df['sma_20'].shift(1) <= df['sma_50'].shift(1))
        )
        df.loc[golden_cross, 'signal'] = 'buy'

        death_cross = (
            (df['sma_20'] < df['sma_50']) &
            (df['sma_20'].shift(1) >= df['sma_50'].shift(1))
        )
        df.loc[death_cross, 'signal'] = 'sell'

        df.loc[df['rsi_14'] < 30, 'signal'] = 'buy'
        df.loc[df['rsi_14'] > 70, 'signal'] = 'sell'

        return self


    def _max_drawdown(self) -> float:
        cumulative   = (1 + self.df['daily_return'].dropna()).cumprod()
        rolling_max  = cumulative.cummax()
        drawdown     = (cumulative - rolling_max) / rolling_max
        return float(drawdown.min())


    def summary(self) -> dict:
        df = self.df.dropna(subset=['daily_return', 'rsi_14'])

        total_return  = (df['close'].iloc[-1] / df['close'].iloc[0] - 1) * 100
        sharpe        = (df['daily_return'].mean() / df['daily_return'].std()) * np.sqrt(252)
        max_dd        = self._max_drawdown() * 100

        return {
            'ticker'          : self.ticker,
            'total_return_pct': round(total_return, 2),
            'sharpe_ratio'    : round(sharpe, 2),
            'max_drawdown_pct': round(max_dd, 2),
            'annual_vol_pct'  : round(df['annual_vol'].iloc[-1] * 100, 2),
            'rsi_current'     : round(df['rsi_14'].iloc[-1], 1),
            'signal_current'  : df['signal'].iloc[-1],
            'latest_close'    : round(df['close'].iloc[-1], 2),
            'data_from'       : str(df['date'].iloc[0].date()),
            'data_to'         : str(df['date'].iloc[-1].date()),
        }


    def run_all(self):
        return (
            self
            .add_moving_averages()
            .add_rsi()
            .add_macd()
            .add_bollinger_bands()
            .add_volume_analysis()
            .add_returns()
            .generate_signals()
        )


    def to_json_records(self) -> list:
        df = self.df.copy()
        df['date'] = df['date'].astype(str)

        records = df.to_dict(orient='records')

        cleaned = []
        for row in records:
            clean_row = {}
            for key, value in row.items():
                if isinstance(value, float) and (np.isnan(value) or np.isinf(value)):
                    clean_row[key] = None
                else:
                    clean_row[key] = value
            cleaned.append(clean_row)

        return cleaned
