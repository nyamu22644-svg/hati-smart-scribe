
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HATI | Your Life. Certified.',
  description: 'The secure, encrypted vault for your family\'s medical history. Powered by privacy-first AI.',
  openGraph: {
    title: 'HATI | Your Life. Certified.',
    description: 'The secure, encrypted vault for your family\'s medical history. Powered by privacy-first AI.',
    url: 'https://hati-certified.web.app',
    siteName: 'HATI Official Registry',
    images: [
      {
        url: 'https://hati-certified.web.app/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HATI | Your Life. Certified.',
    description: 'The secure, encrypted vault for your family\'s medical legacy.',
    images: ['https://hati-certified.web.app/opengraph-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
