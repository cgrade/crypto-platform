import { Metadata } from 'next';
import LoginClient from './page.client';

export const metadata: Metadata = {
  title: 'Login | CryptoPro',
  description: 'Login to your CryptoPro account',
};

export default function LoginPage() {
  return <LoginClient />;
}
