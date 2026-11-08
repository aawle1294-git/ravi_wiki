'use client'

import React, { useState } from 'react'
import { 
  X, 
  Sparkles, 
  Clock, 
  Check, 
  Settings, 
  Save, 
  ArrowRight,
  Layers,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { useVersion, ServerVersionInfo } from '@/lib/version'
import { useAuth } from '@/lib/auth'

interface VersionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VersionModal({ isOpen, onClose }: VersionModalProps) {
  const { 
    selectedVersion, 
    setSelectedVersion, 
    currentVersionInfo, 
    legacyVersionInfo, 
    updateCustomVersion 
  } = useVersion()
  const { isDeveloper } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [currName, setCurrName] = useState(currentVersionInfo.name)
  const [currDesc, setCurrDesc] = useState(currentVersionInfo.description)
  const [legacyName, setLegacyName] = useState(legacyVersionInfo.name)
  const [legacyDesc, setLegacyDesc] = useState(legacyVersionInfo.description)

  if (!isOpen) return null

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateCustomVersion('current', {
      name: currName.trim() || '1.21.x',
      description: currDesc.trim() || currentVersionInfo.description
    })
    updateCustomVersion('legacy', {
      name: legacyName.trim() || '1.20.x',
      description: legacyDesc.trim() || legacyVersionInfo.description
    })
    setIsEditing(false)
    alert('버전 정보 설정이 저장되었습니다.')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-zinc-100 border border-white/[0.1] max-h-[90vh] overflow-y-auto">
        
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>라비서버 버전 시스템</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  지금 & 옛날버전
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                원하는 버전을 선택하여 관련 가이드와 스펙을 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isDeveloper && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition"
                title="버전 정보 수정 (개발자 전용)"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. 개발자 편집 모드 */}
        {isEditing ? (
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              👑 개발자 모드: 지금(최신) 버전과 옛날(구버전)의 명칭 및 설명을 직접 수정할 수 있습니다.
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. 지금 버전 (최신) 설정</span>
                </h4>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">버전 명칭 (예: 1.21.x)</label>
                  <input
                    type="text"
                    value={currName}
                    onChange={e => setCurrName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">설명 요약</label>
                  <textarea
                    value={currDesc}
                    onChange={e => setCurrDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2. 옛날 버전 (클래식) 설정</span>
                </h4>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">버전 명칭 (예: 1.20.x)</label>
                  <input
                    type="text"
                    value={legacyName}
                    onChange={e => setLegacyName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">설명 요약</label>
                  <textarea
                    value={legacyDesc}
                    onChange={e => setLegacyDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] text-xs font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>저장 완료</span>
              </button>
            </div>
          </form>
        ) : (
          /* 2. 일반 열람 및 버전 선택 모드 */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* [카드 1] 지금 버전 */}
              <div 
                onClick={() => setSelectedVersion('current')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedVersion === 'current'
                    ? 'bg-indigo-600/15 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/40'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {currentVersionInfo.badge}
                    </span>
                    {selectedVersion === 'current' && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-indigo-300">
                        <Check className="w-4 h-4 text-indigo-400" />
                        <span>선택됨</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-white">
                      JE {currentVersionInfo.name}
                    </h4>
                    <p className="text-xs text-indigo-200 font-semibold mt-0.5">
                      {currentVersionInfo.label}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {currentVersionInfo.description}
                  </p>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <p className="text-[11px] font-semibold text-zinc-300">핵심 특징:</p>
                    <ul className="space-y-1 text-[11px] text-zinc-400">
                      {currentVersionInfo.features.map((f, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedVersion('current')
                      onClose()
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      selectedVersion === 'current'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300'
                    }`}
                  >
                    <span>지금 버전으로 탐색</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* [카드 2] 옛날 버전 */}
              <div 
                onClick={() => setSelectedVersion('legacy')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedVersion === 'legacy'
                    ? 'bg-amber-600/15 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {legacyVersionInfo.badge}
                    </span>
                    {selectedVersion === 'legacy' && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-amber-300">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>선택됨</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-white">
                      JE {legacyVersionInfo.name}
                    </h4>
                    <p className="text-xs text-amber-200 font-semibold mt-0.5">
                      {legacyVersionInfo.label}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {legacyVersionInfo.description}
                  </p>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <p className="text-[11px] font-semibold text-zinc-300">아카이브 내용:</p>
                    <ul className="space-y-1 text-[11px] text-zinc-400">
                      {legacyVersionInfo.features.map((f, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedVersion('legacy')
                      onClose()
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      selectedVersion === 'legacy'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300'
                    }`}
                  >
                    <span>옛날 버전으로 탐색</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 하단 안내 배너 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center space-x-2">
                <span className="text-base">💡</span>
                <span>
                  상단 네비바의 버전 버튼을 언제든 클릭하여 <strong>지금/옛날 버전</strong>을 전환할 수 있습니다.
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold shrink-0"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
