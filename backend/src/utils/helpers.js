// Helper utility functions

// Calculate profile completion percentage
export const calculateProfileCompletion = (user) => {
  if (!user) return 0;
  
  const fields = [
    user.full_name,
    user.email,
    user.grade,
    user.goals,
    user.phone
  ];
  
  const completedFields = fields.filter(field => field && field.toString().trim() !== '');
  return Math.round((completedFields.length / fields.length) * 100);
};

// Format date for MySQL
export const formatDateForMySQL = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Check if dates are consecutive
export const areConsecutiveDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Success response
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

// Error response
export const errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};






