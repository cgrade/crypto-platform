import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | CryptPro',
  description: 'Sign up or log in to your CryptPro account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
