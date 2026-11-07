'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, Users } from 'lucide-react'

interface ServerStatus {
  online: boolean
  players?: {
    online: number
    max: number
  }
  version?: string
}

export default function ServerStatusBadge() {
  const [status, setStatus] = useState<ServerStatus>({
    online: true,
    players: { online: 0, max: 100 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 마인크래프트 공개 상태 API (mcstatus.io)
    fetch('https://api.mcstatus.io/v2/status/java/mcravi.m-c.kr')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStatus({
            online: data.online ?? true,
            players: {
              online: data.players?.online ?? 0,
              max: data.players?.max ?? 100
            },
            version: data.version?.name_clean || '1.21.x'
          })
        }
        setLoading(false)
      })
      .catch(() => {
        // API 장애 시 기본 fallback
        setLoading(false)
      })
  }, [])

  return (
    <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
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
          {status.online ? '서버 정상 운영 중' : '서버 점검 중'}
        </span>
      </div>

      {status.online && status.players && (
        <div className="flex items-center space-x-1 pl-2 border-l border-slate-700 text-purple-300 font-mono">
          <Users className="w-3 h-3 text-purple-400" />
          <span>{status.players.online}명 접속</span>
        </div>
      )}
    </div>
  )
}

