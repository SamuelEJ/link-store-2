'use client';

import { useEffect, useState } from 'react';
import { Tweet } from 'react-tweet';
import { useLinkStore } from '@/lib/store';

interface Tag {
  id: string;
  name: string;
  parentId: string | null;
  parent: Tag | null;
}

interface SavedLink {
  id: string;
  url: string;
  title: string | null;
  tags: Tag[];
  createdAt: string;
}

export default function LinksList() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const { links, setLinks } = useLinkStore();

  useEffect(() => {
    fetchLinks();
    fetchTags();
  }, []);

  const fetchLinks = async () => {
    try {
      console.log('Fetching links...');
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      console.log('Received links:', data);
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  const fetchTags = async () => {
    try {
      console.log('Fetching tags...');
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      console.log('Received tags:', data);
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const getTagWithParents = (tag: Tag): string[] => {
    const parents: string[] = [tag.name];
    let currentTag = tag;
    
    while (currentTag.parent) {
      parents.unshift(currentTag.parent.name);
      currentTag = currentTag.parent;
    }
    
    return parents;
  };

  console.log('Current links:', links);
  console.log('Current tags:', tags);
  console.log('Selected tag:', selectedTag);

  const filteredLinks = selectedTag
    ? links.filter(link => 
        link.tags.some(tag => tag.id === selectedTag)
      )
    : links;

  console.log('Filtered links:', filteredLinks);

  return (
    <div className="max-w-4xl mx-auto">
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${!selectedTag 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedTag === tag.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {tag.name}
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
            
            {link.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {link.tags.map((tag) => (
                  <div 
                    key={tag.id}
                    className="flex items-center gap-1"
                  >
                    {getTagWithParents(tag).map((parentName, index, array) => (
                      <span key={parentName}>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {parentName}
                        </span>
                        {index < array.length - 1 && (
                          <span className="mx-1 text-gray-400">/</span>
                        )}
                      </span>
                    ))}
                  </div>
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