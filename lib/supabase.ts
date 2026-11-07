import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabase 환경변수가 설정되어 있는지 확인
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
)

// Supabase 클라이언트 생성 (미설정 시 null 안전 처리)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * 🎮 디스코드 원클릭 로그인
 * 마인크래프트 유저들이 별도 회원가입 없이 
 * 가장 편하게 로그인할 수 있는 디스코드 OAuth 방식입니다.
 */
export async function signInWithDiscord() {
  if (!supabase) {
    alert('Supabase 환경 변수가 설정되지 않았습니다. 현재는 게스트(닉네임) 모드로 동작합니다!')
    return
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  })

  if (error) {
    console.error('디스코드 로그인 오류:', error.message)
    alert(`로그인 중 오류가 발생했습니다: ${error.message}`)
  }
}

/**
 * 🚪 로그아웃
 */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

