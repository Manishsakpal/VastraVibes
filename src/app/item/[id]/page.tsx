import { getItem } from '@/lib/data';
import { notFound } from 'next/navigation';
import ItemDetailClient from '@/components/item-detail-client';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string };
};

// This function generates dynamic metadata for the page (for SEO)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const item = getItem(id);

  if (!item) {
    return {
      title: 'Item Not Found',
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: `${item.title} | Vastra Vibes`,
      description: item.description,
      images: [item.imageUrls[0], ...previousImages],
    },
  };
}

export default function ItemDetailPage({ params }: Props) {
  const item = getItem(params.id);

  if (!item) {
    notFound();
  }

  return <ItemDetailClient item={item} />;
}
