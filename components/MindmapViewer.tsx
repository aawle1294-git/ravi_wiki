'use client'

import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react'
import { markdownToMindmap, MindmapNode } from './MindmapBuilder'
import { useTheme } from '@/lib/theme'

interface MindmapViewerProps {
  markdown: string
  title?: string
}

/**
 * 마인드맵을 표시할 구조적 내용(헤딩 또는 2개 이상의 목록 항목)이 있는지 검사합니다.
 * 없을 경우 false를 반환하여 마인드맵 버튼 및 뷰어를 완전히 숨깁니다.
 */
export function hasMindmapContent(markdown: string): boolean {
  if (!markdown || typeof markdown !== 'string') return false
  // HTML 메타 주석 제거 (<!--subtitle:...-->, <!--dislikes:...-->)
  const clean = markdown.replace(/<!--[\s\S]*?-->/g, '').trim()
  if (clean.length < 15) return false

  // H2~H4 헤딩이 있는지 확인
  const hasHeadings = /^#{2,4}\s+\S+/m.test(clean)
  // 목록 항목(-, *, +, 1., 1))이 2개 이상 있는지 확인
  const listItems = clean.match(/^(\s*[-*+]|\s*\d+[.)])\s+\S+/gm) || []

  return hasHeadings || listItems.length >= 2
}

// Discord & Notion 대표 액센트 컬러 팔레트
const BRANCH_COLORS = [
  '#5865F2', // Discord Blurple
  '#23A55A', // Discord Green / Notion Emerald
  '#F0B232', // Discord Yellow / Notion Amber
  '#EC4899', // Notion Pink / Discord Fuchsia
  '#9065B0', // Notion Purple
  '#337EA9', // Notion Blue
  '#14B8A6', // Teal
  '#F97316', // Orange
]

export default function MindmapViewer({ markdown, title }: MindmapViewerProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // 마크다운 파싱 (자식이 없으면 fallback을 주지 않음)
  const rootNode = useMemo(() => {
    const parsed = markdownToMindmap(markdown, false)
    if (title && title.trim()) {
      parsed.text = title.trim()
    }
    return parsed
  }, [markdown, title])

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({})
  const [zoom, setZoom] = useState(1)
  const [allCollapsed, setAllCollapsed] = useState(false)

  // 구조적 내용이 없거나 파싱된 자식 노드가 전혀 없는 경우 아무것도 렌더링하지 않음
  if (!hasMindmapContent(markdown) || !rootNode.children || rootNode.children.length === 0) {
    return null
  }

  const toggleCollapse = (nodeId: string) => {
    setCollapsedMap(prev => ({ ...prev, [nodeId]: !prev[nodeId] }))
  }

  // 전체 펼치기 / 전체 접기 토글
  const handleToggleAll = () => {
    if (allCollapsed) {
      setCollapsedMap({})
      setAllCollapsed(false)
    } else {
      const nextMap: Record<string, boolean> = {}
      const markAll = (n: MindmapNode) => {
        if (n.children && n.children.length > 0) {
          nextMap[n.id] = true
          n.children.forEach(markAll)
        }
      }
      markAll(rootNode)
      setCollapsedMap(nextMap)
      setAllCollapsed(true)
    }
  }

  // 재귀적 노드 렌더링 — Notion (깔끔한 위계선과 카드) + Discord (블러플 포인트와 뱃지)
  const renderNode = (
    node: MindmapNode,
    depth = 0,
    branchColorIndex = 0
  ): React.ReactNode => {
    const isCollapsed = Boolean(collapsedMap[node.id])
    const hasChildren = Boolean(node.children && node.children.length > 0)
    const isRoot = depth === 0
    const branchColor = BRANCH_COLORS[branchColorIndex % BRANCH_COLORS.length]

    let nodeClass = ''
    const nodeStyle: React.CSSProperties = {}

    if (isRoot) {
      // 🔮 Root: Discord Blurple 메인 노드
      nodeClass =
        'px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all select-none border border-[#5865F2]/40'
      nodeStyle.backgroundColor = '#5865F2'
      nodeStyle.color = '#ffffff'
      nodeStyle.boxShadow = '0 8px 20px -4px rgba(88, 101, 242, 0.35)'
    } else if (depth === 1) {
      // 🌿 Depth 1: Notion Callout / Discord Channel 카테고리 카드
      if (isLight) {
        nodeClass =
          'px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 font-bold text-xs sm:text-sm select-none transition-all'
        nodeStyle.color = '#0f172a'
      } else {
        nodeClass =
          'px-3.5 py-2 bg-[#2b2d31] border border-white/[0.08] rounded-xl hover:border-white/[0.18] font-bold text-xs sm:text-sm select-none transition-all'
        nodeStyle.color = '#f2f3f5'
      }
      nodeStyle.borderLeft = `4px solid ${node.color || branchColor}`
    } else if (depth === 2) {
      // 📘 Depth 2: 세부 항목 카드
      if (isLight) {
        nodeClass =
          'px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg hover:border-slate-300 font-medium text-xs select-none transition-all'
        nodeStyle.color = '#334155'
      } else {
        nodeClass =
          'px-3 py-1.5 bg-[#232428] border border-white/[0.06] rounded-lg hover:border-white/[0.14] font-medium text-xs select-none transition-all'
        nodeStyle.color = '#dbdee1'
      }
      nodeStyle.borderLeft = `2.5px solid ${node.color || branchColor}`
    } else {
      // 📄 Depth 3+: 미니멀 인덴트 항목
      if (isLight) {
        nodeClass =
          'px-2.5 py-1 bg-white/70 border border-slate-200/60 rounded-md text-xs select-none'
        nodeStyle.color = '#64748b'
      } else {
        nodeClass =
          'px-2.5 py-1 bg-white/[0.03] border border-white/[0.04] rounded-md text-xs select-none'
        nodeStyle.color = '#949ba4'
      }
    }

    return (
      <div key={node.id} className="relative flex items-start space-x-3 my-2">
        {/* 노드 카드 */}
        <div
          className={`relative ${nodeClass} ${
            hasChildren ? 'cursor-pointer hover:scale-[1.01]' : ''
          }`}
          style={nodeStyle}
          onClick={hasChildren ? () => toggleCollapse(node.id) : undefined}
        >
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <span className="shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition">
                {isCollapsed ? (
                  <ChevronRight
                    className="w-3.5 h-3.5"
                    style={{ color: isRoot ? '#ffffff' : isLight ? '#64748b' : '#949ba4' }}
                  />
                ) : (
                  <ChevronDown
                    className="w-3.5 h-3.5"
                    style={{ color: isRoot ? '#ffffff' : isLight ? '#64748b' : '#949ba4' }}
                  />
                )}
              </span>
            )}

            <span className="leading-snug break-words max-w-[280px] sm:max-w-[420px] whitespace-pre-wrap">
              {node.text}
            </span>

            {/* 접혔을 때 하위 개수 표시 (Discord Blurple 뱃지) */}
            {hasChildren && isCollapsed && (
              <span
                className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(88, 101, 242, 0.15)',
                  color: isLight ? '#4752c4' : '#8b98ff',
                  border: '1px solid rgba(88, 101, 242, 0.3)',
                }}
              >
                +{node.children.length}
              </span>
            )}
          </div>
        </div>

        {/* 자식 노드 연결선 & 목록 */}
        {hasChildren && !isCollapsed && (
          <div
            className="relative pl-5 sm:pl-6 ml-1 space-y-1.5"
            style={{
              borderLeft: isLight
                ? '1.5px solid rgba(203, 213, 225, 0.8)'
                : '1.5px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {node.children.map((child, idx) =>
              renderNode(child, depth + 1, depth === 0 ? idx : branchColorIndex)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden my-5 transition-colors duration-200 border ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-[#2b2d31] border-white/[0.08] shadow-2xl'
      }`}
    >
      {/* Notion & Discord 스타일 상단 툴바 헤더 */}
      <div
        className={`px-4 py-3 flex items-center justify-between gap-3 border-b ${
          isLight
            ? 'bg-slate-50/90 border-slate-200'
            : 'bg-[#1e1f22] border-white/[0.08]'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(88, 101, 242, 0.15)',
              color: '#5865F2',
              border: '1px solid rgba(88, 101, 242, 0.3)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4
              className="text-xs sm:text-sm font-bold flex items-center space-x-1.5"
              style={{ color: isLight ? '#0f172a' : '#ffffff' }}
            >
              <span>🧠 마인드맵 개요 트리</span>
              <span
                className="text-[10px] font-normal hidden sm:inline"
                style={{ color: isLight ? '#64748b' : '#949ba4' }}
              >
                (본문의 핵심 구조와 계층 시각화)
              </span>
            </h4>
          </div>
        </div>

        {/* 컨트롤 버튼 그룹 */}
        <div className="flex items-center space-x-1">
          {/* 전체 접기/펼치기 */}
          <button
            type="button"
            onClick={handleToggleAll}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
            }`}
            title={allCollapsed ? '전체 펼치기' : '전체 접기'}
          >
            {allCollapsed ? (
              <>
                <ChevronsUpDown className="w-3 h-3 text-[#5865F2]" />
                <span className="text-[10px]">전체 펼치기</span>
              </>
            ) : (
              <>
                <ChevronsDownUp className="w-3 h-3 text-[#5865F2]" />
                <span className="text-[10px]">전체 접기</span>
              </>
            )}
          </button>

          <div
            className="h-3 w-[1px] mx-1"
            style={{
              backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            }}
          />

          {/* 줌 축소 */}
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
            className={`p-1.5 rounded-lg text-xs transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
            title="축소"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* 현재 배율 */}
          <span
            className="text-[10px] font-mono w-9 text-center font-semibold"
            style={{ color: isLight ? '#64748b' : '#949ba4' }}
          >
            {Math.round(zoom * 100)}%
          </span>

          {/* 줌 확대 */}
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
            className={`p-1.5 rounded-lg text-xs transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
            title="확대"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* 줌 초기화 */}
          <button
            type="button"
            onClick={() => setZoom(1)}
            className={`p-1.5 rounded-lg text-xs transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
            title="원래 크기(100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 캔버스 영역: Notion Warm White (Light) & Discord Chat Dark (Dark) */}
      <div
        className="p-5 sm:p-7 overflow-x-auto overflow-y-auto max-h-[540px] transition-colors"
        style={{
          backgroundColor: isLight ? '#fbfbfa' : '#313338',
        }}
      >
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
