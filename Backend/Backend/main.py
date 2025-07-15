import uuid
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
from PIL import Image
import io
import os
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

from s3_util import get_s3_client

app = FastAPI()

from ultralytics import YOLO
model = YOLO("best.pt") 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Read the uploaded image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    # Run YOLO inference
    results = model.predict(image)

    # Plot the result on the image
    result_image = results[0].plot()

    pil_image = Image.fromarray(result_image[..., ::-1])
    img_byte_arr = io.BytesIO()
    pil_image.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    return StreamingResponse(img_byte_arr, media_type="image/png")


@app.post("/crack-detect")
async def detect(
    file: UploadFile = File(...),
    context: str = Form(...)
):
    # Print context in terminal
    print(f"Received context: {context}")

    system_prompt = """You are a software developer specializing in civil engineering and crack detection. A user has uploaded a photo/video of a crack in a structure. Based on the detection result and the user's context, Your task is to extract information, generate a comprehensive report and structure it into a JSON object.
    Generate a JSON output conforming EXACTLY to the following schema, extracting relevant information from the provided text for each field.

    Schema Definition:
    {
       "Type of Crack": "string | null",
       "Likely Cause": "string | null",
       "Severity Level": "string | null",
       "Recommended Next Step": "string | null",
       "Preventive Measures": "string | null",
    }

    Example Output Structure:
    {
       "Type of Crack": "The uploaded image reveals a thin, vertical crack extending downward in a mostly straight path. This pattern is consistent with a longitudinal crack typically found in walls or pavements due to tensile stress.",
       "Likely Cause": "The most probable cause of this crack is thermal expansion and contraction over time, combined with foundational settling. Minor shifts in the structure or fluctuations in temperature can create stress lines like this.",
       "Severity Level": "This is a minor to moderate crack. It does not yet exhibit branching, spalling, or significant width, but its length and location suggest that progression is possible if not addressed. Moisture intrusion might already be occurring.",
       "Recommended Next Step": "Seal the crack with a flexible filler or epoxy resin designed for structural cracks. Monitor over the next few months for any changes in size or direction. Consider a professional inspection if worsening is noticed.",
       "Preventive Measures": "Maintain consistent indoor humidity levels, reinforce structural supports if needed, and regularly inspect walls for early signs of stress. Ensure proper drainage around the structure to prevent moisture-related expansion."
    }

    Guidelines:
    1.  Base the content for each field *strictly* on the provided image by the user.
    2.  Do *not* add, infer, or invent any information not explicitly present in the source text.
    3.  If information for a specific field cannot be found in the text, use an empty string "" or `null` as the value for that key. Ensure all keys are present in the final JSON.
    4.  The output MUST be *only* the JSON object itself. Do not include any introductory text, concluding remarks, explanations, or markdown formatting like ```json ... ```. Just the raw JSON.
    """

    # Run your ML model
    results = model.predict(image)
    result_image = results[0].plot()

    # Convert to PIL and Base64
    pil_image = Image.fromarray(result_image[..., ::-1])
    img_byte_arr = io.BytesIO()
    pil_image.save(img_byte_arr, format="PNG")
    base64_img = base64.b64encode(img_byte_arr.getvalue()).decode("utf-8")

    # Call OpenAI API with system prompt, image URL, and user context
    response = client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": context},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": url,
                        },
                    },
                ],
            }
        ],
        max_tokens=1024,
    )

    # Extract the JSON report from the OpenAI response
    openai_report = response.choices[0].message.content.strip()

    # Try to parse the JSON, fallback to string if parsing fails
    import json
    try:
        report = json.loads(openai_report)
    except Exception:
        report = openai_report  # fallback: return raw string

    return JSONResponse(content={
        "image": base64_img,
        "report": report
    })

@app.get("/test")
def test_local_image():
    image_path = "cracks.jpeg"
    output_path = "inference_result.png"

    # Check if the image exists
    if not os.path.exists(image_path):
        return {"error": f"{image_path} not found"}

    # Load image
    image = Image.open(image_path).convert("RGB")

    # Run inference
    results = model.predict(image)

    # Get the result image
    result_image = results[0].plot()

    # Save the result to file
    result_pil = Image.fromarray(result_image[..., ::-1])  # convert BGR to RGB
    result_pil.save(output_path)

    return {"message": f"Inference saved to {output_path}"}