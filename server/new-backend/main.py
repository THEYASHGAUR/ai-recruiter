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
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resume Analyzer (no vectorstore)")

@app.post("/analyze")
async def analyze(
    resume: UploadFile,
    jd: UploadFile = None,
    jd_text: str = Form(None),
    top_k: int = Form(5)
):
    # 1. save files locally
    resume_path = save_upload_file(resume)

    # 2. extract resume text & chunk
    resume_text = load_pdf_text(resume_path)
    resume_chunks = split_text_into_chunks(resume_text)

    # 3. capture full JD text (file or form text)
    if jd:
        jd_path = save_upload_file(jd)
        full_jd = load_pdf_text(jd_path)
    else:
        if not jd_text:
            return JSONResponse({"error": "Provide jd file or jd_text"}, status_code=400)
        full_jd = jd_text

    # 4. generate JD summary (LLM)
    jd_summary = generate_jd_summary(full_jd)

    # 5. create embeddings for resume chunks and the JD (in-memory)
    chunk_embs = embed_text_list(resume_chunks)       # list of vectors
    jd_emb = embed_text(full_jd)                      # single vector

    # 6. simple similarity to pick top-k relevant resume chunks
    topk_indices = top_k_similar(jd_emb, chunk_embs, k=top_k)
    selected_chunks = [resume_chunks[i] for i in topk_indices]
    joined_chunks = "\n\n---\n\n".join(selected_chunks)

    # 7. call LLM to analyze using selected chunks + JD summary + full JD
    analysis = analyze_resume(joined_chunks, jd_summary, full_jd)

    return {
        "jd_summary": jd_summary,
        "selected_chunks_count": len(selected_chunks),
        "selected_chunks_indices": topk_indices,
        "analysis": analysis
    }
