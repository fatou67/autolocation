import { supabase } from './supabase'

export async function envoyerEmailReservation({ client, vehicule, location }) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { client, vehicule, location },
    })
    if (error) console.error('Email error:', error)
    return !error
  } catch (e) {
    console.error('Email error:', e)
    return false
  }
}