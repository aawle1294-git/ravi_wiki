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
          content: (d.content || '').replace(/\\n/g, '\n').replace(/\\r/g, ''),
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
          content: (data.content || '').replace(/\\n/g, '\n').replace(/\\r/g, ''),
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
 * 📘 공식 위키 문서 삭제 (개발자 전용)
 */
export async function deleteOfficialDoc(slug: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`ravi_official_${slug}`)
    const customList = JSON.parse(localStorage.getItem('ravi_official_custom_slugs') || '[]')
    const updated = customList.filter((s: string) => s !== slug)
    localStorage.setItem('ravi_official_custom_slugs', JSON.stringify(updated))
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('official_docs').delete().eq('slug', slug)
    } catch (e) {
      console.error('Supabase 공식 문서 삭제 오류:', e)
    }
  }

  return true
}

/**
 * 🗑️ 삭제된 게시글 ID 목록 추적 (로컬 캐시 방어용)
 */
export function getDeletedDocIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('ravi_deleted_doc_ids') || '[]')
  } catch {
    return []
  }
}

export function markAsDeleted(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const list = getDeletedDocIds()
    if (!list.includes(id)) {
      list.push(id)
      localStorage.setItem('ravi_deleted_doc_ids', JSON.stringify(list))
    }
  } catch {}
}

/**
 * 👤 내가 작성한 글 ID 추적 (닉네임 변경/비로그인 시에도 본인 글 삭제 권한 보장)
 */
export function markAsMyDoc(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const list = JSON.parse(localStorage.getItem('ravi_my_doc_ids') || '[]')
    if (!list.includes(id)) {
      list.push(id)
      localStorage.setItem('ravi_my_doc_ids', JSON.stringify(list))
    }
  } catch {}
}

export function isMyDoc(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const list = JSON.parse(localStorage.getItem('ravi_my_doc_ids') || '[]')
    return list.includes(id)
  } catch {
    return false
  }
}

/**
 * ✍️ 자유 위키 / 게시판 전체 목록 조회
 */
export async function getFreeDocs(): Promise<FreeDoc[]> {
  const deletedIds = getDeletedDocIds()

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('free_docs')
        .select('*')
        .neq('category', '__DELETED__')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data
          .filter((d: any) => 
            d.category !== '__DELETED__' && 
            !d.category?.startsWith('__') &&
            !deletedIds.includes(d.id) &&
            !d.title?.startsWith('[삭제') &&
            !d.title?.startsWith('[정리')
          )
          .map((d: any) => {
            let parsedSubtitle = d.subtitle || undefined
            let cleanContent = (d.content || '').replace(/\\n/g, '\n').replace(/\\r/g, '')
            let parsedDislikes = 0

            const subMatch = cleanContent.match(/^<!--subtitle:(.*?)-->\s*\n?/)
            if (subMatch) {
              parsedSubtitle = subMatch[1]
              cleanContent = cleanContent.replace(/^<!--subtitle:(.*?)-->\s*\n?/, '')
            }

            const dislikeMatch = cleanContent.match(/^<!--dislikes:(\d+)-->\s*\n?/)
            if (dislikeMatch) {
              parsedDislikes = parseInt(dislikeMatch[1], 10) || 0
              cleanContent = cleanContent.replace(/^<!--dislikes:(\d+)-->\s*\n?/, '')
            }

            if (cleanContent.length > 2000) {
              cleanContent = cleanContent.slice(0, 2000)
            }
            const isWiki = d.docType === 'wiki' || d.category === '자유위키'
            return {
              id: d.id,
              title: (d.title || '').slice(0, 100),
              subtitle: parsedSubtitle ? parsedSubtitle.slice(0, 100) : undefined,
              category: d.category,
              docType: isWiki ? 'wiki' : 'post',
              author: (d.author || '익명').slice(0, 30),
              content: cleanContent,
              likes: d.likes !== undefined ? d.likes : 0,
              dislikes: parsedDislikes,
              updatedAt: d.created_at ? new Date(d.created_at).toLocaleString('ko-KR') : '방금 전'
            }
          })
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ravi_free_wiki_docs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed
          .filter((d: FreeDoc) => 
            d.category !== '__DELETED__' && 
            !d.category?.startsWith('__') &&
            !deletedIds.includes(d.id) &&
            !d.title?.startsWith('[삭제') &&
            !d.title?.startsWith('[정리')
          )
          .map((d: FreeDoc) => ({
            ...d,
            title: (d.title || '').slice(0, 100),
            subtitle: d.subtitle ? d.subtitle.slice(0, 100) : undefined,
            author: (d.author || '익명').slice(0, 30),
            content: (d.content || '').slice(0, 2000),
            likes: d.likes !== undefined ? d.likes : 0,
            dislikes: d.dislikes || 0
          }))
      } catch (e) {}
    }
  }

  return INITIAL_FREE_DOCS.filter(d => !deletedIds.includes(d.id))
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
  const isWiki = doc.docType === 'wiki' || doc.category === '자유위키'
  const safeTitle = (doc.title || '').trim().slice(0, 100)
  const safeSubtitle = doc.subtitle ? doc.subtitle.trim().slice(0, 100) : undefined
  const safeAuthor = (doc.author || '라비 유저').trim().slice(0, 30)
  const safeContent = (doc.content || '').trim().slice(0, 2000)

  const completeDoc: FreeDoc = {
    ...doc,
    title: safeTitle,
    subtitle: safeSubtitle,
    author: safeAuthor,
    content: safeContent,
    likes: doc.likes !== undefined ? doc.likes : 0,
    dislikes: doc.dislikes || 0,
    id: newId,
    docType: isWiki ? 'wiki' : 'post'
  }

  // 작성자 소유 ID 기록
  markAsMyDoc(newId)

  if (typeof window !== 'undefined') {
    const current = await getFreeDocs()
    const updated = [completeDoc, ...current]
    localStorage.setItem('ravi_free_wiki_docs', JSON.stringify(updated))
  }

  if (isSupabaseConfigured && supabase) {
    try {
      let enrichedContent = safeContent
      if (doc.dislikes) {
        enrichedContent = `<!--dislikes:${doc.dislikes}-->\n${enrichedContent}`
      }
      if (safeSubtitle) {
        enrichedContent = `<!--subtitle:${safeSubtitle}-->\n${enrichedContent}`
      }

      const { data, error } = await supabase
        .from('free_docs')
        .insert({
          title: safeTitle,
          category: doc.category,
          author: safeAuthor,
          content: enrichedContent,
          likes: doc.likes !== undefined ? doc.likes : 0
        })
        .select()
        .single()

      if (!error && data) {
        markAsMyDoc(data.id)
        return {
          id: data.id,
          title: data.title,
          subtitle: safeSubtitle,
          category: data.category,
          author: data.author,
          content: safeContent,
          likes: data.likes,
          dislikes: doc.dislikes || 0,
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
 * 👎 싫어요(비추천) 중복 방지용 로컬 추적
 */
export function hasDislikedDoc(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const disliked = JSON.parse(localStorage.getItem('ravi_disliked_docs') || '[]')
    return disliked.includes(id)
  } catch {
    return false
  }
}

export function markDocAsDisliked(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const disliked = JSON.parse(localStorage.getItem('ravi_disliked_docs') || '[]')
    if (!disliked.includes(id)) {
      disliked.push(id)
      localStorage.setItem('ravi_disliked_docs', JSON.stringify(disliked))
    }
  } catch {}
}

/**
 * 👎 자유 게시판/위키 싫어요 (비추천)
 */
export async function dislikeFreeDoc(id: string): Promise<{ success: boolean; newDislikes?: number }> {
  if (hasDislikedDoc(id)) {
    return { success: false }
  }

  markDocAsDisliked(id)
  let updatedDislikes = 1

  // 1. Supabase 동기화 (content 내의 <!--dislikes:N--> 태그 갱신)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: current } = await supabase
        .from('free_docs')
        .select('content')
        .eq('id', id)
        .single()

      if (current) {
        let content = current.content || ''
        const match = content.match(/<!--dislikes:(\d+)-->/)
        if (match) {
          const currentCount = parseInt(match[1], 10) || 0
          updatedDislikes = currentCount + 1
          content = content.replace(/<!--dislikes:\d+-->/, `<!--dislikes:${updatedDislikes}-->`)
        } else {
          updatedDislikes = 1
          // subtitle 뒤 또는 최상단에 추가
          if (content.startsWith('<!--subtitle:')) {
            const subEnd = content.indexOf('-->')
            if (subEnd !== -1) {
              const before = content.slice(0, subEnd + 3)
              const after = content.slice(subEnd + 3)
              content = `${before}\n<!--dislikes:${updatedDislikes}-->${after}`
            } else {
              content = `<!--dislikes:${updatedDislikes}-->\n${content}`
            }
          } else {
            content = `<!--dislikes:${updatedDislikes}-->\n${content}`
          }
        }

        await supabase
          .from('free_docs')
          .update({ content })
          .eq('id', id)
      }
    } catch (e) {
      console.error('dislikeFreeDoc Supabase error:', e)
    }
  }

  // 2. localStorage 동기화
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ravi_free_wiki_docs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const updated = parsed.map((d: FreeDoc) => {
          if (d.id === id) {
            const newCount = (d.dislikes || 0) + 1
            updatedDislikes = newCount
            return { ...d, dislikes: newCount }
          }
          return d
        })
        localStorage.setItem('ravi_free_wiki_docs', JSON.stringify(updated))
      } catch (e) {}
    }
  }

  return { success: true, newDislikes: updatedDislikes }
}

/**
 * ✍️ 자유 위키 게시글 수정 (작성자 또는 개발자)
 */
export async function updateFreeDoc(id: string, updates: Partial<Pick<FreeDoc, 'title' | 'subtitle' | 'category' | 'content'>>): Promise<boolean> {
  const safeUpdates: any = { ...updates }
  if (safeUpdates.title !== undefined) safeUpdates.title = safeUpdates.title.trim().slice(0, 100)
  if (safeUpdates.subtitle !== undefined) safeUpdates.subtitle = safeUpdates.subtitle.trim().slice(0, 100)
  if (safeUpdates.content !== undefined) safeUpdates.content = safeUpdates.content.trim().slice(0, 2000)

  // 1. localStorage 동기화
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ravi_free_wiki_docs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const updated = parsed.map((d: FreeDoc) =>
          d.id === id ? { ...d, ...safeUpdates, updatedAt: '방금 전 (수정됨)' } : d
        )
        localStorage.setItem('ravi_free_wiki_docs', JSON.stringify(updated))
      } catch (e) {}
    }
  }

  // 2. Supabase DB 동기화
  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: any = {}
      if (safeUpdates.title !== undefined) dbUpdates.title = safeUpdates.title
      if (safeUpdates.category !== undefined) dbUpdates.category = safeUpdates.category

      if (safeUpdates.content !== undefined || safeUpdates.subtitle !== undefined) {
        const baseContent = safeUpdates.content !== undefined ? safeUpdates.content : ''
        const subtitle = safeUpdates.subtitle
        dbUpdates.content = subtitle ? `<!--subtitle:${subtitle}-->\n${baseContent}` : baseContent
      }

      dbUpdates.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('free_docs')
        .update(dbUpdates)
        .eq('id', id)
      if (error) {
        console.error('Supabase 게시글 수정 실패:', error.message)
        return false
      }
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return true
}

/**
 * 🗑️ 자유 위키 게시글 삭제 (개발자는 전체, 일반 유저는 본인 글)
 */
export async function deleteFreeDoc(id: string): Promise<boolean> {
  // 1. 클라이언트 캐시 및 영구 삭제 목록에 즉시 등록
  markAsDeleted(id)

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

  // 2. Supabase DB에서 삭제 처리
  if (isSupabaseConfigured && supabase) {
    try {
      // 2-1. 소프트 삭제 (category를 '__DELETED__'로 UPDATE하여 즉각 숨김 처리)
      // Supabase UPDATE RLS 정책이 열려있으므로 권한 문제 없이 100% 반영됨
      await supabase
        .from('free_docs')
        .update({ 
          category: '__DELETED__',
          title: '[삭제된 게시글]',
          content: ''
        })
        .eq('id', id)

      // 2-2. 하드 삭제 시도 (Supabase DELETE RLS 정책이 허용되어 있는 경우 완전 삭제)
      await supabase
        .from('free_docs')
        .delete()
        .eq('id', id)
    } catch (e) {
      console.warn('Supabase 게시글 삭제 쿼리 알림:', e)
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

/**
 * 💬 자유 위키 댓글 삭제 (개발자 또는 본인)
 */
export async function deleteFreeDocComment(docId: string, commentId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const current = await getFreeDocComments(docId)
    const updated = current.filter(c => c.id !== commentId)
    localStorage.setItem(`ravi_free_comments_${docId}`, JSON.stringify(updated))
    return true
  }
  return false
}

export interface Report {
  id: string
  targetId: string
  targetType: 'wiki' | 'post' | 'comment'
  targetTitle: string
  reason: string
  details: string
  reporter: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

/**
 * 🚨 신고 접수
 */
export async function createReport(data: {
  targetId: string
  targetType: 'wiki' | 'post' | 'comment'
  targetTitle: string
  reason: string
  details?: string
  reporter?: string
}): Promise<Report> {
  const newReport: Report = {
    id: 'rep_' + Date.now().toString(),
    targetId: data.targetId,
    targetType: data.targetType,
    targetTitle: data.targetTitle,
    reason: data.reason,
    details: data.details || '',
    reporter: data.reporter || '익명 유저',
    status: 'pending',
    createdAt: new Date().toLocaleString('ko-KR')
  }

  if (typeof window !== 'undefined') {
    const list = await getReports()
    const updated = [newReport, ...list]
    localStorage.setItem('ravi_reports', JSON.stringify(updated))
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reports').insert({
        target_id: data.targetId,
        target_type: data.targetType,
        target_title: data.targetTitle,
        reason: data.reason,
        details: data.details || '',
        reporter: data.reporter || '익명 유저',
        status: 'pending'
      })
    } catch (e) {}
  }

  return newReport
}

/**
 * 🚨 전체 신고 목록 조회 (관리자용)
 */
export async function getReports(): Promise<Report[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          targetId: d.target_id,
          targetType: d.target_type,
          targetTitle: d.target_title,
          reason: d.reason,
          details: d.details || '',
          reporter: d.reporter || '익명 유저',
          status: d.status || 'pending',
          createdAt: d.created_at ? new Date(d.created_at).toLocaleString('ko-KR') : '방금 전'
        }))
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ravi_reports')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
  }

  return []
}

/**
 * 🚨 신고 상태 변경 (처리완료, 기각 등)
 */
export async function updateReportStatus(reportId: string, status: 'pending' | 'resolved' | 'dismissed'): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const current = await getReports()
    const updated = current.map(r => r.id === reportId ? { ...r, status } : r)
    localStorage.setItem('ravi_reports', JSON.stringify(updated))
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)
    } catch (e) {}
  }

  return true
}

/**
 * 🚨 신고 내역 삭제
 */
export async function deleteReport(reportId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const current = await getReports()
    const updated = current.filter(r => r.id !== reportId)
    localStorage.setItem('ravi_reports', JSON.stringify(updated))
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
    } catch (e) {}
  }

  return true
}
