# Use Python 3.10 as requested
FROM python:3.10-slim

# Create a non-root user for security (HF Spaces requirement)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Crucial: Ensure the root directory is in the Python path
ENV PYTHONPATH=/app

WORKDIR /app

# Install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project context
COPY --chown=user . .

# Hugging Face Spaces uses port 7860 by default
EXPOSE 7860

# Command to run the FastAPI server on port 7860
# Running it as a module 'openenv_server.app' ensures absolute imports work
CMD ["python", "-m", "uvicorn", "openenv_server.app:app", "--host", "0.0.0.0", "--port", "7860"]
