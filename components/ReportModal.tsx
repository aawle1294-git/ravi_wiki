'use client'

import React, { useState } from 'react'
import { AlertTriangle, X, Send, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { createReport } from '@/lib/db'
import { useAuth } from '@/lib/auth'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetId: string
  targetType: 'wiki' | 'post' | 'comment'
  targetTitle: string
}

const REPORT_REASONS = [
  '욕설, 비하, 혐오 발언 및 분쟁 유도',
  '허위 정보, 사실 왜곡 및 트롤링',
  '도배, 불법 광고, 홍보성 게시글',
  '라비서버 공식 규칙 위반 (비인가 프로그램/핵/버그 악용 등)',
  '음란물 또는 부적절한 유해 콘텐츠',
  '기타 사유 (직접 입력)'
]

export default function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle
}: ReportModalProps) {
  const { user } = useAuth()
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0])
  const [details, setDetails] = useState('')
  const [reporterName, setReporterName] = useState(user.name || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createReport({
        targetId,
        targetType,
        targetTitle,
        reason: selectedReason,
        details: details.trim(),
        reporter: reporterName.trim() || user.name || '익명 유저'
      })

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 1800)
    } catch (e) {
      alert('신고 접수 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel max-w-lg w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-rose-500/20 text-zinc-100">
        
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white">게시물 신고하기</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">신고가 정상 접수되었습니다</h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              라비서버 관리자/개발진이 내용을 신속히 확인하여 커뮤니티 운영 규칙에 따라 조치하겠습니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 신고 대상 정보 박스 */}
            <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/25 text-xs text-zinc-300">
              <span className="font-semibold text-rose-300 block mb-1">
                신고 대상 {targetType === 'wiki' ? '자유위키 문서' : targetType === 'comment' ? '댓글' : '게시글'}
              </span>
              <p className="font-medium text-white truncate">
                "{targetTitle}"
              </p>
            </div>

            {/* 신고 사유 선택 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                신고 사유 선택 *
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map(reason => (
                  <label
                    key={reason}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedReason === reason
                        ? 'bg-rose-500/15 border-rose-500/40 text-white font-medium'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-rose-500 shrink-0"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 상세 사유 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                구체적인 사유 및 문제 내용 (선택)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="운영진이 원활히 확인할 수 있도록 문제 내용을 간략히 적어주세요."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/60 resize-none leading-relaxed"
              />
            </div>

            {/* 신고자 닉네임 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                신고자 닉네임
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="인게임 닉네임 또는 익명"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/60"
              />
            </div>

            {/* 하단 액션 버튼 */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 text-xs font-medium transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isSubmitting ? '접수 중...' : '신고 접수'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

