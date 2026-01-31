FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY phaseBp1/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files from phaseBp1 subdirectory
COPY phaseBp1/app.py .
COPY phaseBp1/index.html .

# Expose port (can be overridden by PORT env var)
# Default to 8000 for deployment platforms, but supports PORT env var
EXPOSE 8000

# Set environment variables
# PORT will be set by deployment platform (Koyeb, etc.)
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/health')"

# Run the application
# Use shell form to allow environment variable substitution
CMD python -m uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
