'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FreeDoc } from '@/lib/wikiData'
import { getFreeDocs, saveFreeDoc, likeFreeDoc, deleteFreeDoc, hasLikedDoc } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import MarkdownEditor from '@/components/MarkdownEditor'
import { 
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  Sparkles, 
  Search, 
  Send,
  ExternalLink,
  X,
  Trash2
} from 'lucide-react'

export default function FreeWikiPage() {
  const { user, isDeveloper } = useAuth()
  
  const [docs, setDocs] = useState<FreeDoc[]>([])
  const [selectedCat, setSelectedCat] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 폼 입력 상태
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('공략/팁')
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
      // 이미 좋아요 누른 ID 초기화
      const liked = new Set(list.map(d => d.id).filter(id => hasLikedDoc(id)))
      setLikedIds(liked)
    })
  }, [user])

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return // 이미 좋아요 누름
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

  const handleDelete = async (id: string) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    setDeletingId(id)
    const ok = await deleteFreeDoc(id)
    if (ok) {
      setDocs(prev => prev.filter(d => d.id !== id))
    }
    setDeletingId(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    setIsSubmitting(true)
    const authorName = newAuthor.trim() || user.name || '라비 유저'

    const created = await saveFreeDoc({
      title: newTitle.trim(),
      category: newCategory,
      author: authorName,
      updatedAt: '방금 전',
      likes: 1,
      content: newContent.trim()
    })

    setDocs(prev => [created, ...prev])
    setNewTitle('')
    setNewContent('')
    setIsSubmitting(false)
    setShowModal(false)
  }

  const filtered = docs.filter(d => {
    const matchCat = selectedCat === '전체' || d.category === selectedCat
    const matchQuery = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       d.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchQuery
  })

  return (
    <div className="min-h-screen flex flex-col text-zinc-100">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* 상단 배너 */}
        <div className="glass-panel rounded-3xl p-6 sm:p-9 mb-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-violet-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>누구나 자유롭게 참여하는 오픈 커뮤니티</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                ✍️ 자유 위키 & 게시판
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                플레이어들이 직접 작성하는 사냥 꿀팁, 강화 후기, 파티 구인, 질문과 답변을 자유롭게 나누어보세요.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://discord.com/invite/jRkzZZ9kXp"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center space-x-1.5 px-4 py-3 rounded-2xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#828cf7] text-xs font-semibold transition"
              >
                <span>디스코드 채팅</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>새 글 / 위키 작성</span>
              </button>
            </div>
          </div>
        </div>

        {/* 필터 및 검색창 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0">
            {['전체', '공략/팁', '자유위키', '질문/답변', '파티모집'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-sm'
                    : 'bg-white/[0.02] border border-white/[0.06] text-zinc-400 hover:text-zinc-200'
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
              placeholder="제목, 본문, 작성자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
          </div>
        </div>

        {/* 게시글 리스트 */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500 text-xs">
            자유 위키 글을 불러오는 중입니다...
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(doc => (
              <div
                key={doc.id}
                className="glass-panel p-5 rounded-2xl transition shadow-sm hover:border-white/[0.15]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                        {doc.category}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">
                        🎮 {doc.author}
                      </span>
                      <span className="text-[11px] text-zinc-500">• {doc.updatedAt}</span>
                    </div>

                    <Link href={`/free-wiki/${doc.id}`} className="group/title block">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover/title:text-indigo-200 transition-colors">
                        {doc.title}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2">
                      {doc.content.replace(/<[^>]+>/g, '').replace(/#+\s|[*_`>-]\s?|\n/g, ' ').trim()}
                    </p>
                  </div>

                  {/* 추천 + 삭제 버튼 묶음 */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleLike(doc.id)}
                      disabled={likedIds.has(doc.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition active:scale-95 ${
                        likedIds.has(doc.id)
                          ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300 cursor-default'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.05] text-zinc-400 hover:text-white'
                      }`}
                      title={likedIds.has(doc.id) ? '이미 추천한 게시글' : '추천하기'}
                    >
                      <ThumbsUp className="w-4 h-4 mb-1" />
                      <span className="text-xs font-bold font-mono">{doc.likes}</span>
                    </button>

                    {/* 삭제 버튼: 개발자는 모든 글, 일반 유저는 본인 글만 */}
                    {(isDeveloper || doc.author === user.name) && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 hover:bg-rose-950/40 hover:border-rose-500/40 text-rose-400/60 hover:text-rose-400 transition active:scale-95 disabled:opacity-50"
                        title="게시글 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20 glass-panel rounded-3xl border border-dashed border-white/[0.08] text-zinc-500 text-xs space-y-3">
                <p>아직 등록된 게시글이 없습니다.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>첫 번째 글 작성하기</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 자유 글쓰기 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl text-zinc-100 border border-white/[0.1] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>자유 위키 / 게시글 작성</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              공략 팁, 질문, 파티원 모집 정보를 자유롭게 공유하세요. (별도 비밀번호 없이 닉네임만으로 작성)
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">카테고리</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e111a] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  >
                    <option value="공략/팁">공략/팁</option>
                    <option value="자유위키">자유위키</option>
                    <option value="질문/답변">질문/답변</option>
                    <option value="파티모집">파티모집</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">작성자 닉네임</label>
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
                <label className="block text-xs font-semibold text-zinc-300 mb-1">제목</label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">본문 내용 (마크다운 지원)</label>
                <MarkdownEditor
                  value={newContent}
                  onChange={setNewContent}
                  placeholder="공략이나 질문, 정보를 자세히 적어주세요... (# 제목, **굵게**, - 목록 등 마크다운 사용 가능)"
                  minHeight="220px"
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
                  <span>{isSubmitting ? '저장 중...' : '등록하기'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
