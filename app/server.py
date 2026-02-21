"""FastAPI server for the Hackathon Judge AI system."""

import asyncio
import json
import os
import threading
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from app.crew import build_and_run_crew, build_and_run_crew_streaming
from app.models.schemas import JudgingResult
from app.streaming import (
    AGENT_DISPLAY,
    create_job,
    get_job,
    make_step_callback,
    make_task_callback,
    push_event,
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
RESULTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "results")
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(RESULTS_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="Hackathon Judge AI",
    description=(
        "An automated AI judging system for hackathons. Submit a team's GitHub repo, "
        "pitch deck, demo video, and voice transcript — get back structured scores, "
        "cross-referenced questions, and a voice-ready judge script."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _save_upload(upload_file: UploadFile, team_name: str, suffix: str) -> str:
    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in team_name)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{safe_name}_{timestamp}{suffix}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(upload_file.file.read())
    return path


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "Hackathon Judge AI", "version": "1.0.0"}


# ---------------------------------------------------------------------------
# Streaming judging (new — used by the UI)
# ---------------------------------------------------------------------------


@app.post("/api/judge/start", tags=["Judging"])
async def start_judging(
    team_name: str = Form(...),
    github_url: str = Form(...),
    transcript: str = Form(...),
    pptx_file: UploadFile | None = File(None),
    video_file: UploadFile | None = File(None),
):
    """Start a judging session. Returns a job_id for streaming progress via SSE."""
    pptx_path = None
    video_path = None

    if pptx_file and pptx_file.filename:
        pptx_path = _save_upload(pptx_file, team_name, ".pptx")
    if video_file and video_file.filename:
        ext = os.path.splitext(video_file.filename)[1] or ".mp4"
        video_path = _save_upload(video_file, team_name, ext)

    job = create_job(team_name)

    push_event(job, "session_started", {
        "team_name": team_name,
        "job_id": job.job_id,
    })

    job.current_agent = "github"
    push_event(job, "agent_started", {
        "agent": "github",
        "display": AGENT_DISPLAY["github"],
    })

    def _run():
        try:
            job.status = "running"
            result = build_and_run_crew_streaming(
                team_name=team_name,
                github_url=github_url,
                pptx_path=pptx_path,
                video_path=video_path,
                transcript=transcript,
                step_callback=make_step_callback(job),
                task_callback=make_task_callback(job),
            )
            job.result = result.model_dump() if hasattr(result, "model_dump") else json.loads(result.json())
            job.status = "complete"
            push_event(job, "verdict", {"result": job.result})
        except Exception as e:
            job.status = "error"
            job.error = str(e)
            push_event(job, "error", {"message": str(e)})

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()

    return {"job_id": job.job_id, "status": "started"}


@app.get("/api/judge/{job_id}/stream", tags=["Judging"])
async def stream_judging(job_id: str):
    """SSE endpoint — streams real-time events from the judging session."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        while True:
            try:
                event = job.event_queue.get_nowait()
                yield f"data: {json.dumps(event, default=str)}\n\n"
                if event.get("type") in ("verdict", "error"):
                    break
            except Exception:
                if job.status in ("complete", "error"):
                    if job.result:
                        yield f"data: {json.dumps({'type': 'verdict', 'result': job.result}, default=str)}\n\n"
                    break
                await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/judge/{job_id}/result", tags=["Judging"])
async def get_judging_result(job_id: str):
    """Get the final result for a completed judging session."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status == "error":
        raise HTTPException(status_code=500, detail=job.error or "Unknown error")
    if job.status != "complete":
        return {"status": job.status, "message": "Still processing..."}
    return job.result


# ---------------------------------------------------------------------------
# Synchronous judging (original — still available)
# ---------------------------------------------------------------------------


@app.post("/api/judge", response_model=JudgingResult, tags=["Judging"])
async def judge_team(
    team_name: str = Form(...),
    github_url: str = Form(...),
    transcript: str = Form(...),
    pptx_file: UploadFile | None = File(None),
    video_file: UploadFile | None = File(None),
) -> JudgingResult:
    pptx_path = None
    video_path = None
    if pptx_file and pptx_file.filename:
        pptx_path = _save_upload(pptx_file, team_name, ".pptx")
    if video_file and video_file.filename:
        ext = os.path.splitext(video_file.filename)[1] or ".mp4"
        video_path = _save_upload(video_file, team_name, ext)
    try:
        return build_and_run_crew(
            team_name=team_name,
            github_url=github_url,
            pptx_path=pptx_path,
            video_path=video_path,
            transcript=transcript,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Judging failed: {str(e)}")


# ---------------------------------------------------------------------------
# Results
# ---------------------------------------------------------------------------


@app.get("/api/results", tags=["Results"])
async def list_results():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    files = [f for f in os.listdir(RESULTS_DIR) if f.endswith(".json")]
    return {"results": sorted(files, reverse=True)}


@app.get("/api/results/{filename}", tags=["Results"])
async def get_result(filename: str):
    path = os.path.join(RESULTS_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Result not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Serve frontend static files (production build)
# ---------------------------------------------------------------------------

if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
