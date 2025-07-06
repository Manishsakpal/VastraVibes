
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSingleItemFromDb } from '@/lib/data-service';
import { processRawItems } from '@/lib/utils';
import ItemDetailClient from '@/components/item-detail-client';
import type { Product, WithContext } from 'schema-dts';

type Props = {
  params: { id: string };
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rawItem = await getSingleItemFromDb(params.id);

  if (!rawItem) {
    return {
      title: 'Item Not Found',
      description: 'The item you are looking for does not exist.',
    };
  }

  const [item] = processRawItems([rawItem]);
  const canonicalUrl = `${appUrl}/item/${item.id}`;

  return {
    title: item.title,
    description: item.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: item.title,
      description: item.description,
      url: canonicalUrl,
      images: [
        {
          url: item.imageUrls[0] || `${appUrl}/placeholder.png`,
          width: 800,
          height: 600,
          alt: item.title,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
     twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: [item.imageUrls[0] || `${appUrl}/placeholder.png`],
    },
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const rawItem = await getSingleItemFromDb(params.id);

  if (!rawItem) {
    notFound();
  }

  const [item] = processRawItems([rawItem]);

  const jsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.description,
    image: item.imageUrls[0] || `${appUrl}/placeholder.png`,
    sku: item.id,
    ...(item.brand && { brand: { '@type': 'Brand', name: item.brand } }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: item.finalPrice.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${appUrl}/item/${item.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ItemDetailClient item={item} />
    </>
  );
}
