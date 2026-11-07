// lib/db.ts에 자유 위키 상세 조회 및 댓글 관련 함수 추가
import { supabase, isSupabaseConfigured } from './supabase'
import { INITIAL_OFFICIAL_DOCS, INITIAL_FREE_DOCS, OfficialDoc, FreeDoc } from './wikiData'

export interface FreeDocComment {
  id: string
  docId: string
  author: string
  content: string
  createdAt: string
}

/**
 * 📘 공식 위키 전체 목록 가져오기
 */
export async function getOfficialDocs(): Promise<OfficialDoc[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('official_docs')
        .select('*')
        .order('category', { ascending: true })

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          slug: d.slug,
          title: d.title,
          category: d.category,
          icon: d.icon || '📜',
          description: d.description || '',
          content: d.content,
          updatedAt: d.updated_at ? new Date(d.updated_at).toISOString().split('T')[0] : '2026-11-07'
        }))
      }
    } catch (e) {
      console.warn('Supabase official_docs 로드 실패, 로컬 데이터 사용:', e)
    }
  }

  // 로컬 fallback
  if (typeof window !== 'undefined') {
    const customSlugs = JSON.parse(localStorage.getItem('ravi_official_custom_slugs') || '[]')
    const combined = [...INITIAL_OFFICIAL_DOCS]

    for (const slug of customSlugs) {
      const saved = localStorage.getItem(`ravi_official_${slug}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (!combined.some(d => d.slug === slug)) {
            combined.push(parsed)
          }
        } catch (e) {}
      }
    }

    return combined.map(d => {
      const saved = localStorage.getItem(`ravi_official_${d.slug}`)
      if (saved) {
        try { return JSON.parse(saved) } catch (e) {}
      }
      return d
    })
  }

  return INITIAL_OFFICIAL_DOCS
}

/**
 * 📘 특정 공식 위키 문서 조회
 */
export async function getOfficialDocBySlug(slug: string): Promise<OfficialDoc | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('official_docs')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!error && data) {
        return {
          slug: data.slug,
          title: data.title,
          category: data.category,
          icon: data.icon || '📜',
          description: data.description || '',
          content: data.content,
          updatedAt: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : '2026-11-07'
        }
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`ravi_official_${slug}`)
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
  }

  const found = INITIAL_OFFICIAL_DOCS.find(d => d.slug === slug)
  return found || null
}

/**
 * 📘 공식 위키 문서 저장 (개발자 전용)
 */
export async function saveOfficialDoc(doc: OfficialDoc): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`ravi_official_${doc.slug}`, JSON.stringify(doc))
    const customList = JSON.parse(localStorage.getItem('ravi_official_custom_slugs') || '[]')
    if (!customList.includes(doc.slug)) {
      customList.push(doc.slug)
      localStorage.setItem('ravi_official_custom_slugs', JSON.stringify(customList))
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('official_docs')
        .upsert({
          slug: doc.slug,
          title: doc.title,
          category: doc.category,
          icon: doc.icon,
          description: doc.description,
          content: doc.content,
          updated_at: new Date().toISOString()
        })
      if (error) {
        console.error('Supabase 공식 문서 저장 실패:', error.message)
        return false
      }
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return true
}

/**
 * ✍️ 자유 위키 / 게시판 전체 목록 조회
 */
export async function getFreeDocs(): Promise<FreeDoc[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('free_docs')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          author: d.author,
          content: d.content,
          likes: d.likes || 1,
          updatedAt: d.created_at ? new Date(d.created_at).toLocaleString('ko-KR') : '방금 전'
        }))
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ravi_free_wiki_docs')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
  }

  return INITIAL_FREE_DOCS
}

/**
 * ✍️ 특정 자유 위키 문서 조회 (ID 기반)
 */
export async function getFreeDocById(id: string): Promise<FreeDoc | null> {
  const all = await getFreeDocs()
  return all.find(d => d.id === id) || null
}

/**
 * ✍️ 자유 위키 새 글 저장
 */
export async function saveFreeDoc(doc: Omit<FreeDoc, 'id'>): Promise<FreeDoc> {
  const newId = Date.now().toString()
  const completeDoc: FreeDoc = {
    ...doc,
    id: newId
  }

  if (typeof window !== 'undefined') {
    const current = await getFreeDocs()
    const updated = [completeDoc, ...current]
    localStorage.setItem('ravi_free_wiki_docs', JSON.stringify(updated))
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('free_docs')
        .insert({
          title: doc.title,
          category: doc.category,
          author: doc.author,
          content: doc.content,
          likes: doc.likes || 1
        })
        .select()
        .single()

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          category: data.category,
          author: data.author,
          content: data.content,
          likes: data.likes,
          updatedAt: new Date(data.created_at).toLocaleString('ko-KR')
        }
      }
    } catch (e) {}
  }

  return completeDoc
}

/**
 * ✍️ 좋아요 중복 방지용 로컬 추적
 */
export function hasLikedDoc(id: string): boolean {
  if (typeof window === 'undefined') return false
  const liked = JSON.parse(localStorage.getItem('ravi_liked_docs') || '[]')
  return liked.includes(id)
}

export function markDocAsLiked(id: string): void {
  if (typeof window === 'undefined') return
  const liked = JSON.parse(localStorage.getItem('ravi_liked_docs') || '[]')
  if (!liked.includes(id)) {
    liked.push(id)
    localStorage.setItem('ravi_liked_docs', JSON.stringify(liked))
  }
}

/**
 * ✍️ 자유 위키 추천(좋아요) - 중복 방지
 */
export async function likeFreeDoc(id: string): Promise<{ success: boolean; newLikes?: number }> {
  if (hasLikedDoc(id)) {
    return { success: false }
  }

  markDocAsLiked(id)

  if (isSupabaseConfigured && supabase) {
    try {
      // 현재 likes 값 먼저 조회
      const { data: current } = await supabase
        .from('free_docs')
        .select('likes')
        .eq('id', id)
        .single()

      const currentLikes = current?.likes ?? 0

      // RPC 시도, 실패 시 직접 UPDATE
      const { error: rpcError } = await supabase.rpc('increment_likes', { doc_id: id })
      if (rpcError) {
        // RPC 없으면 직접 UPDATE
        await supabase
          .from('free_docs')
          .update({ likes: currentLikes + 1 })
          .eq('id', id)
      }

      // 최신 likes 값 반환
      const { data: updated } = await supabase
        .from('free_docs')
        .select('likes')
        .eq('id', id)
        .single()
      return { success: true, newLikes: updated?.likes ?? currentLikes + 1 }
    } catch (e) {}
  }

  // localStorage fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ravi_free_wiki_docs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const updated = parsed.map((d: FreeDoc) =>
          d.id === id ? { ...d, likes: d.likes + 1 } : d
        )
        localStorage.setItem('ravi_free_wiki_docs', JSON.stringify(updated))
        const newDoc = updated.find((d: FreeDoc) => d.id === id)
        return { success: true, newLikes: newDoc?.likes }
      } catch (e) {}
    }
  }

  return { success: true }
}

/**
 * 🗑️ 자유 위키 게시글 삭제
 */
export async function deleteFreeDoc(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('free_docs')
        .delete()
        .eq('id', id)
      if (error) {
        console.error('Supabase 게시글 삭제 실패:', error.message)
        return false
      }
    } catch (e) {
      console.error(e)
      return false
    }
  }

  // localStorage fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ravi_free_wiki_docs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const updated = parsed.filter((d: FreeDoc) => d.id !== id)
        localStorage.setItem('ravi_free_wiki_docs', JSON.stringify(updated))
      } catch (e) {}
    }
  }

  return true
}

/**
 * 💬 자유 위키 댓글 가져오기
 */
export async function getFreeDocComments(docId: string): Promise<FreeDocComment[]> {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`ravi_free_comments_${docId}`)
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
  }
  return []
}

/**
 * 💬 자유 위키 댓글 추가
 */
export async function addFreeDocComment(docId: string, author: string, content: string): Promise<FreeDocComment> {
  const newComment: FreeDocComment = {
    id: Date.now().toString(),
    docId,
    author,
    content,
    createdAt: '방금 전'
  }

  if (typeof window !== 'undefined') {
    const current = await getFreeDocComments(docId)
    const updated = [newComment, ...current]
    localStorage.setItem(`ravi_free_comments_${docId}`, JSON.stringify(updated))
  }

  return newComment
}
