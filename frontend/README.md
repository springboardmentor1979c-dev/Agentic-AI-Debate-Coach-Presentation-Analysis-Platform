# Orator frontend

Start the API first from `FastAPI_Project` with `uvicorn main:app --reload`.

Then serve this folder with any static server, for example:

```powershell
cd frontend
python -m http.server 5500
```

Open http://127.0.0.1:5500. The client is configured for the local FastAPI API at http://127.0.0.1:8000.
