'use client'

import React, { useRef, useState, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered, 
  Code, 
  Table, 
  Link2, 
  Minus, 
  Eye, 
  Edit3, 
  Columns2,
  Palette,
  Type,
  ChevronDown
} from 'lucide-react'
import WikiMarkdownRenderer from './WikiMarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  maxLength?: number
}

// 색상 팔레트
const COLOR_PALETTE = [
  { label: '기본 (흰색)', value: '#ffffff' },
  { label: '밝은 회색', value: '#a1a1aa' },
  { label: '빨강', value: '#f87171' },
  { label: '주황', value: '#fb923c' },
  { label: '노랑', value: '#fbbf24' },
  { label: '연두', value: '#a3e635' },
  { label: '초록', value: '#34d399' },
  { label: '하늘', value: '#38bdf8' },
  { label: '파랑', value: '#818cf8' },
  { label: '보라', value: '#c084fc' },
  { label: '분홍', value: '#f472b6' },
  { label: '금색', value: '#fcd34d' },
]

// 폰트 목록
const FONT_LIST = [
  { label: '기본 (Noto Sans)', value: 'Noto Sans KR' },
  { label: '나눔고딕', value: 'Nanum Gothic' },
  { label: '나눔명조 (세리프)', value: 'Nanum Myeongjo' },
  { label: '블랙한산스 (강조)', value: 'Black Han Sans' },
  { label: '주아 (귀여움)', value: 'Jua' },
  { label: '코드 (고정폭)', value: 'D2Coding, monospace' },
]

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운 형식으로 자유롭게 작성하세요...',
  minHeight = '360px',
  maxLength = 2000
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)

  // DB나 스토리지에서 넘어온 리터럴 \n 문자열이 있다면 실제 개행 문자로 정규화
  useEffect(() => {
    if (value && value.includes('\\n')) {
      onChange(value.replace(/\\n/g, '\n').replace(/\\r/g, ''))
    }
  }, [value, onChange])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setShowColorPicker(false)
        setShowFontPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 마크다운 문법 주입 헬퍼 함수
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const textToInsert = selectedText || defaultPlaceholder
    const replacement = `${prefix}${textToInsert}${suffix}`

    let newValue = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end)

    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength)
    }

    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = selectedText 
        ? start + replacement.length 
        : start + prefix.length
      const selectionEndPos = selectedText 
        ? start + replacement.length 
        : newCursorPos + defaultPlaceholder.length
      textarea.setSelectionRange(newCursorPos, selectionEndPos)
    }, 10)
  }

  // 색상 적용: <span style="color:...">텍스트</span>
  const applyColor = (color: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end) || '텍스트'
    insertFormatting(`<span style="color:${color}">`, '</span>', selectedText === '텍스트' ? '텍스트' : '')
    setShowColorPicker(false)
  }

  // 폰트 적용: <span style="font-family:...">텍스트</span>
  const applyFont = (font: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end) || '텍스트'
    insertFormatting(`<span style="font-family:'${font}'">`, '</span>', selectedText === '텍스트' ? '텍스트' : '')
    setShowFontPicker(false)
  }

  const insertTable = () => {
    const tableTemplate = 
`\n| 항목 | 내용 | 비고 |
| :--- | :--- | :--- |
| 예시 1 | 상세 설명 1 | - |
| 예시 2 | 상세 설명 2 | - |\n`
    insertFormatting(tableTemplate, '', '')
  }

  const insertCodeBlock = () => {
    insertFormatting('\n```\n', '\n```\n', '코드를 여기에 입력하세요')
  }

  return (
    <div className="w-full rounded-2xl border border-white/[0.1] bg-[#0c0e16] overflow-hidden shadow-xl flex flex-col">
      
      {/* 1. 상단 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:px-3 bg-white/[0.03] border-b border-white/[0.07] select-none">
        
        {/* 포맷팅 버튼 그룹 */}
        <div className="flex items-center flex-wrap gap-1">
          {/* 제목 */}
          <button type="button" onClick={() => insertFormatting('# ', '', '제목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="대제목 (H1)">
            <Heading1 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertFormatting('## ', '', '소제목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="중제목 (H2)">
            <Heading2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertFormatting('### ', '', '소단락')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="소제목 (H3)">
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/[0.1] mx-1" />

          {/* 굵기/기울임 */}
          <button type="button" onClick={() => insertFormatting('**', '**', '굵은 텍스트')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition font-bold" title="굵게 (Bold)">
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertFormatting('*', '*', '기울임꼴 텍스트')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition italic" title="기울임 (Italic)">
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/[0.1] mx-1" />

          {/* 색상 선택기 */}
          <div className="relative" data-dropdown>
            <button
              type="button"
              onClick={() => { setShowColorPicker(v => !v); setShowFontPicker(false) }}
              className="flex items-center gap-0.5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
              title="글자 색상"
            >
              <Palette className="w-4 h-4" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-[#13161f] border border-white/[0.12] rounded-2xl p-3 shadow-2xl min-w-[200px]">
                <p className="text-[10px] text-zinc-500 mb-2 font-semibold uppercase tracking-wider">글자 색상</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => applyColor(c.value)}
                      title={c.label}
                      className="w-6 h-6 rounded-lg border-2 border-white/[0.1] hover:border-white/50 hover:scale-110 transition-all"
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-zinc-600 mt-2">텍스트 선택 후 클릭하면 색상이 적용됩니다.</p>
              </div>
            )}
          </div>

          {/* 폰트 선택기 */}
          <div className="relative" data-dropdown>
            <button
              type="button"
              onClick={() => { setShowFontPicker(v => !v); setShowColorPicker(false) }}
              className="flex items-center gap-0.5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
              title="폰트 변경"
            >
              <Type className="w-4 h-4" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-[#13161f] border border-white/[0.12] rounded-2xl p-3 shadow-2xl min-w-[220px]">
                <p className="text-[10px] text-zinc-500 mb-2 font-semibold uppercase tracking-wider">폰트</p>
                <div className="flex flex-col gap-1">
                  {FONT_LIST.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => applyFont(f.value)}
                      className="text-left px-3 py-2 rounded-xl text-sm text-zinc-200 hover:bg-white/[0.08] hover:text-white transition"
                      style={{ fontFamily: f.value }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-600 mt-2">텍스트 선택 후 클릭하면 폰트가 적용됩니다.</p>
              </div>
            )}
          </div>

          <span className="w-px h-4 bg-white/[0.1] mx-1" />

          {/* 목록/인용 */}
          <button type="button" onClick={() => insertFormatting('> ', '', '인용 텍스트')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="인용문">
            <Quote className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertFormatting('- ', '', '목록 항목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="순서없는 목록">
            <List className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertFormatting('1. ', '', '목록 항목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="순서있는 목록">
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/[0.1] mx-1" />

          {/* 고급 */}
          <button type="button" onClick={insertTable}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="표(Table) 삽입">
            <Table className="w-4 h-4" />
          </button>
          <button type="button" onClick={insertCodeBlock}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="코드 블록">
            <Code className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertFormatting('[', '](https://mcravi.kr)', '링크 이름')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="링크 삽입">
            <Link2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertFormatting('\n---\n', '', '')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition" title="구분선 삽입">
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* 뷰 모드 전환 버튼 */}
        <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
          <button type="button" onClick={() => setViewMode('edit')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'edit' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}>
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">편집</span>
          </button>
          <button type="button" onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'split' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}>
            <Columns2 className="w-3.5 h-3.5" />
            <span>실시간 분할</span>
          </button>
          <button type="button" onClick={() => setViewMode('preview')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'preview' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}>
            <Eye className="w-3.5 h-3.5" />
            <span>미리보기</span>
          </button>
        </div>
      </div>

      {/* 2. 편집창 및 미리보기 영역 공간 */}
      <div className={`grid w-full ${viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]' : 'grid-cols-1'}`}>
        
        {/* 편집창 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="relative flex flex-col h-full">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                let text = e.target.value
                if (maxLength && text.length > maxLength) {
                  text = text.substring(0, maxLength)
                }
                onChange(text)
              }}
              maxLength={maxLength}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full h-full p-4 bg-transparent text-zinc-100 font-mono text-sm leading-relaxed resize-y focus:outline-none placeholder-zinc-500"
            />
          </div>
        )}

        {/* 실시간 마크다운 미리보기창 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div 
            style={{ minHeight }}
            className="p-5 bg-black/25 overflow-y-auto max-h-[600px]"
          >
            {value.trim() ? (
              <WikiMarkdownRenderer content={value} />
            ) : (
              <div className="text-zinc-600 text-xs italic py-10 text-center">
                왼쪽 에디터에 내용을 입력하면 실시간으로 미리보기 결과가 표시됩니다.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 하단 힌트 바 */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.02] border-t border-white/[0.06] text-[11px] text-zinc-500">
        <span className="truncate mr-2">🎨 색상/폰트/표/코드 블록 마크다운 서식 지원</span>
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`font-mono font-medium transition-colors ${
            value.length >= maxLength
              ? 'text-rose-400 font-bold'
              : value.length >= maxLength * 0.9
                ? 'text-amber-400'
                : 'text-zinc-400'
          }`}>
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}자
          </span>
          {value.length >= maxLength && (
            <span className="text-[10px] font-semibold text-rose-300 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-500/30">
              최대 글자수 도달
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
