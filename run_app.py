import os
import sys
import subprocess
import time
import webbrowser

def main():
    print("=" * 70)
    print("  AI Debate Coach & Presentation Analysis Platform Launcher")
    print("=" * 70)

    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Install Python backend dependencies if needed
    print("\n[1/3] Checking Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd=backend_dir, check=True)
    except Exception as e:
        print(f"Warning installing requirements: {e}")

    # Install Frontend npm packages if needed
    print("\n[2/3] Checking Node modules for Frontend...")
    if not os.path.exists(os.path.join(frontend_dir, "node_modules")):
        print("Installing npm packages...")
        subprocess.run(["npm", "install"], cwd=frontend_dir, shell=True, check=True)

    # Launch Backend
    print("\n[3/3] Launching FastAPI Backend & Vite Frontend...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    backend_process = subprocess.Popen(backend_cmd, cwd=backend_dir)

    # Launch Frontend
    frontend_cmd = ["npm", "run", "dev"]
    frontend_process = subprocess.Popen(frontend_cmd, cwd=frontend_dir, shell=True)

    print("\n" + "=" * 70)
    print("  SUCCESS! Platform running at:")
    print("  Frontend UI: http://localhost:3000")
    print("  Backend API & Docs: http://localhost:8000/docs")
    print("=" * 70)

    time.sleep(3)
    webbrowser.open("http://localhost:3000")

    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    main()
