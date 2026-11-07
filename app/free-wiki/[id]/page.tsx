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
      <div className="min-h-screen flex flex-col text-zinc-100">
        <Navbar />
        <div className="text-center py-24 text-zinc-500 text-xs">게시글을 불러오는 중입니다...</div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="min-h-screen flex flex-col text-zinc-100">
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

  return (
    <div className="min-h-screen flex flex-col text-zinc-100">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* 상단 브레드크럼 및 공유 버튼 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.07] mb-6">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition">홈</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/free-wiki" className="hover:text-white transition">자유 게시판</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium truncate max-w-[200px]">{doc.title}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] text-zinc-300 text-xs font-medium transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨!' : '공유'}</span>
          </button>
        </div>

        {/* 본문 카드 */}
        <article className="glass-panel p-6 sm:p-9 rounded-3xl shadow-xl mb-8">
          <div className="flex items-center space-x-2.5 mb-3.5">
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
              {doc.category}
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

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-5">
            {doc.title}
          </h1>

          <div className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pb-8 border-b border-white/[0.07]">
            {doc.content}
          </div>

          {/* 추천 버튼 */}
          <div className="pt-6 flex items-center justify-center">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full border transition shadow-sm active:scale-95 ${
                isLiked
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-white/[0.18] hover:text-white'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">추천 {likes}</span>
            </button>
          </div>
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
                placeholder="댓글이나 추가 팁, 의견을 남겨보세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
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
                  <span>댓글 등록</span>
                </button>
              </div>
            </div>
          </form>

          {/* 댓글 목록 */}
          <div className="space-y-2.5">
            {comments.map(c => (
              <div key={c.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center space-x-2 mb-1 text-xs">
                  <span className="font-semibold text-indigo-300">🎮 {c.author}</span>
                  <span className="text-[11px] text-zinc-500">• {c.createdAt}</span>
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
    </div>
  )
}
