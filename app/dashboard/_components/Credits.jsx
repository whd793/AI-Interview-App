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

//   // const fetchCredits = async () => {
//   //   if (!user?.primaryEmailAddress?.emailAddress) {
//   //     return { credits: 5, lastUpdated: new Date() };
//   //   }

//   //   try {
//   //     let userCredits = await db
//   //       .select()
//   //       .from(UserCredits)
//   //       .where(
//   //         eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//   //       );

//   //     if (!userCredits.length) {
//   //       const now = new Date();
//   //       await db.insert(UserCredits).values({
//   //         userEmail: user.primaryEmailAddress.emailAddress,
//   //         credits: 5,
//   //         lastUpdated: now,
//   //       });
//   //       return { credits: 5, lastUpdated: now };
//   //     }

//   //     const { credits: currentCredits, lastUpdated } = userCredits[0];
//   //     const minutesSinceUpdate = moment().diff(moment(lastUpdated), 'minutes');

//   //     if (minutesSinceUpdate > 0 && currentCredits < 5) {
//   //       const creditsToAdd = Math.min(minutesSinceUpdate, 5 - currentCredits);
//   //       const newCredits = Math.min(currentCredits + creditsToAdd, 5);

//   //       if (newCredits > currentCredits) {
//   //         const newLastUpdated = moment()
//   //           .subtract(minutesSinceUpdate - creditsToAdd, 'minutes')
//   //           .toDate();
//   //         await db
//   //           .update(UserCredits)
//   //           .set({
//   //             credits: newCredits,
//   //             lastUpdated: newLastUpdated,
//   //           })
//   //           .where(
//   //             eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//   //           );

//   //         return { credits: newCredits, lastUpdated: newLastUpdated };
//   //       }
//   //     }

//   //     return { credits: currentCredits, lastUpdated };
//   //   } catch (error) {
//   //     console.error('Error fetching credits:', error);
//   //     return { credits: 5, lastUpdated: new Date() };
//   //   }
//   // };

//   // const fetchCredits = async () => {
//   //   if (!user?.primaryEmailAddress?.emailAddress) {
//   //     return { credits: 5, lastUpdated: new Date() };
//   //   }

//   //   try {
//   //     let userCredits = await db
//   //       .select()
//   //       .from(UserCredits)
//   //       .where(
//   //         eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//   //       );

//   //     if (!userCredits.length) {
//   //       const now = new Date();
//   //       await db.insert(UserCredits).values({
//   //         userEmail: user.primaryEmailAddress.emailAddress,
//   //         credits: 5,
//   //         lastUpdated: now,
//   //       });
//   //       return { credits: 5, lastUpdated: now };
//   //     }

//   //     // Return the values directly without additional processing
//   //     return {
//   //       credits: userCredits[0].credits,
//   //       lastUpdated: userCredits[0].lastUpdated,
//   //     };
//   //   } catch (error) {
//   //     console.error('Error fetching credits:', error);
//   //     return { credits: 5, lastUpdated: new Date() };
//   //   }
//   // };

//   const fetchCredits = async () => {
//     if (!user?.primaryEmailAddress?.emailAddress) {
//       return null;
//     }

//     try {
//       let userCredits = await db
//         .select()
//         .from(UserCredits)
//         .where(
//           eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//         );

//       // Don't auto-create credits here - just return null if no credits found
//       if (!userCredits.length) {
//         return null;
//       }

//       // Get current state
//       const { credits: currentCredits, lastUpdated } = userCredits[0];
//       const minutesSinceUpdate = moment().diff(moment(lastUpdated), 'minutes');

//       // If we have max credits, update the lastUpdated time to now
//       // to ensure future credit deductions start timer from current time
//       if (currentCredits >= 5) {
//         await db
//           .update(UserCredits)
//           .set({
//             lastUpdated: new Date(),
//           })
//           .where(
//             eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//           );

//         return { credits: 5, lastUpdated: new Date() };
//       }

//       // If we don't have max credits, check if we need to add credits
//       if (minutesSinceUpdate > 0 && currentCredits < 5) {
//         const creditsToAdd = Math.min(minutesSinceUpdate, 5 - currentCredits);
//         const newCredits = Math.min(currentCredits + creditsToAdd, 5);

//         if (newCredits > currentCredits) {
//           const newLastUpdated = new Date();
//           await db
//             .update(UserCredits)
//             .set({
//               credits: newCredits,
//               lastUpdated: newLastUpdated,
//             })
//             .where(
//               eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//             );

//           return { credits: newCredits, lastUpdated: newLastUpdated };
//         }
//       }

//       return { credits: currentCredits, lastUpdated };
//     } catch (error) {
//       console.error('Error fetching credits:', error);
//       return null;
//     }
//   };

//   // const fetchCredits = async () => {
//   //   if (!user?.primaryEmailAddress?.emailAddress) {
//   //     return { credits: 5, lastUpdated: new Date() };
//   //     // return;
//   //   }

//   //   try {
//   //     let userCredits = await db
//   //       .select()
//   //       .from(UserCredits)
//   //       .where(
//   //         eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//   //       );

//   //     if (!userCredits.length) {
//   //       const now = new Date();
//   //       await db.insert(UserCredits).values({
//   //         userEmail: user.primaryEmailAddress.emailAddress,
//   //         credits: 5,
//   //         lastUpdated: now,
//   //       });
//   //       return { credits: 5, lastUpdated: now };
//   //     }

//   //     return {
//   //       credits: userCredits[0].credits,
//   //       lastUpdated: userCredits[0].lastUpdated,
//   //     };
//   //   } catch (error) {
//   //     console.error('Error fetching credits:', error);
//   //     return { credits: 5, lastUpdated: new Date() };
//   //   }
//   // // };

//   // useEffect(() => {
//   //   const updateCreditsAndTimer = async () => {
//   //     const { credits: currentCredits, lastUpdated } = await fetchCredits();

//   //     // Only set originalLastUpdated if it hasn't been set yet or if we reached max credits
//   //     if (!originalLastUpdated || currentCredits >= 5) {
//   //       setOriginalLastUpdated(lastUpdated);
//   //     }

//   //     setCredits(currentCredits);

//   //     // Only update timer if we're not at max credits
//   //     if (currentCredits < 5) {
//   //       const now = moment();
//   //       const nextUpdate = moment(originalLastUpdated || lastUpdated).add(
//   //         1,
//   //         'minute'
//   //       );
//   //       const timeUntilNext = moment.duration(nextUpdate.diff(now));

//   //       if (timeUntilNext.asSeconds() <= 0) {
//   //         // Time to add a credit
//   //         const newCredits = Math.min(currentCredits + 1, 5);
//   //         const newLastUpdated = new Date();

//   //         await db
//   //           .update(UserCredits)
//   //           .set({
//   //             credits: newCredits,
//   //             lastUpdated: newLastUpdated, // Update lastUpdated when adding credit
//   //           })
//   //           .where(
//   //             eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//   //           );

//   //         // Reset timer when adding credit
//   //         setOriginalLastUpdated(newLastUpdated);
//   //         setCredits(newCredits);
//   //       } else {
//   //         setTimeLeft(
//   //           `${timeUntilNext.minutes()}:${String(
//   //             timeUntilNext.seconds()
//   //           ).padStart(2, '0')}`
//   //         );
//   //       }
//   //     }
//   //   };

//   //   updateCreditsAndTimer();
//   //   const interval = setInterval(updateCreditsAndTimer, 1000);

//   //   return () => clearInterval(interval);
//   // }, [user?.primaryEmailAddress?.emailAddress, originalLastUpdated]);

//   useEffect(() => {
//     const updateCreditsAndTimer = async () => {
//       const data = await fetchCredits();
//       if (!data) return;

//       const { credits: currentCredits, lastUpdated } = data;
//       setCredits(currentCredits);

//       // Only show timer if we're not at max credits
//       if (currentCredits < 5) {
//         const now = moment();
//         const nextUpdate = moment(lastUpdated).add(1, 'minute');
//         const timeUntilNext = moment.duration(nextUpdate.diff(now));

//         if (timeUntilNext.asSeconds() > 0) {
//           setTimeLeft(
//             `${timeUntilNext.minutes()}:${String(
//               timeUntilNext.seconds()
//             ).padStart(2, '0')}`
//           );
//         } else {
//           setTimeLeft('0:00');
//         }
//       } else {
//         setTimeLeft('');
//       }
//     };

//     updateCreditsAndTimer();
//     const interval = setInterval(updateCreditsAndTimer, 1000);

//     return () => clearInterval(interval);
//   }, [user?.primaryEmailAddress?.emailAddress]);

//   // const [credits, setCredits] = useState(5);
//   // const [timeLeft, setTimeLeft] = useState('');

//   // const fetchCredits = async () => {
//   //   if (!user?.primaryEmailAddress?.emailAddress) return;

//   //   let userCredits = await db
//   //     .select()
//   //     .from(UserCredits)
//   //     .where(eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress));

//   //   if (!userCredits.length) {
//   //     // Create new user credits entry
//   //     await db.insert(UserCredits).values({
//   //       userEmail: user.primaryEmailAddress.emailAddress,
//   //       credits: 5,
//   //       lastUpdated: new Date(),
//   //     });
//   //     return 5;
//   //   }

//   //   const { credits: currentCredits, lastUpdated } = userCredits[0];
//   //   // Changed to minutes for testing
//   //   const minutesSinceUpdate = moment().diff(moment(lastUpdated), 'minutes');

//   //   if (minutesSinceUpdate > 0 && currentCredits < 5) {
//   //     const newCredits = Math.min(currentCredits + minutesSinceUpdate, 5);
//   //     await db
//   //       .update(UserCredits)
//   //       .set({
//   //         credits: newCredits,
//   //         lastUpdated: new Date(),
//   //       })
//   //       .where(
//   //         eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
//   //       );
//   //     return newCredits;
//   //   }

//   //   return currentCredits;
//   // };

//   // useEffect(() => {
//   //   const updateCreditsAndTimer = async () => {
//   //     const currentCredits = await fetchCredits();
//   //     setCredits(currentCredits);

//   //     // Changed to next minute for testing
//   //     const now = moment();
//   //     const nextUpdate = moment().startOf('minute').add(1, 'minute');
//   //     const duration = moment.duration(nextUpdate.diff(now));

//   //     setTimeLeft(
//   //       `${duration.minutes()}:${String(duration.seconds()).padStart(2, '0')}`
//   //     );
//   //   };

//   //   updateCreditsAndTimer();
//   //   const interval = setInterval(updateCreditsAndTimer, 1000);

//   //   return () => clearInterval(interval);
//   // }, [user?.primaryEmailAddress?.emailAddress]);

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

  // const fetchCredits = async () => {
  //   if (!user?.primaryEmailAddress?.emailAddress) return;

  //   let userCredits = await db
  //     .select()
  //     .from(UserCredits)
  //     .where(eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress));

  //   if (!userCredits.length) {
  //     const now = new Date();
  //     await db.insert(UserCredits).values({
  //       userEmail: user.primaryEmailAddress.emailAddress,
  //       credits: 5,
  //       lastUpdated: now,
  //     });
  //     setOriginalLastUpdated(now);
  //     return { credits: 5, lastUpdated: now };
  //   }

  //   return {
  //     credits: userCredits[0].credits,
  //     lastUpdated: userCredits[0].lastUpdated,
  //   };
  // };

  // useEffect(() => {
  //   const updateCreditsAndTimer = async () => {
  //     const { credits: currentCredits, lastUpdated } = await fetchCredits();

  //     // Only set originalLastUpdated if it hasn't been set yet
  //     if (!originalLastUpdated) {
  //       setOriginalLastUpdated(lastUpdated);
  //     }

  //     setCredits(currentCredits);

  //     // Calculate time left based on originalLastUpdated
  //     const now = moment();
  //     const nextUpdate = moment(originalLastUpdated || lastUpdated).add(
  //       1,
  //       'minute'
  //     );
  //     const timeUntilNext = moment.duration(nextUpdate.diff(now));

  //     if (timeUntilNext.asSeconds() <= 0 && currentCredits < 5) {
  //       // Time to add a credit
  //       const newCredits = Math.min(currentCredits + 1, 5);
  //       await db
  //         .update(UserCredits)
  //         .set({
  //           credits: newCredits,
  //           lastUpdated: originalLastUpdated, // Keep the original time
  //         })
  //         .where(
  //           eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
  //         );

  //       // Reset the timer
  //       setOriginalLastUpdated(new Date());
  //       setCredits(newCredits);
  //     } else if (timeUntilNext.asSeconds() > 0) {
  //       setTimeLeft(
  //         `${timeUntilNext.minutes()}:${String(
  //           timeUntilNext.seconds()
  //         ).padStart(2, '0')}`
  //       );
  //     }
  //   };

  //   updateCreditsAndTimer();
  //   const interval = setInterval(updateCreditsAndTimer, 1000);

  //   return () => clearInterval(interval);
  // }, [user?.primaryEmailAddress?.emailAddress, originalLastUpdated]);

  const fetchCredits = async () => {
    // if (!user?.primaryEmailAddress?.emailAddress) return;

    if (!user?.primaryEmailAddress?.emailAddress) {
      return { credits: 5 }; // Default fallback
    }

    //   //   if (!user?.primaryEmailAddress?.emailAddress) {
    //   //     return { credits: 5, lastUpdated: new Date() };
    //   //   }

    let userCredits = await db
      .select()
      .from(UserCredits)
      .where(eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress));

    if (!userCredits.length) {
      const now = new Date();
      await db.insert(UserCredits).values({
        userEmail: user.primaryEmailAddress.emailAddress,
        credits: 5,
        lastUpdated: now,
      });
      setOriginalLastUpdated(now);
      return { credits: 5, lastUpdated: now };
    }

    // If credits are at max, update the lastUpdated time
    if (userCredits[0].credits === 5) {
      const now = new Date();
      await db
        .update(UserCredits)
        .set({
          lastUpdated: now,
        })
        .where(
          eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
        );
      return { credits: 5, lastUpdated: now };
    }

    return {
      credits: userCredits[0].credits,
      lastUpdated: userCredits[0].lastUpdated,
    };
  };

  useEffect(() => {
    const updateCreditsAndTimer = async () => {
      const { credits: currentCredits, lastUpdated } = await fetchCredits();

      // Only set originalLastUpdated if it hasn't been set yet or if credits were just reset to 5
      if (!originalLastUpdated || currentCredits === 5) {
        setOriginalLastUpdated(lastUpdated);
      }

      setCredits(currentCredits);

      // // Only show and update timer if not at max credits
      // if (currentCredits < 5) {
      //   const now = moment();
      //   const nextUpdate = moment(originalLastUpdated).add(1, 'minute');
      //   const timeUntilNext = moment.duration(nextUpdate.diff(now));

      //   if (timeUntilNext.asSeconds() <= 0) {
      //     // Time to add a credit
      //     const newCredits = Math.min(currentCredits + 1, 5);
      //     const newLastUpdated = new Date();

      //     await db
      //       .update(UserCredits)
      //       .set({
      //         credits: newCredits,
      //         lastUpdated: newLastUpdated,
      //       })
      //       .where(
      //         eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
      //       );

      //     setOriginalLastUpdated(newLastUpdated);
      //     setCredits(newCredits);
      //     setTimeLeft('');
      //   } else {
      //     setTimeLeft(
      //       `${timeUntilNext.minutes()}:${String(
      //         timeUntilNext.seconds()
      //       ).padStart(2, '0')}`
      //     );
      //   }
      // } else {
      //   setTimeLeft('');
      // }
      // If credits are at max, clear the timer
      if (currentCredits === 5) {
        setTimeLeft('');
        return;
      }

      // Calculate and set the time left until the next credit
      const now = moment();
      const nextUpdate = moment(originalLastUpdated || lastUpdated).add(
        1,
        'minute'
      );
      const timeUntilNext = moment.duration(nextUpdate.diff(now));

      if (timeUntilNext.asSeconds() <= 0) {
        // Add a credit if the timer has expired
        const newCredits = Math.min(currentCredits + 1, 5);
        const newLastUpdated = new Date();

        await db
          .update(UserCredits)
          .set({
            credits: newCredits,
            lastUpdated: newLastUpdated,
          })
          .where(
            eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
          );

        setOriginalLastUpdated(newLastUpdated);
        setCredits(newCredits);
        setTimeLeft('');
      } else {
        // Properly set the remaining time
        setTimeLeft(
          `${timeUntilNext.minutes()}:${String(
            timeUntilNext.seconds()
          ).padStart(2, '0')}`
        );
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
