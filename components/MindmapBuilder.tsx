'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Presentation,
  Lightbulb,
  Maximize2,
  Minimize2,
  Check,
  Copy,
  Layers,
  FileText,
  Palette,
  X
} from 'lucide-react'
import { useTheme } from '@/lib/theme'

export interface MindmapNode {
  id: string
  text: string
  color?: string
  children: MindmapNode[]
  collapsed?: boolean
  notes?: string
}

const COLOR_OPTIONS = [
  { name: '인디고', bg: 'bg-indigo-600', border: 'border-indigo-400', text: 'text-indigo-200', stroke: '#818cf8' },
  { name: '에메랄드', bg: 'bg-emerald-600', border: 'border-emerald-400', text: 'text-emerald-200', stroke: '#34d399' },
  { name: '앰버', bg: 'bg-amber-600', border: 'border-amber-400', text: 'text-amber-200', stroke: '#fbbf24' },
  { name: '로즈', bg: 'bg-rose-600', border: 'border-rose-400', text: 'text-rose-200', stroke: '#fb7185' },
  { name: '바이올렛', bg: 'bg-violet-600', border: 'border-violet-400', text: 'text-violet-200', stroke: '#a78bfa' },
  { name: '시안', bg: 'bg-cyan-600', border: 'border-cyan-400', text: 'text-cyan-200', stroke: '#22d3ee' }
]

// 기본 템플릿들
const TEMPLATES: { label: string; icon: any; data: MindmapNode }[] = [
  {
    label: '🎮 게임 공략 작성 템플릿',
    icon: BookOpen,
    data: {
      id: 'root-game',
      text: '라비서버 흑마법사 완벽 공략',
      color: '#818cf8',
      children: [
        {
          id: 'g-1',
          text: '1. 전직 및 스탯 분배',
          color: '#34d399',
          children: [
            { id: 'g-1-1', text: '레벨 50 달성 후 전직 퀘스트', children: [] },
            { id: 'g-1-2', text: '지능(INT) 70% + 민첩(DEX) 30% 배분', children: [] }
          ]
        },
        {
          id: 'g-2',
          text: '2. 핵심 스킬 트리',
          color: '#fbbf24',
          children: [
            { id: 'g-2-1', text: '다크 볼트 (주력 딜링 스킬, 마스터)', children: [] },
            { id: 'g-2-2', text: '칠흑의 장막 (방어 및 군중제어)', children: [] }
          ]
        },
        {
          id: 'g-3',
          text: '3. 추천 장비 & 세팅',
          color: '#a78bfa',
          children: [
            { id: 'g-3-1', text: '심연의 지팡이 (강화 +7 이상)', children: [] },
            { id: 'g-3-2', text: '마력 재생 마법 부여 룬', children: [] }
          ]
        },
        {
          id: 'g-4',
          text: '4. 레이드 던전 실전 팁',
          color: '#fb7185',
          children: [
            { id: 'g-4-1', text: '보스 광역기 시 장막으로 회피', children: [] },
            { id: 'g-4-2', text: '파티원 마나 버프 주기적 유지', children: [] }
          ]
        }
      ]
    }
  },
  {
    label: '📊 PPT 발표 구성 템플릿',
    icon: Presentation,
    data: {
      id: 'root-ppt',
      text: '라비위키 프로젝트 발표',
      color: '#fbbf24',
      children: [
        {
          id: 'p-1',
          text: '1. 서론 (배경 및 목적)',
          color: '#818cf8',
          children: [
            { id: 'p-1-1', text: '서버 유저 정보 공유의 필요성', children: [] },
            { id: 'p-1-2', text: '나무위키식 오픈 플랫폼 지향', children: [] }
          ]
        },
        {
          id: 'p-2',
          text: '2. 주요 기능 및 아키텍처',
          color: '#34d399',
          children: [
            { id: 'p-2-1', text: 'Next.js 14 + Tailwind CSS 기반 UI', children: [] },
            { id: 'p-2-2', text: 'Supabase 실시간 DB & 캐싱 동기화', children: [] },
            { id: 'p-2-3', text: '좋아요/싫어요 및 신고 시스템', children: [] }
          ]
        },
        {
          id: 'p-3',
          text: '3. 기대 효과 및 비전',
          color: '#22d3ee',
          children: [
            { id: 'p-3-1', text: '신규 유저 진입 장벽 대폭 완화', children: [] },
            { id: 'p-3-2', text: '유저 주도형 커뮤니티 생태계 조성', children: [] }
          ]
        }
      ]
    }
  },
  {
    label: '💡 자유 생각 정리 템플릿',
    icon: Lightbulb,
    data: {
      id: 'root-idea',
      text: '핵심 주제 / 아이디어',
      color: '#22d3ee',
      children: [
        {
          id: 'i-1',
          text: '첫 번째 생각 (배경)',
          color: '#818cf8',
          children: [
            { id: 'i-1-1', text: '세부 아이디어 A', children: [] },
            { id: 'i-1-2', text: '세부 아이디어 B', children: [] }
          ]
        },
        {
          id: 'i-2',
          text: '두 번째 생각 (해결책)',
          color: '#34d399',
          children: [
            { id: 'i-2-1', text: '실행 방안 1', children: [] }
          ]
        },
        {
          id: 'i-3',
          text: '세 번째 생각 (결론)',
          color: '#fbbf24',
          children: [
            { id: 'i-3-1', text: '최종 목표 및 액션 플랜', children: [] }
          ]
        }
      ]
    }
  }
]

// 마인드맵 노드를 마크다운 텍스트로 변환하는 함수
export function mindmapToMarkdown(node: MindmapNode, level = 1): string {
  let md = ''
  if (level === 1) {
    md += `# ${node.text}\n\n`
    if (node.notes) md += `> ${node.notes}\n\n`
    node.children.forEach(child => {
      md += mindmapToMarkdown(child, level + 1)
    })
  } else if (level === 2) {
    md += `## ${node.text}\n\n`
    if (node.notes) md += `${node.notes}\n\n`
    node.children.forEach(child => {
      md += mindmapToMarkdown(child, level + 1)
    })
  } else if (level === 3) {
    md += `### ${node.text}\n\n`
    if (node.notes) md += `${node.notes}\n\n`
    node.children.forEach(child => {
      md += mindmapToMarkdown(child, level + 1)
    })
  } else {
    const indent = '  '.repeat(level - 4)
    md += `${indent}- ${node.text}\n`
    if (node.notes) md += `${indent}  > ${node.notes}\n`
    node.children.forEach(child => {
      md += mindmapToMarkdown(child, level + 1)
    })
    if (level === 4) md += '\n'
  }
  return md
}

// 마크다운 텍스트를 마인드맵 노드로 파싱하는 함수
export function markdownToMindmap(markdown: string, fallbackIfEmpty = false): MindmapNode {
  // HTML 주석 제거 (<!--subtitle:...-->, <!--dislikes:...-->)
  const clean = (markdown || '').replace(/<!--[\s\S]*?-->/g, '').trim()
  const lines = clean.split('\n').filter(l => l.trim().length > 0)
  const root: MindmapNode = {
    id: 'root-' + Date.now(),
    text: '문서 개요',
    color: '#5865f2',
    children: []
  }

  let currentH2: MindmapNode | null = null
  let currentH3: MindmapNode | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    // H1
    if (trimmed.startsWith('# ')) {
      root.text = trimmed.replace(/^#\s+/, '')
      continue
    }

    // H2
    if (trimmed.startsWith('## ')) {
      const h2Node: MindmapNode = {
        id: 'node-' + Math.random().toString(36).substr(2, 9),
        text: trimmed.replace(/^##\s+/, ''),
        color: COLOR_OPTIONS[root.children.length % COLOR_OPTIONS.length].stroke,
        children: []
      }
      root.children.push(h2Node)
      currentH2 = h2Node
      currentH3 = null
      continue
    }

    // H3
    if (trimmed.startsWith('### ')) {
      const h3Node: MindmapNode = {
        id: 'node-' + Math.random().toString(36).substr(2, 9),
        text: trimmed.replace(/^###\s+/, ''),
        children: []
      }
      if (currentH2) {
        currentH2.children.push(h3Node)
      } else {
        root.children.push(h3Node)
      }
      currentH3 = h3Node
      continue
    }

    // H4
    if (trimmed.startsWith('#### ')) {
      const h4Node: MindmapNode = {
        id: 'node-' + Math.random().toString(36).substr(2, 9),
        text: trimmed.replace(/^####\s+/, ''),
        children: []
      }
      if (currentH3) {
        currentH3.children.push(h4Node)
      } else if (currentH2) {
        currentH2.children.push(h4Node)
      } else {
        root.children.push(h4Node)
      }
      continue
    }

    // List item (- or * or + or 1. or 1))
    if (/^[-*+]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      const listText = trimmed.replace(/^[-*+]\s+/, '').replace(/^\d+[.)]\s+/, '').trim()
      if (!listText) continue
      const listNode: MindmapNode = {
        id: 'node-' + Math.random().toString(36).substr(2, 9),
        text: listText,
        children: []
      }

      if (currentH3) {
        currentH3.children.push(listNode)
      } else if (currentH2) {
        currentH2.children.push(listNode)
      } else {
        root.children.push(listNode)
      }
    }
  }

  // fallbackIfEmpty가 true일 때만 기본 템플릿 하나 반환 (빌더 모달용)
  if (fallbackIfEmpty && root.children.length === 0) {
    root.children.push({
      id: 'sub-1',
      text: '주요 내용',
      color: '#5865f2',
      children: [
        { id: 'sub-1-1', text: '첫 번째 세부 사항', children: [] }
      ]
    })
  }

  return root
}

interface MindmapBuilderProps {
  initialMarkdown?: string
  onApplyMarkdown: (markdown: string) => void
  onClose: () => void
}

export default function MindmapBuilder({
  initialMarkdown = '',
  onApplyMarkdown,
  onClose
}: MindmapBuilderProps) {
  const [rootNode, setRootNode] = useState<MindmapNode>(() => {
    if (initialMarkdown.trim().length > 10) {
      return markdownToMindmap(initialMarkdown, true)
    }
    return TEMPLATES[0].data
  })

  const [selectedNodeId, setSelectedNodeId] = useState<string>(rootNode.id)
  const [copied, setCopied] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // 노드 재귀 탐색 및 수정 헬퍼
  const updateNode = (
    current: MindmapNode,
    targetId: string,
    updater: (node: MindmapNode) => MindmapNode | null
  ): MindmapNode | null => {
    if (current.id === targetId) {
      return updater(current)
    }
    const updatedChildren: MindmapNode[] = []
    for (const child of current.children) {
      const res = updateNode(child, targetId, updater)
      if (res !== null) {
        updatedChildren.push(res)
      }
    }
    return { ...current, children: updatedChildren }
  }

  // 자식 노드 추가
  const handleAddChild = (parentId: string) => {
    const newId = 'node-' + Math.random().toString(36).substr(2, 9)
    const newNode: MindmapNode = {
      id: newId,
      text: '새 하위 항목',
      children: []
    }
    setRootNode(prev => {
      const next = updateNode(prev, parentId, node => ({
        ...node,
        collapsed: false,
        children: [...node.children, newNode]
      }))
      return next || prev
    })
    setSelectedNodeId(newId)
  }

  // 형제 노드 추가 (부모의 자식으로)
  const handleAddSibling = (nodeId: string) => {
    if (nodeId === rootNode.id) {
      handleAddChild(nodeId)
      return
    }
    const newId = 'node-' + Math.random().toString(36).substr(2, 9)
    const newNode: MindmapNode = {
      id: newId,
      text: '새 항목',
      children: []
    }

    const insertSibling = (parent: MindmapNode): MindmapNode => {
      const idx = parent.children.findIndex(c => c.id === nodeId)
      if (idx !== -1) {
        const copy = [...parent.children]
        copy.splice(idx + 1, 0, newNode)
        return { ...parent, children: copy }
      }
      return {
        ...parent,
        children: parent.children.map(insertSibling)
      }
    }

    setRootNode(prev => insertSibling(prev))
    setSelectedNodeId(newId)
  }

  // 텍스트 수정
  const handleEditText = (nodeId: string, newText: string) => {
    setRootNode(prev => {
      const next = updateNode(prev, nodeId, node => ({
        ...node,
        text: newText
      }))
      return next || prev
    })
  }

  // 노드 삭제
  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === rootNode.id) {
      alert('최상위 중심 주제는 삭제할 수 없습니다.')
      return
    }
    setRootNode(prev => {
      const next = updateNode(prev, nodeId, () => null)
      return next || prev
    })
    setSelectedNodeId(rootNode.id)
  }

  // 노드 접기/펼치기
  const handleToggleCollapse = (nodeId: string) => {
    setRootNode(prev => {
      const next = updateNode(prev, nodeId, node => ({
        ...node,
        collapsed: !node.collapsed
      }))
      return next || prev
    })
  }

  // 색상 변경
  const handleChangeColor = (nodeId: string, color: string) => {
    setRootNode(prev => {
      const next = updateNode(prev, nodeId, node => ({
        ...node,
        color
      }))
      return next || prev
    })
  }

  // 현재 마크다운 실시간 미리보기
  const currentMarkdown = mindmapToMarkdown(rootNode)

  // 에디터에 적용
  const handleApply = () => {
    onApplyMarkdown(currentMarkdown)
    onClose()
  }

  // 마크다운 복사
  const handleCopy = () => {
    navigator.clipboard.writeText(currentMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 템플릿 적용
  const handleSelectTemplate = (tpl: MindmapNode) => {
    if (confirm('현재 작성 중인 마인드맵을 선택한 템플릿으로 교체하시겠습니까?')) {
      setRootNode(JSON.parse(JSON.stringify(tpl)))
      setSelectedNodeId(tpl.id)
    }
  }

  // 기존 텍스트 다시 불러오기
  const handleReimportFromMarkdown = () => {
    if (!initialMarkdown.trim()) {
      alert('불러올 기존 마크다운 본문이 없습니다.')
      return
    }
    if (confirm('현재 에디터의 마크다운 글을 분석하여 마인드맵으로 새로 변환하시겠습니까?')) {
      const parsed = markdownToMindmap(initialMarkdown, true)
      setRootNode(parsed)
      setSelectedNodeId(parsed.id)
    }
  }

  // 재귀적 노드 렌더러 — Notion & Discord 모던 스타일
  const renderNode = (node: MindmapNode, depth = 0, isLast = false) => {
    const isSelected = selectedNodeId === node.id
    const hasChildren = node.children.length > 0
    const isRoot = depth === 0
    const branchColor = node.color || '#5865F2'

    let nodeClass = ''
    const nodeStyle: React.CSSProperties = {}

    if (isRoot) {
      nodeClass =
        'px-5 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all border border-[#5865F2]/40'
      nodeStyle.backgroundColor = '#5865F2'
      nodeStyle.color = '#ffffff'
    } else if (depth === 1) {
      if (isLight) {
        nodeClass =
          'px-4 py-2 bg-white border border-slate-200/90 rounded-xl shadow-sm hover:shadow-md font-bold text-xs sm:text-sm transition-all'
        nodeStyle.color = '#0f172a'
      } else {
        nodeClass =
          'px-4 py-2 bg-[#2b2d31] border border-white/[0.08] rounded-xl hover:border-white/[0.18] font-bold text-xs sm:text-sm transition-all'
        nodeStyle.color = '#f2f3f5'
      }
      nodeStyle.borderLeft = `4px solid ${branchColor}`
    } else if (depth === 2) {
      if (isLight) {
        nodeClass =
          'px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg font-medium text-xs transition-all'
        nodeStyle.color = '#334155'
      } else {
        nodeClass =
          'px-3.5 py-1.5 bg-[#232428] border border-white/[0.06] rounded-lg font-medium text-xs transition-all'
        nodeStyle.color = '#dbdee1'
      }
      nodeStyle.borderLeft = `2.5px solid ${branchColor}`
    } else {
      if (isLight) {
        nodeClass = 'px-3 py-1 bg-white/70 border border-slate-200/60 rounded-md text-xs'
        nodeStyle.color = '#64748b'
      } else {
        nodeClass = 'px-3 py-1 bg-white/[0.03] border border-white/[0.04] rounded-md text-xs'
        nodeStyle.color = '#949ba4'
      }
    }

    return (
      <div key={node.id} className="relative flex items-start space-x-3 my-2.5">
        
        {/* 노드 카드 본체 */}
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`group/node relative rounded-xl transition-all duration-150 cursor-pointer shadow-sm ${nodeClass} ${
            isSelected
              ? 'ring-2 ring-[#5865F2] border-[#5865F2] shadow-[#5865F2]/20'
              : 'hover:scale-[1.01]'
          }`}
          style={nodeStyle}
        >
          <div className="flex items-center space-x-2">
            {/* 접기 / 펼치기 토글 */}
            {hasChildren && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  handleToggleCollapse(node.id)
                }}
                className="p-0.5 rounded text-zinc-400 hover:text-white"
              >
                {node.collapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[#5865F2]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>
            )}

            {/* 인라인 텍스트 입력창 */}
            <input
              type="text"
              value={node.text}
              onChange={e => handleEditText(node.id, e.target.value)}
              style={{ color: 'inherit' }}
              className="bg-transparent border-0 outline-none font-inherit min-w-[140px] max-w-[280px] focus:bg-black/10 dark:focus:bg-white/[0.08] rounded px-1"
              placeholder="항목 내용 입력..."
            />

            {/* 자식 개수 뱃지 */}
            {hasChildren && node.collapsed && (
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full"
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

          {/* 노드 호버 액션 툴바 */}
          <div className="absolute -right-2 -top-2.5 hidden group-hover/node:flex items-center space-x-1 bg-[#1a1e2e] border border-white/[0.15] rounded-full px-1.5 py-0.5 shadow-xl z-20">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                handleAddChild(node.id)
              }}
              title="하위 가지 추가 (Child)"
              className="p-1 hover:text-indigo-300 text-zinc-400 rounded-full"
            >
              <Plus className="w-3 h-3" />
            </button>
            {!isRoot && (
              <>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    handleAddSibling(node.id)
                  }}
                  title="같은 단계 가지 추가 (Sibling)"
                  className="p-1 hover:text-emerald-300 text-zinc-400 rounded-full text-[10px] font-bold"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                </button>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    handleDeleteNode(node.id)
                  }}
                  title="가지 삭제"
                  className="p-1 hover:text-rose-400 text-zinc-400 rounded-full"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 자식 노드들 (재귀 렌더링) */}
        {hasChildren && !node.collapsed && (
          <div className="relative pl-6 border-l-2 border-indigo-500/25 ml-2 space-y-2">
            {node.children.map((child, idx) =>
              renderNode(child, depth + 1, idx === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 ${fullscreen ? 'p-0' : ''}`}>
      <div
        className={`rounded-3xl w-full border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          fullscreen ? 'h-full rounded-none' : 'max-w-6xl max-h-[92vh] h-[850px]'
        } ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#1e1f22] border-white/[0.12] text-zinc-100'
        }`}
      >
        {/* 상단 헤더 */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#2b2d31] border-white/[0.08]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(88, 101, 242, 0.15)',
                color: '#5865F2',
                border: '1px solid rgba(88, 101, 242, 0.3)',
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                className="text-base sm:text-lg font-extrabold flex items-center space-x-2"
                style={{ color: isLight ? '#0f172a' : '#ffffff' }}
              >
                <span>🧠 마인드맵 글쓰기 빌더</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(88, 101, 242, 0.15)',
                    color: isLight ? '#4752c4' : '#8b98ff',
                    border: '1px solid rgba(88, 101, 242, 0.3)',
                  }}
                >
                  Visual Mindmap
                </span>
              </h2>
              <p
                className="text-xs"
                style={{ color: isLight ? '#64748b' : '#949ba4' }}
              >
                중심 주제에서 가지를 뻗어 생각을 정리하면, 서론-본론-결론이 갖춰진 마크다운 글로 자동 완성됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setFullscreen(v => !v)}
              className={`p-2 rounded-xl transition ${
                isLight
                  ? 'bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white'
              }`}
              title={fullscreen ? '창 모드로 복귀' : '전체화면'}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition ${
                isLight
                  ? 'bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 템플릿 & 도구 바 */}
        <div
          className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 flex-wrap text-xs ${
            isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-black/30 border-white/[0.06]'
          }`}
        >
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span
              className="text-[11px] font-bold mr-1 flex items-center space-x-1"
              style={{ color: isLight ? '#64748b' : '#949ba4' }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>템플릿:</span>
            </span>
            {TEMPLATES.map((tpl, i) => {
              const Icon = tpl.icon
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.data)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition whitespace-nowrap active:scale-95 ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
                      : 'bg-white/[0.04] hover:bg-[#5865F2]/20 hover:border-[#5865F2]/40 border-white/[0.08] text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>{tpl.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {initialMarkdown.trim().length > 0 && (
              <button
                type="button"
                onClick={handleReimportFromMarkdown}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-300'
                }`}
                title="기존 에디터 글에서 마인드맵 새로 생성"
              >
                <Upload className="w-3.5 h-3.5 text-[#23A55A]" />
                <span>글에서 불러오기</span>
              </button>
            )}
          </div>
        </div>

        {/* 메인 2단 작업 영역: [좌측: 시각적 마인드맵 트리] + [우측: 실시간 마크다운 변환 결과] */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          
          {/* [좌측]: 대화형 마인드맵 캔버스 영역 */}
          <div
            className="flex-1 min-h-0 p-5 sm:p-7 overflow-auto relative border-r transition-colors"
            style={{
              backgroundColor: isLight ? '#fbfbfa' : '#313338',
              borderColor: isLight ? 'rgba(226, 232, 240, 0.9)' : 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className="flex items-center space-x-2 text-xs font-semibold"
                style={{ color: isLight ? '#64748b' : '#949ba4' }}
              >
                <span>🎯 노드를 클릭하여 글자 수정, 호버 시 [+] 버튼으로 가지를 뻗을 수 있습니다.</span>
              </div>
              <button
                type="button"
                onClick={() => handleAddChild(selectedNodeId)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>선택 노드에 가지 추가</span>
              </button>
            </div>

            {/* 마인드맵 트리 렌더링 */}
            <div className="min-w-fit pb-12">
              {renderNode(rootNode)}
            </div>
          </div>

          {/* [우측]: 마크다운 실시간 변환 뷰어 */}
          <div
            className="w-full md:w-96 shrink-0 flex flex-col border-t md:border-t-0 transition-colors"
            style={{
              backgroundColor: isLight ? '#ffffff' : '#2b2d31',
              borderColor: isLight ? 'rgba(226, 232, 240, 0.9)' : 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              className={`p-3.5 border-b flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.07]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#5865F2]" />
                <span
                  className="text-xs font-bold"
                  style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                >
                  마크다운 본문 자동 생성
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] transition ${
                  isLight
                    ? 'bg-slate-200/70 hover:bg-slate-200 text-slate-700'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>
            </div>

            <div
              className="flex-1 p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap leading-relaxed select-text"
              style={{
                backgroundColor: isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)',
                color: isLight ? '#334155' : '#dbdee1',
              }}
            >
              {currentMarkdown}
            </div>

            {/* 적용 액션 버튼 */}
            <div
              className={`p-4 border-t space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.01] border-white/[0.08]'
              }`}
            >
              <button
                type="button"
                onClick={handleApply}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>이 마인드맵으로 글 완성하기 (에디터에 적용)</span>
              </button>
              <p
                className="text-[11px] text-center"
                style={{ color: isLight ? '#64748b' : '#949ba4' }}
              >
                클릭 시 작성 중인 글 에디터 본문에 마크다운으로 즉시 삽입됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

