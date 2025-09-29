// Access Control Utility Functions

export enum AccessLevel {
  FREE = 'free',
  REGISTERED = 'registered', 
  PREMIUM = 'premium'
}

export interface UserAccess {
  level: AccessLevel;
  isLoggedIn: boolean;
  isPremium: boolean;
}

// Check user's current access level
export const getUserAccessLevel = (): UserAccess => {
  const learnerData = localStorage.getItem('learnerData');
  const isLoggedIn = learnerData !== null;
  
  if (!isLoggedIn) {
    return {
      level: AccessLevel.FREE,
      isLoggedIn: false,
      isPremium: false
    };
  }

  // Check if user has premium subscription
  const userData = JSON.parse(learnerData);
  const isPremium = userData.isPremium === true || userData.subscription === 'premium';
  
  return {
    level: isPremium ? AccessLevel.PREMIUM : AccessLevel.REGISTERED,
    isLoggedIn: true,
    isPremium
  };
};

// Check if user can access specific content
export const canAccess = (requiredLevel: AccessLevel): boolean => {
  const userAccess = getUserAccessLevel();
  
  switch (requiredLevel) {
    case AccessLevel.FREE:
      return true; // Everyone can access
    case AccessLevel.REGISTERED:
      return userAccess.isLoggedIn; // Must be logged in
    case AccessLevel.PREMIUM:
      return userAccess.isPremium; // Must have premium subscription
    default:
      return false;
  }
};

// Get access level display name
export const getAccessLevelName = (level: AccessLevel): string => {
  switch (level) {
    case AccessLevel.FREE:
      return 'Free';
    case AccessLevel.REGISTERED:
      return 'Registered';
    case AccessLevel.PREMIUM:
      return 'Premium';
    default:
      return 'Unknown';
  }
};

// Check if user needs to upgrade for specific feature
export const needsUpgrade = (requiredLevel: AccessLevel): boolean => {
  return !canAccess(requiredLevel);
};

// Get upgrade message for specific access level
export const getUpgradeMessage = (requiredLevel: AccessLevel): string => {
  switch (requiredLevel) {
    case AccessLevel.REGISTERED:
      return 'Please register to access this feature';
    case AccessLevel.PREMIUM:
      return 'Upgrade to Premium to access this feature';
    default:
      return 'Access denied';
  }
};
