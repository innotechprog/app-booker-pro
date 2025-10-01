import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { packagesAPI } from '@/services/api';
import { useAuth } from './AuthContext';

interface PackageLimits {
  max_notes: number;
  max_tutorials_per_subject: number;
  max_reminders: number;
  max_subjects: number;
  can_view_teacher_profiles: boolean;
}

interface PackageUsage {
  notes_count: number;
  subjects_count: number;
  reminders_count: number;
  tutorials_per_subject: Array<{
    subject_name: string;
    tutorial_count: number;
  }>;
}

interface UserPackage {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface PackageContextType {
  userPackage: UserPackage | null;
  limits: PackageLimits | null;
  usage: PackageUsage | null;
  isLoading: boolean;
  canCreateNote: () => boolean;
  canViewTutorials: (subjectId: string) => boolean;
  canAddSubject: () => boolean;
  canSetReminder: () => boolean;
  canViewTeacherProfiles: () => boolean;
  refreshPackage: () => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const PackageProvider = ({ children }: { children: ReactNode }) => {
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null);
  const [limits, setLimits] = useState<PackageLimits | null>(null);
  const [usage, setUsage] = useState<PackageUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadPackageData = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const [packageResponse, limitsResponse] = await Promise.all([
        packagesAPI.getUserPackage(),
        packagesAPI.getLimits()
      ]);

      if (packageResponse.success) {
        setUserPackage(packageResponse.package);
      }

      if (limitsResponse.success) {
        setLimits(limitsResponse.limits);
        setUsage(limitsResponse.usage);
      }
    } catch (error) {
      console.error('Error loading package data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackageData();
  }, [isAuthenticated]);

  const canCreateNote = (): boolean => {
    if (!limits || !usage) return false;
    return usage.notes_count < limits.max_notes;
  };

  const canViewTutorials = (subjectId: string): boolean => {
    if (!limits || !usage) return false;
    
    const subjectUsage = usage.tutorials_per_subject.find(
      s => s.subject_name === subjectId
    );
    
    if (!subjectUsage) return true; // New subject, can view tutorials
    
    return subjectUsage.tutorial_count < limits.max_tutorials_per_subject;
  };

  const canAddSubject = (): boolean => {
    if (!limits || !usage) return false;
    return usage.subjects_count < limits.max_subjects;
  };

  const canSetReminder = (): boolean => {
    if (!limits || !usage) return false;
    return usage.reminders_count < limits.max_reminders;
  };

  const canViewTeacherProfiles = (): boolean => {
    if (!limits) return false;
    return limits.can_view_teacher_profiles;
  };

  const refreshPackage = async () => {
    setIsLoading(true);
    await loadPackageData();
  };

  const value = {
    userPackage,
    limits,
    usage,
    isLoading,
    canCreateNote,
    canViewTutorials,
    canAddSubject,
    canSetReminder,
    canViewTeacherProfiles,
    refreshPackage
  };

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
};

export const usePackage = () => {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
};
