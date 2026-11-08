'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FreeDoc } from '@/lib/wikiData'
import { getFreeDocs, saveFreeDoc, likeFreeDoc, deleteFreeDoc, hasLikedDoc, isMyDoc } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import MarkdownEditor from '@/components/MarkdownEditor'
import ReportModal from '@/components/ReportModal'
import { 
  BookOpen,
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  Sparkles, 
  Search, 
  Send,
  ExternalLink,
  X,
  Trash2,
  AlertTriangle,
  FileText,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react'

export default function FreeWikiPage() {
  const { user, isDeveloper } = useAuth()
  
  const [docs, setDocs] = useState<FreeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 1. 자유 위키 (상단) 상태
  const [wikiSearchQuery, setWikiSearchQuery] = useState('')

  // 2. 자유 게시판 (하단) 상태
  const [selectedBoardCat, setSelectedBoardCat] = useState('전체')
  const [boardSearchQuery, setBoardSearchQuery] = useState('')

  // 신고 모달 상태
  const [reportTarget, setReportTarget] = useState<{
    id: string
    type: 'wiki' | 'post'
    title: string
  } | null>(null)

  // 글/위키 작성 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'wiki' | 'post'>('wiki')
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [newCategory, setNewCategory] = useState('자유위키')
  const [newAuthor, setNewAuthor] = useState('')
  const [newContent, setNewContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user.role === 'player') {
      setNewAuthor(user.name)
    } else if (user.role === 'developer') {
      setNewAuthor('서버 개발자')
    }

    getFreeDocs().then(list => {
      setDocs(list)
      setLoading(false)
      const liked = new Set(list.map(d => d.id).filter(id => hasLikedDoc(id)))
      setLikedIds(liked)
    })
  }, [user])

  // 해시 체크 (#wiki, #board 스크롤)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      }
    }
  }, [])

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return
    const result = await likeFreeDoc(id)
    if (result.success) {
      setLikedIds(prev => new Set([...prev, id]))
      setDocs(prev => prev.map(d =>
        d.id === id
          ? { ...d, likes: result.newLikes !== undefined ? result.newLikes : d.likes + 1 }
          : d
      ))
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' 게시물을 삭제하시겠습니까?`)) return
    setDeletingId(id)
    try {
      const ok = await deleteFreeDoc(id)
      if (ok) {
        setDocs(prev => prev.filter(d => d.id !== id))
      }
    } catch (e) {
      console.error('삭제 오류:', e)
      alert('삭제 처리 중 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  // 모달 열기 헬퍼
  const openWriteModal = (mode: 'wiki' | 'post', presetTitle = '') => {
    setModalMode(mode)
    setNewTitle(presetTitle)
    setNewSubtitle('')
    setNewCategory(mode === 'wiki' ? '자유위키' : '잡담')
    setNewContent('')
    setShowModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    setIsSubmitting(true)
    const authorName = newAuthor.trim() || user.name || (modalMode === 'wiki' ? '위키 기여자' : '라비 유저')

    const created = await saveFreeDoc({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || undefined,
      category: modalMode === 'wiki' ? '자유위키' : newCategory,
      docType: modalMode === 'wiki' ? 'wiki' : 'post',
      author: authorName,
      updatedAt: '방금 전',
      likes: 1,
      content: newContent.trim()
    })

    setDocs(prev => [created, ...prev])
    setNewTitle('')
    setNewSubtitle('')
    setNewContent('')
    setIsSubmitting(false)
    setShowModal(false)
  }

  // 데이터 분리: 1. 자유위키 문서 목록 vs 2. 자유게시판 글 목록
  const wikiDocs = docs.filter(d => d.category === '자유위키' || d.docType === 'wiki')
  const boardDocs = docs.filter(d => d.category !== '자유위키' && d.docType !== 'wiki')

  // 자유위키 검색 필터링
  const filteredWikiDocs = wikiDocs.filter(d => {
    if (!wikiSearchQuery.trim()) return true
    const q = wikiSearchQuery.toLowerCase()
    return d.title.toLowerCase().includes(q) ||
           (d.subtitle && d.subtitle.toLowerCase().includes(q)) ||
           d.content.toLowerCase().includes(q)
  })

  // 자유게시판 카테고리 & 검색 필터링
  const filteredBoardDocs = boardDocs.filter(d => {
    const matchCat = selectedBoardCat === '전체' || d.category === selectedBoardCat
    const q = boardSearchQuery.toLowerCase()
    const matchQuery = !q ||
                       d.title.toLowerCase().includes(q) ||
                       (d.subtitle && d.subtitle.toLowerCase().includes(q)) ||
                       d.content.toLowerCase().includes(q) ||
                       d.author.toLowerCase().includes(q)
    return matchCat && matchQuery
  })

  // 검색창 입력 시 정확히 일치하는 위키 문서 존재 여부
  const exactWikiMatch = wikiDocs.some(
    d => d.title.trim().toLowerCase() === wikiSearchQuery.trim().toLowerCase()
  )

  return (
    <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-12">
        
        {/* ========================================================= */}
        {/* 1. 상단: 📖 라비 자유 위키 (나무위키 스타일 시스템)       */}
        {/* ========================================================= */}
        <section id="wiki" className="scroll-mt-24 space-y-6">
          
          {/* 자유 위키 메인 헤더 배너 */}
          <div className="glass-panel rounded-3xl p-6 sm:p-9 shadow-xl relative overflow-hidden border border-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>라비 위키 백과사전 · 누구나 자유롭게 생성 및 편집</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  📖 라비 자유 위키
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  나무위키처럼 라비서버의 직업, 스킬 트리, 장비 강화, 보스 공략, 던전 정보를 누구나 자유롭게 등재하고 검색할 수 있는 유저 참여형 지식 백과입니다.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => openWriteModal('wiki')}
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 위키 문서 만들기</span>
                </button>
              </div>
            </div>
          </div>

          {/* 🔍 나무위키 실시간 문서 검색바 */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl shadow-md border border-white/[0.08] space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="나무위키 문서 검색... (예: 전사 전직, 붉은용 레이드, 골드 수급처)"
                value={wikiSearchQuery}
                onChange={(e) => setWikiSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
              />
              {wikiSearchQuery && (
                <button
                  onClick={() => setWikiSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 나무위키 검색 결과 부재 시 문서 즉시 생성 유도 콜아웃 */}
            {wikiSearchQuery.trim() && !exactWikiMatch && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                <div className="flex items-center space-x-2 text-indigo-200">
                  <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>'{wikiSearchQuery.trim()}'</strong> 문서가 아직 없습니다. 직접 새 문서를 등재해보세요!
                  </span>
                </div>
                <button
                  onClick={() => openWriteModal('wiki', wikiSearchQuery.trim())}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>'{wikiSearchQuery.trim()}' 문서 생성</span>
                </button>
              </div>
            )}
          </div>

          {/* 위키 문서 그리드 목록 */}
          {loading ? (
            <div className="text-center py-16 text-zinc-500 text-xs">자유 위키 문서를 불러오는 중입니다...</div>
          ) : filteredWikiDocs.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/[0.08] text-zinc-400 text-xs space-y-3">
              <BookOpen className="w-8 h-8 text-indigo-400/60 mx-auto" />
              <p className="font-medium text-zinc-300">
                {wikiSearchQuery ? `'${wikiSearchQuery}' 검색 결과와 일치하는 위키 문서가 없습니다.` : '아직 등록된 자유 위키 문서가 없습니다.'}
              </p>
              <button
                onClick={() => openWriteModal('wiki', wikiSearchQuery.trim())}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>첫 번째 위키 문서 등재하기</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWikiDocs.map(doc => (
                <div
                  key={doc.id}
                  className="glass-panel glass-panel-hover p-5 rounded-2xl transition-all shadow-sm flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                        📖 자유위키
                      </span>
                      <span className="text-zinc-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{doc.updatedAt}</span>
                      </span>
                    </div>

                    <Link href={`/free-wiki/${doc.id}`} className="block">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition line-clamp-1">
                        {doc.title}
                      </h3>
                    </Link>

                    {doc.subtitle && (
                      <p className="text-xs text-indigo-300/90 font-medium line-clamp-1">
                        💡 {doc.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {doc.content.replace(/<[^>]+>/g, '').replace(/#+\s|[*_`>-]\s?|\n/g, ' ').trim()}
                    </p>
                  </div>

                  {/* 하단 메타 & 액션 버튼 */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-zinc-400 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-indigo-400" />
                        <span>{doc.author}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* 추천 버튼 */}
                      <button
                        onClick={() => handleLike(doc.id)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs transition ${
                          likedIds.has(doc.id)
                            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:text-white'
                        }`}
                        title="추천하기"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span className="font-mono text-[11px]">{doc.likes}</span>
                      </button>

                      {/* 🚨 신고 버튼 */}
                      <button
                        onClick={() => setReportTarget({ id: doc.id, type: 'wiki', title: doc.title })}
                        className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/20 hover:bg-rose-950/40 hover:border-rose-500/40 text-rose-400 hover:text-rose-200 transition"
                        title="부적절한 문서 신고"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>

                      {/* 삭제 버튼 (관리자 또는 본인) */}
                      {(isDeveloper || doc.author === user.name || isMyDoc(doc.id)) && (
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          disabled={deletingId === doc.id}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 transition"
                          title="문서 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 섹션 구분 라인 */}
        <div className="relative py-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]"></div>
          </div>
          <div className="relative px-4 bg-[#090a0f] text-xs font-semibold text-zinc-400 flex items-center space-x-2 rounded-full border border-white/[0.08] py-1 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>라비 유저 커뮤니티 공간</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. 하단: 💬 라비 자유 게시판 (Community Board)             */}
        {/* ========================================================= */}
        <section id="board" className="scroll-mt-24 space-y-6">
          
          {/* 자유 게시판 상단 헤더 */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-violet-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                  <span>실시간 유저 소통 게시판</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  💬 라비 자유 게시판
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                  인게임 잡담, 파티원 모집, 거래, 질문/답변을 자유롭게 나누는 게시판입니다.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => openWriteModal('post')}
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 게시글 작성</span>
                </button>
              </div>
            </div>
          </div>

          {/* 게시판 카테고리 필터 & 검색바 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0">
              {['전체', '잡담', '공략/팁', '질문/답변', '파티모집', '거래'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedBoardCat(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedBoardCat === cat
                      ? 'bg-violet-600 text-white shadow-sm font-bold'
                      : 'bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="게시글 검색..."
                value={boardSearchQuery}
                onChange={(e) => setBoardSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              />
            </div>
          </div>

          {/* 게시글 목록 */}
          {loading ? (
            <div className="text-center py-16 text-zinc-500 text-xs">게시글을 불러오는 중입니다...</div>
          ) : filteredBoardDocs.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/[0.08] text-zinc-400 text-xs space-y-3">
              <MessageSquare className="w-8 h-8 text-violet-400/60 mx-auto" />
              <p className="font-medium text-zinc-300">아직 등록된 게시글이 없습니다.</p>
              <button
                onClick={() => openWriteModal('post')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>첫 번째 게시글 작성하기</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBoardDocs.map(doc => (
                <div
                  key={doc.id}
                  className="glass-panel p-5 rounded-2xl transition shadow-sm hover:border-white/[0.15] space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">
                          {doc.category}
                        </span>
                        <span className="text-xs font-semibold text-zinc-200">
                          🎮 {doc.author}
                        </span>
                        <span className="text-[11px] text-zinc-500">• {doc.updatedAt}</span>
                      </div>

                      <Link href={`/free-wiki/${doc.id}`} className="group/title block">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover/title:text-violet-200 transition-colors">
                          {doc.title}
                        </h3>
                      </Link>

                      {doc.subtitle && (
                        <p className="text-xs text-indigo-300/90 font-medium line-clamp-1">
                          💡 {doc.subtitle}
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2">
                        {doc.content.replace(/<[^>]+>/g, '').replace(/#+\s|[*_`>-]\s?|\n/g, ' ').trim()}
                      </p>
                    </div>

                    {/* 추천 & 신고 & 삭제 버튼 */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleLike(doc.id)}
                        disabled={likedIds.has(doc.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition active:scale-95 ${
                          likedIds.has(doc.id)
                            ? 'bg-violet-600/20 border-violet-500/40 text-violet-300 cursor-default'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.05] text-zinc-400 hover:text-white'
                        }`}
                        title={likedIds.has(doc.id) ? '이미 추천한 게시글' : '추천하기'}
                      >
                        <ThumbsUp className="w-4 h-4 mb-1" />
                        <span className="text-xs font-bold font-mono">{doc.likes}</span>
                      </button>

                      {/* 🚨 신고 버튼 */}
                      <button
                        onClick={() => setReportTarget({ id: doc.id, type: 'post', title: doc.title })}
                        className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/25 hover:bg-rose-950/50 text-rose-400 hover:text-rose-200 transition"
                        title="게시글 신고하기"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>

                      {/* 삭제 버튼 */}
                      {(isDeveloper || doc.author === user.name || isMyDoc(doc.id)) && (
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          disabled={deletingId === doc.id}
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 transition"
                          title="게시글 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ========================================================= */}
      {/* 3. 모달: 새 자유 위키 문서 또는 게시글 작성                 */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl text-zinc-100 border border-white/[0.1] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                {modalMode === 'wiki' ? (
                  <>
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>새 자유 위키 문서 등재</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    <span>새 커뮤니티 게시글 작성</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {modalMode === 'wiki' ? '분류' : '카테고리'}
                  </label>
                  {modalMode === 'wiki' ? (
                    <input
                      type="text"
                      disabled
                      value="자유위키 (오픈 백과사전)"
                      className="w-full px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-semibold"
                    />
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e111a] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                    >
                      <option value="잡담">잡담</option>
                      <option value="공략/팁">공략/팁</option>
                      <option value="질문/답변">질문/답변</option>
                      <option value="파티모집">파티모집</option>
                      <option value="거래">거래</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">작성자 / 기여자 닉네임</label>
                  <input
                    type="text"
                    placeholder="인게임 닉네임"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {modalMode === 'wiki' ? '위키 문서 표제어 (제목) *' : '게시글 제목 *'}
                </label>
                <input
                  type="text"
                  placeholder={modalMode === 'wiki' ? '예: 흑마법사 전직 가이드, 붉은용 레이드' : '제목을 입력하세요...'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  부제목 / 한 줄 설명 (선택)
                </label>
                <input
                  type="text"
                  placeholder="문서 목록 카드에 표시될 핵심 요약 (선택 사항)"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">본문 내용 (마크다운 지원)</label>
                <MarkdownEditor
                  value={newContent}
                  onChange={setNewContent}
                  placeholder={modalMode === 'wiki' ? '위키 문서 내용을 자유롭게 작성하세요... (# 대제목, ## 소제목으로 작성 시 자동 목차가 생성됩니다)' : '게시글 내용을 작성하세요...'}
                  minHeight="240px"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] text-xs font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? '저장 중...' : modalMode === 'wiki' ? '위키 문서 등재' : '게시글 등록'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 신고 모달 */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          targetTitle={reportTarget.title}
        />
      )}
    </div>
  )
}
