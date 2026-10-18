import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Register Traveler Account | Where to Go in Laos (ໄປໃສດີ)',
  description: 'Join Where to Go in Laos to discover, post, and bookmark hidden waterfalls, cafes, and mountain peaks in Laos.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative">
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore Laos
        </Link>
      </div>

      <RegisterForm />
    </main>
  );
}
