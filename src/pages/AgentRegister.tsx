import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  Phone, 
  Upload, 
  FileText, 
  Shield, 
  Fingerprint,
  Camera,
  MapPin,
  Calendar,
  AlertCircle,
  Building2,
  Users,
  Briefcase
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

interface ServiceProviderApplication {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  services: string[];
  experience: string;
  motivation: string;
  documents: {
    businessRegistration: string;
    taxClearance: string;
    insurance: string;
    profilePicture: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

const AgentRegister = () => {
  const [registrationType, setRegistrationType] = useState<'agent' | 'serviceProvider'>('agent');
  
  // Agent form data
  const [agentFormData, setAgentFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    dateOfBirth: "",
    experience: "",
    motivation: "",
  });
  
  // Service Provider form data
  const [providerFormData, setProviderFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    businessType: "",
    services: [] as string[],
    experience: "",
    motivation: "",
  });
  
  const [agentDocuments, setAgentDocuments] = useState({
    criminalRecord: "",
    idDocument: "",
    fingerprintCheck: "",
    profilePicture: "",
  });
  
  const [providerDocuments, setProviderDocuments] = useState({
    businessRegistration: "",
    taxClearance: "",
    insurance: "",
    profilePicture: "",
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const availableServices = [
    "Education Services",
    "IT Solutions", 
    "Send Me Services",
    "Cleaning Services",
    "Maintenance Services",
    "Transportation Services",
    "Event Planning",
    "Consulting Services"
  ];

  const validateAgentForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!agentFormData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (agentFormData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!agentFormData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!agentFormData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(agentFormData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!agentFormData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!agentFormData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!agentFormData.experience.trim()) {
      newErrors.experience = "Please describe your relevant experience";
    }

    if (!agentFormData.motivation.trim()) {
      newErrors.motivation = "Please explain your motivation for becoming an agent";
    }

    if (!agentFormData.password) {
      newErrors.password = "Password is required";
    } else if (agentFormData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(agentFormData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!agentFormData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (agentFormData.password !== agentFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Document validation - now optional
    // if (!agentDocuments.criminalRecord) {
    //   newErrors.criminalRecord = "Criminal record check is required";
    // }
    // if (!agentDocuments.idDocument) {
    //   newErrors.idDocument = "ID document is required";
    // }
    // if (!agentDocuments.fingerprintCheck) {
    //   newErrors.fingerprintCheck = "Fingerprint check is required";
    // }
    // if (!agentDocuments.profilePicture) {
    //   newErrors.profilePicture = "Profile picture is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProviderForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!providerFormData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!providerFormData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person name is required";
    }

    if (!providerFormData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(providerFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!providerFormData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(providerFormData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!providerFormData.address.trim()) {
      newErrors.address = "Business address is required";
    }

    if (!providerFormData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (providerFormData.services.length === 0) {
      newErrors.services = "Please select at least one service";
    }

    if (!providerFormData.experience.trim()) {
      newErrors.experience = "Please describe your business experience";
    }

    if (!providerFormData.motivation.trim()) {
      newErrors.motivation = "Please explain your motivation for joining our platform";
    }

    if (!providerFormData.password) {
      newErrors.password = "Password is required";
    } else if (providerFormData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(providerFormData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!providerFormData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (providerFormData.password !== providerFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Document validation - now optional
    // if (!providerDocuments.businessRegistration) {
    //   newErrors.businessRegistration = "Business registration document is required";
    // }
    // if (!providerDocuments.taxClearance) {
    //   newErrors.taxClearance = "Tax clearance certificate is required";
    // }
    // if (!providerDocuments.insurance) {
    //   newErrors.insurance = "Insurance certificate is required";
    // }
    // if (!providerDocuments.profilePicture) {
    //   newErrors.profilePicture = "Company logo/profile picture is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAgentFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProviderFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setProviderFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
    if (errors.services) {
      setErrors(prev => ({ ...prev, services: "" }));
    }
  };

  const handleAgentDocumentUpload = (field: string, value: string) => {
    setAgentDocuments(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleProviderDocumentUpload = (field: string, value: string) => {
    setProviderDocuments(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = registrationType === 'agent' ? validateAgentForm() : validateProviderForm();
    
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    // Simulate application submission
    setTimeout(() => {
      if (registrationType === 'agent') {
        const application: AgentApplication = {
          id: Date.now().toString(),
          name: agentFormData.name.trim(),
          email: agentFormData.email,
          phone: agentFormData.phone,
          address: agentFormData.address.trim(),
          dateOfBirth: agentFormData.dateOfBirth,
          experience: agentFormData.experience.trim(),
          motivation: agentFormData.motivation.trim(),
          documents: agentDocuments,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };

        const existingApplications = JSON.parse(localStorage.getItem("agentApplications") || "[]");
        existingApplications.push(application);
        localStorage.setItem("agentApplications", JSON.stringify(existingApplications));

        const user = {
          id: Date.now().toString(),
          name: agentFormData.name.trim(),
          email: agentFormData.email,
          phone: agentFormData.phone,
          joinDate: new Date().toISOString(),
          role: 'agent',
          status: 'pending',
          applicationId: application.id,
        };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "agent");

        toast.success("Agent application submitted successfully! We'll review and get back to you soon.");
      } else {
        const application: ServiceProviderApplication = {
          id: Date.now().toString(),
          companyName: providerFormData.companyName.trim(),
          contactPerson: providerFormData.contactPerson.trim(),
          email: providerFormData.email,
          phone: providerFormData.phone,
          address: providerFormData.address.trim(),
          businessType: providerFormData.businessType,
          services: providerFormData.services,
          experience: providerFormData.experience.trim(),
          motivation: providerFormData.motivation.trim(),
          documents: providerDocuments,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };

        const existingApplications = JSON.parse(localStorage.getItem("serviceProviderApplications") || "[]");
        existingApplications.push(application);
        localStorage.setItem("serviceProviderApplications", JSON.stringify(existingApplications));

        const user = {
          id: Date.now().toString(),
          name: providerFormData.companyName.trim(),
          email: providerFormData.email,
          phone: providerFormData.phone,
          joinDate: new Date().toISOString(),
          role: 'serviceProvider',
          status: 'pending',
          applicationId: application.id,
        };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "serviceProvider");

        toast.success("Service provider application submitted successfully! We'll review and get back to you soon.");
      }

      setIsLoading(false);
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-white hover:text-blue-300 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </Button>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Become an IBIS Agent
            </CardTitle>
            <CardDescription className="text-gray-300">
              Join our team and help deliver exceptional services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration Type Toggle */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant={registrationType === 'agent' ? 'default' : 'outline'}
                  onClick={() => setRegistrationType('agent')}
                  className="w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  Agent Registration
                </Button>
                <Button
                  variant={registrationType === 'serviceProvider' ? 'default' : 'outline'}
                  onClick={() => setRegistrationType('serviceProvider')}
                  className="w-full"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Service Provider Registration
                </Button>
              </div>

              {/* Agent Registration Form */}
              {registrationType === 'agent' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white font-semibold">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={agentFormData.name}
                            onChange={handleAgentChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.name 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-semibold">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={agentFormData.email}
                            onChange={handleAgentChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.email 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white font-semibold">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={agentFormData.phone}
                            onChange={handleAgentChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.phone 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-white font-semibold">Date of Birth *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={agentFormData.dateOfBirth}
                            onChange={handleAgentChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.dateOfBirth 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.dateOfBirth && (
                          <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-white font-semibold">Full Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="Enter your full address"
                          value={agentFormData.address}
                          onChange={handleAgentChange}
                          className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                            errors.address 
                              ? "border-red-500 focus:border-red-500" 
                              : "border-gray-200 focus:border-blue-500"
                          } rounded-xl`}
                          required
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Experience & Motivation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      Experience & Motivation
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-white font-semibold">Relevant Experience *</Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        placeholder="Describe your relevant experience (customer service, delivery, etc.)"
                        value={agentFormData.experience}
                        onChange={handleAgentChange}
                        className={`border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.experience 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        rows={3}
                        required
                      />
                      {errors.experience && (
                        <p className="text-red-400 text-sm mt-1">{errors.experience}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivation" className="text-white font-semibold">Motivation *</Label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        placeholder="Why do you want to become an IBIS agent?"
                        value={agentFormData.motivation}
                        onChange={handleAgentChange}
                        className={`border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.motivation 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        rows={3}
                        required
                      />
                      {errors.motivation && (
                        <p className="text-red-400 text-sm mt-1">{errors.motivation}</p>
                      )}
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      Documents (Optional - Complete Later)
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      You can upload these documents now or complete your profile later. Documents are required to activate your service listings.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="criminalRecord" className="text-white font-semibold">Criminal Record Check</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="criminalRecord"
                            name="criminalRecord"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleAgentDocumentUpload('criminalRecord', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.criminalRecord 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.criminalRecord && (
                          <p className="text-red-400 text-sm mt-1">{errors.criminalRecord}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="idDocument" className="text-white font-semibold">ID Document</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="idDocument"
                            name="idDocument"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleAgentDocumentUpload('idDocument', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.idDocument 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.idDocument && (
                          <p className="text-red-400 text-sm mt-1">{errors.idDocument}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fingerprintCheck" className="text-white font-semibold">Fingerprint Check</Label>
                        <div className="relative">
                          <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="fingerprintCheck"
                            name="fingerprintCheck"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleAgentDocumentUpload('fingerprintCheck', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.fingerprintCheck 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.fingerprintCheck && (
                          <p className="text-red-400 text-sm mt-1">{errors.fingerprintCheck}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profilePicture" className="text-white font-semibold">Profile Picture</Label>
                        <div className="relative">
                          <Camera className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="profilePicture"
                            name="profilePicture"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleAgentDocumentUpload('profilePicture', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.profilePicture 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.profilePicture && (
                          <p className="text-red-400 text-sm mt-1">{errors.profilePicture}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      Account Security
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white font-semibold">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={agentFormData.password}
                            onChange={handleAgentChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.password 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.password && (
                          <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white font-semibold">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={agentFormData.confirmPassword}
                            onChange={handleAgentChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.confirmPassword 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Service Provider Registration Form */}
              {registrationType === 'serviceProvider' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      Company Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-white font-semibold">Company Name *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="companyName"
                            name="companyName"
                            type="text"
                            placeholder="Enter your company name"
                            value={providerFormData.companyName}
                            onChange={handleProviderChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.companyName 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.companyName && (
                          <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-white font-semibold">Contact Person *</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="contactPerson"
                            name="contactPerson"
                            type="text"
                            placeholder="Enter contact person name"
                            value={providerFormData.contactPerson}
                            onChange={handleProviderChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.contactPerson 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.contactPerson && (
                          <p className="text-red-400 text-sm mt-1">{errors.contactPerson}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-semibold">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={providerFormData.email}
                            onChange={handleProviderChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.email 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white font-semibold">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={providerFormData.phone}
                            onChange={handleProviderChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.phone 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-white font-semibold">Business Address *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="address"
                            name="address"
                            type="text"
                            placeholder="Enter your business address"
                            value={providerFormData.address}
                            onChange={handleProviderChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.address 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.address && (
                          <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-white font-semibold">Business Type *</Label>
                                                 <Select onValueChange={(value) => {
                           setProviderFormData(prev => ({ ...prev, businessType: value }));
                           if (errors.businessType) {
                             setErrors(prev => ({ ...prev, businessType: "" }));
                           }
                         }} defaultValue={providerFormData.businessType}>
                          <SelectTrigger className="w-full border-2 border-gray-200 rounded-xl bg-white text-gray-900">
                            <SelectValue placeholder="Select a business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Wholesale">Wholesale</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Service">Service</SelectItem>
                            <SelectItem value="Consulting">Consulting</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.businessType && (
                          <p className="text-red-400 text-sm mt-1">{errors.businessType}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="services" className="text-white font-semibold">Services Offered *</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableServices.map((service) => (
                            <div key={service} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`service-${service}`}
                                value={service}
                                checked={providerFormData.services.includes(service)}
                                onChange={() => handleServiceToggle(service)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`service-${service}`} className="ml-2 text-sm text-gray-300">
                                {service}
                              </label>
                            </div>
                          ))}
                        </div>
                        {errors.services && (
                          <p className="text-red-400 text-sm mt-1">{errors.services}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Experience & Motivation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      Experience & Motivation
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-white font-semibold">Business Experience *</Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        placeholder="Describe your business experience and expertise"
                        value={providerFormData.experience}
                        onChange={handleProviderChange}
                        className={`border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.experience 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        rows={3}
                        required
                      />
                      {errors.experience && (
                        <p className="text-red-400 text-sm mt-1">{errors.experience}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivation" className="text-white font-semibold">Motivation *</Label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        placeholder="Why do you want to join our platform as a service provider?"
                        value={providerFormData.motivation}
                        onChange={handleProviderChange}
                        className={`border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.motivation 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        rows={3}
                        required
                      />
                      {errors.motivation && (
                        <p className="text-red-400 text-sm mt-1">{errors.motivation}</p>
                      )}
                    </div>
                  </div>

                                     {/* Required Documents */}
                   <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                       Documents (Optional - Complete Later)
                     </h3>
                     <p className="text-gray-300 text-sm mb-4">
                       You can upload these documents now or complete your profile later. Documents are required to activate your service listings.
                     </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                                                 <Label htmlFor="businessRegistration" className="text-white font-semibold">Business Registration Certificate</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="businessRegistration"
                            name="businessRegistration"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleProviderDocumentUpload('businessRegistration', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.businessRegistration 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.businessRegistration && (
                          <p className="text-red-400 text-sm mt-1">{errors.businessRegistration}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxClearance" className="text-white font-semibold">Tax Clearance Certificate</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="taxClearance"
                            name="taxClearance"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleProviderDocumentUpload('taxClearance', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.taxClearance 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.taxClearance && (
                          <p className="text-red-400 text-sm mt-1">{errors.taxClearance}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="insurance" className="text-white font-semibold">Insurance Certificate</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="insurance"
                            name="insurance"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleProviderDocumentUpload('insurance', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.insurance 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.insurance && (
                          <p className="text-red-400 text-sm mt-1">{errors.insurance}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profilePicture" className="text-white font-semibold">Company Logo/Profile Picture</Label>
                        <div className="relative">
                          <Camera className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="profilePicture"
                            name="profilePicture"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleProviderDocumentUpload('profilePicture', e.target.files?.[0]?.name || '')}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.profilePicture 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                          />
                        </div>
                        {errors.profilePicture && (
                          <p className="text-red-400 text-sm mt-1">{errors.profilePicture}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      Account Security
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white font-semibold">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={providerFormData.password}
                            onChange={handleProviderChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.password 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.password && (
                          <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white font-semibold">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={providerFormData.confirmPassword}
                            onChange={handleProviderChange}
                            className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                              errors.confirmPassword 
                                ? "border-red-500 focus:border-red-500" 
                                : "border-gray-200 focus:border-blue-500"
                            } rounded-xl`}
                            required
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">Important Information:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Your application will be reviewed within 2-3 business days</li>
                      <li>• All documents must be clear and legible</li>
                      <li>• You will be notified via email once your application is reviewed</li>
                      <li>• Approved agents will receive access to the agent dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Submitting Application..." : "Submit Agent Application"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentRegister;
