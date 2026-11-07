'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FreeDoc } from '@/lib/wikiData'
import { getFreeDocById, getFreeDocComments, addFreeDocComment, likeFreeDoc, FreeDocComment } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import { 
  MessageSquare, 
  ThumbsUp, 
  ChevronRight, 
  Clock, 
  User, 
  Send, 
  ArrowLeft,
  Sparkles,
  Share2,
  Check
} from 'lucide-react'

export default function FreeDocDetailPage() {
  const params = useParams()
  const id = (params?.id as string) || ''
  const { user } = useAuth()

  const [doc, setDoc] = useState<FreeDoc | null>(null)
  const [comments, setComments] = useState<FreeDocComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

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
    setLikes(prev => prev + 1)
    setIsLiked(true)
    await likeFreeDoc(doc.id)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return

    const finalAuthor = authorName.trim() || user.name || '라비 유저'
    const added = await addFreeDocComment(id, finalAuthor, newComment.trim())
    setComments(prev => [added, ...prev])
    setNewComment('')
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="text-center py-24 text-slate-400 text-sm">게시글을 불러오는 중입니다...</div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-24">
          <p className="text-slate-400 text-sm mb-4">존재하지 않거나 삭제된 게시글입니다.</p>
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* 상단 빵부스러기 및 공유 버튼 */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
            <Link href="/" className="hover:text-indigo-300 transition">홈</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/free-wiki" className="hover:text-indigo-300 transition">자유 위키</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-indigo-400 font-semibold truncate max-w-[200px]">{doc.title}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? '링크 복사됨!' : '공유'}</span>
          </button>
        </div>

        {/* 본문 카드 */}
        <article className="p-6 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-xl mb-10">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
              {doc.category}
            </span>
            <span className="text-xs text-slate-300 font-semibold flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{doc.author}</span>
            </span>
            <span className="text-xs text-slate-500 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{doc.updatedAt}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            {doc.title}
          </h1>

          <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pb-8 border-b border-slate-800/80">
            {doc.content}
          </div>

          {/* 추천 버튼 */}
          <div className="pt-6 flex items-center justify-center">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl border transition shadow-lg ${
                isLiked
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-bold">추천 {likes}</span>
            </button>
          </div>
        </article>

        {/* 유저 실시간 댓글 섹션 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">유저 댓글 & 추가 팁</h2>
            <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
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
                className="w-48 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-500">
                ✨ 닉네임만 적으면 즉시 등록됩니다.
              </span>
            </div>

            <div className="relative">
              <textarea
                placeholder="댓글이나 추가 꿀팁, 의견을 자유롭게 남겨보세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                required
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>댓글 등록</span>
                </button>
              </div>
            </div>
          </form>

          {/* 댓글 목록 */}
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="flex items-center space-x-2 mb-1 text-xs">
                  <span className="font-bold text-indigo-300">🎮 {c.author}</span>
                  <span className="text-[11px] text-slate-500">• {c.createdAt}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
