'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      alert('Error signing in: ' + error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Decorative elements */}
      <div className="fixed top-10 right-10 text-6xl animate-bounce opacity-20 pointer-events-none hidden md:block">🎈</div>
      <div className="fixed bottom-20 left-10 text-5xl animate-pulse opacity-20 pointer-events-none hidden md:block">🎂</div>
      
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎉</span>
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Friends Kids
              </span>
            </div>
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm md:text-base"
            >
              Sign In 🚀
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-12 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 bg-white px-6 py-2 rounded-full shadow-md">
            <span className="text-sm font-semibold text-purple-600">👋 The friendliest way to track birthdays</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Never Miss a<br/>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Birthday Again
              </span>
              <svg className="absolute -bottom-2 left-0 w-full hidden md:block" height="12" viewBox="0 0 300 12">
                <path d="M5,6 Q150,0 295,6" stroke="#ec4899" strokeWidth="4" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
            Your friends are having babies left and right! Keep track of all those little ones, 
            their birthdays, and become the friend who ALWAYS remembers. 🎁
          </p>
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-full text-lg md:text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all inline-flex items-center gap-3 disabled:opacity-50"
          >
            <svg className="w-6 md:w-8 h-6 md:h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="hidden sm:inline">Start Free with Google</span>
            <span className="sm:hidden">Start Free</span>
          </button>
          <p className="text-sm text-gray-600 mt-4">✨ No credit card • Takes 30 seconds • 100% free</p>
        </div>
      </section>

      {/* Fun Stats */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-lg transform hover:rotate-2 transition-transform">
            <div className="text-3xl md:text-4xl mb-2">🎂</div>
            <div className="text-2xl md:text-3xl font-black text-purple-600">100%</div>
            <div className="text-xs md:text-sm text-gray-600 font-semibold">Free</div>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-lg transform hover:-rotate-2 transition-transform">
            <div className="text-3xl md:text-4xl mb-2">⚡</div>
            <div className="text-2xl md:text-3xl font-black text-pink-600">30s</div>
            <div className="text-xs md:text-sm text-gray-600 font-semibold">Setup</div>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-lg transform hover:rotate-2 transition-transform">
            <div className="text-3xl md:text-4xl mb-2">👶</div>
            <div className="text-2xl md:text-3xl font-black text-blue-600">∞</div>
            <div className="text-xs md:text-sm text-gray-600 font-semibold">Kids</div>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-lg transform hover:-rotate-2 transition-transform">
            <div className="text-3xl md:text-4xl mb-2">🎁</div>
            <div className="text-2xl md:text-3xl font-black text-orange-600">0</div>
            <div className="text-xs md:text-sm text-gray-600 font-semibold">Forgotten</div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-5xl md:text-7xl text-purple-500">&ldquo;</span>
            </div>
            <p className="text-lg md:text-2xl text-gray-800 mb-8 leading-relaxed font-medium">
              With all of our friends having children these days, it&apos;s just so hard to 
              keep up with the birthdays and the new names. We just want to stay connected 
              to our friends as they are going through these new milestones.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg flex-shrink-0">
                BL
              </div>
              <div>
                <div className="font-black text-gray-900 text-lg md:text-xl">Brian L.</div>
                <div className="text-purple-600 font-semibold text-sm md:text-base">Founder & Chief Birthday Rememberer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Screenshots */}
      <section className="container mx-auto px-6 py-12 md:py-20">
        <h2 className="text-3xl md:text-6xl font-black text-center text-gray-900 mb-4">
          Everything You Need! 🎉
        </h2>
        <p className="text-lg md:text-xl text-center text-gray-600 mb-12 md:mb-16 max-w-2xl mx-auto">
          We made it super easy (and kinda fun) to track all the important stuff
        </p>

        <div className="space-y-16 md:space-y-20 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 transform hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 md:p-6 border-4 border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl md:text-2xl">🔥</span>
                    <span className="font-bold text-gray-700 text-sm md:text-base">Coming Up Fast!</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-3 md:p-4 shadow-md">
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 text-base md:text-lg truncate">Emma Johnson</div>
                          <div className="text-xs md:text-sm text-gray-600">Feb 15 • Turning 5! 🎉</div>
                        </div>
                        <div className="bg-red-500 text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center flex-shrink-0">
                          <div className="text-xl md:text-2xl font-black">16</div>
                          <div className="text-[10px] md:text-xs">days</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 md:p-4 shadow-md">
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 text-base md:text-lg truncate">Olivia Lee</div>
                          <div className="text-xs md:text-sm text-gray-600">Feb 10 • Party Time!</div>
                        </div>
                        <div className="bg-orange-500 text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center flex-shrink-0">
                          <div className="text-xl md:text-2xl font-black">11</div>
                          <div className="text-[10px] md:text-xs">days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-4xl md:text-5xl mb-4 block">⏰</span>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Never Get Caught Off Guard
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                See everything sorted by how soon it&apos;s happening. Red = urgent! Orange = plan ahead. 
                Gray = you&apos;ve got time. Easy peasy! 🎯
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <span className="bg-red-100 text-red-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm">
                  🚨 This Week!
                </span>
                <span className="bg-orange-100 text-orange-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm">
                  📅 This Month
                </span>
                <span className="bg-yellow-100 text-yellow-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm">
                  ⭐ Big Milestones
                </span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="text-4xl md:text-5xl mb-4 block">🎁</span>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Gift Ideas On Lock
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                Save what they love (&quot;Emma is obsessed with unicorns!&quot;), mark when you buy it, 
                and never accidentally get them something they already have. You&apos;ll be the GOAT friend! 🐐
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700 font-medium text-sm md:text-base">Remember gift preferences</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700 font-medium text-sm md:text-base">Track what you bought</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700 font-medium text-sm md:text-base">Manage party RSVPs</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 transform hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 border-4 border-purple-200">
                  <div className="bg-white rounded-xl p-4 md:p-5 shadow-lg">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-base md:text-lg truncate">Emma Johnson</div>
                        <div className="text-xs md:text-sm text-gray-600">Sarah&apos;s daughter</div>
                      </div>
                      <span className="bg-yellow-100 text-yellow-700 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black flex-shrink-0">
                        🎉 BIG 5!
                      </span>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 md:p-3 mb-3">
                      <div className="text-xs md:text-sm text-gray-700">
                        💡 <span className="font-semibold">Gift Ideas:</span>
                      </div>
                      <div className="text-xs md:text-sm text-purple-700 italic mt-1">
                        &quot;Loves unicorns and art supplies!&quot;
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-green-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow">
                        ✓ Gift Bought!
                      </span>
                      <span className="bg-blue-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow">
                        ✓ RSVP&apos;d
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 transform hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 md:p-6 border-4 border-pink-300">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl md:text-3xl">🤰</span>
                    <span className="font-bold text-pink-900 text-base md:text-lg">Baby on the Way!</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 md:p-5 shadow-lg">
                    <div className="flex justify-between items-center mb-4 gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-base md:text-lg truncate">Jessica Martinez</div>
                        <div className="text-xs md:text-sm text-gray-600">Due: Feb 28, 2024</div>
                        <div className="text-[10px] md:text-xs text-gray-500 mt-1">🎀 Having a girl!</div>
                      </div>
                      <div className="text-center bg-pink-100 rounded-xl p-2 md:p-3 flex-shrink-0">
                        <div className="text-2xl md:text-3xl font-black text-pink-600">29</div>
                        <div className="text-[10px] md:text-xs text-gray-600 font-semibold">days!</div>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 md:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-sm md:text-base">
                      🍼 Baby Arrived!
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-4xl md:text-5xl mb-4 block">👶</span>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Track the Newest Arrivals
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Friends expecting? Add them here! When baby comes, just click &quot;Baby Arrived&quot; 
                and boom - they&apos;re automatically added to your birthday list. 
                Stay connected through every milestone! 💝
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl shadow-2xl p-8 md:p-12 text-center text-white transform hover:scale-105 transition-transform">
          <div className="text-5xl md:text-6xl mb-6">🎉🎂🎁</div>
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Ready to Be That Friend?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            You know, the one who always remembers, always shows up, always has the perfect gift. 
            Yeah, THAT friend!
          </p>
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="bg-white text-purple-600 px-8 md:px-12 py-4 md:py-5 rounded-full text-lg md:text-xl font-black shadow-2xl hover:shadow-3xl hover:scale-110 transition-all inline-flex items-center gap-3 disabled:opacity-50"
          >
            <svg className="w-6 md:w-8 h-6 md:h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="hidden sm:inline">Let&apos;s Go! Start Free</span>
            <span className="sm:hidden">Start Free</span>
          </button>
          <p className="text-sm mt-4 opacity-75">✨ 30 seconds to start • No credit card • 100% free ✨</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-gray-600 font-medium">
            Made with 💜 for people who care about staying connected
          </p>
          <p className="text-gray-500 text-sm mt-2">© 2026 Friends Kids. Be the friend who remembers.</p>
        </div>
      </footer>
    </div>
  )
}
