import logging

from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from langchain_rag import (
    load_pdf_text,
    split_text_into_chunks,
    embed_text_list,
    embed_text,
    top_k_similar,
    generate_jd_summary,
    analyze_resume,
)
from file_utils import save_upload_file
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resume Analyzer (no vectorstore)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("resume_analyzer")

@app.post("/analyze")
async def analyze(
    resume: UploadFile,
    jd: UploadFile = None,
    jd_text: str = Form(None),
    top_k: int = Form(5)
):
    logger.info(
        "Received /analyze request | resume=%s | jd_upload=%s | jd_text_supplied=%s | top_k=%s",
        resume.filename,
        bool(jd),
        bool(jd_text and jd_text.strip()),
        top_k,
    )

    try:
        # 1. save files locally
        resume_path = save_upload_file(resume)
        logger.info("Resume saved to %s", resume_path)

        # 2. extract resume text & chunk
        resume_text = load_pdf_text(resume_path)
        resume_chunks = split_text_into_chunks(resume_text)
        logger.info("Resume chunked into %s segments", len(resume_chunks))

        # 3. capture full JD text (file or form text)
        if jd:
            jd_path = save_upload_file(jd)
            full_jd = load_pdf_text(jd_path)
            logger.info("JD file processed from %s", jd_path)
        else:
            if not jd_text:
                logger.warning("JD text missing and no JD file uploaded")
                return JSONResponse({"error": "Provide jd file or jd_text"}, status_code=400)
            full_jd = jd_text
            logger.info("JD text supplied via form")

        # 4. generate JD summary (LLM)
        jd_summary = generate_jd_summary(full_jd)
        logger.info("JD summary generated (%s chars)", jd_summary)

        # 5. create embeddings for resume chunks and the JD (in-memory)
        chunk_embs = embed_text_list(resume_chunks)       # list of vectors
        jd_emb = embed_text(full_jd)                      # single vector
        logger.info("Computed embeddings for resume chunks and JD")

        # 6. simple similarity to pick top-k relevant resume chunks
        topk_indices = top_k_similar(jd_emb, chunk_embs, k=top_k)
        selected_chunks = [resume_chunks[i] for i in topk_indices]
        joined_chunks = "\n\n---\n\n".join(selected_chunks)
        logger.info("Selected top %s resume chunks: %s", len(selected_chunks), topk_indices)

        # 7. call LLM to analyze using selected chunks + JD summary + full JD
        analysis = analyze_resume(joined_chunks, jd_summary, full_jd)
        logger.info("Analysis completed successfully: %s", analysis)

        return {
            "jd_summary": jd_summary,
            "selected_chunks_count": len(selected_chunks),
            "selected_chunks_indices": topk_indices,
            "analysis": analysis
        }
    except Exception as exc:
        logger.exception("/analyze request failed: %s", exc)
        return JSONResponse(
            {"error": "Failed to analyze resume", "details": str(exc)},
            status_code=500,
        )


@app.get("/")
def root():
    return {"message":"fastapi server is running...."}