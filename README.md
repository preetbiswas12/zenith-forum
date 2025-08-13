![github-submission-banner](https://github.com/user-attachments/assets/a1493b84-e4e2-456e-a791-ce35ee2bcf2f)

# 🚀 Project Title

> Zenith- One stop AI for active learning ecosystem

---

## 📌 Problem Statement

Probkem statement 8 : Reimagine peer ot peer learning and mentorship<br>
Probelem Statement 1 : weave AI magic with Groq

---

## 🎯 Objective

Zenith addresses the lack of personalized, engaging, and accessible learning tools, especially in environments where traditional education falls short or peer-to-peer support is limited. Many students struggle to find tailored content, quick answers to their doubts, or a supportive learning community. Zenith solves this by combining the power of Gemini and Groq AI to generate customized learning paths, deliver fast and accurate doubt resolution, and enable collaborative discussions through its community-driven Q&A feature.

This platform serves students, self-learners, and educators looking for a smarter, more connected way to learn. With YouTube video integration, AI-generated content, and interactive discussion spaces, Zenith brings real-world value by turning passive learning into an active, personalized journey. It makes quality education more accessible, efficient, and engaging for users across different backgrounds and learning needs.

---

## 🧠 Team & Approach

### Team Name:  
`Solo`

### Team Members:  
- Preet Biswas  ([ LinkedIn ](https://www.linkedin.com/in/preet-biswas-a0a730330/))


### Your Approach:  
- **Why you chose this problem** -  raditional learning systems often lack personalization, quick support, and a sense of community—especially for students in underserved or digital-first environments. Many learners face frustration when they can’t get instant help, don’t know where to start, or feel isolated in their learning journey. By tackling this gap, you're creating a platform that empowers learners with AI-driven support, collaborative features, and a seamless experience that adapts to their pace and preferences.<br><br>
- **Key challenges you addressed** - **1. Lack of Quality and Personalized Education** - students are forced to rely on outdated textbooks or generic online courses that don’t adapt to their personal learning styles or pace. This leads to disengagement, poor understanding, and academic stress even the world is draastically changing into ai automated.<br>**2. Delayed Doubt Resolution and Lack of Mentorship** - Students often struggle alone with their questions due to the unavailability of teachers, mentors, or timely support. This causes learning gaps and demotivation.<br>**3. Isolation in Learning & Poor Peer Interaction** - raditional e-learning platforms often feel isolating, with little to no peer-to-peer collaboration. In real classrooms, students thrive through group discussions and shared problem-solving. <br>
**4. Overload of Unstructured Content Online** - With endless videos and resources available on the internet, learners often feel overwhelmed, not knowing where to begin or what’s credible. <br>**5. Limited Access to Quality Platforms for Underserved Communities** - Many students in rural or economically challenged areas lack access to quality coaching or advanced edtech tools. <br><br>
- **Any pivots, brainstorms, or breakthroughs during hacking:**
<br>
- Realized the need for instant doubt-solving, which led to integrating Groq AI for fast, seamless responses
- Added a discussion forum after brainstorming the need for community-driven, peer-to-peer support.
- Focused on making the platform lightweight and accessible for low-bandwidth users, addressing inclusivity.
- Breakthrough moment: Combining Groq AI + Gemini drastically improved real-time performance and user experience.

---

## 🛠️ Tech Stack

### Core Technologies Used:
- Frontend: ReactJS, NextJS, Shadcn UI, TypeScript
- Backend: Node.js, API Routes, GitHub API Integration
- AI: Google Gemini, Groq AI, Genkit Framework
- Database: Neon DB, Drizzle ORM, localStorage (session management)
- APIs: GitHub API, Gemini, Groq, Firebase, YouTube, Neon DB
- Hosting: Vercel

### Sponsor Technologies Used (if any):
- [✅] **Groq:** _How you used Groq_  
- [ ] **Monad:** _Your blockchain implementation_  
- [ ] **Fluvio:** _Real-time data handling_  
- [ ] **Base:** _AgentKit / OnchainKit / Smart Wallet usage_  
- [ ] **Screenpipe:** _Screen-based analytics or workflows_  
- [ ] **Stellar:** _Payments, identity, or token usage_
*(Mark with ✅ if completed)*
---

## ✨ Key Features

Highlight the most important features of your project:

- ✅ **Lupin AI Assistant**: GitHub-integrated coding assistant with SDE2+ modes for development support
- ✅ **Multi-Session Chat**: Multiple concurrent chat sessions with persistent context and GitHub integration  
- ✅ **GitHub Integration**: Full repository management, issues, PRs, file operations, and commit history
- ✅ **Real-time Forum**: Users can post doubts and others can comment to help solve problems
- ✅ **Groq AI Support**: Lightning-fast AI solutions for complex problems and coding assistance
- ✅ **Course Generation**: Uses YouTube and Gemini API to generate course content
- ✅ **Zenith Explore**: View and access other people's generated courses for collaborative learning
- ✅ **User Authentication**: Clerk authentication with user profiles


---

## 📽️ Demo & Deliverables

- **Demo Video Link:** [ZENITH DEMO](https://youtu.be/-XZRbYsx2Ds?si=1R_6ocBHSwtGytQx)

- **Pitch Deck / PPT Link:** [Pitch Deck](https://in.docworkspace.com/d/sIIPS0KWbAtzGrcAG)

- **Deployment Link:** [Zenith](https://zenith-iota-black.vercel.app/)

**1. Home Page**<br>
![homepage](/main.png)
<br>
**2. Dashboard**
![dashboard](/dashboard.png)
<br>
**3. Explore**
![explore](/explore.png)
<br>
**4. AI**
![ai](/ai.png)
<br>
**5. Discussions**
![discussions](/forum.png)
<br>
**6. Create Course**
![create-course](/create_course.png)
<br>
**7. Loading page**
![loading](/loading.png)
<br>
**8. Create-Course-finish**
![finish](/finish.png)
---

## ✅ Tasks & Bonus Checklist

- [✅] **All members of the team completed the mandatory task - Followed at least 2 of our social channels and filled the form** (Details in Participant Manual)
- [✅] **All members of the team completed Bonus Task 1 - Sharing of Badges and filled the form (2 points)**  (Details in Participant Manual)
- [✅] **All members of the team completed Bonus Task 2 - Signing up for Sprint.dev and filled the form (3 points)**  (Details in Participant Manual)

*(Mark with ✅ if completed)*

---

## 🧪 How to Run the Project

### Requirements:
- [Node.js](/)
- API Keys -
  -Groq API KEY; GEMINI API KEY, YOUTUBE API KEY, FIREBASE API KEY, CLERK API KEY, NEON DATABASE URL.<br>
- .env file setup for ***Zenith***:-
```NEXT_PUBLIC_HOST_URL="http://localhost:3000"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Google Gemini
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY="your-google-gemini-api-key"

# Drizzle Database Url (Postgres)
NEXT_PUBLIC_DRIZZLE_DATABASE_URL="your-drizzle-database-url"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-firebase-measurement-id"

# YouTube Google Console
NEXT_PUBLIC_YOUTUBE_API_KEY="your-youtube-api-key"
```
<br>

- .env file steup for ***zenith-ai***
```VITE_GROQ_API_KEY="your-groq-api-key"
VITE_GROQ_API_URL="https://api.groq.com/openai/v1/chat/completions"
VITE_GROQ_MODEL="your-groq-model-name"
```


### Local Setup for Zenith(main)(others deployed through vercel then added the redirect link):
```bash
# Clone the repo
git clone https://github.com/Preet121106/Zenith-hackhazards-25.git

# Install dependencies
cd zenith
pnpm install

#modify the .env file

# Start development server
npm run dev
```

### local setup for Zenith-ai:
```bash
# Clone the repo
git clone https://github.com/Preet121106/Zenith-hackhazards-25.git

# Install dependencies
cd zenith-ai
pnpm install

#modify the .env file

# Start development server
npm run dev
```

### local setup for Zenith-forum:
```bash
# Clone the repo
git clone https://github.com/Preet121106/Zenith-hackhazards-25.git

# Install dependencies
cd zenith-forum
pnpm install

# Start development server
npm run dev
```

---

## 🧬 Future Scope

List improvements, extensions, or follow-up features:

- 🌐      Multi-language support for regional and global learners
- 🧠     Adaptive learning engine that customizes content based on user progress and behavior.
- Reward system with points, badges, and leaderboards to boost user engagement
- 📱 Mobile app launch for Android and iOS for wider accessibility.
- 🧪 AI-powered exam preparation and mock test generation.
- 🧪 AI-powered Industry Insights and Career Guidance.
- 🎙️ Voice-based Q&A assistant using NLP for hands-free interaction.
- 💬 In-app translator and speech-to-text for inclusivity and accessibility.
- ☁ Cloud based Code Editor for practising.
- 🔗   Addition of new Streams and Career paths with seperated Admin  and Student Dasboard.


---

## 📎 Resources / Credits

- **Frameworks/Libraries:** React, Vite, TypeScript, Tailwind CSS, Shadcn UI,React Markdown, Lucide React Icons, Framer Motion, Recharts,See [`package.json`](package.json) for full list)
- **Inspiration/Acknowledgements:** Mention any specific resources, tutorials, or individuals who helped.
- **Services:** Clerk(auth), Groq (AI),Firebase, Google Gemini, Youtube, Neon DB, Drixzzle, Vercel (Hosting),
---

## 🏁 Final Words
Participating in this hackathon was an incredible journey full of challenges and breakthroughs. Our project, **Zenith**, was born from the need to create an AI-powered, collaborative learning platform. We faced technical challenges in integrating various AI services like Gemini and Groq, ensuring they worked seamlessly together while maintaining performance and scalability. The pressure was intense as we worked late nights to fine-tune APIs and optimize the user interface. The real challenge, however, was balancing simplicity with functionality in the design, as we wanted a user-friendly experience that didn’t compromise on the platform’s powerful features.

The hackathon was a great learning experience, especially in terms of team collaboration and problem-solving. Dividing tasks based on each team member's strengths allowed us to tackle challenges efficiently and deliver a solid product. There were plenty of fun moments—whether it was celebrating small victories or sharing laughs over unexpected mistakes, like submitting the wrong version of the project. Ultimately, the journey wasn’t just about building Zenith; it was about growing together as a team, learning new skills, and enjoying the process of creating something impactful. The support and camaraderie from the team and organizers made this hackathon unforgettable.

---
