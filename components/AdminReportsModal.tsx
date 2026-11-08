'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShieldAlert, 
  X, 
  Check, 
  Trash2, 
  ExternalLink, 
  Clock, 
  User, 
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react'
import { Report, getReports, updateReportStatus, deleteReport, deleteFreeDoc } from '@/lib/db'

interface AdminReportsModalProps {
  isOpen: boolean
  onClose: () => void
  onReportsUpdated?: () => void
}

export default function AdminReportsModal({
  isOpen,
  onClose,
  onReportsUpdated
}: AdminReportsModalProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadReports = async () => {
    setLoading(true)
    const list = await getReports()
    setReports(list)
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      loadReports()
    }
  }, [isOpen])

  if (!isOpen) return null

  // 신고 상태 변경 핸들러
  const handleStatusChange = async (reportId: string, status: 'pending' | 'resolved' | 'dismissed') => {
    setActionLoadingId(reportId)
    await updateReportStatus(reportId, status)
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r))
    if (onReportsUpdated) onReportsUpdated()
    setActionLoadingId(null)
  }

  // 문제 게시글 즉시 삭제 + 신고 처리 완료 핸들러
  const handleDeleteTargetPost = async (report: Report) => {
    if (!confirm(`'${report.targetTitle}' 게시물(문서)을 즉시 삭제하고 신고 처리를 완료하시겠습니까?\n삭제된 게시물은 복구할 수 없습니다.`)) {
      return
    }

    setActionLoadingId(report.id)
    try {
      await deleteFreeDoc(report.targetId)
      await updateReportStatus(report.id, 'resolved')
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r))
      if (onReportsUpdated) onReportsUpdated()
      alert('게시물이 성공적으로 삭제되었으며 신고가 처리완료되었습니다.')
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // 신고 내역 자체 삭제 핸들러
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('신고 기록을 보관함에서 삭제하시겠습니까?')) return
    setActionLoadingId(reportId)
    await deleteReport(reportId)
    setReports(prev => prev.filter(r => r.id !== reportId))
    if (onReportsUpdated) onReportsUpdated()
    setActionLoadingId(null)
  }

  const filteredReports = reports.filter(r => {
    if (activeTab === 'all') return true
    return r.status === activeTab
  })

  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel max-w-4xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-rose-500/30 text-zinc-100 max-h-[90vh] flex flex-col">
        
        {/* 상단 타이틀 바 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">관리자 신고 보관함</h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold animate-pulse">
                    미처리 {pendingCount}건
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">유저들이 접수한 자유위키 및 게시판 게시글 신고 목록을 관리합니다.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadReports}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'pending'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            🚨 미처리 대기중 ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            전체 내역 ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'resolved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            ✅ 처리완료 ({reports.filter(r => r.status === 'resolved').length})
          </button>
          <button
            onClick={() => setActiveTab('dismissed')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'dismissed'
                ? 'bg-zinc-700 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            기각됨 ({reports.filter(r => r.status === 'dismissed').length})
          </button>
        </div>

        {/* 신고 목록 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-16 text-zinc-500 text-xs">신고 내역을 불러오는 중...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs glass-panel rounded-2xl border border-dashed border-white/[0.08]">
              해당 분류의 신고 내역이 없습니다.
            </div>
          ) : (
            filteredReports.map(report => (
              <div
                key={report.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] transition space-y-3"
              >
                {/* 상단 뱃지 & 일시 */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      report.targetType === 'wiki'
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                        : 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                    }`}>
                      {report.targetType === 'wiki' ? '📖 자유위키 문서' : '💬 자유게시판 글'}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      report.status === 'pending'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : report.status === 'resolved'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-500/20 border-zinc-500/40 text-zinc-400'
                    }`}>
                      {report.status === 'pending' ? '🚨 대기중' : report.status === 'resolved' ? '✅ 처리완료' : '기각됨'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-zinc-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-zinc-500" />
                      <span>신고자: <strong className="text-zinc-200">{report.reporter}</strong></span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{report.createdAt}</span>
                    </span>
                  </div>
                </div>

                {/* 신고 대상 제목 & 사유 */}
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.05] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{report.targetTitle}</span>
                    </h4>
                    <Link
                      href={`/free-wiki/${report.targetId}`}
                      target="_blank"
                      className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-200 transition shrink-0 ml-2"
                    >
                      <span>게시물 확인</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="text-xs">
                    <span className="text-rose-400 font-semibold">[사유] </span>
                    <span className="text-zinc-200 font-medium">{report.reason}</span>
                  </div>

                  {report.details && (
                    <p className="text-xs text-zinc-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] leading-relaxed italic">
                      "{report.details}"
                    </p>
                  )}
                </div>

                {/* 관리자 액션 버튼 모음 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                  <div className="flex items-center space-x-2">
                    {/* 문제 글 즉시 삭제 */}
                    <button
                      onClick={() => handleDeleteTargetPost(report)}
                      disabled={actionLoadingId === report.id}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                      title="해당 게시물을 즉시 영구 삭제하고 신고를 처리완료합니다."
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>문제 게시물 즉시 삭제</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {report.status !== 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        disabled={actionLoadingId === report.id}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>처리 완료</span>
                      </button>
                    )}
                    {report.status !== 'dismissed' && (
                      <button
                        onClick={() => handleStatusChange(report.id, 'dismissed')}
                        disabled={actionLoadingId === report.id}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 text-xs font-medium transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>신고 기각</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={actionLoadingId === report.id}
                      className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-white/[0.04] transition"
                      title="신고 기록 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

