import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to Ivy Homes</h1>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        Your trusted property portal for Mumbai. Discover premium apartments, villas, and exclusive builder projects.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/listings" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
          Browse Listings
        </Link>
        <Link href="/login" className="bg-white text-gray-900 border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
          Sign In
        </Link>
      </div>
    </div>
  );
}
