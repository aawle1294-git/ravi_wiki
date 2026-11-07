'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface Props {
  content: string
}

export default function WikiMarkdownRenderer({ content }: Props) {
  // DB에서 이스케이프된 리터럴 \n 문자열을 실제 줄바꿈으로 정상화
  const formattedContent = (content || '')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')

  return (
    <div className="w-full min-w-0 text-zinc-200 leading-relaxed font-sans break-words space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white pb-3 border-b border-white/[0.08] mt-6 mb-4 flex items-center space-x-2 tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-8 mb-4 border-l-3 border-indigo-500 pl-3.5 tracking-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base sm:text-lg font-semibold text-zinc-200 mt-6 mb-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-3 text-zinc-300 leading-7 text-sm sm:text-base break-words" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 my-3 text-zinc-300 text-sm sm:text-base pl-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 my-3 text-zinc-300 text-sm sm:text-base pl-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-indigo-500/60 bg-white/[0.03] px-4 py-3 rounded-r-xl my-4 text-zinc-300 text-sm not-italic shadow-sm break-words" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-2xl border border-white/[0.08] bg-black/40 shadow-lg w-full">
              <table className="w-full text-left text-sm text-zinc-300 min-w-full divide-y divide-white/[0.08]" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-white/[0.04] text-zinc-300 uppercase text-xs tracking-wider font-semibold" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-semibold text-white" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 border-b border-white/[0.05] text-xs sm:text-sm text-zinc-300" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-indigo-300 font-mono text-xs border border-white/[0.08] break-all" {...props}>
                {children}
              </code>
            )
          },
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-white/[0.08]" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-medium transition break-all" target="_blank" rel="noopener noreferrer" {...props} />
          )
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  )
}
