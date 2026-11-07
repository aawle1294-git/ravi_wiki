'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import WikiMarkdownRenderer from '@/components/WikiMarkdownRenderer'
import { OfficialDoc } from '@/lib/wikiData'
import { useAuth } from '@/lib/auth'
import { 
  ArrowLeft, 
  Eye, 
  Edit3, 
  Save, 
  ShieldCheck,
  Lock
} from 'lucide-react'

export default function NewOfficialDocPage() {
  const router = useRouter()
  const { isDeveloper } = useAuth()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('시스템 가이드')
  const [icon, setIcon] = useState('📜')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState(`## 1. 개요\n여기에 공식 시스템 개요를 작성하세요.\n\n## 2. 상세 정보\n- 공식 정보 1\n- 공식 정보 2\n\n## 3. 유의사항\n> 반드시 지켜야 할 규칙이나 안내 사항입니다.`)
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setSlug(generated)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDeveloper) {
      alert('공식 문서는 개발자만 추가할 수 있습니다.')
      return
    }

    if (!title.trim() || !slug.trim() || !content.trim()) return

    setIsSubmitting(true)
    const finalSlug = slug.trim().toLowerCase()
    const newDoc: OfficialDoc = {
      slug: finalSlug,
      title: title.trim(),
      category,
      icon: icon || '📜',
      description: description.trim(),
      updatedAt: new Date().toISOString().split('T')[0],
      content: content.trim()
    }

    const { saveOfficialDoc } = await import('@/lib/db')
    await saveOfficialDoc(newDoc)

    setIsSubmitting(false)
    router.push(`/official/${finalSlug}`)
  }

  if (!isDeveloper) {
    return (
      <div className="min-h-screen flex flex-col text-zinc-100">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-24 text-center flex-1">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">개발자 전용 페이지</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            공식 문서는 개발자만 추가할 수 있습니다.<br />
            상단 <strong>[로그인]</strong> ➔ <strong>[개발자 로그인]</strong>에서 암호(<code className="text-indigo-300">ravi23control</code>)를 입력해주세요.
          </p>
          <Link
            href="/official"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-zinc-300 font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>공식 위키 목록으로</span>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-zinc-100">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.07]">
          <Link
            href="/official"
            className="flex items-center space-x-2 text-xs text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>공식 가이드 목록으로</span>
          </Link>

          <span className="text-xs text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>개발자 권한 인증됨</span>
          </span>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-9 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">새 공식 문서 작성</h1>
            <p className="text-xs text-zinc-400 mt-1">
              개발진 공식 가이드 문서를 새로 생성합니다. 작성 즉시 공식 위키 목록에 반영됩니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 기본 메타데이터 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  문서 제목 *
                </label>
                <input
                  type="text"
                  placeholder="예: 초보자 정착 가이드"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  URL 슬러그 (영문/숫자/-) *
                </label>
                <input
                  type="text"
                  placeholder="beginner-guide"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  카테고리 *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e111a] border border-white/[0.1] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                >
                  <option value="기본 안내">기본 안내</option>
                  <option value="시스템 가이드">시스템 가이드</option>
                  <option value="직업 & 스킬">직업 & 스킬</option>
                  <option value="장비 & 강화">장비 & 강화</option>
                  <option value="던전 & 레이드">던전 & 레이드</option>
                  <option value="서버 규칙">서버 규칙</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  대표 아이콘 (이모지)
                </label>
                <input
                  type="text"
                  placeholder="📜"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  한 줄 요약
                </label>
                <input
                  type="text"
                  placeholder="문서 목록 카드에 표시될 간단한 설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>
            </div>

            {/* 본문 에디터 & 미리보기 탭 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300">
                  공식 문서 본문 (마크다운) *
                </label>
                <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('edit')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      previewTab === 'edit'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>작성</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('preview')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      previewTab === 'preview'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>미리보기</span>
                  </button>
                </div>
              </div>

              {previewTab === 'edit' ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  required
                  className="w-full p-4 rounded-2xl bg-black/40 border border-white/[0.1] text-zinc-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-y"
                />
              ) : (
                <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.08] min-h-[350px]">
                  <WikiMarkdownRenderer content={content} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <span className="text-xs text-zinc-500">
                👑 등록 즉시 공식 위키 목록에 반영됩니다.
              </span>
              <div className="flex space-x-2">
                <Link
                  href="/official"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 text-xs font-semibold"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? '등록 중...' : '공식 문서 등록'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
