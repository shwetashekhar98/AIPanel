# Hackathon Judge AI

An automated AI judging system for hackathons powered by **CrewAI**. Five specialized agents analyze a team's GitHub repo, pitch deck, demo video, and voice transcript — then an orchestrator cross-references everything to produce scores and targeted judge questions.

## Architecture

```
Submission (GitHub URL, PPTX, Video, Transcript)
           │
           ├─► GitHub Agent (Claude)  ─► Code quality, architecture, commit patterns
           ├─► PPT Agent (Claude)     ─► Business model, claims, slide quality
           ├─► Voice Agent (Claude)   ─► Communication, confidence, verbal claims
           ├─► Video Agent (Gemini)   ─► Product demo, UI quality, authenticity
           │
           └─► Orchestrator (Claude)  ─► Cross-references all 4 analyses
                                          ├─ Scores (technical, business, presentation, demo, innovation)
                                          ├─ Prioritized judge questions with evidence
                                          ├─ Key strengths & concerns
                                          └─ Voice script for AI judge
```

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure API keys
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY and GEMINI_API_KEY

# 3. Run the server
python main.py
```

The server starts at **http://localhost:8000** with Swagger docs at **/docs**.

## API Endpoints

| Method | Path               | Description                        |
|--------|--------------------|------------------------------------|
| GET    | `/`                | Health check                       |
| POST   | `/judge`           | Submit a team for AI judging       |
| GET    | `/results`         | List all saved judging results     |
| GET    | `/results/{file}`  | Get a specific result              |

### POST `/judge` — Form Data

| Field        | Type   | Required | Description                     |
|-------------|--------|----------|---------------------------------|
| team_name    | string | Yes      | Name of the team                |
| github_url   | string | Yes      | GitHub repository URL           |
| transcript   | string | Yes      | Voice transcription text        |
| pptx_file    | file   | No       | PowerPoint (.pptx) pitch deck   |
| video_file   | file   | No       | Demo video (.mp4)               |

## Tech Stack

- **CrewAI** — multi-agent orchestration
- **FastAPI** — REST API backend
- **Claude (Anthropic)** — code/PPT/voice/orchestration analysis
- **Gemini (Google)** — video understanding
- **python-pptx** — PowerPoint parsing
- **GitPython** — repository cloning and analysis

## Project Structure

```
├── main.py                  # Entry point
├── requirements.txt         # Dependencies
├── .env.example             # API key template
├── app/
│   ├── server.py            # FastAPI endpoints
│   ├── crew.py              # CrewAI crew & task definitions
│   ├── agents/
│   │   └── definitions.py   # 5 agent definitions
│   ├── tools/
│   │   ├── github_tool.py   # GitHub repo analyzer
│   │   ├── pptx_tool.py     # PowerPoint parser
│   │   └── video_tool.py    # Gemini video analyzer
│   └── models/
│       └── schemas.py       # Pydantic models
├── results/                 # Saved judging results (JSON)
└── uploads/                 # Uploaded files (PPTX, video)
```
