import streamlit as st
import asyncio
from src.search_orchestrator import SearchOrchestrator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Check Groq API key
if not os.getenv('GROQ_API_KEY'):
    st.error("GROQ_API_KEY is not set in .env file")
    st.stop()

# Initialize session state
if 'search_orchestrator' not in st.session_state:
    st.session_state.search_orchestrator = SearchOrchestrator()

# Page configuration
st.set_page_config(
    page_title="DocsGPT - Documentation Search",
    page_icon="🔍",
    layout="wide"
)

# Main search interface
st.title("🔍 DocsGPT - Documentation Search")

# Description with cleaner formatting
st.markdown("""
### Intelligent Documentation Search
Get comprehensive answers from technical documentation across the web.

**Example Queries:**
- "How to handle errors in async/await Python"
- "Best practices for React useEffect"
- "Django authentication examples"
""")

# Search interface with improved styling
col1, col2 = st.columns([3, 1])
with col1:
    query = st.text_input(
        "Enter your question",
        placeholder="What would you like to learn about?",
        key="search_input"
    )

if query:
    try:
        with st.status("🔍 Searching...", expanded=True) as status:
            async def search_and_display():
                try:
                    results = await st.session_state.search_orchestrator.search(query)
                    return results
                except Exception as e:
                    st.error(f"Search error: {str(e)}")
                    return None
            
            # Run search
            results = asyncio.run(search_and_display())
            
            if results:
                status.update(label="✅ Results Found", state="complete")
                
                # Display results with improved formatting
                for result in results:
                    with st.expander("📖 Answer", expanded=True):
                        st.markdown(result['explanation'])
                        
                        if result.get('sources'):
                            st.markdown("---")
                            st.markdown("**Sources:**")
                            for source in result['sources']:
                                st.markdown(f"- [{source}]({source})")
            else:
                status.update(label="⚠️ No Results", state="error")
                st.warning("""
                    No results found. Try:
                    - Being more specific in your query
                    - Including technology names or frameworks
                    - Asking about specific programming concepts
                """)
                
    except Exception as e:
        st.error("Search failed. Please try again.")
        st.error(f"Error details: {str(e)}")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center'>
    <p>Powered by Groq AI & LangChain</p>
</div>
""", unsafe_allow_html=True)
