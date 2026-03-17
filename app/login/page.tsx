'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pendingUrl, setPendingUrl] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('pendingUrl')
    if (saved) setPendingUrl(saved)

    const params = new URLSearchParams(window.location.search)
    if (params.get('message') === 'create-account') {
      setIsSignUp(true)
    }
  }, [])

  const shortenPendingUrl = async (token: string) => {
    const savedUrl = localStorage.getItem('pendingUrl')
    const savedAlias = localStorage.getItem('pendingAlias')
    const savedExpiry = localStorage.getItem('pendingExpiry')

    if (!savedUrl) return

    await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url: savedUrl,
        customAlias: savedAlias || undefined,
        expiresAt: savedExpiry || undefined
      }),
    })

    localStorage.removeItem('pendingUrl')
    localStorage.removeItem('pendingAlias')
    localStorage.removeItem('pendingExpiry')
  }

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const savedUrl = localStorage.getItem('pendingUrl') || ''
      const savedAlias = localStorage.getItem('pendingAlias') || ''
      const savedExpiry = localStorage.getItem('pendingExpiry') || ''

      const redirectUrl = `${window.location.origin}/auth/callback?pendingUrl=${encodeURIComponent(savedUrl)}&pendingAlias=${encodeURIComponent(savedAlias)}&pendingExpiry=${encodeURIComponent(savedExpiry)}`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      })

      if (error) {
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('user already exists') ||
          error.message.toLowerCase().includes('already been registered')
        ) {
          setMessage('ALREADY_EXISTS')
        } else if (error.message.toLowerCase().includes('rate limit')) {
          setMessage('Too many attempts. Please wait a few minutes and try again.')
        } else {
          setMessage(error.message)
        }
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage('ALREADY_EXISTS')
      } else {
        localStorage.removeItem('pendingUrl')
        localStorage.removeItem('pendingAlias')
        localStorage.removeItem('pendingExpiry')
        setMessage('CHECK_EMAIL')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (error.message.toLowerCase().includes('missing email or phone')) {
          setMessage('Please enter your email address.')
        } else if (error.message.toLowerCase().includes('invalid login credentials') ||
                   error.message.toLowerCase().includes('invalid credentials')) {
          setMessage('Incorrect email or password. Please try again.')
        } else {
          setMessage(error.message)
        }
      } else {
        if (data.session) {
          await shortenPendingUrl(data.session.access_token)
        }
        router.push('/dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-white/10 px-6 md:px-12 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-xl font-black tracking-tighter hover:text-green-400 transition-all"
        >
          TRIMLY
        </button>
        <p className="text-xs text-white/30 uppercase tracking-widest">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </p>
      </nav>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">

        {/* Left — Branding */}
        <div className="hidden md:flex border-r border-white/10 p-12 flex-col justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase mb-6">
              Welcome
            </p>
            <h2 className="text-7xl xl:text-7xl font-black tracking-tighter leading-none">
               YOUR<span className="font-light italic text-white/30">LINKS.</span><br />
            </h2>
            <h2 className="text-7xl xl:text-6xl font-black tracking-tighter leading-none">
               <span className="text-green-400">YOUR</span> DATA.
            </h2>  
            
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Track Clicks', 'Custom Aliases', 'Link Expiry', 'Dashboard'].map((f) => (
              <div key={f} className="border border-white/10 px-4 py-3">
                <p className="text-xs text-white/40 uppercase tracking-widest">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center max-w-md w-full mx-auto md:mx-0">

          {/* Pending URL notice */}
          {pendingUrl && (
            <div className="mb-6 border border-green-400/30 bg-green-400/5 px-4 py-3">
              <p className="text-green-400 text-xs uppercase tracking-widest mb-1">
                Almost there!
              </p>
              <p className="text-white/60 text-sm">
                Create an account to shorten:
              </p>
              <p className="text-white/40 text-xs font-mono mt-1 truncate">
                {pendingUrl}
              </p>
            </div>
          )}

          <p className="text-xs font-medium tracking-widest text-white/40 uppercase mb-8">
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>

          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 focus:outline-none focus:border-green-400 text-base placeholder:text-white/20 transition-all"
            />

            {/* Password field with show/hide */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 focus:outline-none focus:border-green-400 text-base placeholder:text-white/20 transition-all pr-20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-4 bg-green-400 hover:bg-green-300 text-black font-black text-sm tracking-widest uppercase transition-all disabled:opacity-50"
            >
              {loading ? 'PLEASE WAIT...' : isSignUp ? 'CREATE ACCOUNT →' : 'SIGN IN →'}
            </button>
          </div>

          {/* Message blocks */}
          {message === 'ALREADY_EXISTS' && (
            <div className="mt-4 border border-red-400/30 bg-red-400/5 px-4 py-3">
              <p className="text-red-400 text-sm font-medium">
                An account with this email already exists.
              </p>
              <button
                onClick={() => {
                  setIsSignUp(false)
                  setMessage('')
                }}
                className="text-xs text-red-400/60 hover:text-red-400 uppercase tracking-widest mt-2 transition-all"
              >
                Sign in instead →
              </button>
            </div>
          )}

          {message === 'CHECK_EMAIL' && (
            <div className="mt-4 border border-green-400/30 bg-green-400/5 px-4 py-3">
              <p className="text-green-400 text-sm font-medium">
                Check your email to confirm your account!
              </p>
            </div>
          )}

          {message !== 'ALREADY_EXISTS' && message !== 'CHECK_EMAIL' && message && (
            <div className="mt-4 border border-yellow-400/30 bg-yellow-400/5 px-4 py-3">
              <p className="text-yellow-400 text-sm">{message}</p>
            </div>
          )}

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-white/40 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
              }}
              className="text-green-400 text-sm font-medium hover:text-green-300 transition-all mt-1"
            >
              {isSignUp ? 'Sign in instead →' : 'Create one for free →'}
            </button>
          </div>
        </div>
      </div>

    </main>
  )
}