import AddLinkForm from '@/components/AddLinkForm';
import LinksList from '@/components/LinksList';

export default function Home() {
  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Tweet Saver
        </h1>
        <div className="bg-red-500 text-white p-4 mb-4 text-center rounded-xl">
          This should be red if Tailwind is working
        </div>
        <AddLinkForm />
        <LinksList />
      </div>
    </main>
  );
} 