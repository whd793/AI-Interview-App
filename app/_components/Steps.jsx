// app/_components/Steps.jsx
import { Lightbulb, Video, Mic, Brain, BarChart } from 'lucide-react';

export function Steps({ t }) {
  const steps = [
    {
      icon: <Lightbulb className='w-10 h-10 text-primary' />,
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      icon: <Video className='w-10 h-10 text-primary' />,
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      icon: <Mic className='w-10 h-10 text-primary' />,
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      icon: <Brain className='w-10 h-10 text-primary' />,
      title: t('step4Title'),
      description: t('step4Description'),
    },
    {
      icon: <BarChart className='w-10 h-10 text-primary' />,
      title: t('step5Title'),
      description: t('step5Description'),
    },
  ];

  return (
    <div className='space-y-8'>
      {steps.map((step, index) => (
        <div
          key={index}
          className='flex flex-col md:flex-row items-start md:items-center gap-6 p-8 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300'
        >
          <div className='p-4 bg-white/10 rounded-xl'>{step.icon}</div>
          <div>
            <h3 className='text-xl font-semibold mb-3 text-white'>
              {step.title}
            </h3>
            <p className='text-gray-300 leading-relaxed'>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
