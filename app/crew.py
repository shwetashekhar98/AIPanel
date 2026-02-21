"""Hackathon Judge AI — CrewAI crew definition with 5 agents and 5 tasks."""

import json
import os
from datetime import datetime
from typing import Any, Callable

from crewai import Crew, Process, Task

from app.agents.definitions import (
    create_github_agent,
    create_orchestrator_agent,
    create_ppt_agent,
    create_video_agent,
    create_voice_agent,
)
from app.models.schemas import JudgingResult

RESULTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "results")


def _build_tasks(
    team_name: str,
    github_url: str,
    pptx_path: str | None,
    video_path: str | None,
    transcript: str,
    agents: dict,
) -> dict:
    """Build all 5 task objects. Returns dict keyed by agent name."""

    github_task = Task(
        description=(
            f"Analyze the GitHub repository for team '{team_name}' at: {github_url}\n\n"
            "Use the GitHub Repository Analyzer tool to clone and inspect the repo. "
            "Then provide a thorough evaluation covering:\n"
            "1. Code quality and architecture\n"
            "2. Tech stack identification\n"
            "3. Commit history patterns (frequency, authors, meaningful messages vs. bulk commits)\n"
            "4. Project structure and organization\n"
            "5. Testing and CI/CD presence\n"
            "6. Documentation quality\n"
            "7. Any red flags (e.g., single mega-commit, copied boilerplate, no real logic)\n\n"
            "Be specific — cite file names, line counts, and exact findings."
        ),
        expected_output=(
            "A structured analysis with sections: Summary, Key Findings (list), "
            "Strengths (list), Concerns (list), and a detailed narrative covering "
            "code quality, architecture, tech stack, commit history, and red flags."
        ),
        agent=agents["github"],
    )

    ppt_description = f"Analyze the pitch deck for team '{team_name}'.\n\n"
    if pptx_path and os.path.exists(pptx_path):
        ppt_description += (
            f"Use the PowerPoint Analyzer tool with file_path: {pptx_path}\n\n"
            "Then evaluate:\n"
        )
    else:
        ppt_description += (
            "NOTE: No PowerPoint file was provided. Analyze based solely on the "
            "voice transcript and any references to slides. State that no deck was available.\n\n"
            "Evaluate what you can infer:\n"
        )
    ppt_description += (
        "1. Business model clarity and viability\n"
        "2. Problem-solution fit\n"
        "3. Market analysis and competitive positioning\n"
        "4. Specific claims made (user numbers, performance, market size) — flag each one\n"
        "5. Slide design quality and narrative flow\n"
        "6. Monetization strategy\n"
        "7. Team credibility indicators\n\n"
        "Extract every specific claim for cross-referencing."
    )

    ppt_task = Task(
        description=ppt_description,
        expected_output=(
            "A structured analysis with sections: Summary, Key Findings (list), "
            "Strengths (list), Concerns (list), Specific Claims Extracted (list of "
            "exact claims with slide numbers if available), and overall business viability assessment."
        ),
        agent=agents["ppt"],
    )

    voice_task = Task(
        description=(
            f"Analyze the voice transcription for team '{team_name}'.\n\n"
            f"TRANSCRIPT:\n---\n{transcript}\n---\n\n"
            "Evaluate:\n"
            "1. Communication clarity and structure\n"
            "2. Confidence and conviction level\n"
            "3. Technical depth — do they sound like they built it?\n"
            "4. Verbal claims made (numbers, features, partnerships, traction)\n"
            "5. Narrative arc — is there a compelling story?\n"
            "6. Handling of technical vs. business language\n"
            "7. Any contradictions or vague handwaving\n\n"
            "Extract every specific verbal claim for cross-referencing."
        ),
        expected_output=(
            "A structured analysis with sections: Summary, Key Findings (list), "
            "Strengths (list), Concerns (list), Specific Verbal Claims (list), "
            "and communication quality assessment."
        ),
        agent=agents["voice"],
    )

    video_description = f"Analyze the demo video for team '{team_name}'.\n\n"
    if video_path and os.path.exists(video_path):
        video_description += (
            f"Use the Demo Video Analyzer tool with file_path: {video_path}\n\n"
            "Then provide your expert evaluation of the demo."
        )
    else:
        video_description += (
            "NOTE: No video file was provided. State that no demo video was available "
            "for analysis and note this as a gap in the evaluation."
        )

    video_task = Task(
        description=video_description,
        expected_output=(
            "A structured analysis with sections: Summary, Key Findings (list), "
            "Features Demonstrated (list), Strengths (list), Concerns (list), "
            "and authenticity/polish assessment."
        ),
        agent=agents["video"],
    )

    orchestrator_task = Task(
        description=(
            f"You are the Chief Judge for team '{team_name}'. You have received detailed "
            "analyses from four specialized agents:\n"
            "1. GitHub Agent (code & architecture)\n"
            "2. PPT Agent (pitch deck & business model)\n"
            "3. Voice Agent (transcript & communication)\n"
            "4. Video Agent (demo & product functionality)\n\n"
            "Your job is to:\n\n"
            "## A) Cross-Reference All Sources\n"
            "Compare claims across sources and identify:\n"
            "- Claims in the PPT that are NOT supported by the code\n"
            "- Features shown in the video that don't exist in the repo\n"
            "- Verbal claims (user numbers, performance) with no evidence\n"
            "- Commit history patterns vs. claimed development timeline\n"
            "- Any inconsistency between what was said, shown, and built\n\n"
            "## B) Generate Prioritized Judge Questions\n"
            "Create 8-12 specific questions a judge should ask, each with:\n"
            "- Category: technical, business, innovation, feasibility, or presentation\n"
            "- Priority: HIGH, MEDIUM, or LOW\n"
            "- The exact question\n"
            "- Reasoning (why this question matters)\n"
            "- Source evidence (which analyses flagged this)\n\n"
            "## C) Score the Submission\n"
            "Provide scores (0-10) for: technical, business, presentation, "
            "demo_quality, innovation, and overall.\n\n"
            "## D) Voice Script\n"
            "Write a 60-second script that an AI judge could read aloud to the team, "
            "covering the top 3-4 questions in a professional, encouraging but probing tone.\n\n"
            "## E) Final Summary\n"
            "List the top 5 strengths and top 5 concerns."
        ),
        expected_output=(
            'Respond with a valid JSON object matching this exact structure:\n'
            '{\n'
            '  "team_name": "<team name>",\n'
            '  "scores": {\n'
            '    "technical": <0-10>,\n'
            '    "business": <0-10>,\n'
            '    "presentation": <0-10>,\n'
            '    "demo_quality": <0-10>,\n'
            '    "innovation": <0-10>,\n'
            '    "overall": <0-10>\n'
            '  },\n'
            '  "questions": [\n'
            '    {\n'
            '      "category": "<technical|business|innovation|feasibility|presentation>",\n'
            '      "priority": "<HIGH|MEDIUM|LOW>",\n'
            '      "question": "<the question>",\n'
            '      "reasoning": "<why this matters>",\n'
            '      "source_evidence": "<which source(s)>"\n'
            '    }\n'
            '  ],\n'
            '  "key_strengths": ["<strength 1>", ...],\n'
            '  "key_concerns": ["<concern 1>", ...],\n'
            '  "voice_script": "<60-second script for AI judge>",\n'
            '  "github_analysis": {"summary": "...", "key_findings": [...], "concerns": [...], "strengths": [...]},\n'
            '  "ppt_analysis": {"summary": "...", "key_findings": [...], "concerns": [...], "strengths": [...]},\n'
            '  "voice_analysis": {"summary": "...", "key_findings": [...], "concerns": [...], "strengths": [...]},\n'
            '  "video_analysis": {"summary": "...", "key_findings": [...], "concerns": [...], "strengths": [...]}\n'
            '}\n'
        ),
        agent=agents["orchestrator"],
        context=[github_task, ppt_task, voice_task, video_task],
        output_json=JudgingResult,
    )

    return {
        "github": github_task,
        "ppt": ppt_task,
        "voice": voice_task,
        "video": video_task,
        "orchestrator": orchestrator_task,
    }


def _parse_result(result: Any, team_name: str) -> JudgingResult:
    """Save result to disk and parse into JudgingResult."""
    os.makedirs(RESULTS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in team_name)
    result_file = os.path.join(RESULTS_DIR, f"{safe_name}_{timestamp}.json")

    raw_output = result.raw if hasattr(result, "raw") else str(result)
    try:
        parsed = json.loads(raw_output)
    except (json.JSONDecodeError, TypeError):
        parsed = {"raw_output": raw_output}

    with open(result_file, "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2, ensure_ascii=False)

    if result.pydantic:
        return result.pydantic
    elif result.json_dict:
        return JudgingResult(**result.json_dict)
    else:
        try:
            return JudgingResult(**json.loads(raw_output))
        except Exception:
            return JudgingResult(
                team_name=team_name,
                scores={"technical": 0, "business": 0, "presentation": 0, "demo_quality": 0, "innovation": 0, "overall": 0},
                questions=[],
                key_strengths=["Analysis completed — see raw output for details"],
                key_concerns=["Structured parsing failed — review raw JSON file"],
                voice_script="The analysis has been completed. Please review the detailed results file.",
            )


def build_and_run_crew(
    team_name: str,
    github_url: str,
    pptx_path: str | None,
    video_path: str | None,
    transcript: str,
) -> JudgingResult:
    """Assemble the full judging crew and execute synchronously (original API)."""
    agents = {
        "github": create_github_agent(),
        "ppt": create_ppt_agent(),
        "voice": create_voice_agent(),
        "video": create_video_agent(),
        "orchestrator": create_orchestrator_agent(),
    }
    tasks = _build_tasks(team_name, github_url, pptx_path, video_path, transcript, agents)

    crew = Crew(
        agents=list(agents.values()),
        tasks=list(tasks.values()),
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff()
    return _parse_result(result, team_name)


def build_and_run_crew_streaming(
    team_name: str,
    github_url: str,
    pptx_path: str | None,
    video_path: str | None,
    transcript: str,
    step_callback: Callable | None = None,
    task_callback: Callable | None = None,
) -> JudgingResult:
    """Assemble the crew with streaming callbacks and execute."""
    agents = {
        "github": create_github_agent(),
        "ppt": create_ppt_agent(),
        "voice": create_voice_agent(),
        "video": create_video_agent(),
        "orchestrator": create_orchestrator_agent(),
    }

    if step_callback:
        for agent in agents.values():
            agent.step_callback = step_callback

    tasks = _build_tasks(team_name, github_url, pptx_path, video_path, transcript, agents)

    crew = Crew(
        agents=list(agents.values()),
        tasks=list(tasks.values()),
        process=Process.sequential,
        verbose=True,
        task_callback=task_callback,
    )

    result = crew.kickoff()
    return _parse_result(result, team_name)
