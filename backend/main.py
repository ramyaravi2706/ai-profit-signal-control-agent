from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from typing import Optional, List
import os

app = FastAPI(title="AI Profit Control Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_PATH = os.path.join(os.path.dirname(__file__), "sales_data_sample.csv")

def load_data() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH, encoding="latin1")
    df["ORDERDATE"] = pd.to_datetime(df["ORDERDATE"], format="%m/%d/%Y %H:%M", errors="coerce")
    df["PROFIT_MARGIN"] = ((df["SALES"] - (df["QUANTITYORDERED"] * (df["MSRP"] * 0.6))) / df["SALES"] * 100).round(2)
    df["PROFIT"] = (df["SALES"] - (df["QUANTITYORDERED"] * (df["MSRP"] * 0.6))).round(2)
    return df


# ── KPI Summary ──────────────────────────────────────────────────────────────
@app.get("/api/kpis")
def get_kpis(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    total_sales = df["SALES"].sum()
    total_profit = df["PROFIT"].sum()
    total_orders = df["ORDERNUMBER"].nunique()
    avg_order_value = df.groupby("ORDERNUMBER")["SALES"].sum().mean()
    avg_margin = df["PROFIT_MARGIN"].mean()
    cancelled = df[df["STATUS"] == "Cancelled"]["SALES"].sum()
    cancellation_rate = (df["STATUS"] == "Cancelled").mean() * 100

    return {
        "total_sales": round(total_sales, 2),
        "total_profit": round(total_profit, 2),
        "total_orders": int(total_orders),
        "avg_order_value": round(avg_order_value, 2),
        "avg_profit_margin": round(avg_margin, 2),
        "cancelled_sales": round(cancelled, 2),
        "cancellation_rate": round(cancellation_rate, 2),
    }


# ── Sales by Product Line ─────────────────────────────────────────────────────
@app.get("/api/sales-by-product")
def sales_by_product(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    grouped = (
        df.groupby("PRODUCTLINE")
        .agg(total_sales=("SALES", "sum"), total_profit=("PROFIT", "sum"), orders=("ORDERNUMBER", "nunique"))
        .reset_index()
        .sort_values("total_sales", ascending=False)
    )
    grouped["total_sales"] = grouped["total_sales"].round(2)
    grouped["total_profit"] = grouped["total_profit"].round(2)
    return grouped.to_dict(orient="records")


# ── Monthly Revenue Trend ─────────────────────────────────────────────────────
@app.get("/api/monthly-trend")
def monthly_trend(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    grouped = (
        df.groupby(["YEAR_ID", "MONTH_ID"])
        .agg(sales=("SALES", "sum"), profit=("PROFIT", "sum"), orders=("ORDERNUMBER", "nunique"))
        .reset_index()
        .sort_values(["YEAR_ID", "MONTH_ID"])
    )
    grouped["sales"] = grouped["sales"].round(2)
    grouped["profit"] = grouped["profit"].round(2)
    month_names = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",
                   7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"}
    grouped["month_name"] = grouped["MONTH_ID"].map(month_names)
    grouped["label"] = grouped["month_name"] + " " + grouped["YEAR_ID"].astype(str)
    return grouped.to_dict(orient="records")


# ── Sales by Country ──────────────────────────────────────────────────────────
@app.get("/api/sales-by-country")
def sales_by_country(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    grouped = (
        df.groupby("COUNTRY")
        .agg(total_sales=("SALES", "sum"), total_profit=("PROFIT", "sum"), orders=("ORDERNUMBER", "nunique"))
        .reset_index()
        .sort_values("total_sales", ascending=False)
    )
    grouped["total_sales"] = grouped["total_sales"].round(2)
    grouped["total_profit"] = grouped["total_profit"].round(2)
    return grouped.to_dict(orient="records")


# ── Top Customers ─────────────────────────────────────────────────────────────
@app.get("/api/top-customers")
def top_customers(limit: int = 10, year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    grouped = (
        df.groupby("CUSTOMERNAME")
        .agg(total_sales=("SALES", "sum"), total_profit=("PROFIT", "sum"), orders=("ORDERNUMBER", "nunique"), country=("COUNTRY", "first"))
        .reset_index()
        .sort_values("total_sales", ascending=False)
        .head(limit)
    )
    grouped["total_sales"] = grouped["total_sales"].round(2)
    grouped["total_profit"] = grouped["total_profit"].round(2)
    return grouped.to_dict(orient="records")


# ── Deal Size Breakdown ───────────────────────────────────────────────────────
@app.get("/api/deal-size")
def deal_size(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    grouped = (
        df.groupby("DEALSIZE")
        .agg(total_sales=("SALES", "sum"), count=("ORDERNUMBER", "count"))
        .reset_index()
    )
    grouped["total_sales"] = grouped["total_sales"].round(2)
    return grouped.to_dict(orient="records")


# ── Order Status ──────────────────────────────────────────────────────────────
@app.get("/api/order-status")
def order_status(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    grouped = (
        df.groupby("STATUS")
        .agg(count=("ORDERNUMBER", "count"), total_sales=("SALES", "sum"))
        .reset_index()
    )
    grouped["total_sales"] = grouped["total_sales"].round(2)
    return grouped.to_dict(orient="records")


# ── Quarterly Performance ─────────────────────────────────────────────────────
@app.get("/api/quarterly")
def quarterly(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]
    grouped = (
        df.groupby(["YEAR_ID", "QTR_ID"])
        .agg(sales=("SALES", "sum"), profit=("PROFIT", "sum"), orders=("ORDERNUMBER", "nunique"))
        .reset_index()
        .sort_values(["YEAR_ID", "QTR_ID"])
    )
    grouped["sales"] = grouped["sales"].round(2)
    grouped["profit"] = grouped["profit"].round(2)
    grouped["label"] = "Q" + grouped["QTR_ID"].astype(str) + " " + grouped["YEAR_ID"].astype(str)
    return grouped.to_dict(orient="records")


# ── AI Insights ───────────────────────────────────────────────────────────────
@app.get("/api/ai-insights")
def ai_insights(year: Optional[int] = None):
    df = load_data()
    if year:
        df = df[df["YEAR_ID"] == year]

    insights = []

    # Best product line
    best_pl = df.groupby("PRODUCTLINE")["SALES"].sum().idxmax()
    best_pl_val = df.groupby("PRODUCTLINE")["SALES"].sum().max()
    insights.append({
        "type": "success",
        "icon": "trending_up",
        "title": f"{best_pl} leads revenue",
        "detail": f"${best_pl_val:,.0f} in total sales — your highest-performing product line.",
    })

    # Cancellation alert
    cancelled_pct = (df["STATUS"] == "Cancelled").mean() * 100
    if cancelled_pct > 3:
        insights.append({
            "type": "warning",
            "icon": "warning",
            "title": f"{cancelled_pct:.1f}% cancellation rate detected",
            "detail": "Order cancellations are above the 3% threshold. Review fulfillment & customer satisfaction.",
        })

    # Best quarter
    best_q = df.groupby("QTR_ID")["SALES"].sum().idxmax()
    insights.append({
        "type": "info",
        "icon": "calendar_today",
        "title": f"Q{best_q} is your strongest quarter",
        "detail": "Peak revenue consistently occurs in this quarter — plan inventory & campaigns accordingly.",
    })

    # Top country
    top_country = df.groupby("COUNTRY")["SALES"].sum().idxmax()
    top_country_sales = df.groupby("COUNTRY")["SALES"].sum().max()
    insights.append({
        "type": "info",
        "icon": "public",
        "title": f"{top_country} is your #1 market",
        "detail": f"${top_country_sales:,.0f} revenue from {top_country}. Consider deepening market penetration.",
    })

    # Profit margin alert
    avg_margin = df["PROFIT_MARGIN"].mean()
    if avg_margin < 20:
        insights.append({
            "type": "danger",
            "icon": "money_off",
            "title": f"Low avg profit margin: {avg_margin:.1f}%",
            "detail": "Margins are thin. Consider renegotiating supplier costs or adjusting pricing strategy.",
        })

    # Large deal opportunity
    large_pct = (df["DEALSIZE"] == "Large").mean() * 100
    insights.append({
        "type": "success" if large_pct > 15 else "info",
        "icon": "stars",
        "title": f"Large deals: {large_pct:.1f}% of orders",
        "detail": "Expanding enterprise/large deal focus could significantly boost average order value.",
    })

    return insights


# ── Available Years ───────────────────────────────────────────────────────────
@app.get("/api/years")
def get_years():
    df = load_data()
    return sorted(df["YEAR_ID"].unique().tolist())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
