'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FreeDoc } from '@/lib/wikiData'
import { getFreeDocs, saveFreeDoc, likeFreeDoc } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import { 
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  Sparkles, 
  Search, 
  Send
} from 'lucide-react'

export default function FreeWikiPage() {
  const { user } = useAuth()
  
  const [docs, setDocs] = useState<FreeDoc[]>([])
  const [selectedCat, setSelectedCat] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

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
    })
  }, [user])

  const handleLike = async (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, likes: d.likes + 1 } : d))
    await likeFreeDoc(id)
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* 상단 배너 */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>누구나 자유롭게 참여하는 오픈 공간</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                ✍️ 자유 위키 & 게시판
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl">
                플레이어들이 직접 작성하는 사냥 꿀팁, 강화 성공 비법, 파티 구인, 질문과 답변을 자유롭게 나누어보세요.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>자유 위키 / 글 작성</span>
            </button>
          </div>
        </div>

        {/* 필터 및 검색창 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {['전체', '공략/팁', '자유위키', '질문/답변', '파티모집'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCat === cat
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="제목, 내용, 작성자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 게시글/문서 리스트 */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            자유 위키 글을 불러오는 중입니다...
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(doc => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                        {doc.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        🎮 {doc.author}
                      </span>
                      <span className="text-[11px] text-slate-500">• {doc.updatedAt}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {doc.title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {doc.content}
                    </p>
                  </div>

                  {/* 추천 버튼 */}
                  <button
                    onClick={() => handleLike(doc.id)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-300 transition"
                    title="추천하기"
                  >
                    <ThumbsUp className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold font-mono">{doc.likes}</span>
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                작성된 문서가 없습니다. 첫 번째 자유 위키/글을 작성해보세요!
              </div>
            )}
          </div>
        )}
      </main>

      {/* 자유 글쓰기 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>자유 위키 / 게시글 작성</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              공략 팁, 질문, 파티 모집 정보를 자유롭게 공유하세요.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">카테고리</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="공략/팁">공략/팁</option>
                    <option value="자유위키">자유위키</option>
                    <option value="질문/답변">질문/답변</option>
                    <option value="파티모집">파티모집</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">작성자 닉네임</label>
                  <input
                    type="text"
                    placeholder="인게임 닉네임"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">제목</label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">본문 내용</label>
                <textarea
                  placeholder="공략이나 질문, 정보를 자세히 적어주세요..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 text-xs font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
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
