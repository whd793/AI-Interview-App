# InterviewAI - AI-Powered Mock Interview Platform

![InterviewAI Banner](https://your-image-url-here.png)

## 🌟 Overview

InterviewAI is an innovative platform that leverages artificial intelligence to provide personalized mock interview experiences. Built with modern web technologies, it helps users practice and improve their interview skills through AI-generated questions, real-time feedback, and comprehensive analytics.

## 🚀 Features

### AI-Powered Interviews
- **Custom Questions**: Generates relevant questions based on job position and experience
- **Multi-language Support**: Available in English, Korean, Japanese, and Chinese
- **Real-time Feedback**: Instant AI evaluation of responses
- **Voice Recognition**: Automatic speech-to-text conversion

### Smart Credit System
- **Credit Management**: 5 credits per user with automatic regeneration
- **Real-time Timer**: Visual countdown for next credit
- **Automatic Regeneration**: 1 credit per minute
- **Visual Indicators**: Dynamic credit display

### Analytics Dashboard
- **Performance Tracking**: Comprehensive view of interview history
- **Progress Charts**: Visual representation of improvement
- **Role-based Analysis**: Performance metrics by job type
- **Improvement Suggestions**: AI-powered recommendations

## 🛠️ Technology Stack

### Frontend
- Next.js 13 (App Router)
- React
- Tailwind CSS
- Shadcn UI
- Clerk Authentication

### Backend
- PostgreSQL
- Drizzle ORM
- Google Gemini AI
- WebRTC

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/interview-ai.git
```

2. Install dependencies
```bash
cd interview-ai
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Add your environment variables
```

4. Run database migrations
```bash
npm run db:migrate
```

5. Start the development server
```bash
npm run dev
```

## 📦 Project Structure

```
interview-ai/
├── app/
│   ├── dashboard/
│   ├── providers/
│   └── ...
├── components/
│   ├── ui/
│   └── ...
├── utils/
│   ├── db.js
│   └── schema.js
└── ...
```

## 💾 Database Schema

```sql
Table UserCredits {
  id          Serial    Primary Key
  userEmail   String    
  credits     Integer   Default(5)
  lastUpdated DateTime  
}

Table MockInterview {
  id          Serial    Primary Key
  mockId      String    
  jsonMockResp Text     
  jobPosition String    
  jobDesc     String    
  language    String    
}

Table UserAnswer {
  id          Serial    Primary Key
  mockIdRef   String    
  question    String    
  answer      Text      
  feedback    Text      
  rating      String    
}
```

## 🔐 Environment Variables

```env
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

## 🌊 Features Flow

### Interview Creation
1. User spends one credit to create new interview
2. AI generates questions based on job details
3. User records answers
4. AI provides instant feedback
5. Results are saved for analytics

### Credit System
1. Users start with 5 credits
2. One credit regenerates every minute
3. Real-time timer shows countdown to next credit
4. Visual indicators show current credit status

## 📱 Screenshots

[Add screenshots here]

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 🔄 API Routes

### Interview Management
- `POST /api/interviews/create`
- `GET /api/interviews/:id`
- `GET /api/interviews/feedback/:id`

### Credit System
- `GET /api/credits`
- `POST /api/credits/use`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Shadcn UI for the component library
- Google Gemini AI for powering our interview questions
- Clerk for authentication services
- The open-source community for inspiration and support

## 📧 Contact

Won Lee - whd793@gmail.com

Project Link: https://ai-interview-app-u24p.vercel.app/

---

⭐️ Star us on GitHub — it helps!

[license-shield]: https://img.shields.io/github/license/yourusername/interview-ai.svg?style=flat-square
[license-url]: https://github.com/yourusername/interview-ai/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/yourusername
