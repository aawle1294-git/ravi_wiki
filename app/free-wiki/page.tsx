'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { FreeDoc } from '@/lib/wikiData'
import {
  getFreeDocs,
  saveFreeDoc,
  likeFreeDoc,
  deleteFreeDoc,
  updateFreeDoc,
  getFreeDocComments,
  addFreeDocComment,
  deleteFreeDocComment,
  hasLikedDoc,
  isMyDoc,
  FreeDocComment
} from '@/lib/db'
import { useAuth } from '@/lib/auth'
import MarkdownEditor from '@/components/MarkdownEditor'
import WikiMarkdownRenderer from '@/components/WikiMarkdownRenderer'
import ReportModal from '@/components/ReportModal'
import {
  BookOpen,
  MessageSquare,
  Plus,
  ThumbsUp,
  Search,
  Send,
  X,
  Trash2,
  AlertTriangle,
  Clock,
  User,
  ArrowRight,
  Compass,
  ChevronRight,
  TrendingUp,
  Edit3,
  FileText,
  List,
  Save,
  Share2,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react'

interface TocItem {
  id: string
  level: number
  text: string
}

function extractToc(markdown: string): TocItem[] {
  const lines = (markdown || '').split('\n')
  const items: TocItem[] = []
  lines.forEach(line => {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`#]/g, '').trim()
      const id = text.toLowerCase().replace(/[^\w\uAC00-\uD7A3]+/g, '-')
      items.push({ id, level, text })
    }
  })
  return items
}

export default function FreeWikiPage() {
  const { user, isDeveloper } = useAuth()
  const router = useRouter()

  const [docs, setDocs] = useState<FreeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 1. 위키 활성 문서 상태 (중앙 메인에 크게 보일 위키)
  const [activeWikiId, setActiveWikiId] = useState<string | null>(null)
  const [wikiComments, setWikiComments] = useState<FreeDocComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [showToc, setShowToc] = useState(true)
  const [copied, setCopied] = useState(false)

  // 위키 인라인 편집 상태
  const [isEditingWiki, setIsEditingWiki] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isSavingWiki, setIsSavingWiki] = useState(false)

  // 위키 상단 검색 상태
  const [topSearchQuery, setTopSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 우측 사이드바 필터 검색
  const [sidebarFilter, setSidebarFilter] = useState('')

  // 2. 자유 게시판 (하단) 상태
  const [selectedBoardCat, setSelectedBoardCat] = useState('전체')
  const [boardSearchQuery, setBoardSearchQuery] = useState('')

  // 신고 모달 상태
  const [reportTarget, setReportTarget] = useState<{
    id: string
    type: 'wiki' | 'post'
    title: string
  } | null>(null)

  // 작성 모달 (새 위키 문서 / 새 게시글 작성)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'wiki' | 'post'>('wiki')
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [newCategory, setNewCategory] = useState('자유위키')
  const [newAuthor, setNewAuthor] = useState('')
  const [newContent, setNewContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 데이터 로드
  useEffect(() => {
    if (user.role === 'player') {
      setNewAuthor(user.name)
      setCommentAuthor(user.name)
    } else if (user.role === 'developer') {
      setNewAuthor('서버 개발자')
      setCommentAuthor('서버 개발자')
    }

    getFreeDocs().then(list => {
      setDocs(list)
      setLoading(false)
      const liked = new Set(list.map(d => d.id).filter(id => hasLikedDoc(id)))
      setLikedIds(liked)

      // URL query id 확인 또는 첫 번째 위키 문서 자동 선택
      const wikiList = list.filter(d => d.category === '자유위키' || d.docType === 'wiki')
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const targetId = params.get('id') || params.get('wiki')
        if (targetId && wikiList.some(d => d.id === targetId)) {
          setActiveWikiId(targetId)
        } else if (wikiList.length > 0) {
          setActiveWikiId(wikiList[0].id)
        }
      } else if (wikiList.length > 0) {
        setActiveWikiId(wikiList[0].id)
      }
    })
  }, [user])

  // 활성 위키 댓글 로드
  useEffect(() => {
    if (activeWikiId) {
      getFreeDocComments(activeWikiId).then(c => {
        setWikiComments(c)
      })
      // 수정 모드 초기화
      setIsEditingWiki(false)
    }
  }, [activeWikiId])

  // 해시 스크롤 (#wiki, #board)
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

  // 외부 클릭 시 검색 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 활성 위키 문서 선택 헬퍼
  const selectWikiDoc = (id: string) => {
    setActiveWikiId(id)
    setShowDropdown(false)
    setTopSearchQuery('')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('id', id)
      window.history.replaceState(null, '', url.toString())
    }
    // 상단 위키 본문으로 부드럽게 스크롤
    const wikiSection = document.getElementById('wiki')
    if (wikiSection) {
      wikiSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 추천 핸들러
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

  // 삭제 핸들러
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' 문서를 삭제하시겠습니까?`)) return
    setDeletingId(id)
    try {
      const ok = await deleteFreeDoc(id)
      if (ok) {
        setDocs(prev => {
          const next = prev.filter(d => d.id !== id)
          // 만약 현재 보고 있던 위키가 삭제되었으면 다음 위키 선택
          if (activeWikiId === id) {
            const nextWiki = next.find(d => d.category === '자유위키' || d.docType === 'wiki')
            setActiveWikiId(nextWiki ? nextWiki.id : null)
          }
          return next
        })
      }
    } catch (e) {
      console.error('삭제 오류:', e)
      alert('삭제 처리 중 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  // 위키 인라인 편집 시작
  const startEditWiki = (doc: FreeDoc) => {
    setEditTitle(doc.title)
    setEditSubtitle(doc.subtitle || '')
    setEditContent(doc.content)
    setIsEditingWiki(true)
  }

  // 위키 인라인 편집 저장
  const handleSaveWikiEdit = async () => {
    if (!activeDoc || !editTitle.trim() || !editContent.trim()) return
    setIsSavingWiki(true)
    const ok = await updateFreeDoc(activeDoc.id, {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || undefined,
      category: '자유위키',
      content: editContent.trim()
    })
    if (ok) {
      setDocs(prev => prev.map(d =>
        d.id === activeDoc.id
          ? {
              ...d,
              title: editTitle.trim(),
              subtitle: editSubtitle.trim() || undefined,
              content: editContent.trim(),
              updatedAt: '방금 전 (수정됨)'
            }
          : d
      ))
      setIsEditingWiki(false)
    } else {
      alert('위키 수정 저장 중 오류가 발생했습니다.')
    }
    setIsSavingWiki(false)
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

  // 새 글/위키 작성 제출
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
    if (modalMode === 'wiki') {
      setActiveWikiId(created.id)
    }
    setNewTitle('')
    setNewSubtitle('')
    setNewContent('')
    setIsSubmitting(false)
    setShowModal(false)
  }

  // 위키 댓글 추가
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !activeWikiId) return

    const author = commentAuthor.trim() || user.name || '위키 독자'
    const added = await addFreeDocComment(activeWikiId, author, newComment.trim())
    setWikiComments(prev => [added, ...prev])
    setNewComment('')
  }

  // 위키 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    if (!activeWikiId) return
    await deleteFreeDocComment(activeWikiId, commentId)
    setWikiComments(prev => prev.filter(c => c.id !== commentId))
  }

  // 공유 버튼
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 데이터 분리
  const wikiDocs = docs.filter(d => d.category === '자유위키' || d.docType === 'wiki')
  const boardDocs = docs.filter(d => d.category !== '자유위키' && d.docType !== 'wiki')

  // 현재 활성 위키 문서
  const activeDoc = wikiDocs.find(d => d.id === activeWikiId) || wikiDocs[0] || null

  // 상단 나무위키 검색어 매칭 목록
  const searchMatches = wikiDocs.filter(d => {
    if (!topSearchQuery.trim()) return false
    const q = topSearchQuery.toLowerCase()
    return d.title.toLowerCase().includes(q) ||
           (d.subtitle && d.subtitle.toLowerCase().includes(q))
  })

  // 검색어와 정확히 일치하는 문서가 있는지 확인
  const exactSearchMatch = wikiDocs.find(
    d => d.title.trim().toLowerCase() === topSearchQuery.trim().toLowerCase()
  )

  // 엔터 키 검색 이벤트
  const handleTopSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topSearchQuery.trim()) {
      if (exactSearchMatch) {
        selectWikiDoc(exactSearchMatch.id)
      } else if (searchMatches.length > 0) {
        selectWikiDoc(searchMatches[0].id)
      } else {
        openWriteModal('wiki', topSearchQuery.trim())
      }
    }
  }

  // 우측 사이드바 필터된 위키 목록
  const sidebarWikiDocs = wikiDocs.filter(d => {
    if (!sidebarFilter.trim()) return true
    const q = sidebarFilter.toLowerCase()
    return d.title.toLowerCase().includes(q) || (d.subtitle && d.subtitle.toLowerCase().includes(q))
  })

  // 자유게시판 필터링
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

  // 목차 추출
  const toc = activeDoc ? extractToc(activeDoc.content) : []

  return (
    <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-9 flex-1 space-y-14">

        {/* ============================================================ */}
        {/* 1. 상단: 📖 라비 자유 위키 (나무위키 스타일 시스템)            */}
        {/* ============================================================ */}
        <section id="wiki" className="scroll-mt-20 space-y-5">

          {/* 🔍 나무위키 스타일 상단 헤더 & 검색바 (위키 본문 바로 위) */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-indigo-500/20 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                      📖 라비 자유 위키
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      오픈 백과
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    나무위키처럼 누구나 자유롭게 검색하고 문서를 보완·등재할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => openWriteModal('wiki')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 문서 등재</span>
                </button>
              </div>
            </div>

            {/* 나무위키 검색창 (실시간 자동완성 + 드롭다운) */}
            <div ref={searchRef} className="relative mt-2">
              <div className="relative">
                <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="나무위키 문서 검색... (예: 전사 전직, 붉은용 레이드, 골드 수급처)"
                  value={topSearchQuery}
                  onChange={e => {
                    setTopSearchQuery(e.target.value)
                    setShowDropdown(e.target.value.trim().length > 0)
                  }}
                  onKeyDown={handleTopSearchKeyDown}
                  onFocus={() => topSearchQuery.trim() && setShowDropdown(true)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.12] text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 transition shadow-inner"
                />
                {topSearchQuery && (
                  <button
                    onClick={() => { setTopSearchQuery(''); setShowDropdown(false) }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 실시간 드롭다운 검색 결과 */}
              {showDropdown && topSearchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl border border-white/[0.12] bg-[#0c0e17]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  {searchMatches.length > 0 && (
                    <ul>
                      {searchMatches.slice(0, 7).map(doc => (
                        <li key={doc.id}>
                          <button
                            type="button"
                            onClick={() => selectWikiDoc(doc.id)}
                            className="w-full text-left flex items-center justify-between px-4 py-3 hover:bg-indigo-500/15 transition group border-b border-white/[0.05] last:border-0"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white group-hover:text-indigo-200 transition truncate">
                                  {doc.title}
                                </p>
                                {doc.subtitle && (
                                  <p className="text-xs text-zinc-400 truncate">{doc.subtitle}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-zinc-500 group-hover:text-indigo-300 shrink-0 font-mono">
                              열람하기 →
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* 일치하는 문서가 없을 때 즉시 생성 제안 */}
                  {!exactSearchMatch && (
                    <div className="p-3.5 bg-indigo-950/40 border-t border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-2 text-xs text-indigo-300">
                        <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>
                          <strong>'{topSearchQuery.trim()}'</strong> 문서가 아직 없습니다. 직접 새 문서를 등재해보세요!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false)
                          openWriteModal('wiki', topSearchQuery.trim())
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>'{topSearchQuery.trim()}' 문서 생성</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 🌟 2단 메인 레이아웃: [중앙 거대 위키 본문 뷰어 (flex-1)] + [우측 위키 목록 사이드바 (w-80)] */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── [좌측 메인]: 거대 위키 문서 본문 (나무위키 스타일 뷰어) ── */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              
              {loading ? (
                <div className="glass-panel p-12 rounded-3xl text-center text-zinc-500 text-xs">
                  자유 위키 문서를 불러오는 중입니다...
                </div>
              ) : activeDoc ? (
                /* 위키 본문 카드 */
                <article className="glass-panel p-6 sm:p-9 rounded-3xl shadow-xl border border-white/[0.08] relative">
                  
                  {isEditingWiki ? (
                    /* ✏️ 인라인 위키 편집 모드 */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div className="flex items-center space-x-2">
                          <Edit3 className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-base font-bold text-white">
                            '{activeDoc.title}' 문서 편집 (자유 기여)
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setIsEditingWiki(false)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] text-xs font-semibold"
                          >
                            취소
                          </button>
                          <button
                            onClick={handleSaveWikiEdit}
                            disabled={isSavingWiki}
                            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSavingWiki ? '저장 중...' : '저장 완료'}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          문서 표제어 (제목)
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          부제목 / 한 줄 요약 (선택)
                        </label>
                        <input
                          type="text"
                          value={editSubtitle}
                          onChange={e => setEditSubtitle(e.target.value)}
                          placeholder="문서의 핵심 요약 설명"
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          문서 본문 (# 대제목, ## 소제목으로 작성 시 목차가 자동 생성됩니다)
                        </label>
                        <MarkdownEditor
                          value={editContent}
                          onChange={setEditContent}
                          placeholder="위키 본문을 작성하세요..."
                          minHeight="380px"
                        />
                      </div>
                    </div>
                  ) : (
                    /* 📖 위키 문서 열람 모드 */
                    <>
                      {/* 문서 상단 도구 바 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07] mb-5">
                        <div className="flex items-center space-x-2 text-xs text-zinc-400">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px]">
                            📖 자유위키 문서
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-indigo-400" />
                            <span>{activeDoc.author}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1 text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span>{activeDoc.updatedAt}</span>
                          </span>
                        </div>

                        {/* 문서 액션 버튼들 */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {/* ✏️ 편집 버튼: 나무위키처럼 누구나 자유롭게 기여 가능 */}
                          <button
                            onClick={() => startEditWiki(activeDoc)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold transition active:scale-95"
                            title="나무위키처럼 누구나 문서를 보완하고 편집할 수 있습니다."
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>문서 편집</span>
                          </button>

                          {/* 🚨 신고 버튼 */}
                          <button
                            onClick={() => setReportTarget({ id: activeDoc.id, type: 'wiki', title: activeDoc.title })}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-950/20 border border-rose-500/25 hover:bg-rose-950/40 text-rose-400 text-xs font-medium transition active:scale-95"
                            title="부적절한 내용 신고"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>신고</span>
                          </button>

                          {/* 삭제 버튼: 관리자 또는 작성자 */}
                          {(isDeveloper || activeDoc.author === user.name || isMyDoc(activeDoc.id)) && (
                            <button
                              onClick={() => handleDelete(activeDoc.id, activeDoc.title)}
                              disabled={deletingId === activeDoc.id}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 text-xs font-medium transition active:scale-95"
                              title="문서 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>삭제</span>
                            </button>
                          )}

                          {/* 공유 버튼 */}
                          <button
                            onClick={handleShare}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] text-zinc-300 text-xs font-medium transition active:scale-95"
                            title="URL 복사"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{copied ? '복사됨' : '공유'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 표제어 (H1) */}
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                        {activeDoc.title}
                      </h1>

                      {/* 부제목 */}
                      {activeDoc.subtitle && (
                        <div className="mb-6">
                          <p className="text-xs sm:text-sm text-indigo-300/90 font-medium leading-relaxed bg-indigo-500/10 border-l-2 border-indigo-500/60 px-3.5 py-2 rounded-r-xl">
                            💡 {activeDoc.subtitle}
                          </p>
                        </div>
                      )}

                      {/* 📑 나무위키 스타일 목차 (TOC) 박스 */}
                      {toc.length > 0 && (
                        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] max-w-sm">
                          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/[0.06]">
                            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                              <List className="w-3.5 h-3.5 text-indigo-400" />
                              <span>목차</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowToc(v => !v)}
                              className="text-[10px] text-zinc-400 hover:text-white"
                            >
                              {showToc ? '[접기]' : '[펼치기]'}
                            </button>
                          </div>
                          {showToc && (
                            <ol className="space-y-1 text-xs text-zinc-300">
                              {toc.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                                  className="hover:text-indigo-300 transition"
                                >
                                  <span className="font-mono text-indigo-400 font-semibold mr-1.5">{idx + 1}.</span>
                                  <span>{item.text}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      )}

                      {/* 본문 마크다운 렌더링 */}
                      <div className="pb-8 border-b border-white/[0.07] min-h-[160px]">
                        <WikiMarkdownRenderer content={activeDoc.content} />
                      </div>

                      {/* 추천 버튼 */}
                      <div className="pt-6 flex items-center justify-center">
                        <button
                          onClick={() => handleLike(activeDoc.id)}
                          disabled={likedIds.has(activeDoc.id)}
                          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full border transition shadow-sm active:scale-95 ${
                            likedIds.has(activeDoc.id)
                              ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 cursor-default'
                              : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-white/[0.18] hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs font-bold font-mono">
                            {likedIds.has(activeDoc.id) ? '추천됨' : '문서 추천'} {activeDoc.likes}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ) : (
                /* 위키 문서가 아예 없을 때의 환영/안내 대문 (나무위키 대문 스타일) */
                <article className="glass-panel p-6 sm:p-10 rounded-3xl shadow-xl border border-white/[0.08] space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
                    <div className="flex items-center space-x-2 text-xs text-zinc-400">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px]">
                        📖 대문
                      </span>
                      <span>•</span>
                      <span className="text-zinc-400">라비 자유 위키 포털</span>
                    </div>
                    <button
                      onClick={() => openWriteModal('wiki')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>새 위키 문서 등재</span>
                    </button>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                      라비 자유 위키: 대문
                    </h1>
                    <p className="text-xs sm:text-sm text-indigo-300/90 font-medium leading-relaxed bg-indigo-500/10 border-l-2 border-indigo-500/60 px-4 py-2.5 rounded-r-xl">
                      💡 라비서버 유저라면 누구나 자유롭게 지식을 등재하고 편집할 수 있는 오픈 백과사전입니다.
                    </p>
                  </div>

                  {/* 안내 카드 그리드 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                        <span>🗡️</span>
                        <span>직업 & 스킬 트리 공략</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        전사, 마법사, 궁수, 도적 등 직업별 스텟 분배와 추천 스킬 콤보를 문서로 작성해보세요.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <div className="flex items-center space-x-2 text-violet-300 font-bold text-xs">
                        <span>🐉</span>
                        <span>레이드 & 보스 공략</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        필드 보스와 레이드 던전의 핵심 패턴, 안전 구역, 드랍 아이템 정보를 기록하세요.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                        <span>💎</span>
                        <span>장비 파밍 & 경제 가이드</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        골드 수급처, 광물 채집지, 장비 강화 확률 및 재료 획득 팁을 유저들과 공유하세요.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                        <span>🗺️</span>
                        <span>초보자 던전 길잡이</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        서버에 새로 합류한 뉴비들을 위한 레벨업 동선과 필수 퀘스트 가이드를 작성하세요.
                      </p>
                    </div>
                  </div>

                  {/* 새 문서 작성 유도 바 */}
                  <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>직접 알고 있는 정보를 첫 문서로 등재해보세요!</span>
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        제목과 내용만 입력하면 마크다운 서식으로 즉시 위키 문서가 생성됩니다.
                      </p>
                    </div>
                    <button
                      onClick={() => openWriteModal('wiki')}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>첫 위키 문서 등재하기</span>
                    </button>
                  </div>
                </article>
              )}

              {/* 💬 위키 토론 & 독자 의견/댓글 섹션 */}
              {activeDoc && !isEditingWiki && (
                <section className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold text-white">
                        '{activeDoc.title}' 문서 의견 및 보완 요청
                      </h3>
                      <span className="text-[11px] bg-white/[0.04] text-zinc-300 px-2 py-0.5 rounded-full border border-white/[0.08] font-mono">
                        {wikiComments.length}
                      </span>
                    </div>
                  </div>

                  {/* 댓글 작성 폼 */}
                  <form onSubmit={handleAddComment} className="mb-5 space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="닉네임"
                        value={commentAuthor}
                        onChange={e => setCommentAuthor(e.target.value)}
                        required
                        className="w-40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] text-zinc-500">
                        문서에 대한 추가 팁이나 수정 제안을 남겨보세요.
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        placeholder="의견이나 추가 정보를 작성하세요..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        rows={2}
                        required
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>등록</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* 댓글 목록 */}
                  <div className="space-y-2.5">
                    {wikiComments.map(c => (
                      <div key={c.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] group/comment">
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-indigo-300">🎮 {c.author}</span>
                            <span className="text-[11px] text-zinc-500">• {c.createdAt}</span>
                          </div>

                          {(isDeveloper || c.author === user.name) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover/comment:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded transition"
                              title="댓글 삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))}

                    {wikiComments.length === 0 && (
                      <p className="text-center py-4 text-xs text-zinc-500">
                        아직 등록된 의견이 없습니다. 첫 번째 의견을 남겨보세요!
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* ── [우측 사이드바]: 자유 위키 문서 리스트 (나무위키 스타일 목차) ── */}
            <aside className="w-full lg:w-80 shrink-0 space-y-4">
              
              {/* 위키 문서 목록 박스 */}
              <div className="glass-panel rounded-2xl border border-white/[0.08] shadow-lg overflow-hidden">
                <div className="px-4 py-3.5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">위키 문서 목록</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                    {wikiDocs.length}개
                  </span>
                </div>

                {/* 사이드바 내부 빠른 검색 */}
                <div className="p-2.5 border-b border-white/[0.06] bg-black/20">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="목록에서 문서 필터..."
                      value={sidebarFilter}
                      onChange={e => setSidebarFilter(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                {/* 문서 리스트 (세로 목록) */}
                <div className="max-h-[520px] overflow-y-auto divide-y divide-white/[0.04]">
                  {loading ? (
                    <div className="p-6 text-center text-xs text-zinc-500">불러오는 중...</div>
                  ) : sidebarWikiDocs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      {sidebarFilter ? '일치하는 문서가 없습니다.' : '등록된 위키 문서가 없습니다.'}
                    </div>
                  ) : (
                    sidebarWikiDocs.map(doc => {
                      const isActive = doc.id === activeWikiId
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => selectWikiDoc(doc.id)}
                          className={`w-full text-left p-3.5 transition flex items-center justify-between group ${
                            isActive
                              ? 'bg-indigo-600/15 border-l-2 border-indigo-400 text-white'
                              : 'hover:bg-white/[0.04] text-zinc-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className={`text-xs font-semibold truncate ${isActive ? 'text-indigo-200 font-bold' : 'group-hover:text-white'}`}>
                              {doc.title}
                            </p>
                            {doc.subtitle && (
                              <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                                {doc.subtitle}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1 text-[10px] text-zinc-500">
                              <span>{doc.author}</span>
                              <span>•</span>
                              <span>{doc.updatedAt}</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition ${isActive ? 'text-indigo-400 translate-x-0.5' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                        </button>
                      )
                    })
                  )}
                </div>

                {/* 사이드바 하단 새 문서 등재 버튼 */}
                <div className="p-3 border-t border-white/[0.07] bg-white/[0.01]">
                  <button
                    onClick={() => openWriteModal('wiki')}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>새 위키 문서 등재</span>
                  </button>
                </div>
              </div>

              {/* 참여 안내 카드 */}
              <div className="glass-panel rounded-2xl border border-white/[0.08] p-4 space-y-2 text-xs">
                <p className="font-bold text-zinc-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>나무위키식 자유 기여</span>
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  라비서버 위키는 유저 누구나 문서를 새로 등재하고, 잘못된 정보를 보완·편집할 수 있습니다. 적극적인 기여를 환영합니다!
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* 섹션 구분 라인 */}
        <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]"></div>
          </div>
          <div className="relative px-4 bg-[#090a0f] text-xs font-semibold text-zinc-400 flex items-center space-x-2 rounded-full border border-white/[0.08] py-1 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>라비 유저 커뮤니티 공간</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. 하단: 💬 라비 자유 게시판 (포럼 스타일)                     */}
        {/* ============================================================ */}
        <section id="board" className="scroll-mt-24 space-y-6">

          {/* 게시판 헤더 배너 */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-violet-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                  <span>실시간 유저 소통 공간</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  💬 라비 자유 게시판
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                  인게임 잡담, 파티원 모집, 아이템 거래, 질문/답변을 자유롭게 나누는 게시판입니다.
                </p>
              </div>
              <button
                onClick={() => openWriteModal('post')}
                className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>새 게시글 작성</span>
              </button>
            </div>
          </div>

          {/* 카테고리 필터 & 검색바 */}
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
                onChange={e => setBoardSearchQuery(e.target.value)}
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
                    <div className="space-y-1.5 flex-1 min-w-0">
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

                    {/* 액션 버튼 */}
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

                      <button
                        onClick={() => setReportTarget({ id: doc.id, type: 'post', title: doc.title })}
                        className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/25 hover:bg-rose-950/50 text-rose-400 hover:text-rose-200 transition"
                        title="게시글 신고하기"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>

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

      {/* ============================================================ */}
      {/* 3. 모달: 새 위키 문서 / 새 게시글 작성                         */}
      {/* ============================================================ */}
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
              <button onClick={() => setShowModal(false)} className="p-1 text-zinc-400 hover:text-white">
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
                      onChange={e => setNewCategory(e.target.value)}
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
                    onChange={e => setNewAuthor(e.target.value)}
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
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">부제목 / 한 줄 설명 (선택)</label>
                <input
                  type="text"
                  placeholder="문서 목록 및 검색 드롭다운에 표시될 핵심 요약"
                  value={newSubtitle}
                  onChange={e => setNewSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">본문 내용 (마크다운 지원)</label>
                <MarkdownEditor
                  value={newContent}
                  onChange={setNewContent}
                  placeholder={modalMode === 'wiki'
                    ? '위키 문서 내용을 자유롭게 작성하세요... (# 대제목, ## 소제목으로 작성 시 자동 목차가 생성됩니다)'
                    : '게시글 내용을 작성하세요...'}
                  minHeight="260px"
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
