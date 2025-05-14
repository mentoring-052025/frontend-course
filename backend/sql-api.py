# This script sets up a FastAPI application that connects to a local PostgreSQL database
# API can be called with GET at http://127.0.0.1:8000/data
# ToDo: create env-var file, host in Google Cloud

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.exc import SQLAlchemyError

# Configuration
DATABASE_URL = "postgresql://postgres:Build2025@localhost:5432/postgres"
SCHEMA_NAME = "fit_data"
TABLE_NAME = "fit_api"


# Setup
engine = create_engine(DATABASE_URL)
metadata = MetaData()

try:
    metadata.reflect(bind=engine, schema=SCHEMA_NAME)
    table_key = f"{SCHEMA_NAME}.{TABLE_NAME}"
    if table_key not in metadata.tables:
        raise ValueError(f"Table '{TABLE_NAME}' not found in schema '{SCHEMA_NAME}'")
    table = metadata.tables[table_key]
except Exception as e:
    raise RuntimeError(f"Failed to load table metadata: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://127.0.0.1:5501"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/data")
def get_data():
    try:
        with engine.connect() as conn:
            stmt = select(table)
            result = conn.execute(stmt)
            rows = [dict(row._mapping) for row in result.fetchall()]
            return {"data": rows}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))