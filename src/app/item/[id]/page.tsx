
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSingleItemFromDb } from '@/lib/data-service';
import { processRawItems } from '@/lib/utils';
import ItemDetailClient from '@/components/item-detail-client';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rawItem = await getSingleItemFromDb(params.id);

  if (!rawItem) {
    return {
      title: 'Item Not Found',
      description: 'The item you are looking for does not exist.',
    };
  }

  const [item] = processRawItems([rawItem]);

  return {
    title: item.title, // The layout template will add "| Vastra Vibes"
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      images: [
        {
          url: item.imageUrls[0] || 'https://placehold.co/800x600.png',
          width: 800,
          height: 600,
          alt: item.title,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const rawItem = await getSingleItemFromDb(params.id);

  if (!rawItem) {
    notFound(); // This will render the not-found.js file if it exists
  }

  const [item] = processRawItems([rawItem]);

  return <ItemDetailClient item={item} />;
}
