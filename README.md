# AI Profit Signal Control Agent 🤖📊

An AI-powered dashboard that analyzes sales data and generates profit signals and business insights automatically.

## 🚀 Tech Stack

### Backend
- Python 3.x
- FastAPI
- Pandas
- Uvicorn

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Axios

## 📁 Project Structure
 aiprofit/
├── backend/
│   ├── main.py              # FastAPI server & 8 API endpoints
│   ├── requirements.txt     # Python dependencies
│   └── sales_data_sample.csv # Sales dataset
└── frontend/
├── src/
│   ├── App.tsx          # Main dashboard component
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
└── vite.config.ts

## 🔧 How to Run

### Step 1 — Backend
```bash
cd backend
venv\Scripts\activate
python main.py
```
Backend runs at: `http://localhost:8000`

### Step 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

## 📊 Features

- ✅ KPI Dashboard (Total Sales, Profit, Orders)
- ✅ Monthly Revenue & Profit Trend Chart
- ✅ Quarterly Performance Analysis
- ✅ Sales by Product Line
- ✅ Top Countries by Revenue
- ✅ Top Customers List
- ✅ Deal Size & Order Status
- ✅ AI Profit Signals & Insights
- ✅ Year Filter

## 🤖 AI Insights

The AI automatically detects:
- Best performing product line
- Cancellation rate alerts
- Strongest quarter
- Top market country
- Low profit margin warnings
- Large deal opportunities

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/kpis` | Key Performance Indicators |
| `/api/monthly-trend` | Monthly sales & profit |
| `/api/sales-by-product` | Product line analysis |
| `/api/sales-by-country` | Country-wise revenue |
| `/api/top-customers` | Top 10 customers |
| `/api/deal-size` | Deal size breakdown |
| `/api/order-status` | Order status summary |
| `/api/quarterly` | Quarterly performance |
| `/api/ai-insights` | AI-generated signals |
| `/api/years` | Available years |

## 👩‍💻 Developed By
 **Ramya R**
