'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkSession()
  }, [])

  const handleShorten = async () => {
    if (!url) return
    setLoading(true)

    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`
    }

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Save the URL to localStorage and redirect to login
      localStorage.setItem('pendingUrl', finalUrl)
      localStorage.setItem('pendingAlias', customAlias || '')
      localStorage.setItem('pendingExpiry', expiryDate || '')
      window.location.href = '/login?message=create-account'
      return
    }

    const token = session?.access_token
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        url: finalUrl,
        customAlias: customAlias || undefined,
        expiresAt: expiryDate || undefined
      }),
    })

    const data = await res.json()
    if (data.shortUrl) {
      window.location.href = '/dashboard'
    } else {
      alert(data.error || 'Something went wrong!')
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-white/10 px-6 md:px-12 py-5 flex items-center justify-between">
      <button
        onClick={() => window.location.href = '/'}
        className="text-xl font-black tracking-tighter hover:text-green-400 transition-all"
        >
          TRIMLY
        </button>
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-sm font-medium text-green-400 hover:text-green-300 transition-all"
            >
              Dashboard →
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
              className="text-sm font-medium text-white/60 hover:text-white transition-all"
            >
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 grid grid-cols-1 md:grid-cols-2 border-b border-white/10">

        {/* Left */}
        <div className="border-b md:border-b-0 md:border-r border-white/10 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase mb-6">
              URL Shortener — 2026
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
              TRIM.<br />
              <span className="font-light italic text-white/30">share.</span><br />
              <span className="text-green-400">TRACK.</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg font-light max-w-sm leading-relaxed">
              Shorten any link in seconds. Track every click. Share anywhere.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-3">
            {[
              { label: 'Fast', desc: 'Instant redirect' },
              { label: 'Smart', desc: 'Click analytics' },
              { label: 'Clean', desc: 'Custom aliases' },
            ].map((item) => (
              <div key={item.label} className="border border-white/10 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest">{item.label}</p>
                <p className="text-xs text-white/30 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <p className="text-xs font-medium tracking-widest text-white/40 uppercase mb-6">
            Shorten a URL
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
              className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 focus:outline-none focus:border-green-400 text-base placeholder:text-white/20 transition-all"
            />
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-white/30 hover:text-white/60 text-left transition-all tracking-widest uppercase"
            >
              {showAdvanced ? '− Hide Options' : '+ Advanced Options'}
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Custom alias — e.g. my-portfolio"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 focus:outline-none focus:border-green-400 text-base placeholder:text-white/20 transition-all"
                />
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/30 uppercase tracking-widest">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 focus:outline-none focus:border-green-400 text-base transition-all"
                  />
                </div>
              </div>
            )}
            <button
              onClick={handleShorten}
              disabled={loading}
              className="w-full py-4 bg-green-400 hover:bg-green-300 text-black font-black text-sm tracking-widest uppercase transition-all disabled:opacity-50"
            >
              {loading ? 'TRIMMING...' : 'TRIM URL →'}
            </button>
          </div>
          {shortUrl && (
            <div className="mt-6 border border-green-400/30 bg-green-400/5 p-4 flex items-center justify-between gap-4">
              <span className="text-green-400 font-mono text-sm truncate">{shortUrl}</span>
              <button
                onClick={handleCopy}
                className="text-xs text-white/40 hover:text-white uppercase tracking-widest whitespace-nowrap transition-all"
              >
                {copied ? 'COPIED ✓' : 'COPY'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-5 flex items-center justify-between">
        <p className="text-xs text-white/20 uppercase tracking-widest">© 2026 Trimly</p>
        <p className="text-xs text-white/20 uppercase tracking-widest">Next.js + Supabase</p>
      </footer>

    </main>
  )
}