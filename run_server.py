#!/usr/bin/env python
"""
Quick test runner to verify endpoints work
"""
import subprocess
import sys
import time

# Try to start uvicorn
try:
    print("Starting FastAPI server...")
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload"], cwd=".")
except Exception as e:
    print(f"Error: {e}")
    print("Please ensure all dependencies are installed:")
    print("  pip install -r requirements.txt")
