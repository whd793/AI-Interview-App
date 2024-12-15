// app/dashboard/_components/Credits.jsx
'use client';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { UserCredits } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useLanguage } from '@/app/providers/LanguageProvider';
import moment from 'moment';

function Credits() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [credits, setCredits] = useState(5);
  const [timeLeft, setTimeLeft] = useState('');
  const [originalLastUpdated, setOriginalLastUpdated] = useState(null);

  const fetchCredits = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return { credits: 5, lastUpdated: new Date() };
      // return;
    }

    try {
      let userCredits = await db
        .select()
        .from(UserCredits)
        .where(
          eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
        );

      if (!userCredits.length) {
        const now = new Date();
        await db.insert(UserCredits).values({
          userEmail: user.primaryEmailAddress.emailAddress,
          credits: 5,
          lastUpdated: now,
        });
        return { credits: 5, lastUpdated: now };
      }

      return {
        credits: userCredits[0].credits,
        lastUpdated: userCredits[0].lastUpdated,
      };
    } catch (error) {
      console.error('Error fetching credits:', error);
      return { credits: 5, lastUpdated: new Date() };
    }
  };

  useEffect(() => {
    const updateCreditsAndTimer = async () => {
      const { credits: currentCredits, lastUpdated } = await fetchCredits();

      // Only set originalLastUpdated if it hasn't been set yet or if we reached max credits
      if (!originalLastUpdated || currentCredits >= 5) {
        setOriginalLastUpdated(lastUpdated);
      }

      setCredits(currentCredits);

      // Only update timer if we're not at max credits
      if (currentCredits < 5) {
        const now = moment();
        const nextUpdate = moment(originalLastUpdated || lastUpdated).add(
          1,
          'minute'
        );
        const timeUntilNext = moment.duration(nextUpdate.diff(now));

        if (timeUntilNext.asSeconds() <= 0) {
          // Time to add a credit
          const newCredits = Math.min(currentCredits + 1, 5);
          const newLastUpdated = new Date();

          await db
            .update(UserCredits)
            .set({
              credits: newCredits,
              lastUpdated: newLastUpdated, // Update lastUpdated when adding credit
            })
            .where(
              eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
            );

          // Reset timer when adding credit
          setOriginalLastUpdated(newLastUpdated);
          setCredits(newCredits);
        } else {
          setTimeLeft(
            `${timeUntilNext.minutes()}:${String(
              timeUntilNext.seconds()
            ).padStart(2, '0')}`
          );
        }
      }
    };

    updateCreditsAndTimer();
    const interval = setInterval(updateCreditsAndTimer, 1000);

    return () => clearInterval(interval);
  }, [user?.primaryEmailAddress?.emailAddress, originalLastUpdated]);

  return (
    <div className='flex items-center gap-2 bg-white rounded-lg shadow-sm border p-3 whitespace-nowrap'>
      <div className='flex flex-col items-center'>
        <span className='text-sm font-medium text-gray-600'>
          {t('credits')}
        </span>
        <div className='flex gap-1 mt-1'>
          {[...Array(5)].map((_, i) => (
            <Zap
              key={i}
              className={`w-5 h-5 ${
                i < credits
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
      {credits < 5 && (
        <div className='flex flex-col items-center border-l pl-4'>
          <span className='text-sm font-medium text-gray-600 whitespace-nowrap'>
            {t('nextCredit')}
          </span>
          <span className='text-lg font-semibold text-primary'>{timeLeft}</span>
        </div>
      )}
    </div>
  );
}

export default Credits;

// // app/dashboard/_components/Credits.jsx
// 'use client';
// import { useEffect, useState } from 'react';
// import { Zap } from 'lucide-react';
// import { useUser } from '@clerk/nextjs';
// import { db } from '@/utils/db';
// import { UserCredits } from '@/utils/schema';
// import { eq } from 'drizzle-orm';
// import { useLanguage } from '@/app/providers/LanguageProvider';
// import moment from 'moment';

// function Credits() {
//   const { user } = useUser();
//   const { t } = useLanguage();
//   const [credits, setCredits] = useState(5);
//   const [timeLeft, setTimeLeft] = useState('');
//   const [originalLastUpdated, setOriginalLastUpdated] = useState(null);

//   const fetchCredits = async () => {
//     if (!user?.primaryEmailAddress?.emailAddress) return;

//     let userCredits = await db
//       .select()
//       .from(UserCredits)
//       .where(eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress));

//     if (!userCredits.length) {
//       const now = new Date();
//       await db.insert(UserCredits).values({
//         userEmail: user.primaryEmailAddress.emailAddress,
//         credits: 5,
//         lastUpdated: now,
//       });
//       setOriginalLastUpdated(now);
//       return { credits: 5, lastUpdated: now };
//     }

//     return {
//       credits: userCredits[0].credits,
//       lastUpdated: userCredits[0].lastUpdated,
//     };
//   };

//   useEffect(() => {
//     const updateCreditsAndTimer = async () => {
//       const { credits: currentCredits, lastUpdated } = await fetchCredits();

//       // Only set originalLastUpdated if it hasn't been set yet
//       if (!originalLastUpdated) {
//         setOriginalLastUpdated(lastUpdated);
//       }

//       setCredits(currentCredits);

//       // Calculate time left based on originalLastUpdated
//       const now = moment();
//       const nextUpdate = moment(originalLastUpdated || lastUpdated).add(
//         1,
//         'minute'
//       );
//       const timeUntilNext = moment.duration(nextUpdate.diff(now));

//       if (timeUntilNext.asSeconds() <= 0 && currentCredits < 5) {
//         // Time to add a credit
//         const newCredits = Math.min(currentCredits + 1, 5);
//         await db
//           .update(UserCredits)
//           .set({
//             credits: newCredits,
//             lastUpdated: originalLastUpdated, // Keep the original time
//           })
//           .where(
//             eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//           );

//         // Reset the timer
//         setOriginalLastUpdated(new Date());
//         setCredits(newCredits);
//       } else if (timeUntilNext.asSeconds() > 0) {
//         setTimeLeft(
//           `${timeUntilNext.minutes()}:${String(
//             timeUntilNext.seconds()
//           ).padStart(2, '0')}`
//         );
//       }
//     };

//     updateCreditsAndTimer();
//     const interval = setInterval(updateCreditsAndTimer, 1000);

//     return () => clearInterval(interval);
//   }, [user?.primaryEmailAddress?.emailAddress, originalLastUpdated]);

//   return (
//     <div className='flex items-center gap-2 bg-white rounded-lg shadow-sm border p-3 whitespace-nowrap'>
//       <div className='flex flex-col items-center'>
//         <span className='text-sm font-medium text-gray-600'>
//           {t('credits')}
//         </span>
//         <div className='flex gap-1 mt-1'>
//           {[...Array(5)].map((_, i) => (
//             <Zap
//               key={i}
//               className={`w-5 h-5 ${
//                 i < credits
//                   ? 'text-yellow-400 fill-yellow-400'
//                   : 'text-gray-200 fill-gray-200'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//       {credits < 5 && (
//         <div className='flex flex-col items-center border-l pl-4'>
//           <span className='text-sm font-medium text-gray-600 whitespace-nowrap'>
//             {t('nextCredit')}
//           </span>
//           <span className='text-lg font-semibold text-primary'>{timeLeft}</span>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Credits;
