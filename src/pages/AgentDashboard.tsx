import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  LogOut, 
  Settings,
  Home,
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  FileText,
  Fingerprint,
  Camera,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  TrendingUp,
  Package,
  CheckCircle2,
  XCircle,
  Hourglass
} from "lucide-react";

interface AgentApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  experience: string;
  motivation: string;
  documents: {
    criminalRecord: string;
    idDocument: string;
    fingerprintCheck: string;
    profilePicture: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  assignedDate: string;
  dueDate: string;
  location: string;
  estimatedHours: number;
  actualHours?: number;
  customerName: string;
  customerPhone: string;
  serviceType: string;
}

interface AgentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  role: 'agent';
  status: 'pending' | 'active' | 'inactive';
  applicationId: string;
}

const AgentDashboard = () => {
  const [user, setUser] = useState<AgentUser | null>(null);
  const [application, setApplication] = useState<AgentApplication | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    
    if (!isAuthenticated || userRole !== "agent") {
      navigate("/login");
      return;
    }

    // Load user data
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setEditForm({
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone || ""
      });

      // Load application data
      if (userObj.applicationId) {
        const applications = JSON.parse(localStorage.getItem("agentApplications") || "[]");
        const userApplication = applications.find((app: AgentApplication) => app.id === userObj.applicationId);
        setApplication(userApplication);
      }
    }

    // Load tasks
    loadTasks();
  }, [navigate]);

  const loadTasks = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      const allTasks = JSON.parse(localStorage.getItem("agentTasks") || "[]");
      const userTasks = allTasks.filter((task: AgentTask) => task.assignedTo === userObj.id);
      setTasks(userTasks);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    });
  };

  const handleSaveProfile = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    
    toast.success("Profile updated successfully");
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTaskClick = (task: AgentTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(false);
  };

  const handleTaskStatusUpdate = (taskId: string, newStatus: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("agentTasks", JSON.stringify(updatedTasks));
    toast.success(`Task status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'assigned': return 'bg-blue-500';
      case 'in-progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      case 'pending': return <Hourglass className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'assigned': return <Package className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "assigned":
        return tasks.filter(task => task.status === 'assigned');
      case "in-progress":
        return tasks.filter(task => task.status === 'in-progress');
      case "completed":
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                IBIS<span className="text-blue-400">.</span> Agent Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-white hover:text-blue-300 hover:bg-white/10"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:text-red-300 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-300">
            Manage your tasks and track your application status
          </p>
        </div>

        {/* Application Status */}
        {application && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 mb-2">
                    Your agent application is currently being reviewed
                  </p>
                  <p className="text-sm text-gray-400">
                    Submitted on {new Date(application.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={`${getStatusColor(application.status)} text-white`}>
                  {getStatusIcon(application.status)}
                  <span className="ml-1 capitalize">{application.status}</span>
                </Badge>
              </div>
              
              {application.status === 'rejected' && application.reviewNotes && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">
                    <strong>Review Notes:</strong> {application.reviewNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="assigned" className="text-white">Assigned</TabsTrigger>
            <TabsTrigger value="in-progress" className="text-white">In Progress</TabsTrigger>
            <TabsTrigger value="completed" className="text-white">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">Total Tasks</p>
                      <p className="text-2xl font-bold text-white">{tasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-orange-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">In Progress</p>
                      <p className="text-2xl font-bold text-white">
                        {tasks.filter(t => t.status === 'in-progress').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">Completed</p>
                      <p className="text-2xl font-bold text-white">
                        {tasks.filter(t => t.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">Success Rate</p>
                      <p className="text-2xl font-bold text-white">
                        {tasks.length > 0 
                          ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tasks */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-gray-300 text-center py-8">
                    No tasks assigned yet. Check back later!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                          <div>
                            <p className="text-white font-medium">{task.title}</p>
                            <p className="text-gray-400 text-sm">{task.serviceType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">{task.customerName}</p>
                          <p className="text-gray-400 text-xs">{task.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tabs */}
          {["assigned", "in-progress", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white capitalize">
                    {tab === "in-progress" ? "In Progress" : tab} Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getFilteredTasks().length === 0 ? (
                    <p className="text-gray-300 text-center py-8">
                      No {tab} tasks found.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredTasks().map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium">{task.title}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                                {task.priority}
                              </Badge>
                              <Badge className={`${getStatusColor(task.status)} text-white`}>
                                {getStatusIcon(task.status)}
                                <span className="ml-1 capitalize">{task.status}</span>
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{task.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {task.location}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {task.estimatedHours}h
                              </span>
                            </div>
                            <span>{task.customerName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Profile Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Profile Information</span>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  onClick={handleEditClick}
                  className="text-blue-300 hover:text-blue-200 hover:bg-white/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={handleSaveProfile}
                    className="text-green-300 hover:text-green-200 hover:bg-white/10"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-red-300 hover:text-red-200 hover:bg-white/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300 text-sm">Full Name</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  ) : (
                    <p className="text-white mt-1">{user.name}</p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">Email</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  ) : (
                    <p className="text-white mt-1">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300 text-sm">Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  ) : (
                    <p className="text-white mt-1">{user.phone || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">Member Since</Label>
                  <p className="text-white mt-1">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Details Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTask.title}</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={`${getPriorityColor(selectedTask.priority)} text-white`}>
                    {selectedTask.priority} Priority
                  </Badge>
                  <Badge className={`${getStatusColor(selectedTask.status)} text-white`}>
                    {getStatusIcon(selectedTask.status)}
                    <span className="ml-1 capitalize">{selectedTask.status}</span>
                  </Badge>
                </div>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">Customer</Label>
                  <p className="text-gray-900">{selectedTask.customerName}</p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Service Type</Label>
                  <p className="text-gray-900">{selectedTask.serviceType}</p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Location</Label>
                  <p className="text-gray-900">{selectedTask.location}</p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Due Date</Label>
                  <p className="text-gray-900">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Estimated Hours</Label>
                  <p className="text-gray-900">{selectedTask.estimatedHours}h</p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Customer Phone</Label>
                  <p className="text-gray-900">{selectedTask.customerPhone}</p>
                </div>
              </div>

              {selectedTask.status !== 'completed' && selectedTask.status !== 'cancelled' && (
                <div className="flex space-x-2">
                  {selectedTask.status === 'assigned' && (
                    <Button
                      onClick={() => handleTaskStatusUpdate(selectedTask.id, 'in-progress')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Task
                    </Button>
                  )}
                  {selectedTask.status === 'in-progress' && (
                    <Button
                      onClick={() => handleTaskStatusUpdate(selectedTask.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={closeTaskModal}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDashboard;
