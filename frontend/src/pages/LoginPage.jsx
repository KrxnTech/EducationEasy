// LoginPage.jsx — Playful Geometric Redesign
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/utils/api'
import { GraduationCap, Eye, EyeOff, Loader2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import ErrorMessage from '@/components/ErrorMessage'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [role, setRole] = useState('teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password, role })
      const { token, user } = res.data
      login(user, token)
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoRole) => {
    setRole(demoRole)
    if (demoRole === 'admin') {
      setEmail('admin@eduease.com')
      setPassword('admin123')
    } else {
      setEmail('priya@eduease.com')
      setPassword('teacher123')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-body overflow-hidden selection:bg-tertiary selection:text-foreground">

      {/* ── Left Panel — The "Stable Grid, Wild Decoration" ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent flex-col justify-between p-16 relative overflow-hidden border-r-4 border-foreground">

        {/* Wild Decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-tertiary rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-secondary rounded-full border-4 border-foreground shadow-pop-secondary rotate-12" />
        <div className="absolute top-1/4 right-12 w-24 h-24 bg-quaternary rounded-2xl border-4 border-foreground shadow-pop rotate-[-15deg] animate-bounce" />
        <div className="absolute top-1/2 left-8 w-16 h-16 bg-white rounded-full border-4 border-foreground shadow-pop" />

        {/* Dot Grid Overlay */}
        <div className="absolute inset-0 bg-dot-grid opacity-20" />

        {/* Logo Section */}
        <div className="relative z-10 animate-bounce-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border-4 border-foreground rounded-2xl shadow-pop flex items-center justify-center rotate--3d">
              <GraduationCap className="w-8 h-8 text-accent stroke-[2.5px] animate-wiggle" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-4xl text-white tracking-tight drop-shadow-[2px_2px_0px_#1E293B]">EduEase</span>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10">
          <h1 className="font-heading text-6xl font-extrabold text-white leading-[1.1] mb-8 animate-bounce-in">
            Teaching<br />
            <span className="text-tertiary relative decoration-foreground decoration-8">made Fun</span>
          </h1>
          <p className="text-black text-xl font-medium max-w-md leading-relaxed mb-12 opacity-90">
            Ditch the paperwork Automate attendance and generate reports while you sip your coffee ☕
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { text: 'Voice Attendance', color: 'bg-secondary' },
              { text: 'AI Reports', color: 'bg-quaternary' },
              { text: 'Smart Alerts', color: 'bg-tertiary' },
              { text: 'Heatmaps', color: 'bg-white' },
              { text: 'AI Grade Analysis', color: 'bg-quaternary' },
            ].map((f, i) => (
              <div
                key={f.text}
                className={`${f.color} border-2 border-foreground p-3 rounded-xl shadow-pop text-foreground font-bold flex items-center gap-2 hover:rotate-2 transition-playful`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-foreground bg-muted overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="avatar" />
              </div>
            ))}
          </div>
          <p className="text-white font-bold text-sm"></p>
        </div>
      </div>

      {/* ── Right Panel — The Sticker Form ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dot-grid relative">

        {/* Scrawled arrow decoration (Hidden on mobile) */}
        <div className="hidden xl:block absolute -left-10 top-1/2 -translate-y-1/2 z-20">
          <div className="bg-white border-2 border-foreground p-3 rounded-full shadow-pop-tertiary -rotate-90">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

        <div className="w-full max-w-120 relative">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-accent border-2 border-foreground rounded-lg shadow-pop flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-black text-2xl">EduEase</span>
          </div>

          {/* Main Card — The "Sticker" Card */}
          <div className="bg-white border-4 border-foreground rounded-4xl p-10 shadow-pop-secondary relative animate-bounce-in hover:rotate-1 hover:scale-[1.01] transition-playful">

            {/* Corner Accent Shape */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-tertiary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop rotate-12 z-10">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="font-heading text-4xl font-black mb-2">Welcome back !</h2>
            <p className="text-muted-foreground font-medium mb-10">Choose your role and let's get busy</p>

            {/* Role Toggle — Tactile Style */}
            <div className="flex gap-4 mb-8">
              {['teacher', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError('') }}
                  className={`flex-1 py-4 px-2 rounded-2xl font-black text-sm uppercase tracking-wider border-4 border-foreground transition-playful ${role === r
                    ? 'bg-accent text-white shadow-pop translate-x-0.5 translate-y-0.5'
                    : 'bg-white text-foreground hover:bg-muted'
                    }`}
                >
                  {r === 'teacher' ? '👩‍🏫 Teacher' : '🛡️ Admin'}
                </button>
              ))}
            </div>

            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-foreground mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white border-4 border-foreground rounded-2xl text-lg font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-accent focus:shadow-pop transition-playful group-hover:shadow-sm"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-foreground mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white border-4 border-foreground rounded-2xl text-lg font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-accent focus:shadow-pop transition-playful group-hover:shadow-sm pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-accent text-white font-black text-xl rounded-full border-4 border-foreground shadow-pop shadow-pop-hover shadow-pop-active transition-playful flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>Let's Go!</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Sticker */}
            <div className="mt-10 pt-8 border-t-4 border-dotted border-foreground">
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4 text-center">
                ✨ Quick Access Stickers ✨
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => fillDemo('teacher')}
                  className="px-4 py-2 bg-secondary/10 hover:bg-secondary text-secondary-foreground border-2 border-foreground rounded-lg text-xs font-black -rotate-2 transition-playful hover:rotate-0 hover:scale-110 shadow-sm"
                >
                  Priya (Teacher)
                </button>
                <button
                  onClick={() => fillDemo('admin')}
                  className="px-4 py-2 bg-tertiary/10 hover:bg-tertiary text-tertiary-foreground border-2 border-foreground rounded-lg text-xs font-black rotate-3 transition-playful hover:rotate-0 hover:scale-110 shadow-sm"
                >
                  Admin (Principal)
                </button>
              </div>
            </div>
          </div>

          {/* Floating decorative triangles/blobs around form */}
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-quaternary border-4 border-foreground rounded-full shadow-pop -z-10 animate-pulse" />
          <div className="absolute -top-10 -left-20 w-12 h-12 bg-secondary border-2 border-foreground rotate-45 -z-10" />
        </div>
      </div>
    </div>
  )
}