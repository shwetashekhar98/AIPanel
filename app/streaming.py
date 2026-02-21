"""Job manager with SSE streaming support for real-time agent updates."""

import json
import queue
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class JudgingJob:
    job_id: str
    team_name: str
    status: str = "pending"
    current_agent: str = ""
    events: list = field(default_factory=list)
    event_queue: queue.Queue = field(default_factory=queue.Queue)
    result: dict | None = None
    error: str | None = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


_jobs: dict[str, JudgingJob] = {}

AGENT_MAP = {
    "Senior Code Reviewer & Architecture Analyst": "github",
    "Business Strategy & Pitch Deck Analyst": "ppt",
    "Communication & Pitch Delivery Analyst": "voice",
    "Product Demo & UX Analyst": "video",
    "Chief Judge & Cross-Reference Analyst": "orchestrator",
}

AGENT_DISPLAY = {
    "github": {"name": "GitHub Agent", "title": "Code & Architecture Witness", "icon": "code"},
    "ppt": {"name": "PPT Agent", "title": "Business Strategy Witness", "icon": "presentation"},
    "voice": {"name": "Voice Agent", "title": "Communication Witness", "icon": "mic"},
    "video": {"name": "Video Agent", "title": "Product Demo Witness", "icon": "video"},
    "orchestrator": {"name": "Orchestrator", "title": "Chief Judge", "icon": "gavel"},
}


def create_job(team_name: str) -> JudgingJob:
    job_id = str(uuid.uuid4())[:8]
    job = JudgingJob(job_id=job_id, team_name=team_name)
    _jobs[job_id] = job
    return job


def get_job(job_id: str) -> JudgingJob | None:
    return _jobs.get(job_id)


def push_event(job: JudgingJob, event_type: str, data: dict):
    event = {"type": event_type, "timestamp": datetime.now().isoformat(), **data}
    job.events.append(event)
    job.event_queue.put(event)


def make_step_callback(job: JudgingJob):
    """Create a step_callback for CrewAI agents that pushes events to the job queue."""

    def callback(step_output: Any):
        agent_role = getattr(step_output, "agent", "")
        if hasattr(agent_role, "role"):
            agent_role = agent_role.role

        agent_key = AGENT_MAP.get(str(agent_role), job.current_agent or "unknown")

        text = ""
        if hasattr(step_output, "output"):
            text = str(step_output.output)[:600]
        elif hasattr(step_output, "result"):
            text = str(step_output.result)[:600]
        else:
            text = str(step_output)[:600]

        push_event(job, "agent_step", {"agent": agent_key, "content": text})

    return callback


def make_task_callback(job: JudgingJob):
    """Create a task_callback for CrewAI crew that fires when each task finishes."""

    task_index = {"count": 0}
    agent_order = ["github", "ppt", "voice", "video", "orchestrator"]

    def callback(task_output: Any):
        idx = task_index["count"]
        agent_key = agent_order[idx] if idx < len(agent_order) else "unknown"
        task_index["count"] += 1

        raw = ""
        if hasattr(task_output, "raw"):
            raw = task_output.raw[:800]

        push_event(job, "agent_complete", {
            "agent": agent_key,
            "summary": raw,
            "display": AGENT_DISPLAY.get(agent_key, {}),
        })

        next_idx = task_index["count"]
        if next_idx < len(agent_order):
            next_agent = agent_order[next_idx]
            job.current_agent = next_agent
            push_event(job, "agent_started", {
                "agent": next_agent,
                "display": AGENT_DISPLAY.get(next_agent, {}),
            })

    return callback
