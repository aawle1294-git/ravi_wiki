'use client'

import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { markdownToMindmap, MindmapNode } from './MindmapBuilder'

interface MindmapViewerProps {
  markdown: string
  title?: string
}

export default function MindmapViewer({ markdown, title }: MindmapViewerProps) {
  const rootNode = useMemo(() => {
    const parsed = markdownToMindmap(markdown)
    if (title && title.trim()) {
      parsed.text = title.trim()
    }
    return parsed
  }, [markdown, title])

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({})
  const [zoom, setZoom] = useState(1)

  const toggleCollapse = (nodeId: string) => {
    setCollapsedMap(prev => ({ ...prev, [nodeId]: !prev[nodeId] }))
  }

  // 재귀적 노드 렌더링
  const renderNode = (node: MindmapNode, depth = 0) => {
    const isCollapsed = collapsedMap[node.id]
    const hasChildren = node.children && node.children.length > 0
    const isRoot = depth === 0

    return (
      <div key={node.id} className="relative flex items-start space-x-3 my-2.5">
        <div
          className={`relative rounded-2xl transition-all duration-150 shadow-md ${
            isRoot
              ? 'px-4 sm:px-5 py-3 bg-gradient-to-r from-indigo-900/90 via-violet-900/90 to-purple-900/90 border-2 border-indigo-400 text-white font-extrabold text-sm sm:text-base'
              : depth === 1
              ? 'px-3.5 py-2 bg-[#131726] border border-white/[0.14] text-zinc-100 font-bold text-xs sm:text-sm'
              : 'px-3 py-1.5 bg-[#0d0f18] border border-white/[0.08] text-zinc-300 text-xs'
          }`}
          style={node.color && !isRoot ? { borderLeftColor: node.color, borderLeftWidth: '3.5px' } : undefined}
        >
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleCollapse(node.id)}
                className="p-0.5 rounded text-zinc-400 hover:text-white transition"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>
            )}

            <span className="font-sans leading-normal break-words max-w-[280px] sm:max-w-[400px]">
              {node.text}
            </span>

            {hasChildren && isCollapsed && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                +{node.children.length}
              </span>
            )}
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="relative pl-5 sm:pl-6 border-l-2 border-indigo-500/20 ml-2 space-y-2">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl bg-[#090b12] border border-indigo-500/20 shadow-xl overflow-hidden my-6">
      {/* 뷰어 상단 헤더 */}
      <div className="p-3 sm:p-4 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
              <span>🧠 마인드맵 개요 트리</span>
              <span className="text-[10px] font-normal text-zinc-400">
                (본문의 핵심 목차와 내용을 시각화)
              </span>
            </h4>
          </div>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs"
            title="축소"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-zinc-400 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs"
            title="확대"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs"
            title="원래 크기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 마인드맵 노드 영역 */}
      <div className="p-5 sm:p-7 overflow-x-auto overflow-y-auto max-h-[500px] bg-black/25">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          className="transition-transform duration-100 min-w-fit"
        >
          {renderNode(rootNode)}
        </div>
      </div>
    </div>
  )
}
