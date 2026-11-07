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
  Columns2
} from 'lucide-react'
import WikiMarkdownRenderer from './WikiMarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운 형식으로 자유롭게 작성하세요...',
  minHeight = '360px'
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split')

  // DB나 스토리지에서 넘어온 리터럴 \n 문자열이 있다면 실제 개행 문자로 정규화
  useEffect(() => {
    if (value && value.includes('\\n')) {
      onChange(value.replace(/\\n/g, '\n').replace(/\\r/g, ''))
    }
  }, [value, onChange])

  // 마크다운 문법 주입 헬퍼 함수
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const textToInsert = selectedText || defaultPlaceholder
    const replacement = `${prefix}${textToInsert}${suffix}`

    const newValue = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end)

    onChange(newValue)

    // 커서 위치 재조정
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

  // 자주 쓰이는 템플릿 삽입
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
          <button
            type="button"
            onClick={() => insertFormatting('# ', '', '제목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="대제목 (H1)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ', '', '소제목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="중제목 (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ', '', '소단락')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="소제목 (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/[0.1] mx-1"></span>

          <button
            type="button"
            onClick={() => insertFormatting('**', '**', '굵은 텍스트')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition font-bold"
            title="굵게 (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', '기울임 텍스트')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition italic"
            title="기울임 (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/[0.1] mx-1"></span>

          <button
            type="button"
            onClick={() => insertFormatting('> ', '', '강조할 안내 문구')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="인용구 (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ', '', '목록 항목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="불릿 목록 (List)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('1. ', '', '순서 항목')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="번호 목록 (Ordered List)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-white/[0.1] mx-1"></span>

          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="표(Table) 삽입"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertCodeBlock}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="코드 블록"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('[', '](https://mcravi.kr)', '링크 이름')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="링크 삽입"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n---\n', '', '')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
            title="구분선 삽입"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* 뷰 모드 전환 버튼 (편집 / 분할 / 미리보기) */}
        <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'edit'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">편집</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>실시간 분할</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'preview'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>미리보기</span>
          </button>
        </div>
      </div>

      {/* 2. 에디터 및 미리보기 본문 영역 */}
      <div className={`grid w-full ${viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]' : 'grid-cols-1'}`}>
        
        {/* 편집창 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="relative flex flex-col h-full">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
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
                상단 툴바를 누르거나 마크다운을 입력하면 실시간으로 렌더링 결과가 표시됩니다.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 하단 도움말 바 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.02] border-t border-white/[0.06] text-[11px] text-zinc-500">
        <span>💡 글자 선택 후 툴바 버튼을 누르면 해당 텍스트에 마크다운이 자동 적용됩니다.</span>
        <span className="font-mono">{value.length}자</span>
      </div>
    </div>
  )
}

