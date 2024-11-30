from typing import List, Dict
import asyncio
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from googlesearch import search as googlesearch
import os
from .content_ingestion import ContentIngestionPipeline
from .search_engine import SearchEngine
from .ai_enhancement import AIEnhancementService
import logging

logger = logging.getLogger(__name__)

class SearchOrchestrator:
    def __init__(self):
        self.content_ingestion = ContentIngestionPipeline()
        self.search_engine = SearchEngine()
        self.ai_enhancement = AIEnhancementService()
        self.llm = ChatGroq(
            api_key=os.getenv('GROQ_API_KEY'),
            model_name=os.getenv('MODEL_NAME'),
            max_tokens=2000,
            temperature=0.3
        )

    async def sync_documentation(self):
        """Sync existing vector store"""
        try:
            if self.content_ingestion.vector_store:
                self.content_ingestion.save_vector_store()
                logger.info("Vector store saved successfully")
        except Exception as e:
            logger.error(f"Error during vector store sync: {str(e)}")

    async def get_relevant_urls(self, query: str, num_results: int = 5) -> List[str]:
        """Get relevant URLs for the query using Google search"""
        try:
            enhanced_query = f"{query} (documentation OR tutorial OR example OR guide)"
            urls = await asyncio.to_thread(
                lambda: list(googlesearch(enhanced_query, num_results=num_results))
            )
            logger.info(f"Found {len(urls)} URLs for query: {query}")
            return urls
        except Exception as e:
            logger.error(f"Error in Google search: {str(e)}")
            return []

    async def search(self, query: str, k: int = 3) -> List[Dict]:
        """
        Search flow:
        1. Check vector database for existing results
        2. If no results, perform Google search for relevant URLs
        3. Process found URLs and update vector store
        4. Generate AI-enhanced response
        """
        try:
            # First try to get results from existing vector store
            retriever = self.content_ingestion.get_retriever()
            if retriever:
                logger.info("Checking vector database for existing results...")
                try:
                    qa_chain = RetrievalQA.from_chain_type(
                        llm=self.llm,
                        chain_type="stuff",
                        retriever=retriever,
                        return_source_documents=True,
                        verbose=True,
                        chain_type_kwargs={
                            "prompt": PromptTemplate(
                                template="""You are a helpful technical documentation assistant. Use the following pieces of context to provide a detailed and accurate answer to the question.
                                If the context doesn't contain enough information, explain what is known and what additional information might be needed.
                                Always include relevant code examples when available.
                                
                                Context: {context}
                                Question: {question}
                                
                                Detailed Answer:""",
                                input_variables=["context", "question"]
                            )
                        }
                    )
                    
                    chain_response = await asyncio.to_thread(
                        qa_chain,
                        {"query": query}
                    )
                    
                    if chain_response and chain_response.get('result'):
                        answer = chain_response.get('result', '')
                        sources = chain_response.get('source_documents', [])
                        if answer and len(answer.strip()) > 50:
                            logger.info("Found results in vector database")
                            return [{
                                "title": "Answer",
                                "explanation": answer,
                                "sources": [
                                    doc.metadata.get('source', '') 
                                    for doc in sources 
                                    if doc.metadata.get('source')
                                ]
                            }]
                
                except Exception as e:
                    logger.warning(f"Vector DB search failed: {str(e)}")
            
            # If we're here, either no vector DB results or they weren't sufficient
            logger.info("Performing Google search for relevant content...")
            urls = await self.get_relevant_urls(query)
            if not urls:
                logger.warning("No URLs found from Google search")
                return []
            
            # Process the found URLs
            results = await self.content_ingestion.process_domains(urls)
            
            # Get updated retriever with new content
            retriever = self.content_ingestion.get_retriever()
            if not retriever:
                logger.warning("No retriever available after processing URLs")
                return []
            
            # Create QA chain with new content
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=retriever,
                return_source_documents=True,
                verbose=True,
                chain_type_kwargs={
                    "prompt": PromptTemplate(
                        template="""You are a helpful technical documentation assistant. Use the following pieces of context to provide a detailed and accurate answer to the question.
                        If the context doesn't contain enough information, explain what is known and what additional information might be needed.
                        Always include relevant code examples when available.
                        
                        Context: {context}
                        Question: {question}
                        
                        Detailed Answer:""",
                        input_variables=["context", "question"]
                    )
                }
            )
            
            chain_response = await asyncio.to_thread(
                qa_chain,
                {"query": query}
            )
            
            if not chain_response:
                return []
            
            answer = chain_response.get('result', '')
            sources = chain_response.get('source_documents', [])
            
            return [{
                "title": "Answer",
                "explanation": answer,
                "sources": [
                    doc.metadata.get('source', '') 
                    for doc in sources 
                    if doc.metadata.get('source')
                ]
            }]
            
        except Exception as e:
            logger.error(f"Error in search: {str(e)}")
            return []
