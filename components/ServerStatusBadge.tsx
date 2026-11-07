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
    // 실제 마인크래프트 서버 상태 라이브 쿼리 (mcravi.m-c.kr)
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
      <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-500 whitespace-nowrap shrink-0">
        <span className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse"></span>
        <span className="text-[11px] font-medium">서버 조회 중</span>
      </div>
    )
  }

  const playerNames = status.players?.list?.map(p => p.name_clean).join(', ') || ''

  return (
    <div 
      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs whitespace-nowrap shrink-0 group relative cursor-pointer transition-colors"
      title={playerNames ? `실시간 접속자: ${playerNames}` : '라비서버 실시간 상태'}
    >
      <div className="flex items-center space-x-1.5">
        <span className="relative flex h-2 w-2">
          {status.online ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          )}
        </span>
        <span className="font-semibold text-zinc-300 text-[11px] tracking-tight">
          {status.online ? '온라인' : '점검중'}
        </span>
      </div>

      {status.online && status.players && (
        <div className="flex items-center space-x-1 pl-1.5 border-l border-white/[0.1] text-zinc-300 font-mono text-[11px]">
          <Users className="w-3 h-3 text-indigo-400" />
          <span className="font-medium text-white">{status.players.online}명</span>
        </div>
      )}

      {/* 마우스 호버 시 실제 접속자 닉네임 목록 툴팁 */}
      {status.players?.list && status.players.list.length > 0 && (
        <div className="absolute top-full right-0 sm:left-0 mt-2 hidden group-hover:block z-50 bg-[#0d0f17] border border-white/[0.12] rounded-2xl p-3 shadow-2xl text-[11px] text-zinc-200 min-w-[180px] backdrop-blur-xl">
          <div className="text-indigo-300 font-semibold mb-1.5 pb-1.5 border-b border-white/[0.08] flex items-center justify-between">
            <span>실시간 접속자</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono">
              {status.players.online}명
            </span>
          </div>
          <ul className="space-y-1 font-mono max-h-40 overflow-y-auto">
            {status.players.list.map((p, idx) => (
              <li key={idx} className="flex items-center space-x-1.5 text-zinc-300 text-[11px]">
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
