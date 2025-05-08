'use client';

import { useState } from 'react';
import { useLinkStore } from '@/lib/store';

export default function AddLinkForm() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLink = useLinkStore((state) => state.addLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const categories = category
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);

      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          title,
          category: categories.join(',')
        }),
      });

      if (!response.ok) throw new Error('Failed to save link');
      
      const savedLink = await response.json();
      addLink(savedLink);
      
      setUrl('');
      setTitle('');
      setCategory('');
    } catch (error) {
      console.error('Error saving link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Add New Tweet</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="url" 
                className="block text-sm font-medium text-blue-700 mb-2"
              >
                Tweet URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                placeholder="https://twitter.com/username/status/123456789"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="Add a memorable title"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="category" 
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  Categories <span className="text-blue-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="Tech, Sports, News"
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
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
        </form>
      </div>
    </div>
  );
} 