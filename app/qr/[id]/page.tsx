import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

interface QRPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QRPage({ params, searchParams }: QRPageProps) {
  const { id } = await params
  const { data, error } = await supabase
    .from('urls')
    .select('urls')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">QR Code Not Found</h1>
        <p>The requested QR code could not be found.</p>
      </div>
    )
  }

  // If single URL, redirect directly
  if (data.urls.length === 1) {
    redirect(data.urls[0])
  }

  // If multiple URLs, show list
  return (
    <div className="flex min-h-screen flex-col items-center p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Multiple URLs Found</h1>
      <ul className="space-y-4 w-full">
        {data.urls.map((url: string, index: number) => (
          <li key={index}>
            <a
              href={url}
              className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
