from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults


SYSTEM_PROMPT = """
You are an AI agent that fetches real interview insights from the internet.

Given a Job Description (JD), extract:
- Company name
- Role/Position title
- Tech stack or domain (if mentioned)

Your tasks:
1. Search the internet for past interview questions asked at this company for this role in the last 1 year.
2. Search for real interview experiences posted online in the last 1 year.
3. Identify the number of interview rounds generally conducted for this position in the last 1 year.
4. Identify the insider tips for the interview process in the last 1 year.
5. Summarize all findings in a crisp, structured, easy-to-read format.
6. The overall response should be very detailed and should not miss any information.
NOTE: If you are not able to find any information, return "Not found".
Output Format:
1. Past Interview Questions (Last 1 year) - List of questions asked in the last 1 year.(Min. 10 questions)
2. Past Interview Experiences (Last 1 year) - List of interview experiences in the last 1 year.(Min. 5 experiences)
3. Typical Number of Rounds (Last 1 year) - Number of interview rounds generally conducted for this position in the last 1 year.
4. Insider Tips (Last 1 year) - Insider tips for the interview process in the last 1 year. (This should be a list of tips)
"""

# LLM
llm = ChatOpenAI(model="gpt-4.1", temperature=0)

# Search tool
search = TavilySearchResults(max_results=8)


def fetch_interview_insights_from_web(jd_text: str) -> str:
    try:
        # 1. Perform web search
        query = f"Interview questions and experiences last 1 year for this job description: {jd_text}"
        search_results = search.invoke({"query": query})

        # 2. Join results as a single text block
        combined_content = ""
        for item in search_results:
            if "content" in item:
                combined_content += item["content"] + "\n\n"

        # 3. Ask LLM to summarize properly
        final_prompt = f"""
{SYSTEM_PROMPT}

Here is the online data found:
{combined_content}

Now summarize using the required EXACT output format.
"""

        response = llm.invoke(final_prompt)
        return response.content

    except Exception as e:
        return f"Error: {e}"
