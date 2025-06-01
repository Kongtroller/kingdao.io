import { ReactNode } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Collection } from '@/lib/daoCollections';
import { ThemeToggle } from '../ThemeToggle';
import RootLayout from './RootLayout';

interface CollectionLayoutProps {
  collection: Collection;
  children: ReactNode;
}

export default function CollectionLayout({ collection, children }: CollectionLayoutProps) {
  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Banner */}
        <div className="relative h-48 md:h-64 w-full">
          <Image
            src={collection.banner}
            alt={`${collection.name} banner`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
        </div>

        {/* Collection Info */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Logo */}
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800">
              <Image
                src={collection.logo}
                alt={collection.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-gray-600 dark:text-gray-400">{collection.description}</p>
                {collection.website && (
                  <a
                    href={collection.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </RootLayout>
  );
} 