'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface WebsiteVersionInfo {
  id: 'current' | 'legacy'
  version: string
  label: string
  releaseDate: string
  status: 'active' | 'legacy'
  badge: string
  description: string
  changelog: string[]
}

export const DEFAULT_WEBSITE_VERSIONS: Record<'current' | 'legacy', WebsiteVersionInfo> = {
  current: {
    id: 'current',
    version: 'v2.2.0',
    label: '지금 버전 (최신)',
    releaseDate: '2026-11-08 최신 배포',
    status: 'active',
    badge: '현재 최신 버전',
    description: '나무위키 스타일 오픈 백과사전, 유저 신고 시스템, 화이트 모드 및 2단 레이아웃 개편',
    changelog: [
      '📖 나무위키 스타일 중앙 거대 본문 뷰어 및 우측 문서 목록 사이드바 구현',
      '🔍 상단 통합 검색바 (실시간 문서 매칭 드롭다운 & 원클릭 새 문서 생성 연동)',
      '✏️ 나무위키식 인라인 자유 기여 편집 (누구나 문서 보완 및 즉시 저장 가능)',
      '💬 자유위키와 분리된 독립형 커뮤니티 자유 게시판 공간 (#board)',
      '🚨 악성 게시글/위키 유저 신고 시스템 및 관리자 전용 신고 보관함',
      '☀️/🌙 화이트 모드 & 다크 모드 원클릭 테마 전환 시스템',
      '📝 마크다운 에디터 및 본문 2,000자 제한 & 실시간 글자수 카운터',
      '✨ 황금 R 엠블럼 고화질 무손실 로고 및 파비콘 리뉴얼'
    ]
  },
  legacy: {
    id: 'legacy',
    version: 'v1.0.0',
    label: '옛날 버전 (초기)',
    releaseDate: '2025-12 초기 배포',
    status: 'legacy',
    badge: '이전 초기 버전',
    description: '라비서버 공식 가이드 및 단순 카드 그리드 게시판 중심의 초기 웹사이트',
    changelog: [
      '📘 공식 시스템 가이드 및 서버 규칙 열람 기능',
      '💬 포럼형 단순 카드 그리드 게시판 목록',
      '🌙 흑요석 다크 모드 단일 테마',
      '🔐 개발자 전용 로그인 인증 및 기본 공식 문서 편집'
    ]
  }
}

interface WebsiteVersionContextType {
  selectedVersion: 'current' | 'legacy'
  setSelectedVersion: (ver: 'current' | 'legacy') => void
  currentVer: WebsiteVersionInfo
  legacyVer: WebsiteVersionInfo
  activeVer: WebsiteVersionInfo
  updateWebsiteVersion: (verId: 'current' | 'legacy', updates: Partial<WebsiteVersionInfo>) => void
}

const WebsiteVersionContext = createContext<WebsiteVersionContextType>({
  selectedVersion: 'current',
  setSelectedVersion: () => {},
  currentVer: DEFAULT_WEBSITE_VERSIONS.current,
  legacyVer: DEFAULT_WEBSITE_VERSIONS.legacy,
  activeVer: DEFAULT_WEBSITE_VERSIONS.current,
  updateWebsiteVersion: () => {},
})

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [selectedVersion, setSelectedVersionState] = useState<'current' | 'legacy'>('current')
  const [versions, setVersions] = useState<Record<'current' | 'legacy', WebsiteVersionInfo>>(DEFAULT_WEBSITE_VERSIONS)

  useEffect(() => {
    try {
      const savedVer = localStorage.getItem('ravi_selected_site_version') as 'current' | 'legacy' | null
      if (savedVer === 'current' || savedVer === 'legacy') {
        setSelectedVersionState(savedVer)
      }

      const savedCustom = localStorage.getItem('ravi_custom_site_versions')
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
      localStorage.setItem('ravi_selected_site_version', ver)
    } catch (e) {}
  }

  const updateWebsiteVersion = (verId: 'current' | 'legacy', updates: Partial<WebsiteVersionInfo>) => {
    setVersions(prev => {
      const next = {
        ...prev,
        [verId]: { ...prev[verId], ...updates }
      }
      try {
        localStorage.setItem('ravi_custom_site_versions', JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  return (
    <WebsiteVersionContext.Provider
      value={{
        selectedVersion,
        setSelectedVersion,
        currentVer: versions.current,
        legacyVer: versions.legacy,
        activeVer: versions[selectedVersion],
        updateWebsiteVersion
      }}
    >
      {children}
    </WebsiteVersionContext.Provider>
  )
}

export function useVersion() {
  return useContext(WebsiteVersionContext)
}
