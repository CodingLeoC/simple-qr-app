'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UrlInputForm } from '@/components/url-input-form';

export default function Home() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  const handleSubmit = async (data: { url: string; inputType: 'single' | 'multiple' }) => {
    // For now, we'll just generate a random ID
    // In a real app, this would be handled by the backend
    const randomId = Math.random().toString(36).substring(2, 8);
    const generatedShortUrl = `https://this-will-be-replaced.com/qr/${randomId}`;
    setShortUrl(generatedShortUrl);
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Simple QR Code Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate QR codes for your URLs quickly and easily
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <UrlInputForm onSubmit={handleSubmit} />
        </div>

        {shortUrl && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4">Your QR Code</h2>
            <div className="flex flex-col items-center gap-4">
              <QRCodeSVG
                value={shortUrl}
                size={200}
                level="H"
                className="bg-white p-2 rounded"
              />
              <p className="text-sm break-all">{shortUrl}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
