import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LearnerLayout from "@/components/LearnerLayout";
import { useAuth } from "@/contexts/AuthContext";
import { notesAPI, calendarAPI, notificationsAPI, learnerAPI, messagesAPI, tutorialsAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  BookOpen, 
  Star, 
  Clock, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  CheckCircle,
  Edit,
  Settings,
  GraduationCap,
  BookMarked,
  MessageSquare,
  Play,
  Eye,
  Save,
  X,
  Heart,
  Send,
  BarChart3,
  PieChart,
  Bell,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  Lightbulb,
  Wand2,
  FileText,
  Brain
} from "lucide-react";
import { getPersonalizedTutorials, TutorialItem } from "@/data/tutorials";
import AvailableTutorials from "./AvailableTutorials";

interface LearnerDashboardProps {
  initialTab?: "profile" | "tutorials" | "tutors" | "notes" | "achievements" | "analytics";
  hideTabs?: boolean;
  showProfileForm?: boolean;
}

const LearnerDashboard = ({ initialTab = "profile", hideTabs = false, showProfileForm = false }: LearnerDashboardProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Notes
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteCategory, setNoteCategory] = useState("general");
  const [notes, setNotes] = useState<any[]>([]);
  const [notesFilter, setNotesFilter] = useState("all");
  const [notesSearch, setNotesSearch] = useState("");
  const [notesSortBy, setNotesSortBy] = useState("newest");
  const [editingNote, setEditingNote] = useState<any>(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteBody, setEditNoteBody] = useState("");
  const [editNoteCategory, setEditNoteCategory] = useState("general");
  const [readingNote, setReadingNote] = useState<any>(null);
  const [isReading, setIsReading] = useState(false);
  const [readingSettings, setReadingSettings] = useState({
    rate: 0.8,
    pitch: 1,
    volume: 1
  });

  // AI Assistant
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const notesPreview = useMemo(()=> noteBody, [noteBody]);

  // Study Streak & Achievements
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Messages
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");

  // Calendar & Notifications
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");

  // Tutor Subject Selection
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [availableSubjects] = useState(['all', 'Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology']);
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventType, setNewEventType] = useState("study");

  // Subject Management
  const [newSubject, setNewSubject] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Welcome header visibility
  const [showWelcome, setShowWelcome] = useState(true);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: any) => {
    if (!profile) return 0;
    const fields = ['name', 'email', 'grade', 'subjects', 'goals'];
    const completedFields = fields.filter(field => {
      if (field === 'subjects') return profile[field] && profile[field].length > 0;
      return profile[field] && profile[field].trim() !== '';
    });
    return Math.round((completedFields.length / fields.length) * 100);
  };

  useEffect(()=>{
    const loadData = async () => {
      if (!isAuthenticated) {
        navigate("/learner/login");
        return;
      }

      try {
        setIsLoadingData(true);

        // User profile from context
        setProfile(user);
        setProfileCompletion(user?.profileCompletion || 0);

        // Load notes from API
        const notesResponse = await notesAPI.getAll();
        if (notesResponse.success) {
          setNotes(notesResponse.notes);
        }

        // Load study streak from API
        const streakResponse = await learnerAPI.getStreak();
        if (streakResponse.success) {
          setStudyStreak(streakResponse.streak.currentStreak || 0);
        }

        // Load calendar events from API
        const calendarResponse = await calendarAPI.getAll();
        if (calendarResponse.success) {
          setCalendarEvents(calendarResponse.events);
        }

        // Load notifications from API
        const notificationsResponse = await notificationsAPI.getAll();
        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.notifications);
        }

        // Load bookmarks from API
        try {
          const bookmarksResponse = await tutorialsAPI.getBookmarks();
          if (bookmarksResponse.success) {
            setBookmarkedTutorials(bookmarksResponse.bookmarks.map((b: any) => parseInt(b.id)));
          }
        } catch (error) {
          console.error('Error loading bookmarks:', error);
        }
        
        // Load achievements from API
        try {
          const achievementsResponse = await learnerAPI.getAchievements();
          if (achievementsResponse.success) {
            setAchievements(achievementsResponse.achievements);
            setTotalBadges(achievementsResponse.achievements.length);
          }
        } catch (error) {
          console.error('Error loading achievements:', error);
        }

        // Load messages from API
        try {
          const messagesResponse = await messagesAPI.getConversations();
          if (messagesResponse.success) {
            setMessages(messagesResponse.conversations);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }

        setIsLoadingData(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoadingData(false);
      }

      // Auto-hide welcome header after 5 seconds
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      return () => clearTimeout(welcomeTimer);
    };

    loadData();
  }, [navigate, isAuthenticated, user]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const saveProfile = async () => {
    if (!user) return;

    try {
      const response = await learnerAPI.updateProfile({
        fullName: profile.fullName || profile.name,
        phone: profile.phone,
        grade: profile.grade,
        goals: profile.goals
      });

      if (response.success) {
        setProfileCompletion(response.profileCompletion || 0);
        updateUser(profile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const deleteProfile = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    
    // TODO: Add delete API endpoint
    alert('Account deletion will be available soon.');
  };

  const addNote = async () => {
    if (!noteTitle.trim() && !noteBody.trim()) return;

    try {
      const response = await notesAPI.create({
        title: noteTitle || "Untitled",
        body: noteBody,
        category: noteCategory
      });

      if (response.success) {
        // Reload notes
        const notesResponse = await notesAPI.getAll();
        if (notesResponse.success) {
          setNotes(notesResponse.notes);
        }
        
        setNoteTitle("");
        setNoteBody("");
        setNoteCategory("general");
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    }
  };

  const editNote = (note: any) => {
    setEditingNote(note);
    setEditNoteTitle(note.title);
    setEditNoteBody(note.body);
    setEditNoteCategory(note.category);
  };

  const saveEditNote = async () => {
    if (!editingNote) return;

    try {
      const response = await notesAPI.update(editingNote.id, {
        title: editNoteTitle,
        body: editNoteBody,
        category: editNoteCategory
      });

      if (response.success) {
        // Reload notes
        const notesResponse = await notesAPI.getAll();
        if (notesResponse.success) {
          setNotes(notesResponse.notes);
        }
        // Reset edit state
        setEditingNote(null);
        setEditNoteTitle("");
        setEditNoteBody("");
        setEditNoteCategory("general");
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  const cancelEditNote = () => {
    setEditingNote(null);
    setEditNoteTitle("");
    setEditNoteBody("");
    setEditNoteCategory("general");
  };

  const readNote = (note: any) => {
    setReadingNote(note);
    setIsReading(true);
    
    // Create speech synthesis
    const speechSynthesis = window.speechSynthesis;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `${note.title}. ${note.body}`;
    utterance.rate = readingSettings.rate;
    utterance.pitch = readingSettings.pitch;
    utterance.volume = readingSettings.volume;
    
    // Event handlers
    utterance.onend = () => {
      setIsReading(false);
      setReadingNote(null);
    };
    
    utterance.onerror = () => {
      setIsReading(false);
      setReadingNote(null);
      alert('Error reading note. Please check your browser\'s text-to-speech settings.');
    };
    
    // Start speaking
    speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setReadingNote(null);
  };

  const generateAISuggestions = async (topic: string) => {
    if (!topic.trim()) return;
    
    setIsAiGenerating(true);
    setAiSuggestions([]);
    
    // Simulate AI generation with contextual content based on topic
    setTimeout(() => {
      const topicLower = topic.toLowerCase();
      let suggestions = [];
      
      if (topicLower.includes('geometry') || topicLower.includes('math')) {
        suggestions = [
          "📐 Basic shapes: triangles, circles, rectangles, and their properties",
          "📏 Area and perimeter formulas for common shapes",
          "📊 Coordinate geometry: plotting points and understanding axes",
          "🔺 Triangle types: equilateral, isosceles, scalene, right triangles",
          "📐 Angle relationships: complementary, supplementary, vertical angles",
          "🏗️ 3D shapes: cubes, spheres, cylinders, and their volume formulas"
        ];
      } else if (topicLower.includes('science') || topicLower.includes('biology')) {
        suggestions = [
          "🔬 Scientific method: observation, hypothesis, experiment, conclusion",
          "🧬 Cell structure: nucleus, cytoplasm, cell membrane, organelles",
          "🌱 Photosynthesis: how plants convert sunlight into energy",
          "🧪 Chemical reactions: reactants, products, and energy changes",
          "🌍 Ecosystems: producers, consumers, decomposers, food chains",
          "🧬 DNA structure: double helix, genes, chromosomes"
        ];
      } else if (topicLower.includes('english') || topicLower.includes('literature')) {
        suggestions = [
          "📝 Essay structure: introduction, body paragraphs, conclusion",
          "📚 Literary devices: metaphor, simile, personification, alliteration",
          "✍️ Grammar essentials: subject-verb agreement, punctuation rules",
          "📖 Reading comprehension strategies: main idea, supporting details",
          "🎭 Story elements: plot, characters, setting, theme, conflict",
          "📝 Writing techniques: descriptive, narrative, persuasive writing"
        ];
      } else if (topicLower.includes('history')) {
        suggestions = [
          "🏛️ Ancient civilizations: Egypt, Greece, Rome, China",
          "⚔️ Major wars: World Wars, Civil War, Revolutionary War",
          "👑 Important historical figures and their contributions",
          "🗺️ Timeline of major historical events and their causes",
          "🏛️ Government systems: democracy, monarchy, republic",
          "🌍 Cultural movements: Renaissance, Industrial Revolution"
        ];
      } else {
        suggestions = [
          `🎯 Key concepts for ${topic}: Understanding the fundamental principles and definitions`,
          `📚 Important theories: Core theories that explain how ${topic} works`,
          `💡 Real-world applications: How ${topic} is used in everyday life and industry`,
          `❓ Common questions: Frequently asked questions about ${topic} and their answers`,
          `🔗 Connections: How ${topic} relates to other subjects you're studying`,
          `📝 Study tips: Effective methods for learning and remembering ${topic}`
        ];
      }
      
      setAiSuggestions(suggestions);
      setIsAiGenerating(false);
    }, 2000);
  };

  const applyAISuggestion = (suggestion: string) => {
    const currentContent = noteBody;
    const newContent = currentContent ? `${currentContent}\n\n${suggestion}` : suggestion;
    setNoteBody(newContent);
  };

  // AI Question Answering Function
  const answerAIQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    setIsAiGenerating(true);
    
    // Simulate AI question answering with direct, helpful responses
    setTimeout(() => {
      const questionLower = question.toLowerCase();
      let answer = "";
      
      // Math Questions
      if (questionLower.includes('what is') && questionLower.includes('triangle')) {
        answer = "A triangle is a three-sided polygon with three angles that add up to 180 degrees. There are different types: equilateral (all sides equal), isosceles (two sides equal), scalene (no sides equal), and right triangle (has one 90-degree angle).";
      } else if (questionLower.includes('how to calculate') && questionLower.includes('area')) {
        answer = "To calculate area: Rectangle = length × width, Triangle = ½ × base × height, Circle = π × radius². Always use the same units and remember to include units in your answer (cm², m², etc.).";
      } else if (questionLower.includes('pythagorean theorem')) {
        answer = "The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse (longest side). For example, if sides are 3 and 4, then 3² + 4² = 9 + 16 = 25, so c = √25 = 5.";
      }
      
      // Science Questions
      else if (questionLower.includes('what is photosynthesis')) {
        answer = "Photosynthesis is the process where plants use sunlight, carbon dioxide, and water to make glucose (sugar) and oxygen. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This happens mainly in the leaves.";
      } else if (questionLower.includes('what is dna')) {
        answer = "DNA (Deoxyribonucleic Acid) is the genetic material that contains instructions for all living things. It's shaped like a double helix (twisted ladder) and is made up of four bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C).";
      } else if (questionLower.includes('scientific method')) {
        answer = "The scientific method is: 1) Observe something interesting, 2) Ask a question, 3) Form a hypothesis (educated guess), 4) Test with an experiment, 5) Analyze results, 6) Draw conclusions. This helps us understand the world systematically.";
      }
      
      // English Questions
      else if (questionLower.includes('what is metaphor')) {
        answer = "A metaphor is a figure of speech that directly compares two things without using 'like' or 'as'. Examples: 'Life is a journey', 'Time is money', 'The classroom was a zoo'. It helps create vivid imagery and deeper meaning.";
      } else if (questionLower.includes('how to write essay')) {
        answer = "Essay structure: 1) Introduction with thesis statement, 2) Body paragraphs (each with topic sentence, evidence, analysis), 3) Conclusion that restates thesis and summarizes main points. Use transitions between paragraphs and provide specific examples.";
      } else if (questionLower.includes('what is theme')) {
        answer = "Theme is the main message or lesson that the author wants readers to learn from a story. Common themes include: good vs. evil, love conquers all, coming of age, friendship, justice. It's the deeper meaning beyond just what happens in the plot.";
      }
      
      // History Questions
      else if (questionLower.includes('world war') && questionLower.includes('cause')) {
        answer = "World War I (1914-1918) was caused by: militarism, alliances, imperialism, and nationalism. The assassination of Archduke Franz Ferdinand was the immediate trigger. World War II (1939-1945) was caused by: Treaty of Versailles, economic depression, rise of dictators, and territorial expansion.";
      } else if (questionLower.includes('what is renaissance')) {
        answer = "The Renaissance (1300-1600) was a period of cultural rebirth in Europe. It featured: revival of classical learning, advances in art (Leonardo da Vinci, Michelangelo), science (Galileo), literature (Shakespeare), and exploration (Columbus). It marked the transition from medieval to modern times.";
      }
      
      // General Study Questions
      else if (questionLower.includes('how to study') || questionLower.includes('study tips')) {
        answer = "Effective study tips: 1) Create a schedule and stick to it, 2) Find a quiet, comfortable place, 3) Take breaks every 25-30 minutes, 4) Use active techniques like summarizing, teaching others, or creating flashcards, 5) Review material regularly, 6) Get enough sleep and eat well.";
      } else if (questionLower.includes('how to remember')) {
        answer = "Memory techniques: 1) Mnemonics (memory aids like acronyms), 2) Visualization (create mental images), 3) Chunking (break information into smaller parts), 4) Repetition and practice, 5) Connect new information to what you already know, 6) Use multiple senses (read, write, say aloud).";
      } else if (questionLower.includes('what is') && questionLower.includes('important')) {
        answer = "The most important thing is to understand the core concepts, not just memorize facts. Focus on: why things happen, how they connect to other ideas, and how you can apply them. Ask questions, practice regularly, and don't be afraid to make mistakes - they help you learn!";
      }
      
      // Default response for other questions
      else {
        answer = `Great question about "${question}"! This is an important topic that requires understanding the key concepts and principles. Here are some helpful points to consider:

1. **Core Concept**: Focus on understanding the fundamental idea behind this topic
2. **Key Components**: Break down the topic into its main parts
3. **Examples**: Look for real-world applications and specific examples
4. **Practice**: Apply what you learn through exercises and problem-solving
5. **Connections**: See how this relates to other subjects you're studying

Remember: Don't just memorize - understand the 'why' and 'how' behind the concepts. This will help you apply your knowledge in new situations and remember it better long-term.`;
      }
      
      // Add the answer to the note
      const currentContent = noteBody;
      const newContent = currentContent ? `${currentContent}\n\n## Q: ${question}\n${answer}` : `## Q: ${question}\n${answer}`;
      setNoteBody(newContent);
      setIsAiGenerating(false);
    }, 1500);
  };

  // AI Note Correction and Improvement Functions
  const correctNoteWithAI = async () => {
    if (!noteBody.trim()) return;
    
    setIsAiGenerating(true);
    
    // Simulate AI note correction
    setTimeout(() => {
      let correctedNote = noteBody;
      
      // Grammar and spelling improvements
      correctedNote = correctedNote
        .replace(/\bi\b/g, 'I') // Capitalize "i" to "I"
        .replace(/\bteh\b/g, 'the') // Fix common typo
        .replace(/\byour\b/g, 'your') // Fix "your" vs "you're"
        .replace(/\bthier\b/g, 'their') // Fix "thier" to "their"
        .replace(/\brecieve\b/g, 'receive') // Fix "recieve" to "receive"
        .replace(/\bseperate\b/g, 'separate') // Fix "seperate" to "separate"
        .replace(/\boccured\b/g, 'occurred') // Fix "occured" to "occurred")
        .replace(/\bdefinately\b/g, 'definitely') // Fix "definately" to "definitely")
        .replace(/\bacheive\b/g, 'achieve') // Fix "acheive" to "achieve")
        .replace(/\bbeleive\b/g, 'believe'); // Fix "beleive" to "believe")

      // Structure improvements
      if (!correctedNote.includes('##') && !correctedNote.includes('#')) {
        // Add structure if missing
        const lines = correctedNote.split('\n');
        const improvedLines = lines.map((line, index) => {
          if (index === 0 && !line.startsWith('#')) {
            return `# ${line.trim()}`;
          }
          return line;
        });
        correctedNote = improvedLines.join('\n');
      }

      // Add missing punctuation
      correctedNote = correctedNote
        .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2') // Add line breaks after sentences
        .replace(/([.!?])\s*$/gm, '$1'); // Ensure sentences end with punctuation

      setNoteBody(correctedNote);
      setIsAiGenerating(false);
    }, 2000);
  };

  const improveNoteWithAI = async () => {
    if (!noteBody.trim()) return;
    
    setIsAiGenerating(true);
    
    // Simulate AI note improvement
    setTimeout(() => {
      let improvedNote = noteBody;
      const topicLower = noteCategory.toLowerCase();
      
      // Add contextual improvements based on subject
      if (topicLower.includes('math') || topicLower.includes('geometry')) {
        if (!improvedNote.includes('## Key Formulas') && !improvedNote.includes('formula')) {
          improvedNote += '\n\n## Key Formulas\n- Area of triangle: A = ½ × base × height\n- Area of circle: A = π × r²\n- Perimeter of rectangle: P = 2(length + width)\n- Pythagorean theorem: a² + b² = c²\n';
        }
        if (!improvedNote.includes('## Examples') && !improvedNote.includes('example')) {
          improvedNote += '\n\n## Examples\n- Example 1: Find area of triangle with base 6cm and height 4cm\n  Solution: A = ½ × 6 × 4 = 12 cm²\n- Example 2: Calculate circumference of circle with radius 5cm\n  Solution: C = 2πr = 2π × 5 = 31.4 cm\n';
        }
        if (!improvedNote.includes('## Practice Problems')) {
          improvedNote += '\n\n## Practice Problems\n- Problem 1: Find the area of a rectangle 8m long and 5m wide\n- Problem 2: Calculate the volume of a cube with side length 3cm\n';
        }
      } else if (topicLower.includes('science') || topicLower.includes('biology')) {
        if (!improvedNote.includes('## Key Concepts')) {
          improvedNote += '\n\n## Key Concepts\n- Cell structure: nucleus controls cell activities\n- Photosynthesis: plants convert sunlight to energy\n- DNA: genetic material that determines traits\n- Evolution: gradual change in species over time\n';
        }
        if (!improvedNote.includes('## Experiments') && !improvedNote.includes('## Lab Work')) {
          improvedNote += '\n\n## Experiments/Lab Work\n- Microscope work: observing cell structures\n- Dissection: understanding organ systems\n- pH testing: measuring acidity and alkalinity\n';
        }
        if (!improvedNote.includes('## Applications')) {
          improvedNote += '\n\n## Real-World Applications\n- Medicine: understanding diseases and treatments\n- Agriculture: improving crop yields\n- Environmental science: protecting ecosystems\n';
        }
      } else if (topicLower.includes('english') || topicLower.includes('literature')) {
        if (!improvedNote.includes('## Key Themes')) {
          improvedNote += '\n\n## Key Themes\n- Good vs. evil: moral conflicts in literature\n- Love and relationships: human connections\n- Coming of age: personal growth and maturity\n';
        }
        if (!improvedNote.includes('## Literary Devices')) {
          improvedNote += '\n\n## Literary Devices\n- Metaphor: "Life is a journey" (comparison without like/as)\n- Simile: "As brave as a lion" (comparison with like/as)\n- Personification: "The wind whispered" (giving human traits to non-human things)\n';
        }
        if (!improvedNote.includes('## Analysis')) {
          improvedNote += '\n\n## Analysis\n- Character development: how characters change throughout the story\n- Plot structure: exposition, rising action, climax, falling action, resolution\n- Symbolism: objects or events that represent deeper meanings\n';
        }
      } else if (topicLower.includes('history')) {
        if (!improvedNote.includes('## Timeline')) {
          improvedNote += '\n\n## Timeline\n- 1066: Norman Conquest of England\n- 1492: Columbus discovers America\n- 1776: American Declaration of Independence\n- 1914-1918: World War I\n- 1939-1945: World War II\n';
        }
        if (!improvedNote.includes('## Key Figures')) {
          improvedNote += '\n\n## Key Figures\n- Julius Caesar: Roman general and dictator\n- Napoleon Bonaparte: French military leader\n- Winston Churchill: British Prime Minister during WWII\n';
        }
        if (!improvedNote.includes('## Causes and Effects')) {
          improvedNote += '\n\n## Causes and Effects\n- Industrial Revolution caused urbanization and social changes\n- World Wars led to new political boundaries and alliances\n- Colonization resulted in cultural exchange and conflict\n';
        }
      }

      // General improvements
      if (!improvedNote.includes('## Summary')) {
        improvedNote += '\n\n## Summary\n- Key points covered: [list main topics]\n- Important concepts to remember\n- How this connects to other subjects\n';
      }
      if (!improvedNote.includes('## Questions')) {
        improvedNote += '\n\n## Questions to Consider\n- How does this topic apply to real life?\n- What are the main challenges in understanding this?\n- What would you like to explore further?\n';
      }

      setNoteBody(improvedNote);
      setIsAiGenerating(false);
    }, 2500);
  };

  const rewriteNoteWithAI = async () => {
    if (!noteBody.trim()) return;
    
    setIsAiGenerating(true);
    
    // Simulate AI note rewriting for better clarity and organization
    setTimeout(() => {
      const lines = noteBody.split('\n');
      let rewrittenNote = '';
      let currentSection = '';
      
      // Extract title
      const titleLine = lines.find(line => line.trim().startsWith('#'));
      const title = titleLine ? titleLine.replace(/^#+\s*/, '') : 'Untitled Note';
      
      rewrittenNote += `# ${title}\n\n`;
      
      // Organize content into sections
      const sections: { [key: string]: string[] } = {};
      let currentSectionName = 'Overview';
      let sectionContent: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('##')) {
          // Save previous section
          if (sectionContent.length > 0) {
            sections[currentSectionName] = [...sectionContent];
          }
          // Start new section
          currentSectionName = trimmedLine.replace(/^##+\s*/, '');
          sectionContent = [];
        } else if (trimmedLine && !trimmedLine.startsWith('#')) {
          sectionContent.push(trimmedLine);
        }
      }
      
      // Save last section
      if (sectionContent.length > 0) {
        sections[currentSectionName] = [...sectionContent];
      }
      
      // Reorganize sections in logical order
      const sectionOrder = ['Overview', 'Key Concepts', 'Important Information', 'Examples', 'Formulas', 'Timeline', 'Key Figures', 'Analysis', 'Summary', 'Questions'];
      
      for (const sectionName of sectionOrder) {
        if (sections[sectionName]) {
          rewrittenNote += `## ${sectionName}\n`;
          sections[sectionName].forEach(item => {
            if (item.startsWith('•') || item.startsWith('-')) {
              rewrittenNote += `${item}\n`;
            } else {
              rewrittenNote += `• ${item}\n`;
            }
          });
          rewrittenNote += '\n';
        }
      }
      
      // Add any remaining sections
      for (const [sectionName, content] of Object.entries(sections)) {
        if (!sectionOrder.includes(sectionName)) {
          rewrittenNote += `## ${sectionName}\n`;
          content.forEach(item => {
            if (item.startsWith('•') || item.startsWith('-')) {
              rewrittenNote += `${item}\n`;
            } else {
              rewrittenNote += `• ${item}\n`;
            }
          });
          rewrittenNote += '\n';
        }
      }
      
      setNoteBody(rewrittenNote.trim());
      setIsAiGenerating(false);
    }, 3000);
  };

  const generateAINote = async () => {
    if (!aiTopic.trim()) return;
    
    setIsAiGenerating(true);
    
    // Simulate AI note generation with contextual content
    setTimeout(() => {
      const topicLower = aiTopic.toLowerCase();
      let generatedNote = `# ${aiTopic}\n\n`;
      
      if (topicLower.includes('geometry') || topicLower.includes('math')) {
        generatedNote += `## Overview
Geometry is the branch of mathematics that deals with shapes, sizes, positions, and properties of space. It helps us understand the world around us through mathematical relationships.

## Key Concepts
• **Points, Lines, and Planes**: The basic building blocks of geometry
• **Angles**: Measuring and understanding different types of angles
• **Shapes**: Properties of triangles, circles, rectangles, and polygons
• **Area and Perimeter**: Calculating space and boundary measurements
• **Volume**: Measuring 3D space in cubes, spheres, and cylinders

## Important Formulas
- **Triangle Area**: A = ½ × base × height
- **Circle Area**: A = π × r²
- **Rectangle Perimeter**: P = 2(length + width)
- **Pythagorean Theorem**: a² + b² = c² (for right triangles)

## Real-World Applications
- Architecture and construction design
- Navigation and GPS systems
- Computer graphics and game development
- Engineering and manufacturing
- Art and design principles

## Study Tips
1. Practice drawing shapes and measuring angles
2. Memorize key formulas with visual aids
3. Solve word problems to understand applications
4. Use geometric proofs to develop logical thinking

## Common Mistakes to Avoid
- Confusing area with perimeter
- Forgetting units in calculations
- Not checking if triangles are possible (triangle inequality)
- Mixing up radius and diameter`;
      } else if (topicLower.includes('science') || topicLower.includes('biology')) {
        generatedNote += `## Overview
Science is the systematic study of the natural world through observation and experimentation. It helps us understand how things work and why they happen.

## Scientific Method
1. **Observation**: Noticing something interesting
2. **Question**: What do we want to know?
3. **Hypothesis**: An educated guess based on prior knowledge
4. **Experiment**: Testing the hypothesis with controlled conditions
5. **Analysis**: Examining the results
6. **Conclusion**: Determining if the hypothesis was correct

## Key Scientific Concepts
• **Matter**: Everything that has mass and takes up space
• **Energy**: The ability to do work or cause change
• **Force**: A push or pull that causes motion or change
• **Chemical Reactions**: When substances combine to form new substances
• **Ecosystems**: Communities of living and non-living things

## Laboratory Safety
- Always wear safety goggles
- Follow instructions carefully
- Never taste or smell unknown substances
- Keep work areas clean and organized
- Report accidents immediately

## Study Strategies
1. Make detailed observations during experiments
2. Keep organized lab notebooks
3. Connect concepts to everyday life
4. Practice drawing diagrams and models
5. Ask questions and seek explanations`;
      } else if (topicLower.includes('english') || topicLower.includes('literature')) {
        generatedNote += `## Overview
English Language Arts encompasses reading, writing, speaking, and listening skills. It's essential for communication and critical thinking.

## Reading Comprehension
• **Main Idea**: The central point or message
• **Supporting Details**: Evidence that backs up the main idea
• **Inference**: Drawing conclusions from what's implied
• **Context Clues**: Using surrounding words to understand meaning
• **Theme**: The underlying message or lesson

## Writing Skills
• **Structure**: Introduction, body paragraphs, conclusion
• **Grammar**: Proper sentence construction and punctuation
• **Vocabulary**: Choosing precise words for clarity
• **Style**: Voice, tone, and word choice
• **Revision**: Improving content and organization

## Literary Devices
- **Metaphor**: Direct comparison without "like" or "as"
- **Simile**: Comparison using "like" or "as"
- **Personification**: Giving human qualities to non-human things
- **Alliteration**: Repetition of beginning consonant sounds
- **Imagery**: Using descriptive language to create mental pictures

## Essay Writing Tips
1. Start with a strong thesis statement
2. Use topic sentences for each paragraph
3. Provide evidence and examples
4. Use transitions between ideas
5. End with a memorable conclusion

## Reading Strategies
- Preview the text before reading
- Take notes while reading
- Summarize key points
- Ask questions about the content
- Connect to personal experiences`;
      } else if (topicLower.includes('history')) {
        generatedNote += `## Overview
History is the study of past events, people, and societies. It helps us understand how we got to where we are today and learn from past experiences.

## Historical Thinking Skills
• **Chronology**: Understanding the sequence of events
• **Cause and Effect**: How events lead to other events
• **Historical Context**: Understanding the time period and circumstances
• **Multiple Perspectives**: Considering different viewpoints
• **Evidence Analysis**: Evaluating sources for reliability

## Important Time Periods
• **Ancient Civilizations**: Egypt, Greece, Rome, China (3000 BCE - 500 CE)
• **Medieval Period**: Middle Ages, feudalism, Crusades (500-1500 CE)
• **Renaissance**: Cultural rebirth, art, science, exploration (1300-1600)
• **Industrial Revolution**: Technological advances, urbanization (1750-1900)
• **Modern Era**: World Wars, globalization, technology (1900-present)

## Key Historical Concepts
- **Primary Sources**: Original documents from the time period
- **Secondary Sources**: Interpretations written later by historians
- **Bias**: Favoring one perspective over others
- **Chronology**: The arrangement of events in time order
- **Historical Significance**: Why events matter in the big picture

## Study Techniques
1. Create timelines to visualize events
2. Compare different historical perspectives
3. Connect events to understand cause and effect
4. Use maps to understand geographical context
5. Analyze primary sources critically

## Common Themes in History
- Power and governance
- Social and cultural change
- Economic systems and trade
- Conflict and cooperation
- Technology and innovation`;
      } else {
        generatedNote += `## Overview
This topic covers important concepts and principles that are essential for your understanding and academic success.

## Key Concepts
• Fundamental principles and theories
• Important definitions and terminology
• Core skills and techniques
• Problem-solving strategies
• Critical thinking approaches

## Important Information
- Essential facts and details to remember
- Key relationships between concepts
- Practical applications and examples
- Common patterns and trends
- Important exceptions or special cases

## Study Strategies
1. Break down complex topics into smaller parts
2. Create visual aids like diagrams or charts
3. Practice with examples and exercises
4. Connect new information to what you already know
5. Review regularly to reinforce learning

## Common Questions
- What are the main principles?
- How do these concepts apply in real situations?
- What are the relationships between different parts?
- What are common mistakes to avoid?
- How does this connect to other subjects?

## Practice Opportunities
- Work through example problems
- Create your own examples
- Teach the concept to someone else
- Apply the knowledge in different contexts
- Test your understanding with practice questions`;
      }
      
      generatedNote += `\n\n## Summary
${aiTopic} is an important topic that builds foundational knowledge for future learning. Understanding these concepts will help you succeed in related subjects and real-world applications.

## Next Steps
1. Review and practice the key concepts
2. Apply what you've learned to new situations
3. Connect this knowledge to other subjects
4. Seek help if you need clarification
5. Continue exploring related topics`;
      
      setNoteBody(generatedNote);
      setNoteTitle(aiTopic);
      setIsAiGenerating(false);
    }, 3000);
  };

  const deleteNote = async (id: number) => {
    try {
      const response = await notesAPI.delete(id);
      
      if (response.success) {
        // Reload notes
        const notesResponse = await notesAPI.getAll();
        if (notesResponse.success) {
          setNotes(notesResponse.notes);
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const loadChatMessages = async (tutorId: number) => {
    try {
      const response = await messagesAPI.getChat(tutorId);
      if (response.success) {
        setChatMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const selectTutor = async (tutor: any) => {
    setSelectedTutor(tutor);
    await loadChatMessages(tutor.id);
  };

  const bookTutorSession = (tutor: any, subject?: string) => {
    const subjectParam = subject || tutor.subject;
    navigate(`/tutor-booking/${tutor.id}?subject=${encodeURIComponent(subjectParam)}`);
  };


  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTutor) return;

    try {
      const response = await messagesAPI.send(selectedTutor.id, newMessage);
      if (response.success) {
        // Reload chat messages
        await loadChatMessages(selectedTutor.id);
        // Reload conversations
        const messagesResponse = await messagesAPI.getConversations();
        if (messagesResponse.success) {
          setMessages(messagesResponse.conversations);
    }
    setNewMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const addCalendarEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate || !newEventTime) return;

    try {
      const response = await calendarAPI.create({
        title: newEventTitle,
        eventDate: newEventDate,
        eventTime: newEventTime,
        type: newEventType
      });

      if (response.success) {
        // Reload calendar events
        const calendarResponse = await calendarAPI.getAll();
        if (calendarResponse.success) {
          setCalendarEvents(calendarResponse.events);
        }

        // Reload notifications (API creates notification automatically)
        const notificationsResponse = await notificationsAPI.getAll();
        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.notifications);
        }

        setNewEventTitle("");
        setNewEventDate("");
        setNewEventTime("");
        setNewEventType("study");
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const deleteCalendarEvent = async (id: number) => {
    try {
      const response = await calendarAPI.delete(id);
      
      if (response.success) {
        // Reload calendar events
        const calendarResponse = await calendarAPI.getAll();
        if (calendarResponse.success) {
          setCalendarEvents(calendarResponse.events);
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const toggleEventComplete = async (id: number) => {
    const event = calendarEvents.find(e => e.id === id);
    if (!event) return;

    try {
      const response = await calendarAPI.update(id, {
        completed: !event.completed
      });

      if (response.success) {
        // Reload calendar events
        const calendarResponse = await calendarAPI.getAll();
        if (calendarResponse.success) {
          setCalendarEvents(calendarResponse.events);
        }
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      const response = await notificationsAPI.markAsRead(id);
      
      if (response.success) {
        // Update local state
        setNotifications(notifications.map(n => n.id === id ? {...n, read: true} : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await notificationsAPI.clearAll();
      
      if (response.success) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const addSubject = async () => {
    if (!newSubject.trim()) return;
    const currentSubjects = profile?.subjects || [];
    if (currentSubjects.includes(newSubject.trim())) {
      alert("This subject is already added!");
      return;
    }

    try {
      const response = await learnerAPI.addSubject(newSubject.trim());
      
      if (response.success) {
        // Update local profile
        const updatedProfile = {
          ...profile,
          subjects: [...currentSubjects, newSubject.trim()]
        };
        setProfile(updatedProfile);
        updateUser(updatedProfile);
        
        setNewSubject("");
        setShowAddSubject(false);
        setProfileCompletion(calculateProfileCompletion(updatedProfile));
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject. Please try again.');
    }
  };

  const removeSubject = async (subject: string) => {
    try {
      // Find subject ID from subjects list
      const subjectsResponse = await learnerAPI.getSubjects();
      const subjectData = subjectsResponse.subjects?.find((s: any) => s.name === subject);
      
      if (subjectData) {
        const response = await learnerAPI.removeSubject(subjectData.id);
        
        if (response.success) {
          // Update local profile
          const updatedProfile = {
            ...profile,
            subjects: (profile?.subjects || []).filter((s: string) => s !== subject)
          };
          setProfile(updatedProfile);
          updateUser(updatedProfile);
          setProfileCompletion(calculateProfileCompletion(updatedProfile));
        }
      }
    } catch (error) {
      console.error('Error removing subject:', error);
      alert('Failed to remove subject. Please try again.');
    }
  };

  // Get personalized tutorials based on user profile
  const tutorials = useMemo(() => {
    const grade = profile?.grade || "";
    const subjects = profile?.subjects || [];
    return getPersonalizedTutorials(grade, subjects).slice(0, 6); // Show first 6 recommendations
  }, [profile]);

  const tutors = useMemo(() => {
    // Use conversations from messages API if available, otherwise fallback to sample data
    if (messages.length > 0) {
      return messages.map(conv => ({
        id: conv.tutor_id,
        name: conv.tutor_name,
        subject: conv.specialization,
        grade: profile?.grade || "",
        photo: conv.tutor_photo,
        unreadCount: conv.unread_count,
        lastMessage: conv.last_message,
        lastMessageTime: conv.last_message_time
      }));
    }
    
    // Fallback sample data
    const g = profile?.grade || "";
    return [
      { id: 1, name: "Dr. Sarah Johnson", subject: "Mathematics", grade: g },
      { id: 2, name: "Prof. Michael Chen", subject: "Science", grade: g },
      { id: 3, name: "Ms. L. Dlamini", subject: "English", grade: g },
    ];
  }, [messages, profile]);

  return (
    <LearnerLayout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SEO title="Learner Portal" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Notifications Panel - only on Dashboard (Profile tab) when not showing profile form */}
        {activeTab === "profile" && !showProfileForm && notifications.filter(n => !n.read).length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm mb-6">
          <CardHeader className="border-b border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-6 w-6 text-yellow-600" />
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-gray-900">Notifications</CardTitle>
                  <p className="text-sm text-gray-600">
                    You have {notifications.filter(n => !n.read).length} unread notification{notifications.filter(n => !n.read).length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-gray-600 hover:text-gray-900">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {notifications.filter(n => !n.read).map(notification => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-100 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    {notification.type === 'streak' && '🔥'}
                    {notification.type === 'achievement' && '🎓'}
                    {notification.type === 'calendar' && '📅'}
                    {!notification.type && '📢'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.time).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); markNotificationRead(notification.id); }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {notifications.filter(n => !n.read).length > 5 && (
                <p className="text-xs text-center text-gray-500 py-2">
                  Showing all {notifications.filter(n => !n.read).length} notifications
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Welcome Header - only on Dashboard (Profile tab) when not showing profile form - Auto-hides after 5 seconds */}
        {activeTab === "profile" && !showProfileForm && showWelcome && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8 transition-opacity duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(() => {
                    const name = profile?.fullName || profile?.name || 'Learner';
                    if (!name || name === "Learner") return "L";
                    const words = name.trim().split(/\s+/);
                    if (words.length === 1) {
                      return words[0].substring(0, 2).toUpperCase();
                    }
                    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
                  })()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.fullName || profile?.name || 'Learner'}! 👋
                </h1>
                <p className="text-blue-100">
                  Ready to continue your learning journey? Let's make today productive!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200 mb-1">Profile Completion</div>
              <div className="text-2xl font-bold">{profileCompletion}%</div>
              <Progress value={profileCompletion} className="w-24 h-2 mt-2" />
            </div>
          </div>
        </div>
        )}

        {/* Quick Stats - only on Dashboard (Profile tab) when not showing profile form */}
        {activeTab === "profile" && !showProfileForm && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Tutorials</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </Card>
          
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Rating</h3>
            <p className="text-2xl font-bold text-green-600">4.8</p>
          </Card>
          
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Study Hours</h3>
            <p className="text-2xl font-bold text-purple-600">24</p>
          </Card>
          
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Progress</h3>
            <p className="text-2xl font-bold text-orange-600">85%</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">🔥 Streak</h3>
            <p className="text-2xl font-bold text-yellow-600">{studyStreak}</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Badges</h3>
            <p className="text-2xl font-bold text-purple-600">{totalBadges}</p>
          </Card>
        </div>
        )}

        {/* Calendar Section - only on Dashboard (Profile tab) when not showing profile form */}
        {activeTab === "profile" && !showProfileForm && (
        <Card className="bg-white border-gray-200 shadow-sm mb-8">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center text-gray-900">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              My Calendar
            </CardTitle>
            <p className="text-gray-600">Schedule and track your study sessions</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Event Form */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Event</h3>
                <div>
                  <Label htmlFor="eventTitle" className="text-sm text-gray-700">Title</Label>
                  <Input
                    id="eventTitle"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g., Math Tutorial Session"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="eventDate" className="text-sm text-gray-700">Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime" className="text-sm text-gray-700">Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventType" className="text-sm text-gray-700">Type</Label>
                  <Select value={newEventType} onValueChange={setNewEventType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">📚 Study Session</SelectItem>
                      <SelectItem value="tutorial">🎓 Tutorial</SelectItem>
                      <SelectItem value="exam">📝 Exam/Test</SelectItem>
                      <SelectItem value="assignment">✍️ Assignment Due</SelectItem>
                      <SelectItem value="other">📌 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addCalendarEvent} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>

              {/* Upcoming Events */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Upcoming Events ({calendarEvents.filter(e => !e.completed).length})</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {calendarEvents.filter(e => !e.completed).length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    calendarEvents.filter(e => !e.completed).map(event => (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={event.completed}
                          onChange={() => toggleEventComplete(event.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              📅 {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-600">
                              🕐 {event.time}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.type === 'study' && '📚 Study'}
                              {event.type === 'tutorial' && '🎓 Tutorial'}
                              {event.type === 'exam' && '📝 Exam'}
                              {event.type === 'assignment' && '✍️ Assignment'}
                              {event.type === 'other' && '📌 Other'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCalendarEvent(event.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Quick Access Notice */}
        {activeTab === "profile" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Quick Access:</strong> Find your <Link to="/invoices" className="underline hover:text-blue-900 font-medium">Invoices</Link> and <Link to="/packages" className="underline hover:text-blue-900 font-medium">Service Packages</Link> in your profile dropdown menu (click your avatar in the top-right corner).
            </p>
          </div>
        )}

        {/* Quick actions removed in favor of header navigation */}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          {!hideTabs && (
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="tutors">Tutors</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="profile" className="mt-6">
            {!showProfileForm ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Your Profile</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Update your personal information, learning goals, and track your progress in one place.
                </p>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/learner/profile">
                    <User className="mr-2 h-5 w-5" />
                    Go to Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Management Card */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-gray-900">
                          <User className="mr-2 h-5 w-5 text-blue-600" />
                          Profile Information
                        </CardTitle>
                        <CardDescription className="text-gray-600">Manage your account details and learning preferences</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={saveProfile} className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button onClick={() => setIsEditing(false)} variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="fullName"
                            value={profile?.fullName || profile?.name || ''}
                            onChange={(e) => setProfile({...profile, fullName: e.target.value, name: e.target.value})}
                            placeholder="Enter your full name"
                            className="text-base"
                          />
                        ) : (
                          <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                            {profile?.fullName || profile?.name || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                        <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                          {profile?.email || 'Not set'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grade" className="text-sm font-semibold text-gray-700">Grade Level</Label>
                        {isEditing ? (
                          <Select value={profile?.grade || ''} onValueChange={(v) => setProfile({...profile, grade: v})}>
                            <SelectTrigger className="text-base">
                              <SelectValue placeholder="Select your grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Grade 1">Grade 1</SelectItem>
                              <SelectItem value="Grade 2">Grade 2</SelectItem>
                              <SelectItem value="Grade 3">Grade 3</SelectItem>
                              <SelectItem value="Grade 4">Grade 4</SelectItem>
                              <SelectItem value="Grade 5">Grade 5</SelectItem>
                              <SelectItem value="Grade 6">Grade 6</SelectItem>
                              <SelectItem value="Grade 7">Grade 7</SelectItem>
                              <SelectItem value="Grade 8">Grade 8</SelectItem>
                              <SelectItem value="Grade 9">Grade 9</SelectItem>
                              <SelectItem value="Grade 10">Grade 10</SelectItem>
                              <SelectItem value="Grade 11">Grade 11</SelectItem>
                              <SelectItem value="Grade 12">Grade 12</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                            {profile?.grade || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={profile?.phone || ''}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            placeholder="Enter your phone number"
                            className="text-base"
                          />
                        ) : (
                          <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                            {profile?.phone || 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subjects" className="text-sm font-semibold text-gray-700">Subjects of Interest</Label>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddSubject(!showAddSubject)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Subject
                          </Button>
                        )}
                      </div>
                      
                      {isEditing && showAddSubject && (
                        <div className="flex gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <Input
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="Enter subject name"
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                          />
                          <Button onClick={addSubject} size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Add
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[60px]">
                        {(profile?.subjects || []).length === 0 ? (
                          <p className="text-gray-400 text-sm italic">
                            {isEditing ? 'Click "Add Subject" to add your subjects' : 'No subjects added yet. Click "Edit Profile" to add subjects.'}
                          </p>
                        ) : (
                          (profile?.subjects || []).map((subject: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className={`px-3 py-1 text-sm flex items-center gap-2 ${isEditing ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                            >
                              📚 {subject}
                              {isEditing && (
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
                                  onClick={() => removeSubject(subject)}
                                />
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                      {!isEditing && (profile?.subjects || []).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Tip: Click "Edit Profile" to add or remove subjects
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goals" className="text-sm font-semibold text-gray-700">Learning Goals</Label>
                      {isEditing ? (
                        <Textarea
                          id="goals"
                          value={profile?.goals || ''}
                          onChange={(e) => setProfile({...profile, goals: e.target.value})}
                          placeholder="What are your learning objectives?"
                          rows={4}
                          className="text-base"
                        />
                      ) : (
                        <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200 min-h-[100px]">
                          {profile?.goals || 'Not set'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Overview */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                          <span className="text-sm font-medium text-gray-900">{profileCompletion}%</span>
                        </div>
                        <Progress value={profileCompletion} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">12</p>
                          <p className="text-sm text-gray-600">Tutorials Completed</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">4.8</p>
                          <p className="text-sm text-gray-600">Average Rating</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-600">24</p>
                          <p className="text-sm text-gray-600">Study Hours</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tutorials" className="mt-6">
            <div className="space-y-6">
              {/* Bookmarked Tutorials */}
              {bookmarkedTutorials.length > 0 && (
                <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-sm">
                  <CardHeader className="border-b border-pink-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <Heart className="mr-2 h-5 w-5 text-pink-600 fill-pink-600" />
                      My Favorites
                    </CardTitle>
                    <p className="text-gray-600">Your bookmarked tutorials for quick access</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {bookmarkedTutorials.map((id) => (
                        <div key={id} className="min-w-[200px] p-3 bg-white rounded-lg border border-pink-200">
                          <p className="text-sm font-medium text-gray-900">Tutorial #{id}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2 text-pink-600"
                            onClick={async () => {
                              try {
                                const response = await tutorialsAPI.removeBookmark(id);
                                if (response.success) {
                              const newBookmarks = bookmarkedTutorials.filter(b => b !== id);
                              setBookmarkedTutorials(newBookmarks);
                                }
                              } catch (error) {
                                console.error('Error removing bookmark:', error);
                                alert('Failed to remove bookmark. Please try again.');
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* All Tutorials */}
              <div>
                <AvailableTutorials hideHeader />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutors" className="mt-6">
            <div className="space-y-6">
              {/* Messages Section */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                <CardHeader className="border-b border-blue-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                    Messages
                  </CardTitle>
                  <p className="text-gray-600">Chat with your tutors</p>
                </CardHeader>
                <CardContent className="pt-4">
                  {selectedTutor ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedTutor.name}</p>
                            <p className="text-xs text-gray-600">{selectedTutor.subject}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTutor(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Messages */}
                      <div className="bg-white rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto space-y-3">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.from === 'student' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-3 rounded-lg ${
                                msg.from === 'student' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.from === 'student' ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        {chatMessages.length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No messages yet. Start a conversation!</p>
                          </div>
                        )}
                      </div>

                      {/* Send Message */}
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Select a tutor below to start a conversation</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subject Selection */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
                    Choose Subject
                  </CardTitle>
                  <p className="text-gray-600">Select a subject to find specialized tutors</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    {availableSubjects.map((subject) => (
                      <Button
                        key={subject}
                        variant={selectedSubject === subject ? "default" : "outline"}
                        onClick={() => setSelectedSubject(subject)}
                        className={`transition-all duration-200 ${
                          selectedSubject === subject 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        {subject === 'all' ? 'All Subjects' : subject}
                      </Button>
                    ))}
                  </div>
                  {selectedSubject !== 'all' && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-800">
                        <strong>Selected:</strong> {selectedSubject} - Showing tutors specialized in this subject
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Tutors */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Available Tutors
                    {selectedSubject !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedSubject}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-600">
                    Expert tutors for your grade level ({profile?.grade || 'Not specified'})
                    {selectedSubject !== 'all' && ` • ${selectedSubject} specialists`}
                  </p>
                </CardHeader>
                <CardContent>
                  {filteredTutors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No tutors found</p>
                      <p className="text-sm">
                        {selectedSubject === 'all' 
                          ? 'No tutors are currently available.' 
                          : `No tutors found for ${selectedSubject}. Try selecting a different subject.`
                        }
                      </p>
                      {selectedSubject !== 'all' && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedSubject('all')}
                          className="mt-4"
                        >
                          Show All Subjects
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTutors.map(t => (
                      <Card key={t.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="text-center pb-3 border-b border-gray-100">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-lg">{t.name}</CardTitle>
                          <div className="flex items-center justify-center space-x-2">
                            <Badge variant="secondary">{t.subject}</Badge>
                            <Badge variant="outline">{t.grade}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="flex items-center justify-center mb-3">
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">4.9 (127 reviews)</span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center justify-between">
                              <span>Experience</span>
                              <span className="font-medium">5+ years</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Students</span>
                              <span className="font-medium">500+</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Rate</span>
                              <span className="font-medium">R300/hour</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Button 
                              className="w-full" 
                              size="sm"
                              onClick={() => bookTutorSession(t)}
                            >
                              Book Session
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              size="sm"
                              onClick={() => selectTutor(t)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Tutors */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Award className="mr-2 h-5 w-5 text-blue-600" />
                    My Tutors
                  </CardTitle>
                  <p className="text-gray-600">Tutors you've worked with</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>You haven't worked with any tutors yet.</p>
                    <p className="text-sm">Book your first session to get started!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="space-y-6">
              {/* Study Streak Card */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
                <CardHeader className="border-b border-yellow-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Target className="mr-2 h-5 w-5 text-yellow-600" />
                    🔥 Study Streak
                  </CardTitle>
                  <p className="text-gray-600">Keep your momentum going!</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-yellow-600 mb-2">{studyStreak}</div>
                    <p className="text-lg text-gray-700 mb-4">day{studyStreak !== 1 ? 's' : ''} in a row!</p>
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(Math.min(studyStreak, 7))].map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          🔥
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {studyStreak >= 7 ? "Amazing! You're on fire! 🎉" : `Keep going! ${7 - studyStreak} more day${(7 - studyStreak) !== 1 ? 's' : ''} to reach 7-day streak!`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Badges & Achievements */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Award className="mr-2 h-5 w-5 text-purple-600" />
                    Badges & Achievements
                  </CardTitle>
                  <p className="text-gray-600">Unlock badges as you learn and grow</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* First Login Badge */}
                    <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="text-4xl mb-2">🎓</div>
                      <p className="font-semibold text-sm text-gray-900">Welcome!</p>
                      <p className="text-xs text-gray-600">Joined the platform</p>
                    </div>

                    {/* Profile Complete */}
                    {profileCompletion >= 100 && (
                      <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-semibold text-sm text-gray-900">Complete Profile</p>
                        <p className="text-xs text-gray-600">100% profile completion</p>
                      </div>
                    )}

                    {/* 3-Day Streak */}
                    {studyStreak >= 3 && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                        <div className="text-4xl mb-2">🔥</div>
                        <p className="font-semibold text-sm text-gray-900">On Fire!</p>
                        <p className="text-xs text-gray-600">3-day study streak</p>
                      </div>
                    )}

                    {/* 7-Day Streak */}
                    {studyStreak >= 7 && (
                      <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                        <div className="text-4xl mb-2">🏆</div>
                        <p className="font-semibold text-sm text-gray-900">Week Warrior</p>
                        <p className="text-xs text-gray-600">7-day study streak</p>
                      </div>
                    )}

                    {/* First Note */}
                    {notes.length > 0 && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="font-semibold text-sm text-gray-900">Note Taker</p>
                        <p className="text-xs text-gray-600">Created first note</p>
                      </div>
                    )}

                    {/* 10 Notes */}
                    {notes.length >= 10 && (
                      <div className="text-center p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="font-semibold text-sm text-gray-900">Organized</p>
                        <p className="text-xs text-gray-600">10+ notes created</p>
                      </div>
                    )}

                    {/* Locked badges (examples) */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-50">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="font-semibold text-sm text-gray-500">First Tutorial</p>
                      <p className="text-xs text-gray-400">Complete a tutorial</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-50">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="font-semibold text-sm text-gray-500">Top Student</p>
                      <p className="text-xs text-gray-400">Reach 50 tutorials</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Milestones */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                    Learning Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tutorials Completed</span>
                        <span className="text-sm font-medium text-gray-900">12 / 50</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Study Hours</span>
                        <span className="text-sm font-medium text-gray-900">24 / 100</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Notes Created</span>
                        <span className="text-sm font-medium text-gray-900">{notes.length} / 20</span>
                      </div>
                      <Progress value={(notes.length / 20) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Performance Overview */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                    Performance Overview
                  </CardTitle>
                  <p className="text-gray-600">Track your learning progress and achievements</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-blue-600">75%</p>
                      <p className="text-sm text-gray-600 mt-1">Overall Progress</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-green-600">+15%</p>
                      <p className="text-sm text-gray-600 mt-1">This Month</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <Award className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-purple-600">Top 20%</p>
                      <p className="text-sm text-gray-600 mt-1">Ranking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Progress */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                    Subject-wise Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Mathematics</span>
                        <span className="text-sm font-medium text-gray-900">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">8 tutorials completed • 12 hours studied</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Science</span>
                        <span className="text-sm font-medium text-gray-900">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">6 tutorials completed • 9 hours studied</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">English</span>
                        <span className="text-sm font-medium text-gray-900">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">5 tutorials completed • 7 hours studied</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">History</span>
                        <span className="text-sm font-medium text-gray-900">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">3 tutorials completed • 4 hours studied</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <Calendar className="mr-2 h-5 w-5 text-green-600" />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-10">{day}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full flex items-center justify-end px-2"
                              style={{ width: `${[80, 65, 90, 75, 85, 60, 70][idx]}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{[4, 3, 5, 3.5, 4, 2.5, 3][idx]}h</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <Target className="mr-2 h-5 w-5 text-orange-600" />
                      Strengths & Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">💪 Strengths</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Algebra</Badge>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Grammar</Badge>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Physics</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-700 mb-2">📈 Focus Areas</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Geometry</Badge>
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Essay Writing</Badge>
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Chemistry</Badge>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                          💡 <span className="font-medium">Tip:</span> Focus on Geometry this week for balanced progress!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-sm">
                <CardHeader className="border-b border-indigo-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Star className="mr-2 h-5 w-5 text-indigo-600" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
                      <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Advanced Geometry Tutorial</p>
                        <p className="text-xs text-gray-600">Based on your current progress, this will help strengthen your skills</p>
                      </div>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">View</Button>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
                      <GraduationCap className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Essay Writing Masterclass</p>
                        <p className="text-xs text-gray-600">Students with similar profiles found this helpful</p>
                      </div>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <div className="space-y-8">
              {/* Notes Header with Quick Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Notes</h2>
                  <p className="text-gray-600">Organize and manage your study notes with AI assistance</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setActiveTab('notes')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('notes')}
                    className="border-gray-300"
                  >
                    <BookMarked className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>

              {/* Notes Statistics Dashboard */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-sm">
                <CardHeader className="border-b border-blue-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                    Notes Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <BookMarked className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-blue-600">{notes.length}</p>
                      <p className="text-sm text-gray-600">Total Notes</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-green-600">{notes.filter(n => n.category === 'mathematics').length}</p>
                      <p className="text-sm text-gray-600">Mathematics</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-purple-600">{notes.filter(n => n.category === 'science').length}</p>
                      <p className="text-sm text-gray-600">Science</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <Edit className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-orange-600">{notes.filter(n => n.category === 'general').length}</p>
                      <p className="text-sm text-gray-600">General</p>
                    </div>
                  </div>
                </CardContent>
                </Card>

              {/* AI Assistant Quick Access */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Note Generation */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-sm">
                  <CardHeader className="border-b border-purple-100 pb-3">
                    <CardTitle className="flex items-center text-gray-900 text-lg">
                      <Wand2 className="mr-2 h-5 w-5 text-purple-600" />
                      Generate Note
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <Input 
                      value={aiTopic} 
                      onChange={(e) => setAiTopic(e.target.value)} 
                      placeholder="Enter topic (e.g., Geometry, Photosynthesis)"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <Button 
                      onClick={generateAINote}
                      disabled={!aiTopic.trim() || isAiGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isAiGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Note
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* AI Question Answering */}
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-sm">
                  <CardHeader className="border-b border-blue-100 pb-3">
                    <CardTitle className="flex items-center text-gray-900 text-lg">
                      <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                      Ask AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <Input 
                      value={aiQuestion} 
                      onChange={(e) => setAiQuestion(e.target.value)} 
                      placeholder="Ask a question (e.g., What is photosynthesis?)"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <Button 
                      onClick={() => answerAIQuestion(aiQuestion)}
                      disabled={!aiQuestion.trim() || isAiGenerating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isAiGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Thinking...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Ask Question
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick AI Actions */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm">
                  <CardHeader className="border-b border-green-100 pb-3">
                    <CardTitle className="flex items-center text-gray-900 text-lg">
                      <Brain className="mr-2 h-5 w-5 text-green-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAISuggestions(noteCategory)}
                      disabled={isAiGenerating}
                      className="w-full bg-white border-gray-300 hover:bg-gray-50 justify-start"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Get Suggestions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNoteBody(noteBody + '\n\n## Summary\n\n## Key Takeaways\n\n## Questions\n\n## References')}
                      className="w-full bg-white border-gray-300 hover:bg-gray-50 justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Add Structure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNoteBody(noteBody + '\n\n## Practice Questions\n\n1. \n2. \n3. ')}
                      className="w-full bg-white border-gray-300 hover:bg-gray-50 justify-start"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Add Questions
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* AI Suggestions Display */}
              {aiSuggestions.length > 0 && (
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
                  <CardHeader className="border-b border-yellow-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                      AI Writing Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => applyAISuggestion(suggestion)}
                          className="justify-start text-left h-auto p-3 bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Lightbulb className="h-4 w-4 mr-2 text-yellow-600 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Create Note */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-900 flex items-center">
                      <Edit className="mr-2 h-5 w-5 text-blue-600" />
                      Create New Note
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div>
                      <Label htmlFor="noteTitle" className="text-sm font-semibold text-gray-700 mb-2">Title</Label>
                      <Input 
                        id="noteTitle"
                        value={noteTitle} 
                        onChange={(e)=>setNoteTitle(e.target.value)} 
                        placeholder="Enter note title" 
                        className="bg-white border-gray-300 text-gray-900" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="noteCategory" className="text-sm font-semibold text-gray-700 mb-2">Category</Label>
                      <Select value={noteCategory} onValueChange={setNoteCategory}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">📝 General</SelectItem>
                          <SelectItem value="mathematics">🔢 Mathematics</SelectItem>
                          <SelectItem value="science">🔬 Science</SelectItem>
                          <SelectItem value="english">📚 English</SelectItem>
                          <SelectItem value="history">🏛️ History</SelectItem>
                          <SelectItem value="other">📌 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="noteBody" className="text-sm font-semibold text-gray-700 mb-2">Content</Label>
                      <Textarea 
                        id="noteBody"
                        value={noteBody} 
                        onChange={(e)=>setNoteBody(e.target.value)} 
                        placeholder="Write your note..." 
                        className="min-h-[200px] bg-white border-gray-300 text-gray-900" 
                      />
                    </div>
                    <Button onClick={addNote} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="mr-2 h-4 w-4" />
                      Save Note
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 flex items-center">
                      <Eye className="mr-2 h-5 w-5 text-blue-600" />
                      Preview
                    </CardTitle>
                      {notesPreview && (
                        <Button 
                          onClick={() => readNote({ title: noteTitle || 'Untitled', body: notesPreview, category: noteCategory })}
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Volume2 className="h-4 w-4 mr-1" />
                          Read Preview
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{noteTitle || 'Untitled'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {noteCategory === 'mathematics' && '🔢 Mathematics'}
                          {noteCategory === 'science' && '🔬 Science'}
                          {noteCategory === 'english' && '📚 English'}
                          {noteCategory === 'history' && '🏛️ History'}
                          {noteCategory === 'general' && '📝 General'}
                          {noteCategory === 'other' && '📌 Other'}
                        </Badge>
                      </div>
                    </div>
                    <div className="prose max-w-none whitespace-pre-wrap text-gray-700 p-4 bg-gray-50 rounded-md min-h-[200px]">
                      {notesPreview || 'Your note content will appear here...'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Edit Note Form */}
              {editingNote && (
                <Card className="bg-white border-blue-200 shadow-sm border-2">
                  <CardHeader className="border-b border-gray-100 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 flex items-center">
                        <Edit className="mr-2 h-5 w-5 text-blue-600" />
                        Edit Note: {editingNote.title}
                      </CardTitle>
                      <Button 
                        onClick={() => readNote({ title: editNoteTitle || 'Untitled', body: editNoteBody, category: editNoteCategory })}
                        variant="outline" 
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        Read Current
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div>
                      <Label htmlFor="editNoteTitle" className="text-sm font-semibold text-gray-700 mb-2">Title</Label>
                      <Input 
                        id="editNoteTitle"
                        value={editNoteTitle} 
                        onChange={(e)=>setEditNoteTitle(e.target.value)} 
                        placeholder="Enter note title" 
                        className="bg-white border-gray-300 text-gray-900" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="editNoteCategory" className="text-sm font-semibold text-gray-700 mb-2">Category</Label>
                      <Select value={editNoteCategory} onValueChange={setEditNoteCategory}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">📝 General</SelectItem>
                          <SelectItem value="mathematics">🔢 Mathematics</SelectItem>
                          <SelectItem value="science">🔬 Science</SelectItem>
                          <SelectItem value="english">📚 English</SelectItem>
                          <SelectItem value="history">🏛️ History</SelectItem>
                          <SelectItem value="other">📌 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editNoteBody" className="text-sm font-semibold text-gray-700 mb-2">Content</Label>
                      <Textarea 
                        id="editNoteBody"
                        value={editNoteBody} 
                        onChange={(e)=>setEditNoteBody(e.target.value)} 
                        placeholder="Write your note..." 
                        className="min-h-[200px] bg-white border-gray-300 text-gray-900" 
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={saveEditNote} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={cancelEditNote} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                    
                    {/* AI Edit Assistant */}
                    <div className="pt-4 border-t border-gray-100">
                      <Label className="text-sm font-semibold text-gray-700 mb-2">
                        AI Edit Assistant
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditNoteBody(editNoteBody + '\n\n## Summary\n\n## Key Points\n\n## Examples')}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Add sections
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditNoteBody(editNoteBody + '\n\n**Important:** \n\n**Remember:** \n\n**Note:** ')}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Add highlights
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAISuggestions(editNoteCategory)}
                          disabled={isAiGenerating}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Get suggestions
                        </Button>
                      </div>
                    </div>

                    {/* AI Note Correction Tools for Edit */}
                    <div className="pt-4 border-t border-gray-100">
                      <Label className="text-sm font-semibold text-gray-700 mb-2">
                        ✨ AI Note Correction & Improvement
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentBody = editNoteBody;
                            let correctedNote = currentBody;
                            
                            // Apply same corrections as the main function
                            correctedNote = correctedNote
                              .replace(/\bi\b/g, 'I')
                              .replace(/\bteh\b/g, 'the')
                              .replace(/\bthier\b/g, 'their')
                              .replace(/\brecieve\b/g, 'receive')
                              .replace(/\bseperate\b/g, 'separate')
                              .replace(/\boccured\b/g, 'occurred')
                              .replace(/\bdefinately\b/g, 'definitely')
                              .replace(/\bacheive\b/g, 'achieve')
                              .replace(/\bbeleive\b/g, 'believe');
                            
                            setEditNoteBody(correctedNote);
                          }}
                          disabled={!editNoteBody.trim()}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          Correct Grammar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Apply content improvements based on category
                            const topicLower = editNoteCategory.toLowerCase();
                            let improvedNote = editNoteBody;
                            
                            if (topicLower.includes('math') || topicLower.includes('geometry')) {
                              if (!improvedNote.includes('## Key Formulas')) {
                                improvedNote += '\n\n## Key Formulas\n- [Add relevant formulas here]\n';
                              }
                              if (!improvedNote.includes('## Examples')) {
                                improvedNote += '\n\n## Examples\n- Example 1: [Add step-by-step solution]\n';
                              }
                            } else if (topicLower.includes('science') || topicLower.includes('biology')) {
                              if (!improvedNote.includes('## Key Concepts')) {
                                improvedNote += '\n\n## Key Concepts\n- [Add important concepts]\n';
                              }
                              if (!improvedNote.includes('## Applications')) {
                                improvedNote += '\n\n## Real-World Applications\n- [How this applies to everyday life]\n';
                              }
                            }
                            
                            if (!improvedNote.includes('## Summary')) {
                              improvedNote += '\n\n## Summary\n- [Write a brief summary of key points]\n';
                            }
                            
                            setEditNoteBody(improvedNote);
                          }}
                          disabled={!editNoteBody.trim()}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Improve Content
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reader Control Panel */}
              {isReading && readingNote && (
                <Card className="bg-green-50 border-green-200 shadow-sm border-2">
                  <CardHeader className="border-b border-green-100 bg-green-100">
                    <CardTitle className="text-gray-900 flex items-center">
                      <Volume2 className="mr-2 h-5 w-5 text-green-600" />
                      Reading: {readingNote.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600">Reading aloud...</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Category: {readingNote.category}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500">
                          Rate: {readingSettings.rate}x | Pitch: {readingSettings.pitch} | Vol: {readingSettings.volume}
                        </div>
                        <Button onClick={stopReading} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                          <VolumeX className="h-4 w-4 mr-2" />
                          Stop Reading
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reader Settings */}
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Volume2 className="mr-2 h-5 w-5 text-gray-600" />
                    Reader Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="readingRate" className="text-sm font-semibold text-gray-700 mb-2">Reading Speed</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Slow</span>
                        <input
                          id="readingRate"
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={readingSettings.rate}
                          onChange={(e) => setReadingSettings({...readingSettings, rate: parseFloat(e.target.value)})}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500">Fast</span>
                      </div>
                      <div className="text-xs text-center text-gray-600 mt-1">{readingSettings.rate}x</div>
                    </div>
                    <div>
                      <Label htmlFor="readingPitch" className="text-sm font-semibold text-gray-700 mb-2">Voice Pitch</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Low</span>
                        <input
                          id="readingPitch"
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={readingSettings.pitch}
                          onChange={(e) => setReadingSettings({...readingSettings, pitch: parseFloat(e.target.value)})}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500">High</span>
                      </div>
                      <div className="text-xs text-center text-gray-600 mt-1">{readingSettings.pitch}</div>
                    </div>
                    <div>
                      <Label htmlFor="readingVolume" className="text-sm font-semibold text-gray-700 mb-2">Volume</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Quiet</span>
                        <input
                          id="readingVolume"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={readingSettings.volume}
                          onChange={(e) => setReadingSettings({...readingSettings, volume: parseFloat(e.target.value)})}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500">Loud</span>
                      </div>
                      <div className="text-xs text-center text-gray-600 mt-1">{Math.round(readingSettings.volume * 100)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Search and Filter */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <BookMarked className="mr-2 h-5 w-5 text-purple-600" />
                      My Notes ({notes.filter(n => notesFilter === 'all' || n.category === notesFilter).length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Input */}
                    <div className="flex-1">
                      <Input 
                        placeholder="Search notes by title or content..."
                        className="bg-white border-gray-300"
                        value={notesSearch}
                        onChange={(e) => setNotesSearch(e.target.value)}
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <Select value={notesFilter} onValueChange={setNotesFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="general">📝 General</SelectItem>
                        <SelectItem value="mathematics">🔢 Mathematics</SelectItem>
                        <SelectItem value="science">🔬 Science</SelectItem>
                        <SelectItem value="english">📚 English</SelectItem>
                        <SelectItem value="history">🏛️ History</SelectItem>
                        <SelectItem value="other">📌 Other</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Sort Options */}
                    <Select value={notesSortBy} onValueChange={setNotesSortBy}>
                      <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(() => {
                    // Filter and sort notes
                    let filteredNotes = notes.filter(n => {
                      const matchesCategory = notesFilter === 'all' || n.category === notesFilter;
                      const matchesSearch = !notesSearch.trim() || 
                        n.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
                        n.body.toLowerCase().includes(notesSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    });

                    // Sort notes
                    filteredNotes.sort((a, b) => {
                      switch (notesSortBy) {
                        case 'oldest':
                          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                        case 'title':
                          return a.title.localeCompare(b.title);
                        case 'category':
                          return a.category.localeCompare(b.category);
                        case 'newest':
                        default:
                          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                      }
                    });

                    return filteredNotes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BookMarked className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No notes found matching your criteria.</p>
                        <p className="text-sm">Try adjusting your search or create a new note!</p>
                    </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map(n => (
                          <Card key={n.id} className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
                            <CardHeader className="border-b border-gray-100 pb-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <CardTitle className="text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {n.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        n.category === 'mathematics' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        n.category === 'science' ? 'bg-green-50 text-green-700 border-green-200' :
                                        n.category === 'english' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        n.category === 'history' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                                      }`}
                                    >
                                      {n.category === 'mathematics' && '🔢 Mathematics'}
                                    {n.category === 'science' && '🔬 Science'}
                                    {n.category === 'english' && '📚 English'}
                                    {n.category === 'history' && '🏛️ History'}
                                    {n.category === 'general' && '📝 General'}
                                    {n.category === 'other' && '📌 Other'}
                                  </Badge>
                              {n.createdAt && (
                                      <span className="text-xs text-gray-500">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                      </span>
                              )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="text-sm whitespace-pre-wrap mb-4 text-gray-700 line-clamp-4 min-h-[60px]">
                                {n.body.length > 150 ? `${n.body.substring(0, 150)}...` : n.body}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={()=>readNote(n)} 
                                  size="sm" 
                                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                                  disabled={isReading && readingNote?.id === n.id}
                                >
                                  {isReading && readingNote?.id === n.id ? (
                                    <>
                                      <VolumeX className="h-4 w-4 mr-1" />
                                      Stop
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="h-4 w-4 mr-1" />
                                      Read
                                    </>
                                  )}
                              </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={()=>editNote(n)} 
                                  size="sm" 
                                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={()=>deleteNote(n.id)} 
                                  size="sm" 
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    </LearnerLayout>
  );
};

export default LearnerDashboard;


