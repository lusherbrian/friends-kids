'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Friend, Kid, Gift, Party } from '@/types/database'
import { format, parseISO } from 'date-fns'

export default function FriendDetailPage() {
  const [friend, setFriend] = useState<Friend | null>(null)
  const [kids, setKids] = useState<Kid[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddKid, setShowAddKid] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchFriendData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchFriendData = async () => {
    try {
      const { data: friendData, error: friendError } = await supabase
        .from('friends')
        .select('*')
        .eq('id', params.id)
        .single()

      if (friendError) throw friendError
      setFriend(friendData)

      const { data: kidsData, error: kidsError } = await supabase
        .from('kids')
        .select('*')
        .eq('friend_id', params.id)
        .order('birthdate')

      if (kidsError) throw kidsError
      setKids(kidsData || [])
    } catch (error) {
      console.error('Error fetching friend data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKid = async (kidId: string) => {
    if (!confirm('Are you sure you want to delete this kid?')) return

    try {
      const { error } = await supabase
        .from('kids')
        .delete()
        .eq('id', kidId)

      if (error) throw error
      fetchFriendData()
    } catch (error) {
      console.error('Error deleting kid:', error)
      alert('Error deleting kid')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!friend) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Friend not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{friend.name}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Friend Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {friend.email && (
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-gray-900">{friend.email}</p>
              </div>
            )}
            {friend.phone && (
              <div>
                <span className="text-sm text-gray-600">Phone:</span>
                <p className="text-gray-900">{friend.phone}</p>
              </div>
            )}
          </div>
          {friend.notes && (
            <div className="mt-4">
              <span className="text-sm text-gray-600">Notes:</span>
              <p className="text-gray-900 mt-1">{friend.notes}</p>
            </div>
          )}
        </div>

        {/* Kids Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Kids</h2>
            <button
              onClick={() => setShowAddKid(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Kid
            </button>
          </div>

          {kids.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No kids added yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add their kids to track birthdays and gifts
              </p>
              <button
                onClick={() => setShowAddKid(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Kid
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {kids.map(kid => {
                const birthDate = parseISO(kid.birthdate)
                const age = new Date().getFullYear() - birthDate.getFullYear()
                
                return (
                  <div
                    key={kid.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {kid.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Birthday: {format(birthDate, 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Age: {age} years old
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            kid.reminder_enabled 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {kid.reminder_enabled ? '🔔 Reminders On' : '🔕 Reminders Off'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteKid(kid.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Kid Modal */}
      {showAddKid && (
        <AddKidModal
          friendId={friend.id}
          onClose={() => setShowAddKid(false)}
          onSuccess={() => {
            setShowAddKid(false)
            fetchFriendData()
          }}
        />
      )}
    </div>
  )
}

function AddKidModal({ 
  friendId, 
  onClose, 
  onSuccess 
}: { 
  friendId: string
  onClose: () => void
  onSuccess: () => void 
}) {
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('kids')
        .insert([
          {
            friend_id: friendId,
            name,
            birthdate,
            reminder_enabled: reminderEnabled
          }
        ])

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error('Error adding kid:', error)
      alert('Error adding kid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Kid</h2>
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
              Birthdate *
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reminder"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="reminder" className="ml-2 block text-sm text-gray-700">
              Enable birthday reminders
            </label>
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
              {loading ? 'Adding...' : 'Add Kid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
