from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import shutil
from convert import convert_any

app = FastAPI(title="Luwain Ingest Service")

@app.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    save_path = f"/tmp/{file.filename}"
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    result = convert_any(save_path)
    return JSONResponse(content=result)

@app.get("/health")
async def health():
    return {"ok": True}
