import TweetBrowser from '@/components/TweetBrowser';
import Navigation from '@/components/Navigation';

export default function TweetsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            My Saved Tweets
          </h1>
          <TweetBrowser />
        </div>
      </main>
    </>
  );
} 