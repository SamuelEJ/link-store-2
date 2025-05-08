'use client';

import { useEffect, useState } from 'react';
import { Tweet } from 'react-tweet';
import { useLinkStore } from '@/lib/store';
import EditTweetModal from './EditTweetModal';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTweet, setEditingTweet] = useState<SavedLink | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      setError('Failed to load tweets. Please try again.');
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tweet');
      
      setLinks(links.filter(link => link.id !== id));
    } catch (error) {
      console.error('Error deleting tweet:', error);
      setError('Failed to delete tweet. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async (tagIds: string[]) => {
    if (!editingTweet) return;

    try {
      const response = await fetch(`/api/links?id=${editingTweet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagIds }),
      });

      if (!response.ok) throw new Error('Failed to update tweet');
      
      const updatedTweet = await response.json();
      setLinks(links.map(link => 
        link.id === updatedTweet.id ? updatedTweet : link
      ));
    } catch (error) {
      throw error;
    }
  };

  const handleTagClick = (tagId: string, event?: React.MouseEvent) => {
    setSelectedTags(prev => {
      // If tag is already selected, remove it
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      // If holding Ctrl/Cmd key, add to selection
      if (event?.ctrlKey || event?.metaKey) {
        return [...prev, tagId];
      }
      // Otherwise, set as single selection
      return [tagId];
    });
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
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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

      {/* Tag Filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedTags([])}
            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
              selectedTags.length === 0
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Tags
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={(e) => handleTagClick(tag.id, e)}
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

      {/* Selected Tags Indicator */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <span className="text-sm text-gray-500">Filtered by:</span>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <button
                  key={tag.id}
                  onClick={(e) => handleTagClick(tag.id, e)}
                  className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                >
                  {tag.name}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null;
            })}
            <button
              onClick={() => setSelectedTags([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Tweet List */}
      <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredLinks.map((link) => (
          <div key={link.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {link.title && (
                  <h3 className="text-lg font-semibold text-gray-800">
                    {link.title}
                  </h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingTweet(link)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Edit tags"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={deletingId === link.id}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete tweet"
                >
                  {deletingId === link.id ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
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
                        <button
                          onClick={(e) => handleTagClick(tag.id, e)}
                          className={`inline-block text-xs px-2 py-1 rounded-lg border transition-colors ${
                            selectedTags.includes(tag.id)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          {parentName}
                        </button>
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

      <EditTweetModal
        isOpen={!!editingTweet}
        onClose={() => setEditingTweet(null)}
        onSave={handleEdit}
        title={editingTweet?.title}
        currentTags={editingTweet?.tags.map(tag => tag.id) || []}
      />
    </div>
  );
}

function getTweetId(url: string): string {
  const matches = url.match(/status\/(\d+)/);
  return matches ? matches[1] : '';
} 