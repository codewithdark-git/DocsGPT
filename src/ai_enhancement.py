from typing import List, Dict
import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
import logging

logger = logging.getLogger(__name__)

class AIEnhancementService:
    def __init__(self):
        self.llm = ChatGroq(
            api_key=os.getenv('GROQ_API_KEY'),
            model_name=os.getenv('SUMMARY_MODEL'),
            temperature=float(os.getenv('SUMMARY_TEMPERATURE'))
        )
        self.summary_chain = self._create_summary_chain()
        
    def _create_summary_chain(self):
        """Create a chain for generating summaries"""
        template = """You are a technical documentation assistant. Provide a concise, accurate summary of the following technical content:

Content:
{content}

Summary (be specific and technical):"""
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["content"]
        )
        
        return LLMChain(llm=self.llm, prompt=prompt)
    
    def enhance_results(self, results: List[Dict]) -> List[Dict]:
        """Enhance search results with AI-generated summaries"""
        enhanced_results = []
        
        for result in results:
            try:
                summary = self.summary_chain.run(content=result['content'])
                result['summary'] = summary
                enhanced_results.append(result)
            except Exception as e:
                logger.error(f"Error generating summary for result: {result['content']}, error: {str(e)}")
                result['summary'] = f"Error generating summary: {str(e)}"
                enhanced_results.append(result)
            
        return enhanced_results
