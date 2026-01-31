'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Friend, Kid } from '@/types/database'
import { formatDistanceToNow, parseISO, differenceInDays, format } from 'date-fns'

interface FriendWithKids extends Friend {
  kids: Kid[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [friends, setFriends] = useState<FriendWithKids[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      } else {
        setUser(session.user)
        fetchFriends(session.user.id)
      }
    }
    checkAuth()
  }, [router, supabase.auth])

  const fetchFriends = async (userId: string) => {
    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (friendsError) throw friendsError

      const friendsWithKids = await Promise.all(
        (friendsData || []).map(async (friend) => {
          const { data: kidsData } = await supabase
            .from('kids')
            .select('*')
            .eq('friend_id', friend.id)
            .order('birthdate')

          return {
            ...friend,
            kids: kidsData || []
          }
        })
      )

      setFriends(friendsWithKids)
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getUpcomingBirthdays = () => {
    const allKids = friends.flatMap(friend => 
      friend.kids.map(kid => ({ ...kid, friendName: friend.name }))
    )
    
    const today = new Date()
    const currentYear = today.getFullYear()
    
    return allKids
      .map(kid => {
        const birthDate = parseISO(kid.birthdate)
        const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
        const nextYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate())
        
        const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday
        const daysUntil = differenceInDays(nextBirthday, today)
        
        return {
          ...kid,
          nextBirthday,
          daysUntil,
          age: currentYear - birthDate.getFullYear()
        }
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const upcomingBirthdays = getUpcomingBirthdays()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Friends Kids 🎂</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Friends</h2>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Friend
                </button>
              </div>

              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No friends added yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by adding your first friend and their kids
                  </p>
                  <button
                    onClick={() => setShowAddFriend(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Friend
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map(friend => (
                    <div
                      key={friend.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/friend/${friend.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {friend.name}
                          </h3>
                          {friend.email && (
                            <p className="text-sm text-gray-600">{friend.email}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {friend.kids.length} {friend.kids.length === 1 ? 'kid' : 'kids'}
                        </span>
                      </div>
                      
                      {friend.kids.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {friend.kids.map(kid => (
                            <span
                              key={kid.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                            >
                              {kid.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upcoming Birthdays 🎈
              </h2>
              
              {upcomingBirthdays.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No upcoming birthdays. Add some kids to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingBirthdays.map(kid => (
                    <div key={kid.id} className="border-l-4 border-pink-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{kid.name}</h4>
                      <p className="text-sm text-gray-600">{kid.friendName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(kid.nextBirthday, 'MMMM d')} • Turning {kid.age}
                      </p>
                      <p className="text-xs text-pink-600 font-medium mt-1">
                        {kid.daysUntil === 0 ? 'Today!' : 
                         kid.daysUntil === 1 ? 'Tomorrow' : 
                         `In ${kid.daysUntil} days`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Friends:</span>
                  <span className="font-semibold">{friends.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Kids:</span>
                  <span className="font-semibold">
                    {friends.reduce((sum, f) => sum + f.kids.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onSuccess={() => {
            setShowAddFriend(false)
            if (user) fetchFriends(user.id)
          }}
          userId={user?.id}
        />
      )}
    </div>
  )
}

function AddFriendModal({ onClose, onSuccess, userId }: { onClose: () => void, onSuccess: () => void, userId: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('friends')
        .insert([
          {
            user_id: userId,
            name,
            email: email || null,
            phone: phone || null,
            reminder_enabled: true
          }
        ])

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error('Error adding friend:', error)
      alert('Error adding friend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Friend</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Friend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
