# Use Python 3.10 as requested
FROM python:3.10-slim

# Create a non-root user for security (HF Spaces requirement)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server code, openenv context, and the extracted regional data
COPY --chown=user openenv_server/ ./openenv_server/
COPY --chown=user openenv.yaml .
COPY --chown=user docx_extracted.json .

# Hugging Face Spaces uses port 7860 by default
EXPOSE 7860

# Command to run the FastAPI server on port 7860
CMD ["uvicorn", "openenv_server.app:app", "--host", "0.0.0.0", "--port", "7860"]
