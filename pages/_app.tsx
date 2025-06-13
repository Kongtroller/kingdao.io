import type { AppProps } from 'next/app';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}

export default MyApp; 