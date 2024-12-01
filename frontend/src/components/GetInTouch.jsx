import React, { useState } from 'react';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import architectureFlow from '../assets/architecture.png';

const GetInTouch = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-slate-900 text-gray-100 py-12 px-4"
      >
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <m.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to DocsGPT
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your intelligent documentation assistant powered by LangChain and GPT technology
            </p>
          </m.section>

          {/* Architecture Section */}
          <m.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-purple-400">
              How DocsGPT Works
            </h2>
            <div className="bg-slate-800/50 rounded-xl p-8 backdrop-blur-sm border border-purple-500/20 shadow-xl">
              <div className="mb-12">
                <div className="max-w-3xl mx-auto overflow-hidden rounded-lg shadow-lg border border-purple-500/20">
                  <img 
                    src={architectureFlow} 
                    alt="DocsGPT Architecture Flow" 
                    className="w-full h-auto object-contain bg-white p-6"
                    style={{ maxHeight: '800px' }}
                  />
                </div>
              </div>

              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <p className="text-xl text-gray-300">
                    Our advanced architecture combines LangChain's powerful capabilities with GPT technology 
                    to deliver precise and context-aware documentation assistance.
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="bg-slate-800/80 p-6 rounded-lg border border-purple-500/10">
                    <h3 className="text-xl font-semibold mb-4 text-purple-300">User Interaction</h3>
                    <p className="text-gray-300">
                      Submit natural language queries through our intuitive interface. 
                      Our system processes your questions and returns relevant documentation insights.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-6 rounded-lg border border-purple-500/10">
                    <h3 className="text-xl font-semibold mb-4 text-purple-300">Smart Processing</h3>
                    <p className="text-gray-300">
                      The LangChain Orchestrator manages your query through our sophisticated 
                      processing pipeline, ensuring accurate and relevant results.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-6 rounded-lg border border-purple-500/10">
                    <h3 className="text-xl font-semibold mb-4 text-purple-300">Content Analysis</h3>
                    <p className="text-gray-300">
                      Our system aggregates and processes documentation content, generating 
                      precise vector embeddings for enhanced search capabilities.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-6 rounded-lg border border-purple-500/10">
                    <h3 className="text-xl font-semibold mb-4 text-purple-300">AI-Powered Results</h3>
                    <p className="text-gray-300">
                      Results are refined and enhanced by GPT technology, providing you with 
                      clear, contextual answers from your documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </m.section>

          {/* Contact Section */}
          <m.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6 text-purple-400">Get Started Today</h2>
            <p className="text-xl text-gray-300 mb-8">
              Experience the future of documentation search and exploration
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/codewithdark-git/DocsGPT"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-semibold transition-colors"
              >
                GitHub Repository
              </a>
              <a
                href="https://discord.gg/n5BX5cqWqp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
              >
                Join Discord
              </a>
            </div>
          </m.section>
        </div>
      </m.div>
    </LazyMotion>
  );
};

export default GetInTouch;
