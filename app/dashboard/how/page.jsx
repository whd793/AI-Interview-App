// app/dashboard/how/page.jsx
'use client';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Lightbulb, Video, Mic, Brain, BarChart } from 'lucide-react';

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Lightbulb className='w-8 h-8 text-primary' />,
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      icon: <Video className='w-8 h-8 text-primary' />,
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      icon: <Mic className='w-8 h-8 text-primary' />,
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      icon: <Brain className='w-8 h-8 text-primary' />,
      title: t('step4Title'),
      description: t('step4Description'),
    },
    {
      icon: <BarChart className='w-8 h-8 text-primary' />,
      title: t('step5Title'),
      description: t('step5Description'),
    },
  ];

  return (
    <div className='container mx-auto px-4 py-12 max-w-6xl'>
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-bold mb-4'>{t('howItWorksTitle')}</h1>
        <p className='text-xl text-gray-600'>{t('howItWorksSubtitle')}</p>
      </div>

      <div className='space-y-12'>
        {steps.map((step, index) => (
          <div
            key={index}
            className='flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow'
          >
            <div className='p-4 bg-gray-50 rounded-full'>{step.icon}</div>
            <div>
              <h2 className='text-xl font-semibold mb-2'>{step.title}</h2>
              <p className='text-gray-600'>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-16 text-center bg-gray-50 p-8 rounded-lg'>
        <h2 className='text-2xl font-bold mb-4'>{t('readyToStart')}</h2>
        <p className='text-gray-600 mb-6'>{t('readyToStartDescription')}</p>
        <a
          href='/dashboard'
          className='inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors'
        >
          {t('startPracticing')}
        </a>
      </div>
    </div>
  );
}
