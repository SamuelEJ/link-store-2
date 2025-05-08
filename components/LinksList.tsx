'use client';

import { useEffect, useState } from 'react';
import { Tweet } from 'react-tweet';
import { useLinkStore } from '@/lib/store';

interface SavedLink {
  id: string;
  url: string;
  title: string | null;
  category: string | null;
  createdAt: string;
}

export default function LinksList() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  const { links, setLinks } = useLinkStore();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
      
      const uniqueCategories = Array.from(
        new Set(
          data
            .flatMap((link: SavedLink) => 
              link.category?.split(',').map(cat => cat.trim()) ?? []
            )
            .filter(Boolean)
        )
      );
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  const filteredLinks = selectedCategory
    ? links.filter(link => 
        link.category?.split(',').map(cat => cat.trim()).includes(selectedCategory)
      )
    : links;

  return (
    <div className="max-w-4xl mx-auto">
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${!selectedCategory 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {filteredLinks.map((link) => (
          <div key={link.id} className="bg-white rounded-xl shadow-lg p-6">
            {link.title && (
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {link.title}
              </h3>
            )}
            
            <div className="flex justify-center bg-gray-50 rounded-lg p-4">
              {link.url.includes('twitter.com') || link.url.includes('x.com') ? (
                <Tweet id={getTweetId(link.url)} />
              ) : (
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {link.title || link.url}
                </a>
              )}
            </div>
            
            {link.category && (
              <div className="mt-4 flex flex-wrap gap-2">
                {link.category.split(',').map((cat, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {cat.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getTweetId(url: string): string {
  const matches = url.match(/status\/(\d+)/);
  return matches ? matches[1] : '';
} 