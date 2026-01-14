// In-memory storage for application assist requests (replace with DB in production)
const applicationRequests = [];

export function addApplicationRequest(request) {
  applicationRequests.push({ ...request, createdAt: new Date().toISOString() });
}

export function getAllApplicationRequests() {
  // Return newest first
  return applicationRequests.slice().reverse();
}
