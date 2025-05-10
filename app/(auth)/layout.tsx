import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | CryptoPro',
  description: 'Sign up or log in to your CryptoPro account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
