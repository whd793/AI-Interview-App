// app/terms/page.jsx
'use client';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { termsContent } from '@/utils/terms-content';
import Header from '../dashboard/_components/Header';
import Footer from '../dashboard/_components/Footer';
export default function Terms() {
  const { language } = useLanguage();
  const content = termsContent[language];

  return (
    <div>
      <Header />
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <h1 className='text-3xl font-bold mb-2'>{content.title}</h1>
        <p className='text-gray-500 mb-8'>{content.lastUpdated}</p>

        <div className='space-y-8'>
          {content.sections.map((section, index) => (
            <div key={index} className='prose'>
              <h2 className='text-xl font-semibold mb-3'>{section.title}</h2>
              <p className='text-gray-700 whitespace-pre-wrap'>
                {section.content}
              </p>
            </div>
          ))}

          <div className='border-t pt-8 mt-12'>
            <h2 className='text-xl font-semibold mb-3'>
              {content.contact.title}
            </h2>
            <p className='text-gray-700 mb-4'>{content.contact.content}</p>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p>Email: whd793@gmail.com</p>
              {/* <p>Address: Your Business Address</p> */}
              {/* <p>Phone: Your Business Phone</p> */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
