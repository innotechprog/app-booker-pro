// Shared tutorial data for consistency across the application

export interface TutorialItem {
  id: number;
  title: string;
  duration: string;
  difficulty: string;
  school: string;
  tutor: string;
  tutorPhoto: string;
  tutorBio: string;
  rating: number;
  topics: string[];
  views: number;
  grade: string;
  subject: string;
  videoThumbnail: string;
  videoUrl: string;
  description: string;
  dateAdded: string;
  isPopular: boolean;
  isRecent: boolean;
}

export const mockTutorials: TutorialItem[] = [
  { 
    id: 1, 
    title: "Introduction to Algebra", 
    duration: "45 min", 
    difficulty: "Beginner", 
    school: "University of Cape Town", 
    tutor: "Dr. Sarah Johnson", 
    tutorPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Mathematics professor with 15 years of experience in teaching algebra and calculus. PhD in Mathematics from MIT.",
    rating: 4.9, 
    topics: ["algebra", "variables", "equations"], 
    views: 1250,
    grade: "Grade 9-10",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Learn the fundamentals of algebra including variables, constants, and basic equations. Perfect for beginners starting their algebra journey.",
    dateAdded: "2024-01-15",
    isPopular: true,
    isRecent: false
  },
  { 
    id: 2, 
    title: "Quadratic Equations", 
    duration: "60 min", 
    difficulty: "Intermediate", 
    school: "University of the Witwatersrand", 
    tutor: "Prof. Michael Chen", 
    tutorPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Senior Mathematics lecturer specializing in advanced algebra and geometry. Published researcher in mathematical education.",
    rating: 4.8, 
    topics: ["quadratic", "parabola", "factorisation"], 
    views: 980,
    grade: "Grade 11-12",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Master quadratic equations through step-by-step problem solving and graphical analysis. Includes factorization and completing the square methods.",
    dateAdded: "2024-01-20",
    isPopular: false,
    isRecent: true
  },
  { 
    id: 3, 
    title: "Advanced Calculus", 
    duration: "90 min", 
    difficulty: "Advanced", 
    school: "Stellenbosch University", 
    tutor: "Dr. Emma Williams", 
    tutorPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Distinguished professor of mathematics with expertise in calculus and mathematical analysis. Author of several calculus textbooks.",
    rating: 4.9, 
    topics: ["calculus", "derivatives", "integrals", "limits"], 
    views: 2100,
    grade: "Grade 12",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Comprehensive coverage of advanced calculus concepts including derivatives, integrals, and limits with practical applications.",
    dateAdded: "2024-01-10",
    isPopular: true,
    isRecent: false
  },
  { 
    id: 4, 
    title: "Statistics and Probability", 
    duration: "75 min", 
    difficulty: "Intermediate", 
    school: "University of KwaZulu-Natal", 
    tutor: "Prof. David Brown", 
    tutorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Statistics professor with extensive experience in data analysis and probability theory. Consultant for various research projects.",
    rating: 4.7, 
    topics: ["statistics", "probability", "data analysis"], 
    views: 1450,
    grade: "Grade 11-12",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Learn statistical concepts and probability theory with real-world applications and data interpretation techniques.",
    dateAdded: "2024-01-18",
    isPopular: false,
    isRecent: true
  },
  { 
    id: 5, 
    title: "English Literature Analysis", 
    duration: "50 min", 
    difficulty: "Intermediate", 
    school: "Rhodes University", 
    tutor: "Dr. Lisa Anderson", 
    tutorPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    tutorBio: "English Literature professor with expertise in poetry and prose analysis. Published author and literary critic.",
    rating: 4.8, 
    topics: ["literature", "analysis", "poetry", "prose"], 
    views: 890,
    grade: "Grade 10-12",
    subject: "English",
    videoThumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Master the art of literary analysis with techniques for understanding themes, symbols, and literary devices in poetry and prose.",
    dateAdded: "2024-01-12",
    isPopular: true,
    isRecent: false
  },
  { 
    id: 6, 
    title: "Essay Writing Techniques", 
    duration: "40 min", 
    difficulty: "Beginner", 
    school: "University of Pretoria", 
    tutor: "Ms. Jennifer Smith", 
    tutorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    tutorBio: "English Language lecturer specializing in academic writing and communication skills. Experienced in helping students improve their writing.",
    rating: 4.6, 
    topics: ["essay writing", "structure", "grammar", "style"], 
    views: 1200,
    grade: "Grade 8-12",
    subject: "English",
    videoThumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Learn effective essay writing techniques including structure, argumentation, and style. Perfect for academic writing improvement.",
    dateAdded: "2024-01-25",
    isPopular: false,
    isRecent: true
  },
  { 
    id: 7, 
    title: "Physics: Mechanics Fundamentals", 
    duration: "65 min", 
    difficulty: "Intermediate", 
    school: "University of Cape Town", 
    tutor: "Prof. James Wilson", 
    tutorPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Physics professor specializing in mechanics and thermodynamics. Former NASA researcher with 20 years of teaching experience.",
    rating: 4.9, 
    topics: ["mechanics", "motion", "forces", "energy"], 
    views: 1800,
    grade: "Grade 11-12",
    subject: "Physics",
    videoThumbnail: "https://images.unsplash.com/photo-1635070041408-e94f4f4604b2?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Comprehensive introduction to classical mechanics covering motion, forces, energy, and momentum with practical examples.",
    dateAdded: "2024-01-08",
    isPopular: true,
    isRecent: false
  },
  { 
    id: 8, 
    title: "Chemistry: Organic Reactions", 
    duration: "55 min", 
    difficulty: "Advanced", 
    school: "University of the Witwatersrand", 
    tutor: "Dr. Maria Garcia", 
    tutorPhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Chemistry professor with expertise in organic chemistry and reaction mechanisms. Published researcher in synthetic chemistry.",
    rating: 4.7, 
    topics: ["organic chemistry", "reactions", "mechanisms", "synthesis"], 
    views: 1100,
    grade: "Grade 12",
    subject: "Chemistry",
    videoThumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Deep dive into organic chemistry reactions, mechanisms, and synthesis strategies for advanced students.",
    dateAdded: "2024-01-22",
    isPopular: false,
    isRecent: true
  },
  { 
    id: 9, 
    title: "Biology: Cell Structure and Function", 
    duration: "50 min", 
    difficulty: "Beginner", 
    school: "Stellenbosch University", 
    tutor: "Dr. Robert Taylor", 
    tutorPhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Biology professor specializing in cell biology and molecular biology. Research focuses on cellular processes and disease mechanisms.",
    rating: 4.8, 
    topics: ["cell biology", "organelles", "membrane", "metabolism"], 
    views: 1350,
    grade: "Grade 10-11",
    subject: "Biology",
    videoThumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Explore the fascinating world of cells, their structure, organelles, and vital functions in living organisms.",
    dateAdded: "2024-01-14",
    isPopular: true,
    isRecent: false
  },
  { 
    id: 10, 
    title: "History: South African Apartheid", 
    duration: "70 min", 
    difficulty: "Intermediate", 
    school: "University of KwaZulu-Natal", 
    tutor: "Prof. Thabo Mthembu", 
    tutorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    tutorBio: "History professor specializing in South African history and social movements. Expert in apartheid era and post-apartheid transition.",
    rating: 4.9, 
    topics: ["apartheid", "history", "social justice", "democracy"], 
    views: 1600,
    grade: "Grade 11-12",
    subject: "History",
    videoThumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Comprehensive study of apartheid in South Africa, its impact, resistance movements, and the path to democracy.",
    dateAdded: "2024-01-16",
    isPopular: true,
    isRecent: false
  }
];

// Helper function to filter tutorials by grade
export const getTutorialsByGrade = (grade: string): TutorialItem[] => {
  if (!grade) return mockTutorials;
  
  // Map common grade formats to our grade ranges
  const gradeMap: { [key: string]: string[] } = {
    'grade-1-3': ['Grade 1-3'],
    'grade-4-6': ['Grade 4-6'],
    'grade-7-9': ['Grade 7-9'],
    'grade-10-12': ['Grade 10-12'],
    'university': ['University Level']
  };
  
  const targetGrades = gradeMap[grade] || [grade];
  
  return mockTutorials.filter(tutorial => 
    targetGrades.some(targetGrade => tutorial.grade.includes(targetGrade))
  );
};

// Helper function to filter tutorials by subject
export const getTutorialsBySubject = (subject: string): TutorialItem[] => {
  if (!subject) return mockTutorials;
  return mockTutorials.filter(tutorial => 
    tutorial.subject.toLowerCase().includes(subject.toLowerCase())
  );
};

// Helper function to get personalized recommendations
export const getPersonalizedTutorials = (grade?: string, subjects?: string[]): TutorialItem[] => {
  let filtered = mockTutorials;
  
  if (grade) {
    filtered = getTutorialsByGrade(grade);
  }
  
  if (subjects && subjects.length > 0) {
    filtered = filtered.filter(tutorial => 
      subjects.some(subject => 
        tutorial.subject.toLowerCase().includes(subject.toLowerCase())
      )
    );
  }
  
  // Return popular and recent tutorials first
  return filtered.sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    if (a.isRecent && !b.isRecent) return -1;
    if (!a.isRecent && b.isRecent) return 1;
    return b.rating - a.rating;
  });
};
