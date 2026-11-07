'use client'

import React, { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

interface ServerStatus {
  online: boolean
  players?: {
    online: number
    max: number
  }
}

export default function ServerStatusBadge() {
  const [status, setStatus] = useState<ServerStatus>({
    online: true,
    players: { online: 0, max: 100 }
  })

  useEffect(() => {
    fetch('https://api.mcstatus.io/v2/status/java/mcravi.m-c.kr')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStatus({
            online: data.online ?? true,
            players: {
              online: data.players?.online ?? 0,
              max: data.players?.max ?? 100
            }
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs whitespace-nowrap shrink-0">
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
    </div>
  )
}
