import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Sign In | Where to Go in Laos (ໄປໃສດີ)',
  description: 'Sign in to Where to Go in Laos with your username or Lao phone number.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative">
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore Laos
        </Link>
      </div>

      <LoginForm />
    </main>
  );
}
