"""Tool that uses Gemini to analyze a demo video."""

import os
import time
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field


class VideoAnalysisInput(BaseModel):
    file_path: str = Field(..., description="Absolute path to the video file (mp4)")


class VideoAnalysisTool(BaseTool):
    name: str = "Demo Video Analyzer"
    description: str = (
        "Uploads a demo video to Google Gemini and analyzes it for: "
        "product functionality, UI quality, features demonstrated, "
        "user flow completeness, and overall polish. "
        "Returns a detailed text analysis."
    )
    args_schema: Type[BaseModel] = VideoAnalysisInput

    def _run(self, file_path: str) -> str:
        import google.generativeai as genai

        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return "Error: GEMINI_API_KEY environment variable is not set."

        genai.configure(api_key=api_key)

        try:
            video_file = genai.upload_file(path=file_path)

            while video_file.state.name == "PROCESSING":
                time.sleep(3)
                video_file = genai.get_file(video_file.name)

            if video_file.state.name == "FAILED":
                return f"Error: Video processing failed — {video_file.state.name}"

            model = genai.GenerativeModel(model_name="gemini-2.0-flash")

            prompt = """You are an expert hackathon judge analyzing a 2-minute product demo video.

Provide a comprehensive analysis covering:

## Product Functionality
- Does the product appear to actually work, or is it a mockup/slideshow?
- What core features are demonstrated?
- Are there any errors, crashes, or broken states visible?

## UI/UX Quality
- How polished is the interface?
- Is the design consistent and professional?
- Is the user flow intuitive?

## Features Demonstrated
- List every distinct feature shown in the demo
- Note which features appear fully functional vs. partially implemented

## Demo Quality
- Is the demo well-structured and easy to follow?
- Does it effectively communicate the product's value?
- Are there any red flags (pre-recorded data, suspicious cuts, etc.)?

## Technical Observations
- Any visible tech stack indicators (URLs, console output, etc.)?
- Performance observations (loading times, responsiveness)
- Any security concerns visible (exposed keys, debug mode, etc.)?

## Overall Assessment
- Rate the demo on a scale of 1-10 for authenticity, polish, and completeness
- List the top 3 strengths and top 3 concerns

Be specific and reference exact moments or visual evidence when possible."""

            response = model.generate_content([video_file, prompt])
            return response.text

        except Exception as e:
            return f"Error analyzing video: {str(e)}"
