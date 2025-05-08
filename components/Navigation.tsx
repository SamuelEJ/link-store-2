'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();
  const isNewTweetPage = pathname === '/tweets/new';

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {isNewTweetPage && (
              <Link
                href="/tweets"
                className="mr-4 text-gray-600 hover:text-gray-900 border-2 border-gray-200 rounded-full p-1 hover:border-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            )}
            <button 
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg border-2 border-green-600 hover:border-green-700 transition-colors"
            >
              <Link href="/tweets" className="text-white no-underline">
                Tweet Saver
              </Link>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isNewTweetPage && (
              <Link
                href="/tweets/new"
                className="inline-flex items-center px-6 py-2.5 border-2 border-blue-600 rounded-lg text-sm font-medium transition-all
                  bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  shadow-sm hover:shadow-md"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                Save New Tweet
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 