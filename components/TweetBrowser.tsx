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

export default function TweetBrowser() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const { links, setLinks } = useLinkStore();

  useEffect(() => {
    fetchLinks();
    fetchTags();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
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

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const filteredLinks = links.filter(link => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tagId => 
        link.tags.some(tag => tag.id === tagId)
      );

    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-6">
      {/* Search and View Toggle */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tweets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg border-2 transition-all ${
              view === 'grid' 
                ? 'border-blue-600 bg-blue-50 text-blue-800' 
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg border-2 transition-all ${
              view === 'list' 
                ? 'border-blue-600 bg-blue-50 text-blue-800' 
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-4">
          <button
            onClick={() => setSelectedTags([])}
            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
              selectedTags.length === 0
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                selectedTags.includes(tag.id)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Tweet List */}
      <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredLinks.map((link) => (
          <div key={link.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {link.title && (
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {link.title}
              </h3>
            )}
            
            <div className="flex justify-center bg-gray-50 rounded-lg border border-gray-100 p-4">
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
                        <span className="inline-block bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-lg border border-blue-200">
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