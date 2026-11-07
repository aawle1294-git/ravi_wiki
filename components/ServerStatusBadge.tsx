'use client'

import React, { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

interface ServerStatus {
  online: boolean
  players?: {
    online: number
    max: number
    list?: Array<{ name_clean: string }>
  }
}

export default function ServerStatusBadge() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제 마인크래프트 서버 상태 라이브 쿼리
    fetch('https://api.mcstatus.io/v2/status/java/mcravi.m-c.kr')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.online === 'boolean') {
          setStatus({
            online: data.online,
            players: data.players ? {
              online: data.players.online ?? 0,
              max: data.players.max ?? 100,
              list: data.players.list || []
            } : undefined
          })
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading || !status) {
    return (
      <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-500 whitespace-nowrap shrink-0">
        <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></span>
        <span>서버 확인 중...</span>
      </div>
    )
  }

  const playerNames = status.players?.list?.map(p => p.name_clean).join(', ') || ''

  return (
    <div 
      className="hidden xl:flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs whitespace-nowrap shrink-0 group relative"
      title={playerNames ? `현재 접속자: ${playerNames}` : '라비서버 실시간 상태'}
    >
      <div className="flex items-center space-x-1.5">
        <span className="relative flex h-2 w-2">
          {status.online ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          )}
        </span>
        <span className="font-semibold text-slate-300">
          {status.online ? '온라인' : '점검중'}
        </span>
      </div>

      {status.online && status.players && (
        <div className="flex items-center space-x-1 pl-1.5 border-l border-slate-700 text-purple-300 font-mono text-[11px]">
          <Users className="w-3 h-3 text-purple-400" />
          <span>{status.players.online}명</span>
        </div>
      )}

      {/* 마우스 호버 시 실제 접속자 닉네임 목록 툴팁 */}
      {status.players?.list && status.players.list.length > 0 && (
        <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50 bg-slate-900 border border-purple-500/40 rounded-xl p-2.5 shadow-2xl text-[11px] text-slate-200">
          <div className="text-purple-300 font-bold mb-1 pb-1 border-b border-slate-800">
            실시간 인게임 접속자 ({status.players.online}명)
          </div>
          <ul className="space-y-0.5 font-mono">
            {status.players.list.map((p, idx) => (
              <li key={idx} className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{p.name_clean}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
