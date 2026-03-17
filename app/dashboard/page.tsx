'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Click = {
  id: string
}

type Link = {
  id: string
  code: string
  destination_url: string
  created_at: string
  is_active: boolean
  expires_at: string | null
  clicks: Click[]
}

export default function Dashboard() {
  const router = useRouter()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserEmail(session.user.email ?? '')
      const { data, error } = await supabase
        .from('links')
        .select('*, clicks(id)')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching links:', error.message)
      } else {
        setLinks(data || [])
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (!error) setLinks(links.filter(link => link.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const totalClicks = links.reduce((acc, link) => acc + (link.clicks?.length || 0), 0)

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-white/10 px-6 md:px-12 py-5 flex items-center justify-between">
            <button
              onClick={() => window.location.reload()}
             className="text-xl font-black tracking-tighter hover:text-green-400 transition-all"
            >
              TRIMLY
            </button>
        <div className="flex items-center gap-6">
          <p className="text-xs text-white/30 hidden md:block truncate max-w-xs">
            {userEmail}
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-xs font-black tracking-widest uppercase bg-green-400 hover:bg-green-300 text-black px-4 py-2 transition-all"
          >
            + New Link
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-all"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Stats Bar */}
      <div className="border-b border-white/10 grid grid-cols-2 md:grid-cols-4">
        <div className="border-r border-white/10 px-6 md:px-12 py-8">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Total Links</p>
          <p className="text-4xl md:text-5xl font-black tracking-tighter">{links.length}</p>
        </div>
        <div className="px-6 md:px-12 py-8 md:border-r border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Total Clicks</p>
          <p className="text-4xl md:text-5xl font-black tracking-tighter text-green-400">{totalClicks}</p>
        </div>
        <div className="hidden md:block border-r border-white/10 px-12 py-8">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Active Links</p>
          <p className="text-5xl font-black tracking-tighter">
            {links.filter(l => l.is_active).length}
          </p>
        </div>
        <div className="hidden md:block px-12 py-8">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Avg Clicks</p>
          <p className="text-5xl font-black tracking-tighter">
            {links.length > 0 ? (totalClicks / links.length).toFixed(1) : '0'}
          </p>
        </div>
      </div>

      {/* Links Section */}
      <div className="flex-1 px-6 md:px-12 py-8">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
          Your Links — {links.length} total
        </p>

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 animate-pulse"></div>
            <p className="text-white/40 text-sm uppercase tracking-widest">Loading...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="border border-white/10 p-12 text-center">
            <p className="text-white/20 text-sm uppercase tracking-widest mb-4">No links yet</p>
            <button
              onClick={() => router.push('/')}
              className="text-xs font-black tracking-widest uppercase bg-green-400 hover:bg-green-300 text-black px-6 py-3 transition-all"
            >
              Create First Link →
            </button>
          </div>
        ) : (
          <div className="flex flex-col border-t border-white/10">
            {links.map((link, index) => (
              <div
                key={link.id}
                className="border-b border-white/10 py-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 items-center"
              >
                {/* Index */}
                <div className="hidden md:block md:col-span-1">
                  <p className="text-white/20 font-mono text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                </div>

                {/* Short URL */}
                <div className="md:col-span-3">
                  <p className="text-green-400 font-mono text-sm font-medium">
                    {baseUrl}/{link.code}
                  </p>
                </div>

                {/* Original URL */}
                <div className="md:col-span-4">
                  <p className="text-white/40 text-sm truncate">
                    {link.destination_url}
                  </p>
                </div>

                {/* Clicks */}
                <div className="md:col-span-2">
                  <p className="text-white/60 text-sm">
                    <span className="text-white font-bold">{link.clicks?.length || 0}</span>
                    <span className="text-white/30 ml-1 uppercase tracking-widest text-xs"> clicks</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex gap-2 justify-start md:justify-end">
                  <button
                    onClick={() => navigator.clipboard.writeText(`${baseUrl}/${link.code}`)}
                    className="text-xs uppercase tracking-widest border border-white/10 px-3 py-2 hover:border-white/30 transition-all"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="text-xs uppercase tracking-widest border border-red-900/50 text-red-400 px-3 py-2 hover:border-red-400 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 md:px-12 py-5 flex items-center justify-between">
        <p className="text-xs text-white/20 uppercase tracking-widest">© 2026 Trimly</p>
        <p className="text-xs text-white/20 uppercase tracking-widest">Built with Next.js + Supabase</p>
      </footer>

    </main>
  )
}