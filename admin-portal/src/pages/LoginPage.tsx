import React from 'react';
import AdminLogin from '../components/AdminLogin';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return <AdminLogin onLoginSuccess={onLoginSuccess} />;
}
