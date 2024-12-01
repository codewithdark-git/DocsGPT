import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  LightBulbIcon, 
  BookOpenIcon,
  ShieldCheckIcon,
  CubeIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  CloudIcon,
  ExclamationCircleIcon,
  ClipboardIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = () => setIsHovering(true);
    const handleMouseOut = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.querySelectorAll('a, button, input').forEach(element => {
      element.addEventListener('mouseover', handleMouseOver);
      element.addEventListener('mouseout', handleMouseOut);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.querySelectorAll('a, button, input').forEach(element => {
        element.removeEventListener('mouseover', handleMouseOver);
        element.removeEventListener('mouseout', handleMouseOut);
      });
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/api/search', { query });
      setResults(response.data.results);
      setResponse(response.data.response);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during search');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = [
    {
      text: "How to implement authentication?",
      icon: <LockClosedIcon className="text-purple-400" />
    },
    {
      text: "What are the best practices for error handling?",
      icon: <ExclamationTriangleIcon className="text-purple-400" />
    },
    {
      text: "How to optimize database queries?",
      icon: <ArrowPathIcon className="text-purple-400" />
    },
    {
      text: "What's the recommended way to handle API requests?",
      icon: <CloudIcon className="text-purple-400" />
    }
  ];

  const CodeBlock = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="code-block-wrapper">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          className="code-block"
        >
          {value}
        </SyntaxHighlighter>
        <button
          onClick={handleCopy}
          className={`copy-button ${copied ? 'copied' : ''}`}
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="h-4 w-4" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
    );
  };

  const ResponseContent = ({ content }) => {
    return (
      <div className="result-card">
        <ReactMarkdown
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <CodeBlock
                  language={match[1]}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
        <div className="response-meta">
          <ClockIcon className="response-meta-icon" />
          <span>Generated in 0.8s</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Custom Cursor */}
      <div
        className={`custom-cursor ${isHovering ? 'active' : ''}`}
        style={{ left: cursorPosition.x, top: cursorPosition.y }}
      />
      <div
        className="custom-cursor-dot"
        style={{ left: cursorPosition.x, top: cursorPosition.y }}
      />

      {/* Gradient Shapes */}
      <div className="gradient-shape-left"></div>
      <div className="gradient-shape-right"></div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative">
        {/* Header */}
        <header className="header-wrapper backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="logo-container float-animation bg-gradient-custom p-2 rounded-xl shadow-glow">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold gradient-text tracking-tight">
                      DocsGPT
                    </h1>
                    <div className="powered-by-badge mt-0.5 flex items-center space-x-1.5">
                      <SparklesIcon className="h-3 w-3 text-purple-400 animate-pulse" />
                      <span className="text-xs font-medium text-gray-400">Powered by Dark Coder</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => window.location.href = '/about'}
                  className="contact-button bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg relative"
                >
                  <div className="button-content">
                    <span className="arrow-icon absolute">→</span>
                    <span className="button-text">Get in touch</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="search-container">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 gradient-text">
                Intelligent Documentation Search
              </h2>
              <p className="text-base text-gray-400">
                Get comprehensive answers from technical documentation across the web
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      className={`search-input ${isTyping ? 'typing' : ''}`}
                      placeholder="What would you like to learn about?"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setIsTyping(true);
                      }}
                    />
                    <MagnifyingGlassIcon className="search-icon" />
                    <label className="search-label">Search Documentation</label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="button-primary px-6"
                >
                  {isLoading ? (
                    <div className="loading-indicator">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
                
              </div>
              
            </form>

            {/* Example Queries */}
            <div className="mt-8">
            <h3 className="examples-title flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-purple-400 animate-pulse" />
                Try asking about:
              </h3>
              <div className="examples-container">
                {exampleQueries.map((query, index) => (
                  <button
                    key={index}
                    className="example-query"
                    onClick={() => setQuery(query.text)}
                  >
                    {query.icon}
                    <span>{query.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {error && (
              <div className="rounded-lg bg-red-50 p-6 mb-8 shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-8">
                {results.map((result, index) => (
                  <div key={index} className="glass rounded-lg p-6 shadow-lg">
                    <div className="prose max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="relative group">
                                <SyntaxHighlighter
                                  style={atomDark}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-lg !bg-gray-900"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {result.explanation}
                      </ReactMarkdown>

                      {result.sources && result.sources.length > 0 && (
                        <div className="mt-8 border-t border-gray-100 pt-6">
                          <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                            <svg className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Sources
                          </h4>
                          <div className="grid gap-3">
                            {result.sources.map((source, sourceIndex) => (
                              <a
                                key={sourceIndex}
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200"
                              >
                                <span className="mr-2">→</span>
                                {source}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Response Section */}
        {response && <ResponseContent content={response} />}

        {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; 2024 DocsGPT • Powered by Groq AI
          </div>
          <div className="flex space-x-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.028 5.192-4.279 6.701z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-3.594-1.555 4.926 4.926 0 00-4.79 6.049A13.978 13.978 0 011.671 3.149a4.93 4.93 0 001.523 6.574 4.903 4.903 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.928 4.928 0 004.6 3.419A9.9 9.9 0 010 19.54a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A10.025 10.025 0 0024 4.557z"/>
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.628 0-12 5.373-12 12s5.372 12 12 12 12-5.373 12-12-5.372-12-12-12zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.779 6.043 2.072zm-10.516-.993c1.331 1.742 2.511 3.538 3.537 5.381-2.43.715-5.331 1.082-8.684 1.105.692-2.835 2.601-5.193 5.147-6.486zm-5.44 8.834l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48-1.432-1.719-2.296-3.927-2.296-6.334zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027.928 2.42 1.609 4.91 2.043 7.46-3.349 1.291-6.953.666-9.641-1.433zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.028 5.192-4.279 6.701z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;
