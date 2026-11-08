'use client'

import React, { useState } from 'react'
import { 
  X, 
  Sparkles, 
  Clock, 
  Check, 
  Settings, 
  Save, 
  Layers, 
  Globe, 
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  Tag
} from 'lucide-react'
import { useVersion } from '@/lib/version'
import { useAuth } from '@/lib/auth'

interface VersionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VersionModal({ isOpen, onClose }: VersionModalProps) {
  const { 
    selectedVersion, 
    setSelectedVersion, 
    currentVer, 
    legacyVer, 
    updateWebsiteVersion 
  } = useVersion()
  const { isDeveloper } = useAuth()

  const [activeTab, setActiveTab] = useState<'current' | 'legacy'>(selectedVersion)
  const [isEditing, setIsEditing] = useState(false)

  // 편집 폼 상태
  const [editCurrVer, setEditCurrVer] = useState(currentVer.version)
  const [editCurrDesc, setEditCurrDesc] = useState(currentVer.description)
  const [editCurrDate, setEditCurrDate] = useState(currentVer.releaseDate)
  const [editLegacyVer, setEditLegacyVer] = useState(legacyVer.version)
  const [editLegacyDesc, setEditLegacyDesc] = useState(legacyVer.description)
  const [editLegacyDate, setEditLegacyDate] = useState(legacyVer.releaseDate)

  if (!isOpen) return null

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateWebsiteVersion('current', {
      version: editCurrVer.trim() || 'v2.2.0',
      description: editCurrDesc.trim() || currentVer.description,
      releaseDate: editCurrDate.trim() || currentVer.releaseDate
    })
    updateWebsiteVersion('legacy', {
      version: editLegacyVer.trim() || 'v1.0.0',
      description: editLegacyDesc.trim() || legacyVer.description,
      releaseDate: editLegacyDate.trim() || legacyVer.releaseDate
    })
    setIsEditing(false)
    alert('웹사이트 버전 정보 설정이 저장되었습니다.')
  }

  const activeData = activeTab === 'current' ? currentVer : legacyVer

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-zinc-100 border border-white/[0.1] max-h-[90vh] overflow-y-auto">
        
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  라비위키 웹사이트 버전 정보
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentVer.version}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                라비위키 웹사이트의 지금 버전과 옛날 버전 변경 기록(체인지로그)입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isDeveloper && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition"
                title="웹사이트 버전 정보 설정 (개발자 전용)"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. 개발자 편집 모드 */}
        {isEditing ? (
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              👑 개발자 관리: 지금(최신) 웹사이트 버전과 옛날(초기) 버전의 번호 및 릴리즈 정보를 직접 설정합니다.
            </div>

            <div className="space-y-4">
              {/* 지금 버전 설정 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. 지금 웹사이트 버전 (최신) 설정</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">버전 명칭 (예: v2.2.0)</label>
                    <input
                      type="text"
                      value={editCurrVer}
                      onChange={e => setEditCurrVer(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">배포 시기 (예: 2026-11-08)</label>
                    <input
                      type="text"
                      value={editCurrDate}
                      onChange={e => setEditCurrDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">버전 핵심 설명</label>
                  <input
                    type="text"
                    value={editCurrDesc}
                    onChange={e => setEditCurrDesc(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 옛날 버전 설정 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2. 옛날 웹사이트 버전 (초기) 설정</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">버전 명칭 (예: v1.0.0)</label>
                    <input
                      type="text"
                      value={editLegacyVer}
                      onChange={e => setEditLegacyVer(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">배포 시기 (예: 2025-12)</label>
                    <input
                      type="text"
                      value={editLegacyDate}
                      onChange={e => setEditLegacyDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">버전 핵심 설명</label>
                  <input
                    type="text"
                    value={editLegacyDesc}
                    onChange={e => setEditLegacyDesc(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          /* 2. 일반 뷰어: 지금 버전 vs 옛날 버전 탭 및 상세 내역 */
          <div className="space-y-5">
            
            {/* 상단 버전 선택 탭 (지금 vs 옛날) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('current')
                  setSelectedVersion('current')
                }}
                className={`py-3 px-4 rounded-xl transition-all flex flex-col items-center justify-center space-y-1 ${
                  activeTab === 'current'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs sm:text-sm font-extrabold font-mono">{currentVer.version}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    지금 버전 (최신)
                  </span>
                </div>
                <span className="text-[11px] opacity-80 hidden sm:inline">
                  {currentVer.releaseDate}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('legacy')
                  setSelectedVersion('legacy')
                }}
                className={`py-3 px-4 rounded-xl transition-all flex flex-col items-center justify-center space-y-1 ${
                  activeTab === 'legacy'
                    ? 'bg-amber-600 text-white shadow-md font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span className="text-xs sm:text-sm font-extrabold font-mono">{legacyVer.version}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    옛날 버전 (초기)
                  </span>
                </div>
                <span className="text-[11px] opacity-80 hidden sm:inline">
                  {legacyVer.releaseDate}
                </span>
              </button>
            </div>

            {/* 선택된 버전 상세 카드 */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-extrabold text-white">
                      라비위키 {activeData.version}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      activeTab === 'current'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    }`}>
                      {activeData.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {activeData.description}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-zinc-500 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeData.releaseDate}</span>
                </div>
              </div>

              {/* 기능 및 변경 기록 (체인지로그) */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{activeTab === 'current' ? '주요 개편 및 추가된 기능' : '초기 웹사이트 기본 구성'}</span>
                </p>
                <ul className="space-y-2 pt-1">
                  {activeData.changelog.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-zinc-300">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 하단 닫기 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white transition"
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
