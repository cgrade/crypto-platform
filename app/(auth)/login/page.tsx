import { Metadata } from 'next';
import LoginClient from './page.client';

export const metadata: Metadata = {
  title: 'Login | CryptPro',
  description: 'Login to your CryptPro account',
};

export default function LoginPage() {
  return <LoginClient />;
}
