'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

export default function Home() {
  const [inputType, setInputType] = useState<'single' | 'multiple'>('single')
  const [url, setUrl] = useState('')
  const [urls, setUrls] = useState('')
  const [shortLink, setShortLink] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        throw new Error(data.error || 'Failed to generate QR code')
      }

      setShortLink(data.shortLink)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Simple QR Code Generator</h1>
      
      <Card className="w-full p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>URL Input Type</Label>
            <RadioGroup
              defaultValue="single"
              onValueChange={(value) => setInputType(value as 'single' | 'multiple')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single URL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple">Multiple URLs (max 10)</Label>
              </div>
            </RadioGroup>
          </div>

          {inputType === 'single' ? (
            <div className="space-y-2">
              <Label htmlFor="url">Enter URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="urls">Enter URLs (one per line)</Label>
              <Textarea
                id="urls"
                placeholder="https://example1.com&#10;https://example2.com"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                required
                className="min-h-[150px]"
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </Button>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
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
            <p className="text-sm break-all text-center">{shortLink}</p>
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
              Download QR Code
            </Button>
          </div>
        </Card>
      )}
    </main>
  )
}
