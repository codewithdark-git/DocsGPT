from typing import List, Dict, Optional
import asyncio
from datetime import datetime
from langchain.document_loaders import WebBaseLoader
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
import os
import logging

logger = logging.getLogger(__name__)

class ContentIngestionPipeline:
    def __init__(self):
        self.vector_store = None
        self.embeddings = HuggingFaceEmbeddings()
        self._load_vector_store()

    def _load_vector_store(self):
        """Load existing vector store if available"""
        try:
            if os.path.exists("vectorstore.faiss"):
                self.vector_store = FAISS.load_local(
                    "vectorstore.faiss",
                    self.embeddings
                )
                logger.info("Loaded existing vector store")
        except Exception as e:
            logger.error(f"Error loading vector store: {str(e)}")

    def save_vector_store(self):
        """Save vector store to disk"""
        try:
            if self.vector_store:
                self.vector_store.save_local("vectorstore.faiss")
                logger.info("Vector store saved successfully")
        except Exception as e:
            logger.error(f"Error saving vector store: {str(e)}")

    def get_retriever(self):
        """Get retriever with optimized settings"""
        if not self.vector_store:
            return None

        return self.vector_store.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={
                "k": 3,
                "score_threshold": 0.5,
                "fetch_k": 10
            }
        )

    async def process_url(self, url: str) -> Optional[List[Dict]]:
        """Process a single URL and extract content"""
        try:
            # Load and process webpage
            loader = WebBaseLoader(url)
            docs = await asyncio.to_thread(loader.load)
            
            if not docs:
                return None
            
            # Process first document
            doc = docs[0]
            
            # Split into chunks
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            
            chunks = splitter.split_text(doc.page_content)
            
            # Create documents with metadata
            documents = []
            for i, chunk in enumerate(chunks):
                chunk = chunk.strip()
                if len(chunk) < 50:  # Skip small chunks
                    continue
                    
                documents.append({
                    "content": chunk,
                    "metadata": {
                        **doc.metadata,
                        "source": url,
                        "chunk_id": i,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
            return documents
            
        except Exception as e:
            logger.error(f"Error processing URL {url}: {str(e)}")
            return None

    async def process_domains(self, urls: List[str]) -> List[Dict]:
        """Process multiple URLs and update vector store"""
        try:
            # Process URLs concurrently
            tasks = [self.process_url(url) for url in urls]
            results = await asyncio.gather(*tasks)
            
            # Flatten and filter results
            documents = []
            for result in results:
                if result:
                    documents.extend(result)
            
            if documents:
                # Create or update vector store
                texts = [doc["content"] for doc in documents]
                metadatas = [doc["metadata"] for doc in documents]
                
                if self.vector_store is None:
                    self.vector_store = FAISS.from_texts(
                        texts,
                        self.embeddings,
                        metadatas=metadatas
                    )
                else:
                    self.vector_store.add_texts(
                        texts,
                        metadatas=metadatas
                    )
                
                # Save updated vector store
                self.save_vector_store()
            
            return documents
            
        except Exception as e:
            logger.error(f"Error processing domains: {str(e)}")
            return []
