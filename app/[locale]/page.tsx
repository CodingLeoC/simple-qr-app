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
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(256);
  const [logoDataURL, setLogoDataURL] = useState<string | null>(null);

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
    <main className="flex flex-col items-center p-8 pt-4 max-w-2xl mx-auto">
      <Card className="w-full p-6">
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
              {error}
            </p>
          )}
        </form>
      </Card>

      {shortLink && (
        <Card className="w-full p-6 mt-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-64 h-64 mx-auto overflow-hidden border border-gray-200">
              <QRCodeSVG
                id='qr-code'
                value={shortLink}
                size={qrSize}
                level="H"
                marginSize={4}
                fgColor={fgColor}
                bgColor={bgColor}
                imageSettings={logoDataURL ? {
                  src: logoDataURL,
                  height: qrSize/5,
                  width: qrSize/5,
                  excavate: true,
                } : undefined}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div>
              <a
                href={shortLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm break-all text-center underline"
              >
                {shortLink}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col items-center min-w-[120px]">
                <Label htmlFor="fg-color">{t('home:foregroundColor')}</Label>
                <Input
                  id="fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-full"
                />
              </div>
              <div className="space-y-2 flex flex-col items-center min-w-[120px]">
                <Label htmlFor="bg-color">{t('home:backgroundColor')}</Label>
                <Input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-full"
                />
              </div>
            </div>
            <div className="space-y-2 flex flex-col items-center min-w-[120px]">
              <Label htmlFor="size">{t('home:sizeLabel')}</Label>
              <Input
                id="size"
                type="number"
                min="100"
                max="500"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                placeholder="256"
              />
            </div>
            <div className="space-y-2 flex flex-col items-center min-w-[120px]">
              <Label htmlFor="logo">{t('home:logoUpload')}</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setLogoDataURL(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setLogoDataURL(null);
                  }
                }}
                className="h-10"
              />
            </div>
            <Button
              onClick={() => {
                const svg = document.querySelector('#qr-code')
                if (svg) {
                  const clone = svg.cloneNode(true) as SVGSVGElement
                  clone.removeAttribute('style')
                  clone.setAttribute('width', qrSize.toString());
                  clone.setAttribute('height', qrSize.toString());
                  const svgData = new XMLSerializer().serializeToString(clone)
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
