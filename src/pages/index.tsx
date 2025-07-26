import type { NextPage } from 'next';
import Head from 'next/head';
import GameBoard from '../components/GameBoard';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Alcorn Solitaire</title>
        <meta name="description" content="Play classic Solitaire online" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/solitaire/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/solitaire/favicon.svg" />
        <meta name="theme-color" content="#1e293b" />
      </Head>
      <main className="min-h-screen flex flex-col items-center" suppressHydrationWarning>
        <GameBoard />
      </main>
    </>
  );
};

export default Home;
