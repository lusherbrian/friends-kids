export interface Friend {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  reminder_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Kid {
  id: string
  friend_id: string
  name: string
  birthdate: string
  reminder_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Gift {
  id: string
  kid_id: string
  description: string
  purchased: boolean
  purchase_date?: string
  price?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Party {
  id: string
  kid_id: string
  party_date: string
  location?: string
  notes?: string
  gift_purchased: boolean
  created_at: string
  updated_at: string
}

export interface Pregnancy {
  id: string
  friend_id: string
  due_date: string
  notes?: string
  baby_born: boolean
  birth_date?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}
