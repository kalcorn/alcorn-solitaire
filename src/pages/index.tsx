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
      </Head>
      <main className="min-h-screen bg-green-900 flex flex-col items-center justify-center">
        <GameBoard />
      </main>
    </>
  );
};

export default Home;
