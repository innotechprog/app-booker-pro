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
          `🎯 Key concepts and definitions for ${topic}`,
          `📚 Important theories and principles`,
          `💡 Real-world applications and examples`,
          `❓ Common questions and answers`,
          `🔗 Connections to other subjects`,
          `📝 Study tips and memory techniques`
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
          improvedNote += '\n\n## Key Formulas\n- [Add relevant formulas here]\n';
        }
        if (!improvedNote.includes('## Examples') && !improvedNote.includes('example')) {
          improvedNote += '\n\n## Examples\n- Example 1: [Add step-by-step solution]\n- Example 2: [Add another example]\n';
        }
        if (!improvedNote.includes('## Practice Problems')) {
          improvedNote += '\n\n## Practice Problems\n- Problem 1: [Add practice problem]\n- Problem 2: [Add another problem]\n';
        }
      } else if (topicLower.includes('science') || topicLower.includes('biology')) {
        if (!improvedNote.includes('## Key Concepts')) {
          improvedNote += '\n\n## Key Concepts\n- [Add important concepts]\n';
        }
        if (!improvedNote.includes('## Experiments') && !improvedNote.includes('## Lab Work')) {
          improvedNote += '\n\n## Experiments/Lab Work\n- [Describe relevant experiments]\n';
        }
        if (!improvedNote.includes('## Applications')) {
          improvedNote += '\n\n## Real-World Applications\n- [How this applies to everyday life]\n';
        }
      } else if (topicLower.includes('english') || topicLower.includes('literature')) {
        if (!improvedNote.includes('## Key Themes')) {
          improvedNote += '\n\n## Key Themes\n- [Identify main themes]\n';
        }
        if (!improvedNote.includes('## Literary Devices')) {
          improvedNote += '\n\n## Literary Devices\n- [Identify literary techniques used]\n';
        }
        if (!improvedNote.includes('## Analysis')) {
          improvedNote += '\n\n## Analysis\n- [Add your interpretation and analysis]\n';
        }
      } else if (topicLower.includes('history')) {
        if (!improvedNote.includes('## Timeline')) {
          improvedNote += '\n\n## Timeline\n- [Add chronological order of events]\n';
        }
        if (!improvedNote.includes('## Key Figures')) {
          improvedNote += '\n\n## Key Figures\n- [Important people and their roles]\n';
        }
        if (!improvedNote.includes('## Causes and Effects')) {
          improvedNote += '\n\n## Causes and Effects\n- [What led to this and what resulted]\n';
        }
      }

      // General improvements
      if (!improvedNote.includes('## Summary')) {
        improvedNote += '\n\n## Summary\n- [Write a brief summary of key points]\n';
      }
      if (!improvedNote.includes('## Questions')) {
        improvedNote += '\n\n## Questions to Consider\n- [What questions does this raise?]\n- [What would you like to explore further?]\n';
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

              {/* Available Tutors */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Available Tutors
                  </CardTitle>
                  <p className="text-gray-600">Expert tutors for your grade level ({profile?.grade || 'Not specified'})</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutors.map(t => (
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
                            <Button className="w-full" size="sm">
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
            <div className="space-y-6">
              {/* Notes Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <BookMarked className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{notes.length}</p>
                  <p className="text-xs text-gray-600">Total Notes</p>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{notes.filter(n => n.category === 'mathematics').length}</p>
                  <p className="text-xs text-gray-600">Mathematics</p>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <GraduationCap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{notes.filter(n => n.category === 'science').length}</p>
                  <p className="text-xs text-gray-600">Science</p>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <Edit className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{notes.filter(n => n.category === 'general').length}</p>
                  <p className="text-xs text-gray-600">General</p>
                </Card>
              </div>

              {/* AI Note Assistant */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-sm">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                    AI Note Writing Assistant
                  </CardTitle>
                  <p className="text-sm text-gray-600">Get AI-powered suggestions and generate notes from topics</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* AI Note Generation */}
                    <div>
                      <Label htmlFor="aiTopic" className="text-sm font-semibold text-gray-700 mb-2">
                        Generate Note from Topic
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          id="aiTopic"
                          value={aiTopic} 
                          onChange={(e) => setAiTopic(e.target.value)} 
                          placeholder="e.g., Introduction to Geometry, Photosynthesis, World War II"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        <Button 
                          onClick={generateAINote}
                          disabled={!aiTopic.trim() || isAiGenerating}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {isAiGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    {aiSuggestions.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2">
                          AI Writing Suggestions
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2">
                        Quick AI Actions
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAISuggestions(noteCategory)}
                          disabled={isAiGenerating}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Get {noteCategory} suggestions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNoteBody(noteBody + '\n\n## Summary\n\n## Key Takeaways\n\n## Questions\n\n## References')}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Add structure
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNoteBody(noteBody + '\n\n## Practice Questions\n\n1. \n2. \n3. ')}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Add questions
                        </Button>
                      </div>
                    </div>

                    {/* AI Note Correction Tools */}
                    <div className="pt-4 border-t border-purple-100">
                      <Label className="text-sm font-semibold text-gray-700 mb-2">
                        ✨ AI Note Correction & Improvement
                      </Label>
                      <p className="text-xs text-gray-600 mb-3">Enhance your existing notes with AI-powered corrections and improvements</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={correctNoteWithAI}
                          disabled={!noteBody.trim() || isAiGenerating}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          Correct Grammar & Spelling
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={improveNoteWithAI}
                          disabled={!noteBody.trim() || isAiGenerating}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Improve Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={rewriteNoteWithAI}
                          disabled={!noteBody.trim() || isAiGenerating}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Reorganize & Rewrite
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        💡 <strong>Tip:</strong> Write your note first, then use these AI tools to enhance it!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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

              {/* Notes Filter */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-gray-900">
                      <BookMarked className="mr-2 h-5 w-5 text-purple-600" />
                      My Notes ({notes.filter(n => notesFilter === 'all' || n.category === notesFilter).length})
                    </CardTitle>
                    <Select value={notesFilter} onValueChange={setNotesFilter}>
                      <SelectTrigger className="w-[180px]">
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
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {notes.filter(n => notesFilter === 'all' || n.category === notesFilter).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BookMarked className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No notes in this category yet.</p>
                      <p className="text-sm">Create your first note to get started!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {notes
                        .filter(n => notesFilter === 'all' || n.category === notesFilter)
                        .map(n => (
                          <Card key={n.id} className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="border-b border-gray-100 pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base text-gray-900 mb-1">{n.title}</CardTitle>
                                  <Badge variant="outline" className="text-xs">
                                    {n.category === 'mathematics' && '🔢 Math'}
                                    {n.category === 'science' && '🔬 Science'}
                                    {n.category === 'english' && '📚 English'}
                                    {n.category === 'history' && '🏛️ History'}
                                    {n.category === 'general' && '📝 General'}
                                    {n.category === 'other' && '📌 Other'}
                                  </Badge>
                                </div>
                              </div>
                              {n.createdAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent className="pt-3">
                              <div className="text-sm whitespace-pre-wrap mb-3 text-gray-700 line-clamp-3">
                                {n.body}
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="outline" 
                                  onClick={()=>readNote(n)} 
                                  size="sm" 
                                  className="flex-1"
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
                                <Button variant="outline" onClick={()=>editNote(n)} size="sm" className="flex-1">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="destructive" onClick={()=>deleteNote(n.id)} size="sm" className="flex-1">
                                  <X className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
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


