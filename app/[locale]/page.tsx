'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next';

export default function Home() {
  const [inputType, setInputType] = useState<'single' | 'multiple'>('single')
  const [url, setUrl] = useState('')
  const [urls, setUrls] = useState('')
  const [shortLink, setShortLink] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShortLink('')
    setIsLoading(true)

    try {
      // Prepare URLs array
      const urlList = inputType === 'single' 
        ? [url.trim()]
        : urls.split('\n').map(u => u.trim()).filter(Boolean)

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlList }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('home:errorMessages.generationFailed'))
      }

      setShortLink(data.shortLink)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home:errorMessages.default'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t('home:title')}</h1>
      
      <Card className="w-full p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>{t('home:inputTypeLabel')}</Label>
            <RadioGroup
              defaultValue="single"
              onValueChange={(value) => setInputType(value as 'single' | 'multiple')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">{t('home:singleUrlLabel')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple">{t('home:multipleUrlsLabel')}</Label>
              </div>
            </RadioGroup>
          </div>

          {inputType === 'single' ? (
            <div className="space-y-2">
              <Label htmlFor="url">{t('home:singleUrlPlaceholder')}</Label>
              <Input
                id="url"
                type="url"
                placeholder={t('home:singleUrlPlaceholder')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="urls">{t('home:multipleUrlsPlaceholder')}</Label>
              <Textarea
                id="urls"
                placeholder={t('home:multipleUrlsPlaceholder')}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                required
                className="min-h-[150px]"
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('home:generatingButton') : t('home:generateButton')}
          </Button>

          {error && (
            <p className="text-red-500 text-sm mt-2">
              {t(`home:errorMessages.${error}`)}
            </p>
          )}
        </form>
      </Card>

      {shortLink && (
        <Card className="w-full p-6">
          <div className="flex flex-col items-center space-y-4">
            <QRCodeSVG
              id='qr-code'
              value={shortLink}
              size={256}
              level="H"
              marginSize={4}
            />
            <a
              href={shortLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all text-center underline"
            >
              {shortLink}
            </a>
            <Button
              onClick={() => {
                const svg = document.querySelector('#qr-code')
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg)
                  const blob = new Blob([svgData], { type: 'image/svg+xml' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'qrcode.svg'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }
              }}
            >
              {t('home:downloadButton')}
            </Button>
          </div>
        </Card>
      )}
    </main>
  )
}
