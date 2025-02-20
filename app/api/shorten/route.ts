import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { supabase } from '@/lib/supabase'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import initTranslations from '@/app/i18n';
import parser from 'accept-language-parser'
import i18nConfig from '@/i18nConfig'

// Create a new ratelimiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
})

// URL validation schema
const urlSchema = z.string().url()
const requestSchema = z.object({
  urls: z.array(urlSchema).min(1).max(10),
})

export async function POST(request: NextRequest) {
  try {
    // Get preferred language from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') ?? 'en'
    const supportedLocales = i18nConfig.locales
    const preferredLocale = parser.pick(supportedLocales, acceptLanguage) ?? 'en'
    const { t } = await initTranslations(preferredLocale, ['qrcode']);

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: t('qrcode:rateLimitExceeded') },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const result = requestSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: t('qrcode:invalidRequest') },
        { status: 400 }
      )
    }

    // Use locale from request body, fallback to Accept-Language header
    let { urls } = result.data
    
    // Generate unique ID (8 characters)
    const id = nanoid(8)
    
    // Store in database
    const { error } = await supabase
      .from('urls')
      .insert({
        id,
        urls,
        ip_address: ip,
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: t('qrcode:generationFailed') },
        { status: 500 }
      )
    }

    // Return the shortened URL
    const shortLink = `${process.env.NEXT_PUBLIC_APP_URL}/qr/${id}`
    
    return NextResponse.json({ shortLink })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
