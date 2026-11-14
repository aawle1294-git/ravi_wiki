import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password, nickname } = await request.json()
    const validPassword = process.env.DEV_PASSWORD || 'ravi23control'

    if (password && password === validPassword) {
      const trimmedNick = (nickname && typeof nickname === 'string' && nickname.trim()) || '서버 개발자'
      const isGeneric = trimmedNick === '서버 개발자' || trimmedNick === '개발자'
      const avatar = isGeneric
        ? '/logo.png'
        : `https://crafthead.net/helm/${encodeURIComponent(trimmedNick)}/64`

      return NextResponse.json({
        success: true,
        role: 'developer',
        nickname: trimmedNick,
        avatar,
        message: '👑 개발자 권한으로 인증되었습니다!'
      })
    }

    return NextResponse.json(
      { success: false, error: '개발자 암호가 일치하지 않습니다.' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: '잘못된 요청입니다.' },
      { status: 400 }
    )
  }
}


