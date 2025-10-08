import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { packagesAPI, subjectsAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Footer from "@/components/Footer";

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  category: 'free' | 'basic' | 'premium' | 'enterprise' | 'specialized';
  icon: string;
  color: string;
  maxStudents?: number;
  subjects: string[];
  limitations?: string[];
  isCurrent?: boolean;
}

const Packages = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subjects from database with search and category filters
        const filters: any = {};
        if (searchQuery) filters.search = searchQuery;
        if (selectedCategory) filters.category = selectedCategory;

        const response = await subjectsAPI.getAll(filters);
        
        if (response.success) {
          // Convert subjects to ServicePackage format
          const subjectPackages: ServicePackage[] = response.subjects.map((subject: any) => ({
            id: `subject-${subject.id}`,
            name: subject.name,
            description: getSubjectDescription(subject.name, subject.category),
            price: getSubjectPrice(subject.name, subject.category),
            originalPrice: null,
            duration: "Monthly",
            features: getSubjectFeatures(subject.name, subject.category),
            category: getSubjectCategory(subject.category),
            icon: subject.emoji || "📚",
            color: getSubjectColor(subject.category),
            maxStudents: 1,
            subjects: [subject.name],
            recommended: false,
            isCurrent: false,
            limitations: []
          }));

          // Filter out already enrolled subjects from database
          let availablePackages = subjectPackages;
          
          if (isAuthenticated && user?.id) {
            try {
              const enrolledResponse = await subjectsAPI.getEnrolled(user.id);
              if (enrolledResponse.success) {
                const enrolledSubjectIds = enrolledResponse.subjects.map((subject: any) => `subject-${subject.id}`);
                console.log('Enrolled subject IDs from DB:', enrolledSubjectIds);
                availablePackages = subjectPackages.filter(pkg => !enrolledSubjectIds.includes(pkg.id));
              }
            } catch (error) {
              console.error('Error loading enrolled subjects:', error);
              // Continue without filtering if there's an error
            }
          }
          
          console.log('Available packages count:', availablePackages.length);
          setPackages(availablePackages);
        } else {
          setError('Failed to load subjects from database');
        }
        
      } catch (error) {
        console.error('Error loading subjects:', error);
        setError('Failed to load subjects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [isAuthenticated, searchQuery, selectedCategory]);

  const handleSubjectToggle = (subjectId: string) => {
    console.log('Toggling subject:', subjectId);
    setSelectedSubjects(prev => {
      const newSelection = prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handlePurchasePackage = (packageId: string) => {
    if (!isAuthenticated) {
      navigate('/learner/login');
      return;
    }
    
    // Navigate to checkout page
    navigate(`/checkout/${packageId}`);
  };

  const handleEnrollSelected = () => {
    if (!isAuthenticated) {
      navigate('/learner/login');
      return;
    }
    
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject to enroll in.');
      return;
    }
    
    // Show summary modal
    setShowSummary(true);
  };

  const handleContinueToBilling = async () => {
    if (!user?.id) {
      alert('User not found. Please log in again.');
      navigate('/learner/login');
      return;
    }

    try {
      // Extract actual subject IDs (remove 'subject-' prefix)
      const subjectIds = selectedSubjects.map(id => parseInt(id.replace('subject-', '')));
      
      // Enroll subjects in database
      const response = await subjectsAPI.enroll(user.id, subjectIds);
      
      if (response.success) {
        // Also store in localStorage for backward compatibility
        const enrolledSubjects = selectedSubjects.map(subjectId => {
          const subject = packages.find(pkg => pkg.id === subjectId);
          return {
            id: subjectId,
            name: subject?.name || '',
            price: subject?.price || 0,
            icon: subject?.icon || '📚',
            description: subject?.description || '',
            features: subject?.features || [],
            enrolledDate: new Date().toISOString(),
            status: 'active'
          };
        });
        
        localStorage.setItem('enrolledSubjects', JSON.stringify(enrolledSubjects));
        
        // Navigate to billing page
        navigate('/billing');
      } else {
        alert('Failed to enroll in subjects. Please try again.');
      }
    } catch (error) {
      console.error('Error enrolling subjects:', error);
      alert('Failed to enroll in subjects. Please try again.');
    }
  };

  const getTotalPrice = () => {
    return selectedSubjects.reduce((total, subjectId) => {
      const subject = packages.find(pkg => pkg.id === subjectId);
      return total + (subject?.price || 0);
    }, 0);
  };

  // Helper functions for converting database subjects to package format
  const getSubjectDescription = (name: string, category: string) => {
    const descriptions: Record<string, string> = {
      'Mathematics': 'Master math fundamentals and advanced concepts',
      'Algebra': 'Learn algebraic concepts and problem-solving techniques',
      'Geometry': 'Explore geometric shapes, angles, and spatial reasoning',
      'Physical Science': 'Understand physics and chemistry fundamentals',
      'Life Science': 'Study biology and life processes',
      'Physics': 'Explore the fundamental laws of physics',
      'Chemistry': 'Learn chemical reactions and molecular structures',
      'Biology': 'Study living organisms and biological processes',
      'English': 'Develop language skills and literary analysis',
      'Afrikaans': 'Learn Afrikaans language and culture',
      'History': 'Explore historical events and their significance',
      'Geography': 'Study the Earth\'s physical and human geography',
      'Accounting': 'Master financial record-keeping and analysis',
      'Economics': 'Understand economic principles and market dynamics',
      'Computer Science': 'Learn programming and computer fundamentals',
      'Life Orientation': 'Develop life skills and personal development'
    };
    return descriptions[name] || `Comprehensive ${name} learning program`;
  };

  const getSubjectPrice = (name: string, category: string) => {
    // Pricing based on subject complexity and category
    if (category === 'Core Subjects') return 25.00;
    if (category === 'Mathematics') return 30.00;
    if (category === 'Sciences') return 35.00;
    if (category === 'Technology') return 40.00;
    if (category === 'Languages') return 20.00;
    return 25.00; // Default price
  };

  const getSubjectFeatures = (name: string, category: string) => {
    const baseFeatures = [
      "Unlimited tutorial access",
      "Interactive practice problems",
      "Progress tracking",
      "Expert tutor support"
    ];

    const categoryFeatures: Record<string, string[]> = {
      'Core Subjects': ["Exam preparation materials", "Grade-specific content", "Homework help"],
      'Mathematics': ["Step-by-step solutions", "Practice worksheets", "Advanced problem sets"],
      'Sciences': ["Laboratory simulations", "Scientific method training", "Research projects"],
      'Technology': ["Hands-on coding exercises", "Project-based learning", "Code review sessions"],
      'Languages': ["Grammar fundamentals", "Vocabulary building", "Speaking practice"]
    };

    return [...baseFeatures, ...(categoryFeatures[category] || ["Study materials", "Assessment tools"])];
  };

  const getSubjectCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Core Subjects': 'basic',
      'Mathematics': 'premium',
      'Sciences': 'premium',
      'Technology': 'specialized',
      'Languages': 'basic'
    };
    return categoryMap[category] || 'basic';
  };

  const getSubjectColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Core Subjects': 'bg-blue-50 border-blue-200',
      'Mathematics': 'bg-purple-50 border-purple-200',
      'Sciences': 'bg-orange-50 border-orange-200',
      'Technology': 'bg-indigo-50 border-indigo-200',
      'Languages': 'bg-green-50 border-green-200'
    };
    return colorMap[category] || 'bg-gray-50 border-gray-200';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'free':
        return { bg: '#dcfce7', text: '#166534' };
      case 'basic':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'premium':
        return { bg: '#f3e8ff', text: '#7c2d12' };
      case 'specialized':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-5"></div>
            <h2 className="text-gray-700 text-lg font-semibold">
              Loading packages...
            </h2>
          </div>
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-10 rounded-xl shadow-sm max-w-md">
            <div className="text-5xl mb-5">⚠️</div>
            <h2 className="text-red-600 text-lg font-semibold mb-3">
              Error Loading Packages
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Subject Enrollment
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the subjects you want to enroll in. Each subject includes unlimited access to tutorials, practice materials, and expert support.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Field */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Subjects
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by subject name or category..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none cursor-pointer relative z-10"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="" className="text-gray-900">All Categories</option>
                  <option value="Core Subjects" className="text-gray-900">Core Subjects</option>
                  <option value="Mathematics" className="text-gray-900">Mathematics</option>
                  <option value="Sciences" className="text-gray-900">Sciences</option>
                  <option value="Technology" className="text-gray-900">Technology</option>
                  <option value="Languages" className="text-gray-900">Languages</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {packages.length} subject{packages.length !== 1 ? 's' : ''} available
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Subject Selection (col-lg-8) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Subjects</h2>
                <div className="grid grid-cols-1 gap-6">
                  {packages.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id);
                    const categoryColor = getCategoryColor(subject.category);
                    console.log('Rendering subject:', subject.id, subject.name, 'isSelected:', isSelected);
                  
                    return (
                      <div 
                          key={subject.id}
                          className={`border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSubjectToggle(subject.id)}
                        >
                          {/* Checkbox and Subject Header */}
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSubjectToggle(subject.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{subject.icon}</span>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                                  {subject.popular && (
                                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                                      ⭐ Popular
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                              
                              {/* Price */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <span className="text-2xl font-bold text-gray-900">R{subject.price.toFixed(2)}</span>
                                  <span className="text-gray-600 text-sm ml-2">/ {subject.duration}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium`} style={{ 
                                  backgroundColor: categoryColor.bg,
                                  color: categoryColor.text 
                                }}>
                                  {subject.category.charAt(0).toUpperCase() + subject.category.slice(1)}
                                </div>
                              </div>

                              {/* Key Features */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Key Features:</h4>
                                <ul className="space-y-1">
                                  {subject.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                                      <span className="text-green-600 mt-0.5">✓</span>
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                  {subject.features.length > 3 && (
                                    <li className="text-xs text-gray-500">
                                      +{subject.features.length - 3} more features
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right Column - Enrollment Summary (col-lg-4) */}
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                {selectedSubjects.length > 0 ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Enrollment Summary</h3>
                    
                    {/* Selected Subjects List */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Subjects:</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedSubjects.map(subjectId => {
                          const subject = packages.find(pkg => pkg.id === subjectId);
                          return subject ? (
                            <div key={subjectId} className="flex items-center justify-between bg-white rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{subject.icon}</span>
                                <div>
                                  <span className="font-medium text-gray-900 text-sm">{subject.name}</span>
                                  <p className="text-xs text-gray-500">{subject.category}</p>
                                </div>
                              </div>
                              <span className="font-bold text-gray-900 text-sm">R{subject.price.toFixed(2)}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Monthly Total:</span>
                        <span className="text-2xl font-bold text-blue-600">R{getTotalPrice().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Billed monthly • Cancel anytime
                      </p>
                    </div>

                    {/* Enroll Button */}
                    <button
                      onClick={handleEnrollSelected}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      Enroll in {selectedSubjects.length} Subject{selectedSubjects.length > 1 ? 's' : ''}
                      <span>→</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subjects Selected</h3>
                    <p className="text-gray-600 text-sm">
                      Select subjects from the left to see your enrollment summary here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16 p-10 bg-white rounded-2xl shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Subject-Based Learning?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Pay Only What You Need
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Enroll in specific subjects and pay monthly for unlimited access to that subject's content
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Expert Subject Tutors
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Learn from qualified educators specialized in each subject area
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Flexible Enrollment
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Add or remove subjects anytime based on your learning needs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Enrollment Summary</h2>
                <button
                  onClick={() => setShowSummary(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Review your selected subjects before proceeding to billing</p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Selected Subjects ({selectedSubjects.length})</h3>
                
                {/* Selected Subjects List */}
                <div className="space-y-3">
                  {selectedSubjects.map(subjectId => {
                    const subject = packages.find(pkg => pkg.id === subjectId);
                    return subject ? (
                      <div key={subjectId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{subject.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                            <p className="text-sm text-gray-600">{subject.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">R{subject.price.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">/month</div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Total Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Monthly Total</h4>
                      <p className="text-sm text-gray-600">Billed monthly • Cancel anytime</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">R{getTotalPrice().toFixed(2)}</div>
                      <div className="text-sm text-gray-600">/month</div>
                    </div>
                  </div>
                </div>

                {/* Features Summary */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2">What's Included:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Unlimited tutorial access for each subject
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Expert tutor support and guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Progress tracking and analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Practice materials and assessments
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Mobile app access
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSummary(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Selection
                </button>
                <button
                  onClick={handleContinueToBilling}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Billing
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </DashboardLayout>
  );
};

export default Packages;