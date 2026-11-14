'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Send, User, Sparkles } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface CommentItem {
  id: string
  author: string
  content: string
  createdAt: string
  avatar?: string
}

interface Props {
  documentSlug: string
}

export default function DocComments({ documentSlug }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 1. 로그인 닉네임 및 게스트 닉네임 복원
    const savedName = localStorage.getItem('ravi_user_name') || localStorage.getItem('ravi_guest_name')
    if (savedName) setAuthorName(savedName)

    // 2. Supabase 유저 확인
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user)
          setAuthorName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0])
        }
      })
    }

    // 3. 로컬 댓글 불러오기 (캐시 또는 초기값)
    const localKey = `ravi_comments_${documentSlug}`
    const saved = localStorage.getItem(localKey)
    if (saved) {
      try {
        setComments(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      // 기본 안내 댓글 예시
      setComments([
        {
          id: 'default-1',
          author: '라비용사',
          content: '이 문서 덕분에 사냥터 동선 쉽게 익혔습니다! 뉴비분들 1구역에서 15렙까지 찍고 넘어가세요.',
          createdAt: '2026-11-07 15:30',
        }
      ])
    }

    // 4. Supabase DB에서 댓글 불러오기 (연동된 경우)
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('feedbacks')
        .select('*')
        .eq('document_slug', documentSlug)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mapped = data.map((d: any) => ({
              id: d.id,
              author: d.author_name,
              content: d.content,
              createdAt: new Date(d.created_at).toLocaleString('ko-KR'),
            }))
            setComments(mapped)
          }
        })
    }
  }, [documentSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !authorName.trim()) return

    setLoading(true)
    const newComment: CommentItem = {
      id: Date.now().toString(),
      author: authorName.trim(),
      content: content.trim(),
      createdAt: '방금 전',
      avatar: currentUser?.user_metadata?.avatar_url
    }

    // 로컬 업데이트
    const updated = [newComment, ...comments]
    setComments(updated)
    localStorage.setItem(`ravi_comments_${documentSlug}`, JSON.stringify(updated))
    localStorage.setItem('ravi_guest_name', authorName.trim())

    // Supabase 연동 시 서버 저장
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('feedbacks').insert({
          document_slug: documentSlug,
          author_name: authorName.trim(),
          content: content.trim(),
        })
      } catch (err) {
        console.error('Supabase 피드백 저장 오류:', err)
      }
    }

    setContent('')
    setLoading(false)
  }

  return (
    <section className="mt-12 pt-8 border-t border-slate-800">
      <div className="flex items-center space-x-2.5 mb-6">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">유저 실시간 한 줄 제보 & 꿀팁 댓글</h3>
        <span className="text-xs bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
          {comments.length}
        </span>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            {currentUser?.user_metadata?.avatar_url ? (
              <img src={currentUser.user_metadata.avatar_url} alt="User" className="w-8 h-8 rounded-full" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            placeholder="인게임 닉네임 입력 (로그인 시 자동)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            ✨ 회원가입 없이 닉네임만 적으면 즉시 등록됩니다.
          </span>
        </div>

        <div className="relative">
          <textarea
            placeholder="이 공략에 대한 추가 팁이나 패치 변경점, 질문을 자유롭게 남겨보세요!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading || !content.trim() || !authorName.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition"
            >
              <span>등록하기</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/70 hover:border-slate-700/80 transition">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-xs text-purple-300">🎮 {c.author}</span>
                <span className="text-[11px] text-slate-500">{c.createdAt}</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

