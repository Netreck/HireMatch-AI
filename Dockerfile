# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS frontend
WORKDIR /frontend
COPY app/package*.json ./
RUN npm ci
COPY app .
RUN npm run build

FROM python:3.11-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend /frontend/dist ./app/dist

EXPOSE 8080

CMD ["sh", "-c", "uvicorn src.api.app:app --host 0.0.0.0 --port ${PORT:-8080}"]
