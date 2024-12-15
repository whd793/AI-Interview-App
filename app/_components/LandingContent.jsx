// app/_components/LandingContent.jsx
'use client';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { Outfit } from 'next/font/google';
import { Steps } from './Steps';

const outfit = Outfit({ subsets: ['latin'] });

export default function LandingContent({ t }) {
  return (
    <div>
      <div className='pt-32 px-4 mx-auto max-w-screen-xl text-center lg:pt-40 lg:px-12'>
        <div className='flex justify-center mb-8'>
          <BrainCircuit className='w-20 h-20 text-primary animate-pulse' />
        </div>
        <h1
          className={`mb-6 text-5xl font-extrabold tracking-tight leading-none text-white md:text-6xl lg:text-7xl ${outfit.className}`}
        >
          {t('title')}
        </h1>
        <p className='mb-12 text-lg font-normal text-gray-300 lg:text-xl max-w-3xl mx-auto'>
          {t('subtitle')}
        </p>
        <div className='flex justify-center mb-20'>
          <a
            href='/dashboard'
            className='group inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-all hover:gap-4'
          >
            {t('getStarted')}
            <ArrowRight className='w-5 h-5 transition-all group-hover:translate-x-1' />
          </a>
        </div>
      </div>

      <div className='container mx-auto px-4 py-16 bg-white/5 backdrop-blur-sm rounded-2xl'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-16'>
            <h2
              className={`text-4xl font-bold mb-6 text-white ${outfit.className}`}
            >
              {t('howItWorksTitle')}
            </h2>
            <p className='text-xl text-gray-300'>{t('howItWorksSubtitle')}</p>
          </div>

          <Steps t={t} />

          <div className='mt-20 text-center bg-white/10 p-10 rounded-xl backdrop-blur-sm'>
            <h2
              className={`text-3xl font-bold mb-4 text-white ${outfit.className}`}
            >
              {t('readyToStart')}
            </h2>
            <p className='text-gray-300 mb-8 text-lg'>
              {t('readyToStartDescription')}
            </p>
            <a
              href='/dashboard'
              className='group inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-all hover:gap-4'
            >
              {t('startPracticing')}
              <ArrowRight className='w-5 h-5 transition-all group-hover:translate-x-1' />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
