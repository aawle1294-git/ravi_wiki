'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import WikiMarkdownRenderer from '@/components/WikiMarkdownRenderer'
import { useAuth } from '@/lib/auth'
import { OfficialDoc } from '@/lib/wikiData'
import { 
  PlusCircle, 
  ArrowLeft, 
  Eye, 
  Edit3, 
  Save, 
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react'

export default function NewOfficialDocPage() {
  const router = useRouter()
  const { isDeveloper } = useAuth()
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('기본 안내')
  const [icon, setIcon] = useState('📜')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState(`## 1. 개요\n여기에 공식 시스템 개요를 작성하세요.\n\n## 2. 상세 정보\n- 공식 정보 1\n- 공식 정보 2\n\n## 3. 유의사항\n> 반드시 지켜야 할 규칙이나 안내 사항입니다.`)
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9가-힣-]/g, '-')
        .replace(/-+/g, '-')
      setSlug(generated)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDeveloper) {
      alert('공식 문서는 개발자만 추가할 수 있습니다. 상단 로그인에서 ravi23control로 로그인해주세요.')
      return
    }

    if (!title.trim() || !slug.trim() || !content.trim()) return

    const finalSlug = slug.trim().toLowerCase()
    const newDoc: OfficialDoc = {
      slug: finalSlug,
      title: title.trim(),
      category,
      icon: icon.trim() || '📜',
      description: description.trim() || `${title} 공식 가이드 문서입니다.`,
      updatedAt: new Date().toISOString().split('T')[0],
      content: content.trim()
    }

    // Supabase 및 로컬에 영구 저장
    const { saveOfficialDoc } = await import('@/lib/db')
    await saveOfficialDoc(newDoc)

    alert('👑 새 공식 위키 문서가 성공적으로 등록되었습니다!')
    router.push(`/official/${finalSlug}`)
  }

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-20 text-center flex-1">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">개발자 전용 페이지</h2>
          <p className="text-xs text-slate-400 mb-6">
            공식 문서는 개발자만 추가할 수 있습니다.<br />
            상단 <strong>[로그인]</strong> 버튼 ➔ <strong>[개발자 로그인]</strong>에서 암호(<code className="text-purple-300">ravi23control</code>)를 입력해주세요.
          </p>
          <Link
            href="/official"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>공식 위키 목록으로</span>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <Link
            href="/official"
            className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400 hover:text-purple-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>공식 위키 목록으로</span>
          </Link>

          <span className="text-xs text-purple-300 bg-purple-950 border border-purple-500/40 px-3 py-1 rounded-full font-bold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>개발자 권한 활성화</span>
          </span>
        </div>

        <div className="bg-slate-900/60 border border-purple-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
            <PlusCircle className="w-6 h-6 text-purple-400" />
            <span>새 공식 위키 문서 등록</span>
          </h1>
          <p className="text-xs text-slate-400 mb-6">
            라비서버의 새로운 공식 패치, 시스템 안내, 규칙 문서를 작성합니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  문서 제목 *
                </label>
                <input
                  type="text"
                  placeholder="예: 신규 레이드 보스 가이드"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="기본 안내">기본 안내</option>
                  <option value="시스템 가이드">시스템 가이드</option>
                  <option value="패치노트">패치노트</option>
                  <option value="이벤트 안내">이벤트 안내</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  아이콘 (이모지)
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  문서 식별자 (Slug / URL 경로) *
                </label>
                <input
                  type="text"
                  placeholder="예: new-raid-guide"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                간단한 한 줄 설명
              </label>
              <input
                type="text"
                placeholder="목록에서 카드에 표시될 요약문"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 본문 에디터 & 탭 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  공식 문서 본문 (마크다운) *
                </label>
                <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('edit')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      previewTab === 'edit'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>편집</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('preview')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      previewTab === 'preview'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
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
                  className="w-full p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                />
              ) : (
                <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 min-h-[350px]">
                  <WikiMarkdownRenderer content={content} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                👑 등록 즉시 공식 위키 목록에 반영됩니다.
              </span>
              <div className="flex space-x-2">
                <Link
                  href="/official"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>공식 문서 등록</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

