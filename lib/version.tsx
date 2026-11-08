'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface ServerVersionInfo {
  id: 'current' | 'legacy'
  name: string
  label: string
  releaseDate: string
  status: 'active' | 'legacy'
  badge: string
  description: string
  features: string[]
}

export const DEFAULT_VERSIONS: Record<'current' | 'legacy', ServerVersionInfo> = {
  current: {
    id: 'current',
    name: '1.21.x',
    label: '지금 버전 (최신)',
    releaseDate: '최신 정규 시즌',
    status: 'active',
    badge: '현재 추천',
    description: '마인크래프트 JE 1.21.x 기반 최신 정통 판타지 RPG 시스템 및 신규 레이드',
    features: [
      'JE 1.21.x 최신 클라이언트 완벽 호환',
      '신규 직업 스킬 밸런스 및 5차 각성 시스템',
      '네더 대성채 신규 레이드 [붉은용 카라쉬]',
      '커스텀 3D 장비 모델링 및 전용 사운드팩 연동',
      '통합 GUI 경매장 및 1:1 안전 거래 시스템'
    ]
  },
  legacy: {
    id: 'legacy',
    name: '1.20.x',
    label: '옛날 버전 (클래식)',
    releaseDate: '클래식 시즌 아카이브',
    status: 'legacy',
    badge: '구버전 보관소',
    description: '마인크래프트 JE 1.20.x 기반 클래식 라비서버 뼈대 시스템 및 아카이브 기록',
    features: [
      'JE 1.20.x 계열 레거시 클라이언트 접속 안내',
      '클래식 3대 기본 직업(전사, 마법사, 궁수) 초기 스킬트리',
      '구버전 전설 장비 및 오리지널 필드 보스 패턴',
      '초기 스폰 광장 퀘스트 동선 및 아카이브 데이터'
    ]
  }
}

interface VersionContextType {
  selectedVersion: 'current' | 'legacy'
  setSelectedVersion: (ver: 'current' | 'legacy') => void
  currentVersionInfo: ServerVersionInfo
  legacyVersionInfo: ServerVersionInfo
  activeInfo: ServerVersionInfo
  updateCustomVersion: (verId: 'current' | 'legacy', updates: Partial<ServerVersionInfo>) => void
}

const VersionContext = createContext<VersionContextType>({
  selectedVersion: 'current',
  setSelectedVersion: () => {},
  currentVersionInfo: DEFAULT_VERSIONS.current,
  legacyVersionInfo: DEFAULT_VERSIONS.legacy,
  activeInfo: DEFAULT_VERSIONS.current,
  updateCustomVersion: () => {},
})

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [selectedVersion, setSelectedVersionState] = useState<'current' | 'legacy'>('current')
  const [versions, setVersions] = useState<Record<'current' | 'legacy', ServerVersionInfo>>(DEFAULT_VERSIONS)

  useEffect(() => {
    try {
      const savedVer = localStorage.getItem('ravi_selected_version') as 'current' | 'legacy' | null
      if (savedVer === 'current' || savedVer === 'legacy') {
        setSelectedVersionState(savedVer)
      }

      const savedCustom = localStorage.getItem('ravi_custom_versions')
      if (savedCustom) {
        setVersions(prev => ({
          ...prev,
          ...JSON.parse(savedCustom)
        }))
      }
    } catch (e) {}
  }, [])

  const setSelectedVersion = (ver: 'current' | 'legacy') => {
    setSelectedVersionState(ver)
    try {
      localStorage.setItem('ravi_selected_version', ver)
    } catch (e) {}
  }

  const updateCustomVersion = (verId: 'current' | 'legacy', updates: Partial<ServerVersionInfo>) => {
    setVersions(prev => {
      const next = {
        ...prev,
        [verId]: { ...prev[verId], ...updates }
      }
      try {
        localStorage.setItem('ravi_custom_versions', JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  return (
    <VersionContext.Provider
      value={{
        selectedVersion,
        setSelectedVersion,
        currentVersionInfo: versions.current,
        legacyVersionInfo: versions.legacy,
        activeInfo: versions[selectedVersion],
        updateCustomVersion
      }}
    >
      {children}
    </VersionContext.Provider>
  )
}

export function useVersion() {
  return useContext(VersionContext)
}
