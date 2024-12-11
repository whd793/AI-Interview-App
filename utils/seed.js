const { db } = require('./db');
const { QuestionBank } = require('./schema');
const moment = require('moment');
const { questions } = require('./seed-questions');

async function seedQuestions() {
  try {
    // Clear existing questions
    await db.delete(QuestionBank);

    // Insert questions for each language
    for (const question of questions) {
      for (const [lang, translation] of Object.entries(question.translations)) {
        await db.insert(QuestionBank).values({
          questionId: question.questionId,
          question: translation.question,
          category: question.category,
          difficulty: question.difficulty,
          experienceLevel: question.experienceLevel,
          commonFor: JSON.stringify(question.commonFor),
          sampleAnswer: translation.sampleAnswer,
          tips: translation.tips,
          popularity: question.popularity,
          language: lang,
          createdAt: moment().format('DD-MM-yyyy'),
        });
      }
    }
    console.log('Questions seeded successfully!');
  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    process.exit();
  }
}

seedQuestions();
