import { supabase } from '@/lib/supabase'
import RedirectWithDelay from '@/components/RedirectWithDelay'
import initTranslations from '@/app/i18n';

interface QRPageProps {
  params: Promise<{ id: string, locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QRPage({ params }: QRPageProps) {
  const { id, locale } = await params

  const { t } = await initTranslations(locale, ['qrcode']);

  const { data, error } = await supabase
    .from('urls')
    .select('urls')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">{t('qrcode:qrCodeNotFoundHeading')}</h1>
        <p>{t('qrcode:qrCodeNotFound')}</p>
      </div>
    )
  }

  // If single URL, show countdown component
  if (data.urls.length === 1) {
    return <RedirectWithDelay url={data.urls[0]} />
  }

  // If multiple URLs, show list
  return (
    <div className="flex flex-col items-center p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">{t('qrcode:multipleUrlsFoundHeading')}</h1>
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
