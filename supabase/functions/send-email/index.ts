import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { client, vehicule, location } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AutoLocation <onboarding@resend.dev>',
        to: [Deno.env.get('ADMIN_EMAIL')],
        subject: '🚗 Nouvelle réservation — AutoLocation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1526; color: #fff; padding: 24px; border-radius: 12px;">
            <h2 style="color: #2563eb;">🚗 Nouvelle réservation !</h2>
            <div style="background: #111e35; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #94a3b8; font-size: 12px;">CLIENT</h3>
              <p><strong>Nom :</strong> ${client.nom}</p>
              <p><strong>Téléphone :</strong> ${client.telephone}</p>
              <p><strong>Email :</strong> ${client.email || '—'}</p>
            </div>
            <div style="background: #111e35; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #94a3b8; font-size: 12px;">VÉHICULE</h3>
              <p><strong>Véhicule :</strong> ${vehicule.marque} ${vehicule.modele}</p>
              <p><strong>Immatriculation :</strong> ${vehicule.immatriculation}</p>
            </div>
            <div style="background: #111e35; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #94a3b8; font-size: 12px;">LOCATION</h3>
              <p><strong>Du :</strong> ${location.date_debut}</p>
              <p><strong>Au :</strong> ${location.date_fin}</p>
              <p style="color: #22c55e; font-size: 18px;"><strong>Montant : ${location.montant}£</strong></p>
            </div>
            <a href="https://autolocation-2026.netlify.app" style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
              Voir le dashboard
            </a>
          </div>
        `,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
