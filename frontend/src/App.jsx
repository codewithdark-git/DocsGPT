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

    const handleMouseOver = (e) => {
      const interactiveElements = ['BUTTON', 'INPUT', 'A'];
      if (interactiveElements.includes(e.target.tagName) || 
          e.target.classList.contains('example-query') ||
          e.target.classList.contains('copy-button')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
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
        className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
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
        <header className="glass sticky top-0 z-50 shadow-sm mb-8">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="float-animation bg-gradient-custom p-1.5 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">
                  DocsGPT
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-4 w-4 text-purple-400 pulse-animation" />
                <span className="text-xs font-medium text-gray-400">Powered by Groq AI</span>
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
              <h3 className="examples-title">Try asking about:</h3>
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
        <footer className="glass mt-12">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-base text-gray-500">
              Powered by Groq AI & LangChain • Built with{' '}
              <span className="text-red-500">❤️</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
