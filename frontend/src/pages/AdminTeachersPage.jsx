// AdminTeachersPage.jsx — View all teachers with workload summary

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout         from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage   from '@/components/ErrorMessage'
import api            from '@/utils/api'
import {
  GraduationCap, Users, BookOpen,
  Calendar, Mail, ChevronRight, Search
} from 'lucide-react'

export default function AdminTeachersPage() {
  const navigate = useNavigate()

  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    api.get('/admin/teachers')
      .then(res => setTeachers(res.data.teachers || []))
      .catch(err => setError(err.response?.data?.error || 'Failed to load teachers.'))
      .finally(() => setLoading(false))
  }, [])

  // Filter by search
  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

  // Burnout colour based on workload
  const getBurnout = (t) => {
    const score = Math.min(100, Math.round(t.classCount * 15 + t.studentCount * 0.8 + t.periodCount * 0.5))
    return {
      score,
      color: score <= 33 ? '#10B981' : score <= 66 ? '#F59E0B' : '#EF4444',
      label: score <= 33 ? 'Low'     : score <= 66 ? 'Medium'  : 'High',
      bg:    score <= 33 ? '#ECFDF5' : score <= 66 ? '#FFFBEB' : '#FEF2F2',
    }
  }

  return (
    <Layout>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">Teachers</h1>
        </div>
        <p className="text-[#6B7280] text-sm ml-12">
          Overview of all teachers, their subjects, classes and workload
        </p>
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search by name, email or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
        />
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner text="Loading teachers..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center">
          <GraduationCap className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
          <p className="text-[#6B7280]">No teachers found.</p>
        </div>
      ) : (
        <>
          {/* Summary stat row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Teachers', value: teachers.length,                                              color: '#7C3AED', bg: '#F5F3FF' },
              { label: 'Total Students', value: teachers.reduce((s, t) => s + t.studentCount, 0),             color: '#10B981', bg: '#ECFDF5' },
              { label: 'Total Periods',  value: teachers.reduce((s, t) => s + t.periodCount,  0),             color: '#F59E0B', bg: '#FFFBEB' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center">
                <p className="text-3xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Teacher cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(teacher => {
              const burnout = getBurnout(teacher)
              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Card top */}
                  <div className="p-5 border-b border-[#E5E7EB]">
                    <div className="flex items-start justify-between mb-3">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#7C3AED] flex items-center justify-center shrink-0">
                          <span className="text-white text-lg font-display font-bold">
                            {teacher.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1A2E]">{teacher.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <BookOpen className="w-3 h-3 text-[#7C3AED]" />
                            <p className="text-xs text-[#7C3AED] font-medium">{teacher.subject}</p>
                          </div>
                        </div>
                      </div>

                      {/* Burnout badge */}
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{ color: burnout.color, backgroundColor: burnout.bg }}
                      >
                        {burnout.label} Load
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 divide-x divide-[#E5E7EB]">
                    {[
                      { icon: Users,        label: 'Students', value: teacher.studentCount },
                      { icon: GraduationCap, label: 'Classes',  value: teacher.classCount   },
                      { icon: Calendar,     label: 'Periods',  value: teacher.periodCount   },
                    ].map(stat => (
                      <div key={stat.label} className="flex flex-col items-center py-3 gap-1">
                        <p className="text-xl font-display font-bold text-[#1A1A2E]">{stat.value}</p>
                        <p className="text-[10px] text-[#6B7280]">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Classes list */}
                  {teacher.classes.length > 0 && (
                    <div className="px-5 pb-4 pt-3 border-t border-[#E5E7EB]">
                      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                        Classes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.classes.map(cls => (
                          <span
                            key={cls.id}
                            className="text-xs px-2.5 py-1 bg-[#F5F3FF] text-[#7C3AED] font-medium rounded-lg border border-[#EDE9FE]"
                          >
                            {cls.name} · {cls.studentCount} students
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Burnout bar */}
                  <div className="px-5 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider">
                        Workload Score
                      </p>
                      <p className="text-[10px] font-bold" style={{ color: burnout.color }}>
                        {burnout.score}/100
                      </p>
                    </div>
                    <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${burnout.score}%`, backgroundColor: burnout.color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Layout>
  )
}