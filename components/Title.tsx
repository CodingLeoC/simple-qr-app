'use client'

import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'

export default function Title() {
  const { t } = useTranslation('home')
  return (
    <div className="w-full max-w-2xl mx-auto p-8 pb-4">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 h-[10vh] rounded-lg w-full flex items-center justify-center">
        <h1 className="text-4xl font-bold text-center">{t('title')}</h1>
      </Card>
    </div>
  )
}
