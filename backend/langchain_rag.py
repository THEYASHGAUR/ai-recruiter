import numpy as np
from pypdf import PdfReader

# -----------------------------
# LangChain 1.0 Compatible Imports
# -----------------------------
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate

from dotenv import load_dotenv
load_dotenv()


# -----------------------------
# PROMPTS
# -----------------------------
JD_SUMMARY_PROMPT = """
Extract the summary from this job description such as 
company name , job title , location , requirements, education required , experience required , skills required, package offering.
NOTE: if any of the information in not provided in that jd return as "not mentioned"

Return ONLY in JSON format.

Job Description:
{jd_text}
"""

ANALYSIS_PROMPT = """
You are an expert resume evaluator.

Inputs:
- Resume Chunks (most relevant to job)
- JD Summary (JSON)
- Full Job Description (text)

Produce ONLY this JSON:

{{
  "match_score": "<0-100 integer>",
  "missing_skills": [],
  "strengths": [],
  "Should u apply in this Job?": "<short 1-2 sentence fit response>"
}}

Resume Chunks:
{resume_chunks}

JD Summary:
{jd_summary}

Full JD:
{full_jd}
"""

# -----------------------------
# LLM + Embeddings
# -----------------------------
embeddings_client = OpenAIEmbeddings(model="text-embedding-3-small")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# -----------------------------
# Prompt Templates (1.0)
# -----------------------------
jd_summary_prompt = ChatPromptTemplate.from_template(JD_SUMMARY_PROMPT)
analysis_prompt = ChatPromptTemplate.from_template(ANALYSIS_PROMPT)

# -----------------------------
# LCEL Runnables (Prompt → LLM)
# -----------------------------
jd_summary_chain = jd_summary_prompt | llm
analysis_chain = analysis_prompt | llm


# -----------------------------
# PDF LOADER
# -----------------------------
def load_pdf_text(path: str) -> str:
    """Return full text from all PDF pages."""
    reader = PdfReader(path)
    texts = []
    for page in reader.pages:
        texts.append(page.extract_text() or "")
    return "\n".join(texts)


# -----------------------------
# TEXT SPLITTER
# -----------------------------
def split_text_into_chunks(text: str, chunk_size: int = 800, chunk_overlap: int = 150):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return splitter.split_text(text)


# -----------------------------
# EMBEDDINGS HELPERS
# -----------------------------
def embed_text_list(texts: list):
    """Return embeddings for each text snippet."""
    return embeddings_client.embed_documents(texts)


def embed_text(text: str):
    return embeddings_client.embed_query(text)


def cosine_similarity(a: np.ndarray, b: np.ndarray):
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def top_k_similar(query_emb, chunk_embs, k=5):
    scores = []
    q = np.array(query_emb)
    for i, emb in enumerate(chunk_embs):
        scores.append((i, cosine_similarity(q, np.array(emb))))
    scores.sort(key=lambda x: x[1], reverse=True)
    return [idx for idx, _ in scores[:k]]


# -----------------------------
# CHAIN FUNCTIONS
# -----------------------------
def generate_jd_summary(full_jd: str) -> str:
    """Run the JD summarization LCEL chain."""
    result = jd_summary_chain.invoke({"jd_text": full_jd})
    return result.content.strip()


def analyze_resume(resume_chunks_text: str, jd_summary: str, full_jd: str) -> str:
    """Run the final analysis LCEL chain."""
    result = analysis_chain.invoke({
        "resume_chunks": resume_chunks_text,
        "jd_summary": jd_summary,
        "full_jd": full_jd
    })
    return result.content.strip()
