// app/dashboard/analytics/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Trophy, Target, TrendingUp, AlertCircle, Clock } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all user answers
      const answers = await db
        .select()
        .from(UserAnswer)
        .where(
          eq(UserAnswer.userEmail, user?.primaryEmailAddress?.emailAddress)
        );

      // Fetch all interviews
      const interviews = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
        );

      // Process data for analytics
      const processedData = processAnalyticsData(answers, interviews);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (answers, interviews) => {
    // Calculate average ratings over time
    const progressData = answers
      .map((answer) => ({
        date: answer.createdAt,
        rating: parseFloat(answer.rating),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate performance by job role
    const rolePerformance = interviews.reduce((acc, interview) => {
      const interviewAnswers = answers.filter(
        (a) => a.mockIdRef === interview.mockId
      );
      if (interviewAnswers.length === 0) return acc;

      const avgRating =
        interviewAnswers.reduce((sum, a) => sum + parseFloat(a.rating), 0) /
        interviewAnswers.length;

      acc.push({
        name: interview.jobPosition,
        value: avgRating,
      });
      return acc;
    }, []);

    // Find areas for improvement
    const improvements = answers.reduce((acc, answer) => {
      const rating = parseFloat(answer.rating);
      if (rating < 7) {
        acc.push({
          question: answer.question,
          rating,
          feedback: answer.feedback,
        });
      }
      return acc;
    }, []);

    return {
      progressData,
      rolePerformance,
      improvements,
      totalInterviews: interviews.length,
      averageRating:
        answers.reduce((sum, a) => sum + parseFloat(a.rating), 0) /
        answers.length,
    };
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <h1 className='text-2xl font-bold mb-8'>{t('performanceAnalytics')}</h1>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('totalInterviews')}
            </CardTitle>
            <Trophy className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {analyticsData.totalInterviews}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('averageRating')}
            </CardTitle>
            <Target className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {analyticsData.averageRating.toFixed(1)}/10
            </div>
          </CardContent>
        </Card>

        {/* Add more overview cards as needed */}
      </div>

      {/* Progress Over Time */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>{t('progressOverTime')}</CardTitle>
          <CardDescription>{t('ratingTrend')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={analyticsData.progressData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='rating'
                  stroke='#8884d8'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Role */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>{t('performanceByRole')}</CardTitle>
          <CardDescription>{t('averageRatingByPosition')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={analyticsData.rolePerformance}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {analyticsData.rolePerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardHeader>
          <CardTitle>{t('areasForImprovement')}</CardTitle>
          <CardDescription>{t('questionsNeedingWork')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {analyticsData.improvements.slice(0, 3).map((item, index) => (
              <div key={index} className='border-b pb-4 last:border-0'>
                <div className='flex items-start gap-4'>
                  <div className='p-2 bg-red-100 rounded-full'>
                    <AlertCircle className='h-4 w-4 text-red-500' />
                  </div>
                  <div>
                    <h4 className='font-medium mb-1'>{item.question}</h4>
                    <p className='text-sm text-gray-600'>{item.feedback}</p>
                    <div className='mt-2 flex items-center gap-2'>
                      <span className='text-sm font-medium'>
                        {t('rating')}: {item.rating}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
