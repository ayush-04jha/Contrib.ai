import os
from typing import List, Optional
from pymongo import MongoClient
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from schemas import SearchQuery, SearchResult, SearchResponse

load_dotenv()

# Initialize clients
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2-preview",
    google_api_key=os.getenv("GEMINI_KEY")
)

llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_KEY"),
    temperature=0
)

client_db = MongoClient(os.getenv("MONGO_URI"))
db = client_db["code_agent"]
collection = db["embeddings"]

# Initialize MongoDB vector store
vector_store = MongoDBAtlasVectorSearch(
    collection=collection,
    embedding=embeddings,
    index_name="vector_index",
    embedding_key="embedding",
    text_key="code",
    relevance_score_fn="cosine"
)


def format_docs(docs: List[Document]) -> str:
    """Format documents for context"""
    context_parts = []
    for doc in docs:
        metadata = doc.metadata
        code = doc.page_content
        file_path = metadata.get("file_path", "Unknown")
        name = metadata.get("name", "Unknown")
        context_parts.append(f"--- File: {file_path} | Function: {name} ---\n{code}")
    return "\n\n".join(context_parts)


def create_search_chain(repo_id: str):
    """Create a retrieval chain for a specific repository"""
    
    # Create retriever with pre-filter for repo_id
    retriever = vector_store.as_retriever(
        search_kwargs={
            "pre_filter": {"repo_id": repo_id},
            "k": 10
        }
    )
    
    # Define the prompt template
    template = """
    You are a Senior Open Source Contributor Agent. 
    Use the following code snippets from the repository to answer the user's question accurately.
    If the answer isn't in the code, give me generalised answer based on the question.

    CONTEXT FROM REPOSITORY:
    {context}

    USER QUESTION:
    {question}

    FINAL ANSWER:
    """
    
    prompt = ChatPromptTemplate.from_template(template)
    
    # Create the retrieval chain
    retrieval_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return retrieval_chain, retriever


def search_and_answer(query: str, repo_id: str) -> SearchResponse:
    """
    Search for relevant code and generate answer using LangChain
    
    Args:
        query: User's search query
        repo_id: Repository ID to search within
        
    Returns:
        SearchResponse with answer and search results
    """
    print("=== LangChain Search Agent ===")
    print("Repo ID:", repo_id)
    print("Query:", query)
    
    # Check if repository has documents
    count = collection.count_documents({"repo_id": repo_id})
    print("Documents for repo:", count)
    
    if count == 0:
        print("DEBUG: No documents found for this repository!")
        sample_repos = collection.distinct("repo_id")[:5]
        print("Sample repo_ids in database:", sample_repos)
        return SearchResponse(
            answer="No relevant code found in the repository.",
            search_results=[],
            results_count=0
        )
    
    # Create search chain and retriever
    chain, retriever = create_search_chain(repo_id)
    
    # Get search results for metadata
    search_docs = retriever.invoke(query)
    print(f"Found {len(search_docs)} results in Vector Search")
    
    # Convert to SearchResult objects
    search_results = []
    for doc in search_docs:
        metadata = doc.metadata
        search_result = SearchResult(
            file_path=metadata.get("file_path", "Unknown"),
            name=metadata.get("name", "Unknown"),
            code=doc.page_content,
            score=metadata.get("score", 0.0)
        )
        search_results.append(search_result)
        print(f"-> Matching Function: {search_result.name} (Score: {search_result.score})")
    
    # Generate answer using the chain
    answer = chain.invoke(query)
    
    return SearchResponse(
        answer=answer,
        search_results=search_results,
        results_count=len(search_results)
    )


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        user_query = sys.argv[1]
        r_id = sys.argv[2] if len(sys.argv) > 2 else ""
        
        response = search_and_answer(user_query, r_id)
        print(response.answer)
        print(f"\nFound {response.results_count} relevant code snippets.")
