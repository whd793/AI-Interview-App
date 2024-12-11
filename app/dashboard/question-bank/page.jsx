// app/dashboard/question-bank/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { QuestionBank, SavedQuestions } from '@/utils/schema';
import { eq, and } from 'drizzle-orm';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, BookmarkCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

function QuestionBankPage() {
  const { user } = useUser();
  const { t, language } = useLanguage();
  const [questions, setQuestions] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('behavioural');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchSavedQuestions();
    }
  }, [user, language]);

  const fetchQuestions = async () => {
    try {
      const result = await db
        .select()
        .from(QuestionBank)
        .where(eq(QuestionBank.language, language));

      // Organize questions by category
      const organized = result.reduce((acc, question) => {
        acc[question.category] = acc[question.category] || [];
        acc[question.category].push({
          ...question,
          commonFor: JSON.parse(question.commonFor),
        });
        return acc;
      }, {});

      setQuestions(organized);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error(t('errorFetchingQuestions'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedQuestions = async () => {
    try {
      const saved = await db
        .select()
        .from(SavedQuestions)
        .where(
          eq(SavedQuestions.userEmail, user?.primaryEmailAddress?.emailAddress)
        );

      setBookmarkedQuestions(new Set(saved.map((s) => s.questionId)));
    } catch (error) {
      console.error('Error fetching saved questions:', error);
    }
  };

  const handleBookmark = async (questionId) => {
    try {
      if (bookmarkedQuestions.has(questionId)) {
        await db
          .delete(SavedQuestions)
          .where(
            and(
              eq(SavedQuestions.questionId, questionId),
              eq(
                SavedQuestions.userEmail,
                user?.primaryEmailAddress?.emailAddress
              )
            )
          );

        setBookmarkedQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
        toast.success(t('questionRemoved'));
      } else {
        await db.insert(SavedQuestions).values({
          questionId,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-yyyy'),
        });

        setBookmarkedQuestions((prev) => new Set([...prev, questionId]));
        toast.success(t('questionSaved'));
      }
    } catch (error) {
      console.error('Error updating bookmarks:', error);
      toast.error(t('errorOccurred'));
    }
  };

  const filterQuestions = (questionList) => {
    if (!questionList) return [];

    return questionList.filter(
      (q) =>
        (selectedDifficulty === 'all' || q.difficulty === selectedDifficulty) &&
        (selectedLevel === 'all' || q.experienceLevel === selectedLevel)
    );
  };

  const QuestionCard = ({ question }) => (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <CardTitle className='text-lg mb-2'>{question.question}</CardTitle>
            <div className='flex flex-wrap gap-2'>
              <Badge>{question.difficulty}</Badge>
              <Badge variant='outline'>{question.experienceLevel}</Badge>
              <Badge variant='secondary'>
                <Star className='h-3 w-3 mr-1' />
                {question.popularity}%
              </Badge>
            </div>
          </div>
          <button
            onClick={() => handleBookmark(question.id)}
            className='p-2 hover:bg-gray-100 rounded-full'
          >
            {bookmarkedQuestions.has(question.id) ? (
              <BookmarkCheck className='h-5 w-5 text-primary' />
            ) : (
              <Bookmark className='h-5 w-5' />
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className='w-full mt-2'>{t('practiceNow')}</Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>{question.question}</DialogTitle>
              <DialogDescription>{t('prepareAnswer')}</DialogDescription>
            </DialogHeader>
            <div className='space-y-4 mt-4'>
              <div>
                <h3 className='font-medium mb-2'>{t('sampleAnswer')}</h3>
                <p className='text-gray-600 whitespace-pre-wrap'>
                  {question.sampleAnswer}
                </p>
              </div>
              <div>
                <h3 className='font-medium mb-2'>{t('tips')}</h3>
                <p className='text-gray-600'>{question.tips}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-2'>{t('questionBank')}</h1>
          <p className='text-gray-600'>{t('questionBankDescription')}</p>
        </div>
        <Button variant='outline' className='gap-2'>
          <BookmarkCheck className='h-4 w-4' />
          {t('savedQuestions')} ({bookmarkedQuestions.size})
        </Button>
      </div>

      <div className='flex gap-4 mb-6'>
        <Select
          value={selectedDifficulty}
          onValueChange={setSelectedDifficulty}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('selectDifficulty')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allDifficulties')}</SelectItem>
            <SelectItem value='easy'>{t('easy')}</SelectItem>
            <SelectItem value='medium'>{t('medium')}</SelectItem>
            <SelectItem value='hard'>{t('hard')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('selectLevel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allLevels')}</SelectItem>
            <SelectItem value='junior'>{t('junior')}</SelectItem>
            <SelectItem value='mid'>{t('mid')}</SelectItem>
            <SelectItem value='senior'>{t('senior')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className='mb-4'>
          <TabsTrigger value='behavioural'>{t('behavioural')}</TabsTrigger>
          <TabsTrigger value='situational'>{t('situational')}</TabsTrigger>
        </TabsList>

        {['behavioural', 'situational'].map((category) => (
          <TabsContent key={category} value={category}>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {filterQuestions(questions[category])?.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
            {filterQuestions(questions[category])?.length === 0 && (
              <div className='text-center py-10'>
                <p className='text-gray-500'>{t('noQuestionsFound')}</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default QuestionBankPage;

// // app/dashboard/question-bank/page.jsx
// 'use client';
// import { useState } from 'react';
// import { useLanguage } from '@/app/providers/LanguageProvider';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Bookmark, BookmarkCheck, Star, MessageSquare } from 'lucide-react';
// import { toast } from 'sonner';

// // Sample question data - In production, this would come from your database
// const questionsData = {
//   behavioural: [
//     {
//       id: 1,
//       question:
//         'Tell me about a time you handled a difficult situation at work',
//       category: 'behavioural',
//       difficulty: 'medium',
//       commonFor: ['All roles'],
//       sampleAnswer: 'Use the STAR method to structure your response...',
//       tips: 'Focus on positive outcomes and learning experiences',
//       popularity: 95,
//     },
//     // Add more questions...
//   ],
//   technical: [
//     {
//       id: 101,
//       question: 'What are the key differences between REST and GraphQL?',
//       category: 'technical',
//       difficulty: 'hard',
//       commonFor: ['Full Stack Developer', 'Backend Developer'],
//       sampleAnswer: 'REST and GraphQL differ in several key aspects...',
//       tips: 'Compare data fetching, endpoints, and use cases',
//       popularity: 88,
//     },
//     // Add more questions...
//   ],
//   situational: [
//     // Add situational questions...
//   ],
// };

// function QuestionBank() {
//   const { t, language } = useLanguage();
//   const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
//   const [selectedQuestion, setSelectedQuestion] = useState(null);
//   const [activeTab, setActiveTab] = useState('behavioural');

//   const handleBookmark = (questionId) => {
//     setBookmarkedQuestions((prev) => {
//       const newBookmarks = new Set(prev);
//       if (newBookmarks.has(questionId)) {
//         newBookmarks.delete(questionId);
//         toast.success(t('questionRemoved'));
//       } else {
//         newBookmarks.add(questionId);
//         toast.success(t('questionSaved'));
//       }
//       return newBookmarks;
//     });
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case 'easy':
//         return 'bg-green-100 text-green-800';
//       case 'medium':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'hard':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const QuestionCard = ({ question }) => (
//     <Card className='mb-4 hover:shadow-md transition-shadow'>
//       <CardHeader className='pb-2'>
//         <div className='flex justify-between items-start'>
//           <div>
//             <CardTitle className='text-lg mb-2'>{question.question}</CardTitle>
//             <div className='flex gap-2 flex-wrap'>
//               <Badge variant='secondary'>{question.category}</Badge>
//               <Badge className={getDifficultyColor(question.difficulty)}>
//                 {question.difficulty}
//               </Badge>
//               <Badge variant='outline'>
//                 <Star className='h-3 w-3 mr-1 inline' />
//                 {question.popularity}%
//               </Badge>
//             </div>
//           </div>
//           <button
//             onClick={() => handleBookmark(question.id)}
//             className='p-2 hover:bg-gray-100 rounded-full'
//           >
//             {bookmarkedQuestions.has(question.id) ? (
//               <BookmarkCheck className='h-5 w-5 text-primary' />
//             ) : (
//               <Bookmark className='h-5 w-5' />
//             )}
//           </button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button
//               variant='outline'
//               className='w-full mt-4'
//               onClick={() => setSelectedQuestion(question)}
//             >
//               {t('practiceQuestion')}
//             </Button>
//           </DialogTrigger>
//           <DialogContent className='max-w-2xl'>
//             <DialogHeader>
//               <DialogTitle>{question.question}</DialogTitle>
//               <DialogDescription>{t('prepareYourAnswer')}</DialogDescription>
//             </DialogHeader>
//             <div className='space-y-4'>
//               <div>
//                 <h4 className='font-medium mb-2'>{t('sampleAnswer')}</h4>
//                 <p className='text-gray-600'>{question.sampleAnswer}</p>
//               </div>
//               <div>
//                 <h4 className='font-medium mb-2'>{t('tips')}</h4>
//                 <p className='text-gray-600'>{question.tips}</p>
//               </div>
//               <div>
//                 <h4 className='font-medium mb-2'>{t('commonFor')}</h4>
//                 <div className='flex gap-2 flex-wrap'>
//                   {question.commonFor.map((role) => (
//                     <Badge key={role} variant='secondary'>
//                       {role}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <div className='container mx-auto p-6'>
//       <div className='flex justify-between items-center mb-8'>
//         <div>
//           <h1 className='text-2xl font-bold mb-2'>{t('questionBank')}</h1>
//           <p className='text-gray-600'>{t('questionBankDescription')}</p>
//         </div>
//         <Button variant='outline' className='gap-2'>
//           <BookmarkCheck className='h-4 w-4' />
//           {t('savedQuestions')} ({bookmarkedQuestions.size})
//         </Button>
//       </div>

//       <Tabs
//         defaultValue='behavioural'
//         className='space-y-4'
//         onValueChange={setActiveTab}
//       >
//         <TabsList>
//           <TabsTrigger value='behavioural'>{t('behavioural')}</TabsTrigger>
//           <TabsTrigger value='technical'>{t('technical')}</TabsTrigger>
//           <TabsTrigger value='situational'>{t('situational')}</TabsTrigger>
//         </TabsList>

//         {Object.keys(questionsData).map((category) => (
//           <TabsContent key={category} value={category}>
//             <div className='grid gap-6'>
//               {questionsData[category].map((question) => (
//                 <QuestionCard key={question.id} question={question} />
//               ))}
//             </div>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   );
// }

// export default QuestionBank;
