import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').filter(Boolean);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  try {
    console.log('🔄 Fetching exchange rates from exrye.com/sanaa')

    // جلب الصفحة من exrye.com/sanaa
    const response = await fetch('https://exrye.com/sanaa')
    const html = await response.text()

    // الأسعار الافتراضية (إذا فشل الاستخراج)
    const defaultRates = {
      YER: 1.0,
      SAR: 140.20,
      USD: 535.00,
      KWD: 1582.00,
      JOD: 754.50,
      AED: 143.00,
      EUR: 564.00
    }

    // محاولة استخراج الأسعار من HTML
    // ملاحظة: هذا يعتمد على بنية HTML الحالية للموقع
    // قد يحتاج تحديث إذا تغيرت بنية الموقع
    let rates = { ...defaultRates }

    // البحث عن أسعار الصرف في الصفحة
    // هذا مثال بسيط - قد يحتاج تعديل بناءً على بنية HTML الفعلية
    const text = html
    const sarMatch = text.match(/ريال.*?(\d+\.?\d*)/i)
    const usdMatch = text.match(/دولار.*?(\d+\.?\d*)/i)
    const aedMatch = text.match(/درهم.*?(\d+\.?\d*)/i)
    const kwdMatch = text.match(/دينار كويتي.*?(\d+\.?\d*)/i)
    const jodMatch = text.match(/دينار أردني.*?(\d+\.?\d*)/i)
    const eurMatch = text.match(/يورو.*?(\d+\.?\d*)/i)

    if (sarMatch) rates.SAR = parseFloat(sarMatch[1])
    if (usdMatch) rates.USD = parseFloat(usdMatch[1])
    if (aedMatch) rates.AED = parseFloat(aedMatch[1])
    if (kwdMatch) rates.KWD = parseFloat(kwdMatch[1])
    if (jodMatch) rates.JOD = parseFloat(jodMatch[1])
    if (eurMatch) rates.EUR = parseFloat(eurMatch[1])

    console.log('✅ Exchange rates fetched:', rates)

    // تحديث جدول exchange_rates في Supabase تلقائياً
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    for (const [currencyCode, rate] of Object.entries(rates)) {
      const { error: upsertError } = await supabase
        .from('exchange_rates')
        .upsert({
          currency_code: currencyCode,
          rate: rate,
          timestamp: new Date().toISOString(),
          source: 'exrye.com/sanaa'
        }, {
          onConflict: 'currency_code'
        })

      if (upsertError) {
        console.error(`❌ Error updating ${currencyCode} in Supabase:`, upsertError)
      } else {
        console.log(`✅ Updated ${currencyCode} in Supabase: ${rate}`)
      }
    }

    console.log('✅ All exchange rates updated in Supabase')

    return new Response(
      JSON.stringify({
        success: true,
        rates: rates,
        timestamp: new Date().toISOString(),
        source: 'exrye.com/sanaa'
      }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error fetching exchange rates:', error)

    // إرجاع الأسعار الافتراضية في حالة الفشل
    const defaultRates = {
      YER: 1.0,
      SAR: 140.20,
      USD: 535.00,
      KWD: 1582.00,
      JOD: 754.50,
      AED: 143.00,
      EUR: 564.00
    }

    return new Response(
      JSON.stringify({
        success: false,
        rates: defaultRates,
        timestamp: new Date().toISOString(),
        source: 'default',
        error: error.message
      }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
