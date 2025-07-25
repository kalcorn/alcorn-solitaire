import '../styles/globals.css';
import type { AppProps } from 'next/app';

function AlcornSolitaire({ Component, pageProps }: AppProps) {
  return (
    <div className="felt-bg min-h-screen flex flex-col w-full">
      <Component {...pageProps} />
    </div>
  );
}

export default AlcornSolitaire;