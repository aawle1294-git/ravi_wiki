'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FreeDoc } from '@/lib/wikiData'
import { getFreeDocById, getFreeDocComments, addFreeDocComment, deleteFreeDocComment, likeFreeDoc, dislikeFreeDoc, deleteFreeDoc, updateFreeDoc, hasLikedDoc, hasDislikedDoc, isMyDoc, FreeDocComment } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import WikiMarkdownRenderer from '@/components/WikiMarkdownRenderer'
import MarkdownEditor from '@/components/MarkdownEditor'
import ReportModal from '@/components/ReportModal'
import MindmapViewer, { hasMindmapContent } from '@/components/MindmapViewer'
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  ChevronRight, 
  Clock, 
  User, 
  Send, 
  ArrowLeft,
  Share2,
  Check,
  Trash2,
  Edit3,
  Save,
  X,
  AlertTriangle,
  BookOpen,
  List,
  Sparkles
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

export default function FreeDocDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''
  const { user, isDeveloper } = useAuth()

  const [doc, setDoc] = useState<FreeDoc | null>(null)
  const [comments, setComments] = useState<FreeDocComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [dislikes, setDislikes] = useState(0)
  const [isDisliked, setIsDisliked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showToc, setShowToc] = useState(true)
  const [showMindmap, setShowMindmap] = useState(false)

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editCategory, setEditCategory] = useState('공략/팁')
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user.role === 'player') {
      setAuthorName(user.name)
    } else if (user.role === 'developer') {
      setAuthorName('서버 개발자')
    }

    if (id) {
      getFreeDocById(id).then(d => {
        if (d) {
          setDoc(d)
          setLikes(d.likes)
          setIsLiked(hasLikedDoc(id))
          setDislikes(d.dislikes || 0)
          setIsDisliked(hasDislikedDoc(id))
        }
        setLoading(false)
      })

      getFreeDocComments(id).then(c => {
        setComments(c)
      })
    }
  }, [id, user])

  const handleLike = async () => {
    if (!doc || isLiked) return
    const result = await likeFreeDoc(doc.id)
    if (result.success) {
      setIsLiked(true)
      setLikes(result.newLikes !== undefined ? result.newLikes : likes + 1)
    }
  }

  const handleDislike = async () => {
    if (!doc || isDisliked) return
    const result = await dislikeFreeDoc(doc.id)
    if (result.success) {
      setIsDisliked(true)
      setDislikes(result.newDislikes !== undefined ? result.newDislikes : dislikes + 1)
    }
  }

  const startEditing = () => {
    if (!doc) return
    setEditTitle(doc.title)
    setEditSubtitle(doc.subtitle || '')
    setEditCategory(doc.category)
    setEditContent(doc.content)
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!doc || !editTitle.trim() || !editContent.trim()) return
    if (editContent.trim().length > 2000) {
      alert('내용은 최대 2,000자까지 작성할 수 있습니다. (현재: ' + editContent.trim().length + '자)')
      return
    }
    setIsSaving(true)
    const ok = await updateFreeDoc(doc.id, {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || undefined,
      category: editCategory,
      content: editContent.trim()
    })
    if (ok) {
      setDoc({
        ...doc,
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || undefined,
        category: editCategory,
        content: editContent.trim(),
        updatedAt: '방금 전 (수정됨)'
      })
      setIsEditing(false)
    } else {
      alert('수정 중 오류가 발생했습니다.')
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!doc) return
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    setIsDeleting(true)
    const ok = await deleteFreeDoc(doc.id)
    if (ok) {
      router.push('/free-wiki')
    } else {
      alert('삭제 중 오류가 발생했습니다.')
      setIsDeleting(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return

    const finalAuthor = authorName.trim() || user.name || '라비 유저'
    const added = await addFreeDocComment(id, finalAuthor, newComment.trim())
    setComments(prev => [added, ...prev])
    setNewComment('')
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    await deleteFreeDocComment(id, commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <div className="text-center py-24 text-zinc-500 text-xs">게시글을 불러오는 중입니다...</div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-24">
          <p className="text-zinc-400 text-sm mb-4">존재하지 않거나 삭제된 게시글입니다.</p>
          <Link
            href="/free-wiki"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>자유 위키 목록으로</span>
          </Link>
        </div>
      </div>
    )
  }

  const isWikiDoc = doc.category === '자유위키' || doc.docType === 'wiki'
  // 나무위키식 참여형 편집: 자유위키 문서는 모든 유저가 자유롭게 기여 및 수정 가능
  const canEdit = isWikiDoc || isDeveloper || doc.author === user.name || isMyDoc(doc.id)
  const canDelete = isDeveloper || doc.author === user.name || isMyDoc(doc.id)
  const toc = extractToc(doc.content)

  return (
    <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* 상단 브레드크럼 및 공유/수정/삭제 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07] mb-6">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition">홈</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link 
              href={isWikiDoc ? "/free-wiki#wiki" : "/free-wiki#board"} 
              className="hover:text-white transition font-semibold"
            >
              {isWikiDoc ? "📖 자유 위키" : "💬 자유 게시판"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium truncate max-w-[200px]">{doc.title}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* 수정 버튼: 자유위키는 누구나 기여 가능, 게시판은 본인/관리자만 */}
            {canEdit && !isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold transition active:scale-95"
                title={isWikiDoc ? "나무위키처럼 누구나 문서를 보완하고 편집할 수 있습니다." : "게시글 수정"}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isWikiDoc ? "문서 편집(자유 기여)" : "수정"}</span>
              </button>
            )}

            {/* 🚨 신고 버튼 */}
            {!isEditing && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-950/20 border border-rose-500/25 hover:bg-rose-950/40 text-rose-400 text-xs font-medium transition active:scale-95"
                title="부적절한 내용 신고"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>신고</span>
              </button>
            )}

            {/* 삭제 버튼: 개발자는 모든 글, 일반 유저는 본인 글만 */}
            {canDelete && !isEditing && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-950/20 border border-rose-500/25 hover:bg-rose-950/40 hover:border-rose-500/50 text-rose-400 text-xs font-medium transition active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] text-zinc-300 text-xs font-medium transition active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨!' : '공유'}</span>
            </button>
          </div>
        </div>

        {/* 본문 카드 */}
        <article className="glass-panel p-6 sm:p-9 rounded-3xl shadow-xl mb-8">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  <span>게시글 수정</span>
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] text-xs font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>취소</span>
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? '저장 중...' : '저장 완료'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">카테고리</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e111a] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  >
                    <option value="공략/팁">공략/팁</option>
                    <option value="자유위키">자유위키</option>
                    <option value="질문/답변">질문/답변</option>
                    <option value="파티모집">파티모집</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">제목</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">부제목 / 한 줄 설명 (선택)</label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  placeholder="게시글 핵심 요약 또는 부제목"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">본문 (마크다운 & 글 색상/폰트 지원)</label>
                  <span className="text-[10px] text-zinc-500 font-mono">최대 2,000자</span>
                </div>
                <MarkdownEditor
                  value={editContent}
                  onChange={setEditContent}
                  maxLength={2000}
                  placeholder="내용을 작성하세요... (최대 2,000자)"
                  minHeight="340px"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2.5 mb-3.5">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isWikiDoc
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    : 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                }`}>
                  {isWikiDoc ? '📖 자유위키 문서' : `💬 ${doc.category}`}
                </span>
                <span className="text-xs text-zinc-300 font-medium flex items-center space-x-1">
                  <User className="w-3 h-3 text-indigo-400" />
                  <span>{doc.author}</span>
                </span>
                <span className="text-xs text-zinc-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{doc.updatedAt}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {doc.title}
              </h1>

              {doc.subtitle && (
                <div className="mb-6">
                  <p className="text-xs sm:text-sm text-indigo-300/90 font-medium leading-relaxed bg-indigo-500/10 border-l-2 border-indigo-500/60 px-3.5 py-2 rounded-r-xl">
                    💡 {doc.subtitle}
                  </p>
                </div>
              )}

              {/* 📑 나무위키 스타일 목차 (Table of Contents) 박스 & 🧠 마인드맵 토글 */}
              <div className="mb-6 space-y-4">
                {hasMindmapContent(doc.content) && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowMindmap(v => !v)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition active:scale-95 ${
                        showMindmap
                          ? 'bg-[#5865f2] text-white border-[#5865f2] shadow-md shadow-[#5865f2]/20'
                          : 'bg-white/[0.04] text-zinc-400 border-white/[0.1] hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${showMindmap ? 'text-white' : 'text-zinc-400'}`} />
                      <span>{showMindmap ? '마인드맵 닫기' : '🧠 마인드맵으로 개요 보기'}</span>
                    </button>
                  </div>
                )}

                {showMindmap && hasMindmapContent(doc.content) && (
                  <MindmapViewer markdown={doc.content} title={doc.title} />
                )}

                {isWikiDoc && toc.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] max-w-sm">
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
              </div>

              <div className="pb-8 border-b border-white/[0.07]">
                <WikiMarkdownRenderer content={doc.content} />
              </div>

              {/* 추천 / 비추천 (좋아요 / 싫어요) 버튼 */}
              <div className="pt-6 flex items-center justify-center space-x-3">
                <button
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`flex items-center space-x-2 px-5 sm:px-6 py-2.5 rounded-full border transition shadow-sm active:scale-95 ${
                    isLiked
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 cursor-default'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-indigo-500/30 hover:text-white'
                  }`}
                  title={isLiked ? '이미 추천한 게시글입니다' : '이 게시글을 추천합니다'}
                >
                  <ThumbsUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold font-mono">
                    {isLiked ? '추천됨' : '좋아요'} {likes}
                  </span>
                </button>

                <button
                  onClick={handleDislike}
                  disabled={isDisliked}
                  className={`flex items-center space-x-2 px-5 sm:px-6 py-2.5 rounded-full border transition shadow-sm active:scale-95 ${
                    isDisliked
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 cursor-default'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-rose-500/30 hover:text-rose-200'
                  }`}
                  title={isDisliked ? '이미 비추천한 게시글입니다' : '이 게시글을 비추천합니다'}
                >
                  <ThumbsDown className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold font-mono">
                    {isDisliked ? '비추천됨' : '싫어요'} {dislikes}
                  </span>
                </button>
              </div>
            </>
          )}
        </article>

        {/* 유저 실시간 댓글 섹션 */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 mb-5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">댓글 & 의견</h2>
            <span className="text-[11px] bg-white/[0.04] text-zinc-300 px-2 py-0.5 rounded-full border border-white/[0.08] font-mono">
              {comments.length}
            </span>
          </div>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleAddComment} className="mb-6 space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="닉네임 (로그인 시 자동)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                className="w-44 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-zinc-500">
                ✨ 닉네임만 적으면 즉시 등록됩니다.
              </span>
            </div>

            <div className="relative">
              <textarea
                placeholder="댓글이나 추가 팁, 의견을 남겨보세요... (최대 2,000자)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={2000}
                rows={2}
                required
                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {newComment.length} / 2,000자
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || newComment.length > 2000}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>댓글 등록</span>
                </button>
              </div>
            </div>
          </form>

          {/* 댓글 목록 */}
          <div className="space-y-2.5">
            {comments.map(c => (
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

            {comments.length === 0 && (
              <p className="text-center py-6 text-xs text-zinc-500">
                아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요!
              </p>
            )}
          </div>
        </section>
      </main>

      {/* 🚨 신고 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={doc.id}
        targetType={isWikiDoc ? 'wiki' : 'post'}
        targetTitle={doc.title}
      />
    </div>
  )
}
