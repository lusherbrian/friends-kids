'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Friend, Kid } from '@/types/database'
import { format, parseISO } from 'date-fns'

export default function FriendDetailPage() {
  const [friend, setFriend] = useState<Friend | null>(null)
  const [kids, setKids] = useState<Kid[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddKid, setShowAddKid] = useState(false)
  const [showEditFriend, setShowEditFriend] = useState(false)
  const [editingGiftNotes, setEditingGiftNotes] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchFriendData()
    
    // Check if we should auto-open add kid modal (from pregnancy "Baby Born")
    if (searchParams.get('addKid') === 'true') {
      setShowAddKid(true)
    }
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

      const { data: kidsData, error: kidsError} = await supabase
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

  const saveGiftNotes = async (kidId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('kids')
        .update({ gift_notes: notes || null })
        .eq('id', kidId)

      if (error) throw error
      
      setKids(kids.map(k => k.id === kidId ? { ...k, gift_notes: notes } : k))
      setEditingGiftNotes(null)
    } catch (error) {
      console.error('Error saving gift notes:', error)
      alert('Error saving gift notes')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg font-semibold text-purple-600">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Header - Enhanced */}
      <header className="bg-white shadow-md border-b-2 border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-purple-600 hover:text-purple-800 font-bold"
            >
              ← Back
            </button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {friend.name}
              </h1>
            </div>
            <button
              onClick={() => setShowEditFriend(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold shadow-md text-sm"
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Friend Info - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-purple-100">
          <h2 className="text-lg font-black text-purple-900 mb-4">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {friend.email && (
              <div>
                <span className="text-sm text-purple-700 font-bold">Email:</span>
                <p className="text-gray-900 font-medium">{friend.email}</p>
              </div>
            )}
            {friend.phone && (
              <div>
                <span className="text-sm text-purple-700 font-bold">Phone:</span>
                <p className="text-gray-900 font-medium">{friend.phone}</p>
              </div>
            )}
          </div>
          {friend.notes && (
            <div className="mt-4">
              <span className="text-sm text-purple-700 font-bold">Notes:</span>
              <p className="text-gray-900 mt-1 font-medium">{friend.notes}</p>
            </div>
          )}
        </div>

        {/* Kids Section - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-purple-900">Kids</h2>
            <button
              onClick={() => setShowAddKid(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold shadow-md"
            >
              + Add Kid
            </button>
          </div>

          {kids.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                No kids added yet
              </h3>
              <p className="text-gray-600 mb-4 font-medium">
                Add their kids to track birthdays and gifts
              </p>
              <button
                onClick={() => setShowAddKid(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold shadow-md"
              >
                Add First Kid
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {kids.map(kid => {
                const birthDate = parseISO(kid.birthdate)
                const age = new Date().getFullYear() - birthDate.getFullYear()
                const isMilestone = kid.age_at_next_birthday && [1, 5, 10, 13, 16, 18, 21].includes(kid.age_at_next_birthday)
                
                return (
                  <div
                    key={kid.id}
                    className="border-2 border-purple-100 rounded-2xl p-4 hover:border-purple-300 transition-all bg-gradient-to-br from-white to-purple-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-black text-gray-900">{kid.name}</h3>
                          {isMilestone && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-yellow-100 text-yellow-800 shadow-sm">
                              🎉 Milestone: {kid.age_at_next_birthday}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-purple-700 font-bold">
                          Birthday: {format(birthDate, 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Current Age: {age} years old
                          {kid.age_at_next_birthday && ` • Turning ${kid.age_at_next_birthday}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteKid(kid.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-bold"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Gift Notes Section */}
                    <div className="mt-4 pt-4 border-t-2 border-purple-100">
                      <div className="flex items-start justify-between mb-2">
                        <label className="text-sm font-black text-purple-700">
                          💡 Gift Ideas & Notes:
                        </label>
                        {editingGiftNotes !== kid.id && (
                          <button
                            onClick={() => setEditingGiftNotes(kid.id)}
                            className="text-xs text-purple-600 hover:text-purple-800 font-bold"
                          >
                            {kid.gift_notes ? 'Edit' : 'Add Notes'}
                          </button>
                        )}
                      </div>
                      
                      {editingGiftNotes === kid.id ? (
                        <div className="space-y-2">
                          <textarea
                            defaultValue={kid.gift_notes || ''}
                            id={`notes-${kid.id}`}
                            rows={3}
                            placeholder="E.g., Loves dinosaurs, wants Lego sets, already has blue bike..."
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 bg-white font-medium"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const textarea = document.getElementById(`notes-${kid.id}`) as HTMLTextAreaElement
                                saveGiftNotes(kid.id, textarea.value)
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm hover:from-green-600 hover:to-emerald-600 font-bold shadow-md"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingGiftNotes(null)}
                              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 italic font-medium">
                          {kid.gift_notes || 'No gift notes yet'}
                        </p>
                      )}
                    </div>

                    {/* Tracking Status */}
                    <div className="mt-4 pt-4 border-t-2 border-purple-100 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                        kid.reminder_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {kid.reminder_enabled ? '🔔 Reminders On' : '🔕 Reminders Off'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                        kid.rsvp_status === 'yes' ? 'bg-green-100 text-green-700' :
                        kid.rsvp_status === 'no' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        RSVP: {kid.rsvp_status === 'yes' ? '✓ Yes' : kid.rsvp_status === 'no' ? '✗ No' : '— N/A'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                        kid.gift_bought === 'yes' ? 'bg-blue-100 text-blue-700' :
                        kid.gift_bought === 'no' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Gift: {kid.gift_bought === 'yes' ? '✓ Bought' : kid.gift_bought === 'no' ? '✗ Not Yet' : '— N/A'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                        kid.texted_hb ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {kid.texted_hb ? '✓ Texted HB' : '— Not Texted'}
                      </span>
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
            
            // If coming from pregnancy, mark it as born
            const pregnancyId = searchParams.get('fromPregnancy')
            if (pregnancyId) {
              supabase
                .from('pregnancies')
                .update({ baby_born: true, birth_date: new Date().toISOString().split('T')[0] })
                .eq('id', pregnancyId)
                .then(() => {
                  // Redirect back without query params
                  router.push(`/dashboard/friend/${friend.id}`)
                })
            }
          }}
        />
      )}

      {/* Edit Friend Modal */}
      {showEditFriend && (
        <EditFriendModal
          friend={friend}
          onClose={() => setShowEditFriend(false)}
          onSuccess={() => {
            setShowEditFriend(false)
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
  const [giftNotes, setGiftNotes] = useState('')
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
            reminder_enabled: reminderEnabled,
            gift_notes: giftNotes || null,
            rsvp_status: 'n/a',
            gift_bought: 'n/a',
            texted_hb: false
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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-200">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Add Kid</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Birthdate *
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Gift Ideas & Notes
            </label>
            <textarea
              value={giftNotes}
              onChange={(e) => setGiftNotes(e.target.value)}
              rows={3}
              placeholder="E.g., Loves dinosaurs, wants Lego sets..."
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-medium"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reminder"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-2 border-purple-300 rounded"
            />
            <label htmlFor="reminder" className="ml-2 block text-sm text-gray-700 font-bold">
              Enable birthday reminders
            </label>
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
              {loading ? 'Adding...' : 'Add Kid'}
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
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Name(s) *
              <span className="text-xs font-normal text-gray-500 ml-2">(e.g., &quot;Sarah & Mike Johnson&quot;)</span>
            </label>
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
