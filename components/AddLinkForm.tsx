'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLinkStore } from '@/lib/store';
import TagSelector from './TagSelector';

export default function AddLinkForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLink = useLinkStore((state) => state.addLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a tweet URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          title,
          tagIds: selectedTags
        }),
      });

      if (!response.ok) throw new Error('Failed to save link');
      
      const savedLink = await response.json();
      addLink(savedLink);
      
      // Redirect to tweets page after successful save
      router.push('/tweets');
    } catch (error) {
      console.error('Error saving link:', error);
      setError('Failed to save tweet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Add New Tweet</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="url" 
                className="block text-sm font-medium text-blue-700 mb-2"
              >
                Tweet URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                placeholder="https://twitter.com/username/status/123456789"
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="title" 
                className="block text-sm font-medium text-blue-700 mb-2"
              >
                Title <span className="text-blue-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                placeholder="Add a memorable title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Tags <span className="text-blue-400">(Optional)</span>
              </label>
              <TagSelector
                selectedTags={selectedTags}
                onChange={setSelectedTags}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedTags.length} tags selected
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !url}
              className="inline-flex items-center px-6 py-3 border-2 border-blue-600 rounded-xl text-base font-medium transition-all
                bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Tweet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 