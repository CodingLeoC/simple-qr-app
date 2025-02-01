'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

export default function RedirectWithDelay({ url }: { url: string }) {
  const { t } = useTranslation('qrcode')
  const [secondsLeft, setSecondsLeft] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.location.href = url
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [url])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">{t('redirectMessage', { seconds: secondsLeft })}</h1>
      <p>{t('redirectingTo')}</p>
      <p className="mt-2 text-blue-600 break-all">{url}</p>
    </div>
  )
}
