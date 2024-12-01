import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ClockIcon,
  KeyIcon,
  ChartBarIcon,
  ListBulletIcon,
  ArrowPathRoundedSquareIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  ArrowUpTrayIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import GetInTouch from './components/GetInTouch';

function App() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOnInput, setIsOnInput] = useState(false);
  const [trails, setTrails] = useState([]);
  const [response, setResponse] = useState(null);
  const [exampleQueries, setExampleQueries] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;

    const isInteractiveElement = (element) => {
      if (!element || !(element instanceof Element)) return false;
      return (
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.dataset.role === 'button'
      );
    };

    const moveCursor = (e) => {
      const { clientX: x, clientY: y } = e;
      const targetElement = document.elementFromPoint(x, y);
      const isInput = targetElement instanceof Element && (
        targetElement.tagName === 'INPUT' || 
        targetElement.tagName === 'TEXTAREA'
      );
      
      setIsOnInput(isInput);
      setIsHovering(isInteractiveElement(targetElement));

      requestAnimationFrame(() => {
        if (cursor && cursorDot) {
          cursor.style.left = x + 'px';
          cursor.style.top = y + 'px';
          cursorDot.style.left = x + 'px';
          cursorDot.style.top = y + 'px';
        }
      });
    };

    document.addEventListener('mousemove', moveCursor);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  const updateCursor = useCallback((e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
    
    // Add trail effect
    setTrails(prev => [...prev.slice(-5), { x: e.clientX, y: e.clientY, id: Date.now() }]);
  }, []);

  const handleMouseDown = () => setIsHovering(true);
  const handleMouseUp = () => setIsHovering(false);
  const handleMouseEnterInput = () => setIsOnInput(true);
  const handleMouseLeaveInput = () => setIsOnInput(false);

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnterInput, true);
    document.addEventListener('mouseleave', handleMouseLeaveInput, true);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnterInput, true);
      document.removeEventListener('mouseleave', handleMouseLeaveInput, true);
    };
  }, []);

  // Clean up trails after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setTrails(prev => prev.slice(1));
    }, 500);

    return () => clearTimeout(timer);
  }, [trails]);

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

  const allExampleQueries = [
    {
      text: "How do I get started with the API?",
      icon: <DocumentTextIcon className="h-4 w-4" />,
      category: "general"
    },
    {
      text: "What are the authentication methods?",
      icon: <KeyIcon className="h-4 w-4" />,
      category: "security"
    },
    {
      text: "How to handle API errors?",
      icon: <ExclamationTriangleIcon className="h-4 w-4" />,
      category: "error"
    },
    {
      text: "What's the rate limit for API calls?",
      icon: <ChartBarIcon className="h-4 w-4" />,
      category: "limits"
    },
    {
      text: "How to implement pagination?",
      icon: <ListBulletIcon className="h-4 w-4" />,
      category: "data"
    },
    {
      text: "What are the webhook endpoints?",
      icon: <ArrowPathRoundedSquareIcon className="h-4 w-4" />,
      category: "integration"
    },
    {
      text: "How to update user settings?",
      icon: <Cog6ToothIcon className="h-4 w-4" />,
      category: "settings"
    },
    {
      text: "What's the response format?",
      icon: <CodeBracketIcon className="h-4 w-4" />,
      category: "response"
    },
    {
      text: "How to handle file uploads?",
      icon: <ArrowUpTrayIcon className="h-4 w-4" />,
      category: "files"
    },
    {
      text: "What are the API versioning rules?",
      icon: <TagIcon className="h-4 w-4" />,
      category: "versioning"
    }
  ];

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ];
    }
    return array;
  };

  useEffect(() => {
    const updateExamples = () => {
      const shuffled = shuffleArray([...allExampleQueries]);
      setExampleQueries(shuffled.slice(0, 4)); // Show 4 random examples
    };

    updateExamples();

    const interval = setInterval(updateExamples, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const examples = document.querySelectorAll('.example-query');
    examples.forEach(example => {
      example.style.animation = 'none';
      void example.offsetHeight;
      example.style.animation = null;
    });
  }, [exampleQueries]);

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
    <Router>
      <LazyMotion features={domAnimation}>
        <m.div className="min-h-screen relative overflow-hidden">
          {/* Cursor elements */}
          <div 
            ref={cursorRef}
            className={`cursor ${isHovering ? 'cursor-hover' : ''} ${isOnInput ? 'cursor-input' : ''}`}
          />
          <div 
            ref={cursorDotRef}
            className={`cursor-dot ${isHovering ? 'cursor-hover' : ''} ${isOnInput ? 'cursor-input' : ''}`}
          />

          <Routes>
            <Route path="/get-in-touch" element={<GetInTouch />} />
            <Route path="/" element={
              <div className="container-wrapper">
                {/* Main content */}
                <div className="container mx-auto relative">
                  {/* Header */}
                  <header className="header-wrapper">
                    <div className="header-content">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          <div className="logo-container p-3 rounded-xl">
                            <DocumentTextIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <h1 className="text-2xl font-bold gradient-text tracking-tight leading-none">
                              DocsGPT
                            </h1>
                            <div className="powered-by-badge flex items-center space-x-1.5 mt-0.5">
                              <SparklesIcon className="h-3 w-3 text-purple-400 animate-pulse" />
                              <span className="text-xs font-medium text-purple-200">Powered by Dark Coder</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Link 
                          to="/get-in-touch"
                          className="contact-button"
                        >
                          <div className="button-content">
                            <span className="button-text">Get in touch</span>
                          </div>
                        </Link>
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
                                <ArrowPathIcon className="h-4 w-4" />
                                <span>Searching</span>
                                <span className="loading-dots"></span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                <span>Search</span>
                              </div>
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
                              key={`${query.text}-${index}`}
                              className="example-query"
                              onClick={() => {
                                setQuery(query.text);
                                document.querySelector('.search-input').scrollIntoView({ 
                                  behavior: 'smooth',
                                  block: 'center'
                                });
                              }}
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
                  {response && (
                    <div className="response-content mt-8">
                      <ResponseContent content={response} />
                    </div>
                  )}

                  {/* Footer */}
                  <footer className="footer-wrapper">
                    <div className="footer-content">
                      <div className="footer-brand flex items-center space-x-3">
                        <div className="flex items-center space-x-3">
                          <div className="logo-container-footer">
                            <div className="logo-icon-wrapper">
                              <DocumentTextIcon className="h-5 w-5 text-white" />
                              <SparklesIcon className="h-2.5 w-2.5 text-purple-300 absolute -top-0.5 -right-0.5 animate-pulse" />
                            </div>
                          </div>
                          <h1 className="text-xl font-bold gradient-text tracking-tight leading-none">
                            DocsGPT
                          </h1>
                        </div>
                        <div className="h-6 w-px bg-purple-500/20"></div>
                        <p className="footer-tagline text-sm text-gray-400">
                          Empowering your journey in understanding documentation with the power of AI
                        </p>
                      </div>
                      
                      <div className="social-links-container">
                        <div className="social-links-title">Connect with us</div>
                        <div className="social-links">
                          <a
                            href="https://github.com/codewithdark-git/DocsGPT"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link github"
                            aria-label="GitHub"
                          >
                            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.23 0H1.77C.79 0 0 .774 0 1.725v20.55C0 23.226.79 24 1.77 24h20.46c.98 0 1.77-.774 1.77-1.725V1.725C24 .774 23.21 0 22.23 0zM7.12 20.452H3.56V9.036h3.56v11.416zM5.34 7.732c-1.14 0-2.065-.951-2.065-2.124C3.275 4.536 4.2 3.586 5.34 3.586c1.14 0 2.065.95 2.065 2.122 0 1.173-.925 2.124-2.065 2.124zM20.452 20.452h-3.56v-5.605c0-1.337-.026-3.059-1.867-3.059-1.868 0-2.155 1.46-2.155 2.967v5.697h-3.56V9.036h3.415v1.551h.048c.476-.902 1.637-1.85 3.369-1.85 3.605 0 4.27 2.373 4.27 5.457v6.258z"/>
                            </svg>
                            <span className="social-label">GitHub</span>
                          </a>
                          <a
                            href="mailto:codewithdark90@gmail.com"
                            className="social-link mail"
                            aria-label="Email"
                          >
                            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            <span className="social-label">Email</span>
                          </a>
                          <a
                            href="https://linkedin.com/in/codewithdark"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link linkedin"
                            aria-label="LinkedIn"
                          >
                            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.23 0H1.77C.79 0 0 .774 0 1.725v20.55C0 23.226.79 24 1.77 24h20.46c.98 0 1.77-.774 1.77-1.725V1.725C24 .774 23.21 0 22.23 0zM7.12 20.452H3.56V9.036h3.56v11.416zM5.34 7.732c-1.14 0-2.065-.951-2.065-2.124C3.275 4.536 4.2 3.586 5.34 3.586c1.14 0 2.065.95 2.065 2.122 0 1.173-.925 2.124-2.065 2.124zM20.452 20.452h-3.56v-5.605c0-1.337-.026-3.059-1.867-3.059-1.868 0-2.155 1.46-2.155 2.967v5.697h-3.56V9.036h3.415v1.551h.048c.476-.902 1.637-1.85 3.369-1.85 3.605 0 4.27 2.373 4.27 5.457v6.258z"/>
                            </svg>
                            <span className="social-label">LinkedIn</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="footer-bottom">
                      <p className="copyright">
                        &copy; {new Date().getFullYear()} DocsGPT. All rights reserved.
                      </p>
                    </div>
                  </footer>
                </div>
              </div>
            } />
          </Routes>
        </m.div>
      </LazyMotion>
    </Router>
  );
}

export default App;