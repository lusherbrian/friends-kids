'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Friend, Kid, Pregnancy } from '@/types/database'
import { parseISO, differenceInDays, format } from 'date-fns'

interface KidWithFriend extends Kid {
  friendName: string
  friendId: string
  daysUntil: number
  nextBirthday: Date
}

interface PregnancyWithFriend extends Pregnancy {
  friends?: {
    name: string
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [kids, setKids] = useState<KidWithFriend[]>([])
  const [pregnancies, setPregnancies] = useState<PregnancyWithFriend[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOption, setFilterOption] = useState('all')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showAddPregnancy, setShowAddPregnancy] = useState(false)
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      } else {
        setUser(session.user)
        fetchAllData(session.user.id)
      }
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase.auth])

  const fetchAllData = async (userId: string) => {
    try {
      // Fetch friends
      const { data: friendsData } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      setFriends(friendsData || [])

      // Fetch all kids with friend info
      const { data: kidsData } = await supabase
        .from('kids')
        .select(`
          *,
          friends!inner(name, user_id)
        `)
        .eq('friends.user_id', userId)
        .order('birthdate')

      if (kidsData) {
        const kidsWithCalc = kidsData.map((kid: any) => {
          const birthDate = parseISO(kid.birthdate)
          const today = new Date()
          const currentYear = today.getFullYear()
          const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
          const nextYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate())
          const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday
          const daysUntil = differenceInDays(nextBirthday, today)

          return {
            ...kid,
            friendName: kid.friends.name,
            friendId: kid.friend_id,
            daysUntil,
            nextBirthday,
          }
        }).sort((a: any, b: any) => a.daysUntil - b.daysUntil)

        setKids(kidsWithCalc)
      }

      // Fetch pregnancies
      const { data: pregData } = await supabase
        .from('pregnancies')
        .select(`
          *,
          friends!inner(name, user_id)
        `)
        .eq('friends.user_id', userId)
        .eq('baby_born', false)
        .order('due_date')

      setPregnancies(pregData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const updateKidField = async (kidId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('kids')
        .update({ [field]: value })
        .eq('id', kidId)

      if (error) throw error

      // Update local state
      setKids(kids.map(kid => 
        kid.id === kidId ? { ...kid, [field]: value } : kid
      ))
    } catch (error) {
      console.error('Error updating kid:', error)
    }
  }

  const handleBabyBorn = async (pregnancy: PregnancyWithFriend) => {
    router.push(`/dashboard/friend/${pregnancy.friend_id}?addKid=true&fromPregnancy=${pregnancy.id}`)
  }

  // Filter and search logic
  const filteredKids = kids.filter(kid => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      kid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kid.friendName.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    // Additional filters
    switch(filterOption) {
      case 'this-month':
        const kidMonth = parseISO(kid.birthdate).getMonth()
        const currentMonth = new Date().getMonth()
        return kidMonth === currentMonth
      case 'milestones':
        return kid.age_at_next_birthday && [1, 5, 10, 13, 16, 18, 21].includes(kid.age_at_next_birthday)
      case 'pending-rsvp':
        return kid.rsvp_status === 'n/a'
      case 'no-gift':
        return kid.gift_bought === 'no' || kid.gift_bought === 'n/a'
      case 'not-texted':
        return !kid.texted_hb && kid.daysUntil <= 7
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg font-semibold text-purple-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Header - Enhanced */}
      <header className="bg-white shadow-md border-b-2 border-purple-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Friends Kids
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Pregnant Friends Section - Enhanced */}
        {pregnancies.length > 0 && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 md:p-6 mb-6 border-2 border-pink-300 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-black text-pink-900 flex items-center gap-2">
                🤰 Expecting Friends
              </h2>
              <button
                onClick={() => setShowAddPregnancy(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {pregnancies.map(pregnancy => {
                const daysUntil = differenceInDays(parseISO(pregnancy.due_date), new Date())
                return (
                  <div key={pregnancy.id} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{pregnancy.friends?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Due: {format(parseISO(pregnancy.due_date), 'MMMM d, yyyy')}
                        </p>
                        {pregnancy.notes && (
                          <p className="text-sm text-purple-600 mt-1 italic">{pregnancy.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-pink-100 rounded-xl px-4 py-2">
                          <div className="text-3xl font-black text-pink-600">{daysUntil}</div>
                          <div className="text-xs text-gray-600 font-semibold">days until</div>
                        </div>
                        <button
                          onClick={() => handleBabyBorn(pregnancy)}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                          🍼 Baby Born
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Search and Filters - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-2 border-purple-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search kids or friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              />
            </div>
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
            >
              <option value="all">All Kids</option>
              <option value="this-month">🎂 Birthdays This Month</option>
              <option value="milestones">🎉 Milestone Birthdays</option>
              <option value="pending-rsvp">📝 Pending RSVP</option>
              <option value="no-gift">🎁 No Gift Yet</option>
              <option value="not-texted">💬 Haven&apos;t Texted (Within 7 Days)</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddFriend(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold shadow-md hover:shadow-lg whitespace-nowrap"
              >
                + Friend
              </button>
              <button
                onClick={() => setShowAddPregnancy(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg whitespace-nowrap"
              >
                + Pregnancy
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-purple-700 font-semibold">
            Showing {filteredKids.length} of {kids.length} kids
          </div>
        </div>

        {/* Desktop Table View - Enhanced */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black text-purple-900">Kid / Friend</th>
                  <th className="px-4 py-4 text-left text-sm font-black text-purple-900">Next Birthday</th>
                  <th className="px-4 py-4 text-center text-sm font-black text-purple-900">Age</th>
                  <th className="px-4 py-4 text-center text-sm font-black text-purple-900">Days</th>
                  <th className="px-4 py-4 text-center text-sm font-black text-purple-900">RSVP</th>
                  <th className="px-4 py-4 text-center text-sm font-black text-purple-900">Gift</th>
                  <th className="px-4 py-4 text-center text-sm font-black text-purple-900">Texted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {filteredKids.map((kid) => {
                  const isMilestone = kid.age_at_next_birthday && [1, 5, 10, 13, 16, 18, 21].includes(kid.age_at_next_birthday)
                  return (
                    <tr 
                      key={kid.id} 
                      className="hover:bg-purple-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/friend/${kid.friendId}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{kid.name}</div>
                        <div className="text-sm text-purple-600 font-medium">{kid.friendName}</div>
                        {kid.gift_notes && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            💡 {kid.gift_notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-700">
                          {format(kid.nextBirthday, 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isMilestone ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black bg-yellow-100 text-yellow-800 shadow-sm">
                            🎉 {kid.age_at_next_birthday}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-gray-700">
                            {kid.age_at_next_birthday}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xl font-black ${
                          kid.daysUntil <= 7 ? 'text-red-600' :
                          kid.daysUntil <= 30 ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {kid.daysUntil}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <select 
                          value={kid.rsvp_status}
                          onChange={(e) => updateKidField(kid.id, 'rsvp_status', e.target.value)}
                          className="rounded-lg border-2 border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 py-1.5 font-medium"
                        >
                          <option value="yes">✓ Yes</option>
                          <option value="no">✗ No</option>
                          <option value="n/a">— N/A</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <select 
                          value={kid.gift_bought}
                          onChange={(e) => updateKidField(kid.id, 'gift_bought', e.target.value)}
                          className="rounded-lg border-2 border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 py-1.5 font-medium"
                        >
                          <option value="yes">✓ Yes</option>
                          <option value="no">✗ No</option>
                          <option value="n/a">— N/A</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={kid.texted_hb}
                          onChange={(e) => updateKidField(kid.id, 'texted_hb', e.target.checked)}
                          className="w-5 h-5 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredKids.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No kids found matching your filters
            </div>
          )}
        </div>

        {/* Mobile Card View - Enhanced */}
        <div className="lg:hidden space-y-4">
          {filteredKids.map((kid) => {
            const isMilestone = kid.age_at_next_birthday && [1, 5, 10, 13, 16, 18, 21].includes(kid.age_at_next_birthday)
            return (
              <div 
                key={kid.id} 
                className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-100 hover:border-purple-300 transition-all"
                onClick={() => router.push(`/dashboard/friend/${kid.friendId}`)}
              >
                <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-purple-100">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900">{kid.name}</h3>
                    <p className="text-sm text-purple-600 font-semibold">{kid.friendName}</p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 font-medium">
                        {format(kid.nextBirthday, 'MMM d, yyyy')}
                      </p>
                      {kid.gift_notes && (
                        <p className="text-xs text-gray-500 mt-1">💡 {kid.gift_notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-center ml-4">
                    <div className={`text-2xl font-black ${
                      kid.daysUntil <= 7 ? 'text-red-600' :
                      kid.daysUntil <= 30 ? 'text-orange-600' :
                      'text-gray-900'
                    }`}>
                      {kid.daysUntil}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">days</div>
                    {isMilestone && (
                      <div className="mt-1 text-xs font-black text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                        🎉 {kid.age_at_next_birthday}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">RSVP:</label>
                    <select 
                      value={kid.rsvp_status}
                      onChange={(e) => updateKidField(kid.id, 'rsvp_status', e.target.value)}
                      className="rounded-lg border-2 border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-gray-900 bg-white px-3 py-2"
                    >
                      <option value="yes">✓ Yes</option>
                      <option value="no">✗ No</option>
                      <option value="n/a">— N/A</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">Gift:</label>
                    <select 
                      value={kid.gift_bought}
                      onChange={(e) => updateKidField(kid.id, 'gift_bought', e.target.value)}
                      className="rounded-lg border-2 border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-gray-900 bg-white px-3 py-2"
                    >
                      <option value="yes">✓ Yes</option>
                      <option value="no">✗ No</option>
                      <option value="n/a">— N/A</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">Texted HB:</label>
                    <input 
                      type="checkbox" 
                      checked={kid.texted_hb}
                      onChange={(e) => updateKidField(kid.id, 'texted_hb', e.target.checked)}
                      className="w-7 h-7 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )
          })}
          {filteredKids.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border-2 border-purple-100">
              No kids found matching your filters
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onSuccess={() => {
            setShowAddFriend(false)
            if (user) fetchAllData(user.id)
          }}
          userId={user?.id}
        />
      )}

      {showAddPregnancy && (
        <AddPregnancyModal
          friends={friends}
          onClose={() => setShowAddPregnancy(false)}
          onSuccess={() => {
            setShowAddPregnancy(false)
            if (user) fetchAllData(user.id)
          }}
          userId={user?.id}
        />
      )}

      {editingFriend && (
        <EditFriendModal
          friend={editingFriend}
          onClose={() => setEditingFriend(null)}
          onSuccess={() => {
            setEditingFriend(null)
            if (user) fetchAllData(user.id)
          }}
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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-purple-200">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Add Friend</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Name(s) *
              <span className="text-xs font-normal text-gray-500 ml-2">(e.g., &quot;Sarah & Mike Johnson&quot;)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Both parents improves searchability"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 font-bold shadow-md"
            >
              {loading ? 'Adding...' : 'Add Friend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditFriendModal({ friend, onClose, onSuccess }: { friend: Friend, onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState(friend.name)
  const [email, setEmail] = useState(friend.email || '')
  const [phone, setPhone] = useState(friend.phone || '')
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('friends')
        .update({
          name,
          email: email || null,
          phone: phone || null,
        })
        .eq('id', friend.id)

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error('Error updating friend:', error)
      alert('Error updating friend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-purple-200">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Edit Friend</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name(s) *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 font-bold shadow-md"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddPregnancyModal({ 
  friends, 
  onClose, 
  onSuccess,
  userId
}: { 
  friends: Friend[]
  onClose: () => void
  onSuccess: () => void
  userId: string
}) {
  const [friendId, setFriendId] = useState('')
  const [newFriendName, setNewFriendName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalFriendId = friendId

      // Create new friend if needed
      if (isCreatingNew && newFriendName.trim()) {
        const { data: newFriend, error: friendError } = await supabase
          .from('friends')
          .insert([{
            user_id: userId,
            name: newFriendName,
            reminder_enabled: true
          }])
          .select()
          .single()

        if (friendError) throw friendError
        finalFriendId = newFriend.id
      }

      if (!finalFriendId) {
        alert('Please select or create a friend')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('pregnancies')
        .insert([
          {
            friend_id: finalFriendId,
            due_date: dueDate,
            notes: notes || null,
            baby_born: false
          }
        ])

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error('Error adding pregnancy:', error)
      alert('Error adding pregnancy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-pink-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Add Pregnancy 🤰</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Friend *</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="existing"
                  checked={!isCreatingNew}
                  onChange={() => setIsCreatingNew(false)}
                  className="w-4 h-4 text-pink-600"
                />
                <label htmlFor="existing" className="text-sm font-medium text-gray-700">Select existing friend</label>
              </div>
              {!isCreatingNew && (
                <select
                  value={friendId}
                  onChange={(e) => setFriendId(e.target.value)}
                  required={!isCreatingNew}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white font-medium"
                >
                  <option value="">Select a friend</option>
                  {friends.map(friend => (
                    <option key={friend.id} value={friend.id}>{friend.name}</option>
                  ))}
                </select>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="radio"
                  id="new"
                  checked={isCreatingNew}
                  onChange={() => setIsCreatingNew(true)}
                  className="w-4 h-4 text-pink-600"
                />
                <label htmlFor="new" className="text-sm font-medium text-gray-700">Create new friend</label>
              </div>
              {isCreatingNew && (
                <input
                  type="text"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  required={isCreatingNew}
                  placeholder="Friend's name(s)"
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white font-medium"
                />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Gender, baby name ideas, etc."
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-colors disabled:opacity-50 font-bold shadow-md"
            >
              {loading ? 'Adding...' : 'Add Pregnancy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
