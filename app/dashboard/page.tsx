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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Friends Kids 🎂</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">{user?.email}</span>
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

      <div className="container mx-auto px-4 py-6">
        {/* Pregnant Friends Section */}
        {pregnancies.length > 0 && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 mb-6 border-2 border-pink-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-pink-900 flex items-center gap-2">
                🤰 Expecting Friends
              </h2>
              <button
                onClick={() => setShowAddPregnancy(true)}
                className="text-pink-700 hover:text-pink-900 text-sm font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {pregnancies.map(pregnancy => {
                const daysUntil = differenceInDays(parseISO(pregnancy.due_date), new Date())
                return (
                  <div key={pregnancy.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{pregnancy.friends?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Due: {format(parseISO(pregnancy.due_date), 'MMMM d, yyyy')}
                        </p>
                        {pregnancy.notes && (
                          <p className="text-sm text-gray-500 mt-1">{pregnancy.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">{daysUntil}</div>
                          <div className="text-xs text-gray-500">days until</div>
                        </div>
                        <button
                          onClick={() => handleBabyBorn(pregnancy)}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search kids or friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Kids</option>
              <option value="this-month">Birthdays This Month</option>
              <option value="milestones">Milestone Birthdays</option>
              <option value="pending-rsvp">Pending RSVP</option>
              <option value="no-gift">No Gift Yet</option>
              <option value="not-texted">Haven&apos;t Texted (Within 7 Days)</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddFriend(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                + Friend
              </button>
              <button
                onClick={() => setShowAddPregnancy(true)}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors whitespace-nowrap"
              >
                + Pregnancy
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredKids.length} of {kids.length} kids
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kid / Friend</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">Next Birthday</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Age</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Days</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">RSVP</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Gift</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Texted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredKids.map((kid) => {
                  const isMilestone = kid.age_at_next_birthday && [1, 5, 10, 13, 16, 18, 21].includes(kid.age_at_next_birthday)
                  return (
                    <tr 
                      key={kid.id} 
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/friend/${kid.friendId}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{kid.name}</div>
                        <div className="text-sm text-gray-500">{kid.friendName}</div>
                        {kid.gift_notes && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                            💡 {kid.gift_notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {format(kid.nextBirthday, 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isMilestone ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                            🎉 {kid.age_at_next_birthday}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {kid.age_at_next_birthday}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-lg font-bold ${
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
                          className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"
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
                          className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"
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
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredKids.map((kid) => {
            const isMilestone = kid.age_at_next_birthday && [1, 5, 10, 13, 16, 18, 21].includes(kid.age_at_next_birthday)
            return (
              <div 
                key={kid.id} 
                className="bg-white rounded-xl shadow-md p-4"
                onClick={() => router.push(`/dashboard/friend/${kid.friendId}`)}
              >
                <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{kid.name}</h3>
                    <p className="text-sm text-gray-600">{kid.friendName}</p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        {format(kid.nextBirthday, 'MMM d, yyyy')}
                      </p>
                      {kid.gift_notes && (
                        <p className="text-xs text-gray-500 mt-1">💡 {kid.gift_notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-center ml-4">
                    <div className={`text-2xl font-bold ${
                      kid.daysUntil <= 7 ? 'text-red-600' :
                      kid.daysUntil <= 30 ? 'text-orange-600' :
                      'text-gray-900'
                    }`}>
                      {kid.daysUntil}
                    </div>
                    <div className="text-xs text-gray-500">days</div>
                    {isMilestone && (
                      <div className="mt-1 text-xs font-bold text-yellow-600">
                        🎉 {kid.age_at_next_birthday}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">RSVP:</label>
                    <select 
                      value={kid.rsvp_status}
                      onChange={(e) => updateKidField(kid.id, 'rsvp_status', e.target.value)}
                      className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="yes">✓ Yes</option>
                      <option value="no">✗ No</option>
                      <option value="n/a">— N/A</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Gift:</label>
                    <select 
                      value={kid.gift_bought}
                      onChange={(e) => updateKidField(kid.id, 'gift_bought', e.target.value)}
                      className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="yes">✓ Yes</option>
                      <option value="no">✗ No</option>
                      <option value="n/a">— N/A</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Texted HB:</label>
                    <input 
                      type="checkbox" 
                      checked={kid.texted_hb}
                      onChange={(e) => updateKidField(kid.id, 'texted_hb', e.target.checked)}
                      className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )
          })}
          {filteredKids.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
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

function AddPregnancyModal({ 
  friends, 
  onClose, 
  onSuccess 
}: { 
  friends: Friend[]
  onClose: () => void
  onSuccess: () => void 
}) {
  const [friendId, setFriendId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('pregnancies')
        .insert([
          {
            friend_id: friendId,
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
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Pregnancy</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Friend *</label>
            <select
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Select a friend</option>
              {friends.map(friend => (
                <option key={friend.id} value={friend.id}>{friend.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Gender, baby name ideas, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Pregnancy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
