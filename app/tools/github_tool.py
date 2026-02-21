"""Tool that clones a GitHub repo and analyzes its contents."""

import os
import shutil
import tempfile
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field


class GitHubAnalysisInput(BaseModel):
    repo_url: str = Field(..., description="The GitHub repository URL to analyze")


class GitHubAnalysisTool(BaseTool):
    name: str = "GitHub Repository Analyzer"
    description: str = (
        "Clones a GitHub repository and extracts a comprehensive analysis: "
        "file structure, tech stack, code quality indicators, commit history, "
        "README content, and architecture patterns."
    )
    args_schema: Type[BaseModel] = GitHubAnalysisInput

    def _run(self, repo_url: str) -> str:
        import git

        clone_dir = tempfile.mkdtemp(prefix="hackathon_repo_")
        try:
            repo = git.Repo.clone_from(repo_url, clone_dir, depth=50)
            analysis_parts: list[str] = []

            # --- Commit history ---
            commits = list(repo.iter_commits("HEAD", max_count=50))
            analysis_parts.append(f"## Commit History ({len(commits)} commits fetched)")
            unique_authors = {c.author.name for c in commits}
            analysis_parts.append(f"Unique authors: {', '.join(unique_authors)}")
            analysis_parts.append(f"Total commits (in shallow clone): {len(commits)}")
            if commits:
                first, last = commits[-1], commits[0]
                analysis_parts.append(f"First commit: {first.committed_datetime}")
                analysis_parts.append(f"Latest commit: {last.committed_datetime}")
                analysis_parts.append("\nRecent commits:")
                for c in commits[:10]:
                    analysis_parts.append(f"  - {c.hexsha[:7]} {c.message.strip()[:80]}")

            # --- File structure ---
            analysis_parts.append("\n## File Structure")
            file_list: list[str] = []
            ext_count: dict[str, int] = {}
            total_lines: dict[str, int] = {}
            for root, dirs, files in os.walk(clone_dir):
                dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__", ".venv", "venv", ".next", "dist", "build"}]
                for f in files:
                    rel = os.path.relpath(os.path.join(root, f), clone_dir)
                    file_list.append(rel)
                    ext = os.path.splitext(f)[1].lower()
                    ext_count[ext] = ext_count.get(ext, 0) + 1
                    try:
                        with open(os.path.join(root, f), "r", encoding="utf-8", errors="ignore") as fh:
                            lines = len(fh.readlines())
                            total_lines[ext] = total_lines.get(ext, 0) + lines
                    except Exception:
                        pass

            analysis_parts.append(f"Total files: {len(file_list)}")
            analysis_parts.append("\nFile extensions breakdown:")
            for ext, count in sorted(ext_count.items(), key=lambda x: -x[1])[:15]:
                lines = total_lines.get(ext, 0)
                analysis_parts.append(f"  {ext or '(no ext)'}: {count} files, ~{lines} lines")

            if len(file_list) <= 60:
                analysis_parts.append("\nFull file tree:")
                for f in sorted(file_list):
                    analysis_parts.append(f"  {f}")
            else:
                analysis_parts.append(f"\nFile tree too large ({len(file_list)} files), showing top-level:")
                top_level = set()
                for f in file_list:
                    top_level.add(f.split(os.sep)[0])
                for t in sorted(top_level):
                    analysis_parts.append(f"  {t}/")

            # --- Tech stack detection ---
            analysis_parts.append("\n## Tech Stack Detection")
            indicators = {
                "package.json": "Node.js / JavaScript",
                "requirements.txt": "Python (pip)",
                "Pipfile": "Python (pipenv)",
                "pyproject.toml": "Python (modern)",
                "Cargo.toml": "Rust",
                "go.mod": "Go",
                "pom.xml": "Java (Maven)",
                "build.gradle": "Java/Kotlin (Gradle)",
                "Gemfile": "Ruby",
                "docker-compose.yml": "Docker Compose",
                "Dockerfile": "Docker",
                ".env": "Environment variables",
                "next.config.js": "Next.js",
                "next.config.mjs": "Next.js",
                "vite.config.ts": "Vite",
                "tailwind.config.js": "Tailwind CSS",
                "tailwind.config.ts": "Tailwind CSS",
                "tsconfig.json": "TypeScript",
                "angular.json": "Angular",
                "vue.config.js": "Vue.js",
                "flutter_app.yaml": "Flutter",
                "pubspec.yaml": "Dart/Flutter",
            }
            detected = []
            for indicator, tech in indicators.items():
                if any(f.endswith(indicator) for f in file_list):
                    detected.append(tech)
            if detected:
                analysis_parts.append(f"Detected: {', '.join(detected)}")
            else:
                analysis_parts.append("No common framework indicators detected.")

            # --- Key file contents ---
            analysis_parts.append("\n## Key File Contents")
            key_files = ["README.md", "readme.md", "README.rst", "package.json", "requirements.txt", "pyproject.toml"]
            for kf in key_files:
                matches = [f for f in file_list if f.lower() == kf.lower()]
                if matches:
                    fpath = os.path.join(clone_dir, matches[0])
                    try:
                        with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                            content = fh.read(3000)
                        analysis_parts.append(f"\n### {matches[0]}")
                        analysis_parts.append(content)
                    except Exception:
                        pass

            # --- Code quality signals ---
            analysis_parts.append("\n## Code Quality Signals")
            quality_files = [".eslintrc", ".eslintrc.json", ".prettier", ".prettierrc", "mypy.ini", "setup.cfg", ".flake8", "tox.ini", "jest.config", "pytest.ini", ".github/workflows"]
            found_quality = [q for q in quality_files if any(q in f for f in file_list)]
            if found_quality:
                analysis_parts.append(f"Quality tools found: {', '.join(found_quality)}")
            else:
                analysis_parts.append("No linting/testing config files detected.")

            has_tests = any("test" in f.lower() for f in file_list)
            analysis_parts.append(f"Test files present: {has_tests}")

            has_ci = any(".github/workflows" in f or "Jenkinsfile" in f or ".gitlab-ci" in f for f in file_list)
            analysis_parts.append(f"CI/CD config present: {has_ci}")

            return "\n".join(analysis_parts)

        except Exception as e:
            return f"Error analyzing repository: {str(e)}"
        finally:
            shutil.rmtree(clone_dir, ignore_errors=True)
