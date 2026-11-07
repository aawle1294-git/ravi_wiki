import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const validPassword = process.env.DEV_PASSWORD || 'ravi23control'

    if (password && password === validPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: '비밀번호가 일치하지 않습니다.' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: '잘못된 요청입니다.' },
      { status: 400 }
    )
  }
}

