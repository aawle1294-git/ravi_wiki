import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

// 시스템 예약어 닉네임
const RESERVED_NAMES = [
  '개발자',
  '관리자',
  '서버개발자',
  'admin',
  'administrator',
  'system',
  '운영자',
  '서버관리자',
  'moderator',
  'root',
  '총괄',
  '총관리자',
  '라비관리자',
  '방문자',
  'guest'
]

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex')
}

/**
 * GET: 마인크래프트 닉네임 중복 및 등록 여부 실시간 확인
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const nickname = (searchParams.get('nickname') || '').trim()

    if (!nickname || nickname.length < 2) {
      return NextResponse.json({ exists: false })
    }

    const normalized = nickname.toLowerCase()

    if (RESERVED_NAMES.includes(normalized)) {
      const isGeneric = ['개발자', '서버개발자', '관리자', 'admin', 'system', 'root'].includes(normalized)
      return NextResponse.json({ 
        exists: true, 
        isReserved: true,
        isDevName: true,
        nickname: nickname,
        avatar: isGeneric ? '/logo.png' : `https://crafthead.net/helm/${encodeURIComponent(nickname)}/64`,
        message: '👑 개발자/관리자 전용 계정입니다. 개발자 암호로 인증하여 로그인할 수 있습니다.' 
      })
    }

    if (!supabase) {
      return NextResponse.json({ exists: false })
    }

    const { data, error } = await supabase
      .from('free_docs')
      .select('id, title, author, created_at')
      .eq('category', '__USER_ACCOUNT__')
      .eq('title', normalized)
      .limit(1)

    if (!error && data && data.length > 0) {
      const row = data[0]
      return NextResponse.json({
        exists: true,
        nickname: row.author,
        avatar: `https://crafthead.net/helm/${encodeURIComponent(row.author)}/64`,
        registeredAt: row.created_at
      })
    }

    return NextResponse.json({
      exists: false,
      avatar: `https://crafthead.net/helm/${encodeURIComponent(nickname)}/64`
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * POST: 마인크래프트 닉네임 로그인 및 신규 닉네임 등록 (비밀번호 보안 검증)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, nickname, password } = body

    if (!nickname || typeof nickname !== 'string' || !nickname.trim()) {
      return NextResponse.json({ success: false, error: '마인크래프트 닉네임을 입력해주세요.' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json({ success: false, error: '비밀번호는 최소 4자 이상 입력해주세요.' }, { status: 400 })
    }

    const trimmed = nickname.trim()
    const normalized = trimmed.toLowerCase()

    // 닉네임 형식 검사 (영문, 숫자, 밑줄, 한글 2~16자)
    const validFormat = /^[a-zA-Z0-9_\uAC00-\uD7A3]{2,16}$/.test(trimmed)
    if (!validFormat) {
      return NextResponse.json({
        success: false,
        error: '닉네임은 2~16자의 영문, 숫자, 한글, 밑줄(_)만 사용 가능합니다.'
      }, { status: 400 })
    }

    const validDevPassword = process.env.DEV_PASSWORD || 'ravi23control'

    // 시스템 예약어 검사: 개발자 암호 일치 시 개발자 권한으로 로그인 승인
    if (RESERVED_NAMES.includes(normalized)) {
      if (password === validDevPassword || body.devPassword === validDevPassword) {
        const isGeneric = ['개발자', '서버개발자', '관리자', 'admin', 'system', 'root'].includes(normalized)
        return NextResponse.json({
          success: true,
          role: 'developer',
          nickname: trimmed,
          avatar: isGeneric ? '/logo.png' : `https://crafthead.net/helm/${encodeURIComponent(trimmed)}/64`,
          message: '👑 개발자 권한으로 인증되었습니다!'
        })
      }
      return NextResponse.json({
        success: false,
        isReserved: true,
        isDevName: true,
        error: '개발자/관리자 전용 닉네임입니다. 개발자 인증 암호를 입력해주세요.'
      }, { status: 401 })
    }

    if (!supabase) {
      return NextResponse.json({ success: false, error: '데이터베이스 연결을 확인해주세요.' }, { status: 500 })
    }

    // 기존 닉네임 계정 조회
    const { data: existing, error: queryError } = await supabase
      .from('free_docs')
      .select('id, title, author, content')
      .eq('category', '__USER_ACCOUNT__')
      .eq('title', normalized)
      .limit(1)

    if (queryError) {
      return NextResponse.json({ success: false, error: '계정 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const accountExists = Boolean(existing && existing.length > 0)

    // 1. 신규 닉네임 등록 (회원가입)
    if (action === 'register') {
      if (accountExists) {
        return NextResponse.json({
          success: false,
          error: '이미 다른 플레이어가 등록한 마인크래프트 닉네임입니다! 다른 사람이 사용하는 닉네임은 등록할 수 없습니다.'
        }, { status: 409 })
      }

      const salt = crypto.randomBytes(16).toString('hex')
      const hash = hashPassword(password, salt)
      const id = crypto.randomUUID()

      const { error: insertError } = await supabase
        .from('free_docs')
        .insert({
          id,
          title: normalized,
          category: '__USER_ACCOUNT__',
          author: trimmed,
          content: JSON.stringify({
            hash,
            salt,
            registeredAt: new Date().toISOString()
          }),
          likes: 0
        })

      if (insertError) {
        return NextResponse.json({
          success: false,
          error: '계정 등록 중 오류가 발생했습니다: ' + insertError.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        nickname: trimmed,
        avatar: `https://crafthead.net/helm/${encodeURIComponent(trimmed)}/64`,
        message: '마인크래프트 닉네임이 성공적으로 등록되었습니다!'
      })
    }

    // 2. 기존 닉네임 로그인
    if (!accountExists) {
      return NextResponse.json({
        success: false,
        notRegistered: true,
        error: '등록되지 않은 닉네임입니다. 비밀번호를 설정하여 내 닉네임으로 먼저 등록해주세요!'
      }, { status: 404 })
    }

    const account = existing[0]
    let accountData: any = {}
    try {
      accountData = JSON.parse(account.content || '{}')
    } catch {
      return NextResponse.json({ success: false, error: '계정 정보 처리 오류가 발생했습니다.' }, { status: 500 })
    }

    const computedHash = hashPassword(password, accountData.salt || '')

    if (computedHash !== accountData.hash) {
      return NextResponse.json({
        success: false,
        error: '비밀번호가 일치하지 않습니다. 다른 사람의 닉네임으로는 접속할 수 없습니다!'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      nickname: account.author || trimmed,
      avatar: `https://crafthead.net/helm/${encodeURIComponent(account.author || trimmed)}/64`,
      message: '로그인되었습니다.'
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || '서버 오류' }, { status: 500 })
  }
}

