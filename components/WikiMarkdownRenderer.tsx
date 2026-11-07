'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
}

export default function WikiMarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-extrabold text-white pb-3 border-b border-slate-800 mt-6 mb-4 flex items-center space-x-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-purple-200 mt-8 mb-4 border-l-4 border-purple-500 pl-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-slate-100 mt-6 mb-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-3 text-slate-300 leading-7 text-sm md:text-base" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1.5 my-3 text-slate-300 text-sm md:text-base pl-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-3 text-slate-300 text-sm md:text-base pl-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-purple-500 bg-purple-950/20 px-4 py-3 rounded-r-xl my-4 text-purple-200 text-sm not-italic shadow-sm" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
              <table className="w-full text-left text-sm text-slate-300" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-800/80 text-purple-300 uppercase text-xs tracking-wider border-b border-slate-700/80" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 border-b border-slate-800/60" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return (
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-xs border border-slate-700/60" {...props}>
                {children}
              </code>
            )
          },
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-slate-800" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-purple-400 hover:text-purple-300 underline underline-offset-4 font-medium transition" target="_blank" rel="noopener noreferrer" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

