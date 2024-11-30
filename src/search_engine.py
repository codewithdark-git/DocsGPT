from typing import List, Dict
import numpy as np
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import os
import asyncio

class SearchEngine:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2"
        )
        self.vector_store = None
        self.llm = ChatGroq(
            api_key=os.getenv('GROQ_API_KEY'),
            model_name=os.getenv('SUMMARY_MODEL'),
            temperature=float(os.getenv('SUMMARY_TEMPERATURE'))
        )
        self._setup_chains()
        # Add result caching
        self._query_cache = {}
        self._expansion_cache = {}

    def _setup_chains(self):
        """Setup LLM chains for query enhancement"""
        query_expansion_template = """Given a search query, generate 3 alternative versions that capture different aspects or phrasings of the same intent.
        Make the variations semantically meaningful and diverse.

        Original Query: {query}

        Alternative Queries (comma-separated):"""

        self.query_expansion_chain = LLMChain(
            llm=self.llm,
            prompt=PromptTemplate(
                template=query_expansion_template,
                input_variables=["query"]
            )
        )

    async def _expand_query(self, query: str) -> List[str]:
        """Asynchronously expand the query"""
        if query in self._expansion_cache:
            return self._expansion_cache[query]
            
        expanded = await self.query_expansion_chain.arun(query)
        queries = [q.strip() for q in expanded.strip().split(',')]
        queries.append(query)
        self._expansion_cache[query] = queries
        return queries

    def load_vector_store(self, path: str = "faiss_index"):
        """Load existing vector store"""
        if os.path.exists(path):
            self.vector_store = FAISS.load_local(path, self.embeddings)
            return True
        return False

    async def semantic_search(self, query: str, k: int = 5, use_query_expansion: bool = True) -> List[Dict]:
        """Perform semantic search with parallel query expansion"""
        if not self.vector_store:
            if not self.load_vector_store():
                return []
                
        # Check cache first
        cache_key = f"{query}_{k}_{use_query_expansion}"
        if cache_key in self._query_cache:
            return self._query_cache[cache_key]

        results = []
        if use_query_expansion:
            # Generate alternative queries asynchronously
            expanded_queries = await self._expand_query(query)
            
            # Search with each query in parallel
            tasks = []
            for q in expanded_queries:
                tasks.append(self.vector_store.asimilarity_search_with_score(q, k=k//len(expanded_queries)))
            
            # Gather all results
            all_results = await asyncio.gather(*tasks)
            for q_results, q in zip(all_results, expanded_queries):
                results.extend([
                    {
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "score": score,
                        "matched_query": q
                    }
                    for doc, score in q_results
                ])
        else:
            # Direct search with original query
            q_results = await self.vector_store.asimilarity_search_with_score(query, k=k)
            results.extend([
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": score,
                    "matched_query": query
                }
                for doc, score in q_results
            ])

        # Sort by score and remove duplicates
        results.sort(key=lambda x: x["score"])
        seen = set()
        unique_results = []
        for result in results:
            content = result["content"]
            if content not in seen:
                seen.add(content)
                unique_results.append(result)
                if len(unique_results) >= k:
                    break
                    
        # Cache results
        self._query_cache[cache_key] = unique_results
        return unique_results

    def filtered_search(self, 
                       query: str, 
                       filters: Dict[str, str],
                       k: int = 5) -> List[Dict]:
        """Search with metadata filters"""
        if not self.vector_store:
            if not self.load_vector_store():
                return []

        # Get initial results
        results = self.vector_store.similarity_search_with_score(query, k=k*2)  # Get more results for filtering
        
        # Apply filters
        filtered_results = []
        for doc, score in results:
            matches_filters = all(
                doc.metadata.get(key) == value 
                for key, value in filters.items()
            )
            if matches_filters:
                filtered_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": score
                })
                if len(filtered_results) >= k:
                    break
                    
        return filtered_results

    def hybrid_search(self,
                     query: str,
                     k: int = 5,
                     semantic_weight: float = 0.7) -> List[Dict]:
        """Combine semantic and keyword search results"""
        if not self.vector_store:
            if not self.load_vector_store():
                return []

        # Get semantic search results
        semantic_results = self.semantic_search(query, k=k, use_query_expansion=False)
        
        # Get keyword search results (using FAISS's exact match capability)
        keyword_results = self.vector_store.similarity_search_with_score(
            query, k=k, filter=lambda x: query.lower() in x.page_content.lower()
        )
        
        # Convert keyword results to same format
        keyword_results = [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score
            }
            for doc, score in keyword_results
        ]
        
        # Combine and normalize scores
        all_results = {}
        
        for result in semantic_results:
            key = result["content"]
            all_results[key] = {
                "content": result["content"],
                "metadata": result["metadata"],
                "semantic_score": result["score"],
                "keyword_score": None
            }
            
        for result in keyword_results:
            key = result["content"]
            if key in all_results:
                all_results[key]["keyword_score"] = result["score"]
            else:
                all_results[key] = {
                    "content": result["content"],
                    "metadata": result["metadata"],
                    "semantic_score": None,
                    "keyword_score": result["score"]
                }
                
        # Calculate final scores
        final_results = []
        for result in all_results.values():
            semantic_score = result["semantic_score"] if result["semantic_score"] is not None else float('inf')
            keyword_score = result["keyword_score"] if result["keyword_score"] is not None else float('inf')
            
            # Lower scores are better in FAISS
            final_score = (semantic_weight * semantic_score + 
                         (1 - semantic_weight) * keyword_score)
            
            final_results.append({
                "content": result["content"],
                "metadata": result["metadata"],
                "score": final_score
            })
            
        # Sort by final score and return top k
        final_results.sort(key=lambda x: x["score"])
        return final_results[:k]