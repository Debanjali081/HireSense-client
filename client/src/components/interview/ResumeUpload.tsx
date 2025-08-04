import { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, Loader2, Building2, Users, Target, Copy, ExternalLink, Star, TrendingUp, Award, Briefcase } from 'lucide-react';
import axios from 'axios';

const roles = [
  { id: 'Frontend Developer', name: 'Frontend Developer', color: 'bg-blue-500', icon: '🎨' },
  { id: 'Backend Developer', name: 'Backend Developer', color: 'bg-green-500', icon: '⚙️' },
  { id: 'Full Stack Developer', name: 'Full Stack Developer', color: 'bg-purple-500', icon: '🚀' },
  { id: 'Data Scientist', name: 'Data Scientist', color: 'bg-orange-500', icon: '📊' },
  { id: 'DevOps Engineer', name: 'DevOps Engineer', color: 'bg-red-500', icon: '🔧' },
  { id: 'Product Manager', name: 'Product Manager', color: 'bg-pink-500', icon: '📋' }
];

interface Company {
  name: string;
  description: string;
  level: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'All Levels';
  matchScore: number;
}

interface AnalysisResult {
  personalizedQuestions: string[];
  topCompanies: Company[];
  generalQuestions: string[];
}

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<{section: string, index: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setFile(files[0]);
      setMessage('');
    } else {
      setMessage('Please drop a PDF file only.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const copyToClipboard = async (text: string, section: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex({ section, index });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const extractCompanyInfo = (companyText: string): Company => {
    // Remove asterisks and clean up the text
    const cleanText = companyText.replace(/\*\*/g, '').trim();
    
    // Extract company name (everything before the first colon or the first few words)
    const colonIndex = cleanText.indexOf(':');
    let name = '';
    let description = '';
    
    if (colonIndex > 0) {
      name = cleanText.substring(0, colonIndex).trim();
      description = cleanText.substring(colonIndex + 1).trim();
    } else {
      // If no colon, try to extract company name from the beginning
      const words = cleanText.split(' ');
      if (words.length >= 2) {
        // Take first 1-3 words as company name
        name = words.slice(0, Math.min(3, words.length)).join(' ');
        description = words.slice(Math.min(3, words.length)).join(' ');
      } else {
        name = cleanText;
        description = 'Great company for your career growth';
      }
    }
    
    // Clean up name by removing common prefixes
    name = name.replace(/^\d+\.\s*/, '').trim();
    
    // Determine level based on keywords in description
    let level: Company['level'] = 'All Levels';
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('entry') || lowerDesc.includes('graduate') || lowerDesc.includes('junior') || lowerDesc.includes('fresher')) {
      level = 'Entry Level';
    } else if (lowerDesc.includes('senior') || lowerDesc.includes('lead') || lowerDesc.includes('principal') || lowerDesc.includes('architect')) {
      level = 'Senior Level';
    } else if (lowerDesc.includes('mid') || lowerDesc.includes('experienced') || lowerDesc.includes('3-5 years') || lowerDesc.includes('2-4 years')) {
      level = 'Mid Level';
    }
    
    // Generate a match score based on relevance keywords
    const relevanceKeywords = ['hiring', 'opportunities', 'culture', 'engineering', 'development', 'technology', 'innovation'];
    const matchScore = Math.min(95, 75 + relevanceKeywords.filter(keyword => 
      lowerDesc.includes(keyword)
    ).length * 5);
    
    return { name, description, level, matchScore };
  };

  const parseAnalysisResponse = (responseText: string): AnalysisResult => {
    // Split by major section headers
    const sections = responseText.split(/(?=\*\*[^*]+\*\*)/);
    
    let personalizedQuestions: string[] = [];
    let topCompanies: Company[] = [];
    let generalQuestions: string[] = [];

    sections.forEach(section => {
      const lowerSection = section.toLowerCase();
      
      // Look for personalized questions section
      if (lowerSection.includes('personalized') && lowerSection.includes('interview')) {
        personalizedQuestions = section
          .split('\n')
          .filter(line => /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(line => line.length > 0);
      } 
      // Look for companies section - updated to match the new prompt format
      else if (lowerSection.includes('top') && lowerSection.includes('companies') && lowerSection.includes('target')) {
        const companyLines = section
          .split('\n')
          .filter(line => /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(line => line.length > 0);
        
        topCompanies = companyLines.map(extractCompanyInfo);
      } 
      // Look for general questions section
      else if (lowerSection.includes('general') && lowerSection.includes('most asked')) {
        generalQuestions = section
          .split('\n')
          .filter(line => /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(line => line.length > 0);
      }
    });

    // Fallback parsing if the above doesn't work
    if (personalizedQuestions.length === 0 || topCompanies.length === 0 || generalQuestions.length === 0) {
      const lines = responseText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      let currentSection = '';
      
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('personalized') && lowerLine.includes('interview')) {
          currentSection = 'personalized';
        } else if (lowerLine.includes('top') && lowerLine.includes('companies')) {
          currentSection = 'companies';
        } else if (lowerLine.includes('general') && lowerLine.includes('most asked')) {
          currentSection = 'general';
        } else if (/^\d+\./.test(line)) {
          const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
          
          if (currentSection === 'personalized' && personalizedQuestions.length < 15) {
            personalizedQuestions.push(cleanLine);
          } else if (currentSection === 'companies' && topCompanies.length < 10) {
            topCompanies.push(extractCompanyInfo(cleanLine));
          } else if (currentSection === 'general' && generalQuestions.length < 15) {
            generalQuestions.push(cleanLine);
          }
        }
      });
    }

    return { personalizedQuestions, topCompanies, generalQuestions };
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a resume (PDF) file first.');
      return;
    }

    if (!role) {
      setMessage('Please select a role before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role);

    setIsUploading(true);
    setUploadProgress(0);
    setMessage('');
    setAnalysisResult(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const res = await axios.post('https://hire-sense-client-faxy-wheat.vercel.app/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setMessage(res.data.message);
        
        // Parse the response based on your backend structure
        if (res.data.questions) {
          if (typeof res.data.questions === 'string') {
            // If questions is a string, parse it
            const parsed = parseAnalysisResponse(res.data.questions);
            setAnalysisResult(parsed);
          } else if (Array.isArray(res.data.questions)) {
            // If it's an array, treat as personalized questions for backward compatibility
            setAnalysisResult({
              personalizedQuestions: res.data.questions,
              topCompanies: [],
              generalQuestions: []
            });
          }
        }
        
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error: any) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Something went wrong.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const selectedRole = roles.find(r => r.id === role);

  const handleDownloadPDF = () => {
    if (!analysisResult) {
      alert('Please analyze a resume first before downloading the report.');
      return;
    }

    // Use jsPDF library to generate PDF from HTML content
    import('jspdf').then(jsPDFModule => {
      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF();

      const margin = 10;
      let y = margin;

      doc.setFontSize(18);
      doc.text(`Interview Preparation Report - ${selectedRole?.name}`, margin, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
      y += 10;

      // Personalized Interview Questions
      doc.setFontSize(14);
      doc.text('Personalized Interview Questions', margin, y);
      y += 8;
      doc.setFontSize(12);
      analysisResult.personalizedQuestions.forEach((q, i) => {
        const text = `${i + 1}. ${q}`;
        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, margin, y);
        y += splitText.length * 7;
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
      });

      y += 5;

      // Top Companies to Target
      doc.setFontSize(14);
      doc.text('Top Companies to Target', margin, y);
      y += 8;
      doc.setFontSize(12);
      analysisResult.topCompanies.forEach((c, i) => {
        const text = `${i + 1}. ${c.name} - ${c.description} (${c.level}) - Match: ${c.matchScore}%`;
        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, margin, y);
        y += splitText.length * 7;
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
      });

      y += 5;

      // General Most Asked Questions
      doc.setFontSize(14);
      doc.text('General Most Asked Questions', margin, y);
      y += 8;
      doc.setFontSize(12);
      analysisResult.generalQuestions.forEach((q, i) => {
        const text = `${i + 1}. ${q}`;
        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, margin, y);
        y += splitText.length * 7;
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
      });

      y += 10;
      doc.setFontSize(10);
      doc.text('Report generated by HireSense AI Interview Preparation Tool', margin, y);

      doc.save(`interview-preparation-${selectedRole?.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    }).catch(err => {
      alert('Failed to generate PDF report. Please try again.');
      console.error('PDF generation error:', err);
    });
  };

  const handleAnalyzeAnother = () => {
    // Reset all states to allow uploading another resume
    setFile(null);
    setRole('');
    setMessage('');
    setAnalysisResult(null);
    setIsUploading(false);
    setUploadProgress(0);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLevelColor = (level: Company['level']) => {
    switch (level) {
      case 'Entry Level': return 'bg-green-100 text-green-800 border-green-200';
      case 'Mid Level': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Senior Level': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: Company['level']) => {
    switch (level) {
      case 'Entry Level': return '🌱';
      case 'Mid Level': return '🚀';
      case 'Senior Level': return '👑';
      default: return '🎯';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg">
          <Sparkles className="w-5 h-5" />
          Resume Analysis
        </div>
        <p className="mt-4 text-gray-600 text-lg">
          Upload your resume and get personalized interview questions
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : file 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          {file ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-800">{file.name}</p>
                <p className="text-sm text-green-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setMessage('');
                  setAnalysisResult(null);
                }}
                className="text-sm text-red-500 hover:text-red-700 underline"
              >
                Remove file
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PDF files only, up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Select Your Target Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((roleOption) => (
            <div
              key={roleOption.id}
              onClick={() => setRole(roleOption.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                role === roleOption.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${roleOption.color} flex items-center justify-center text-white text-xl`}>
                  {roleOption.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{roleOption.name}</h4>
                </div>
              </div>
              {role === roleOption.id && (
                <CheckCircle className="absolute top-3 right-3 w-6 h-6 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Button & Progress */}
      <div className="space-y-4">
        <button
          onClick={handleUpload}
          disabled={!file || !role || isUploading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            !file || !role || isUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Resume...
            </div>
          ) : (
            'Analyze Resume'
          )}
        </button>

        {isUploading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.toFixed(0)}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600">
              {uploadProgress.toFixed(0)}% complete
            </p>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          message.includes('success') || message.includes('uploaded') || message.includes('analyzed')
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-orange-50 text-orange-800 border border-orange-200'
        }`}>
          {message.includes('success') || message.includes('uploaded') || message.includes('analyzed') ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="font-medium">{message}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-8">
          {/* Results Summary Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Analysis Complete! 🎉</h2>
                <p className="text-blue-100">
                  Your resume has been analyzed for the {selectedRole?.name} position
                </p>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{analysisResult.personalizedQuestions.length}</div>
                  <div className="text-sm text-blue-100">Personalized</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{analysisResult.topCompanies.length}</div>
                  <div className="text-sm text-blue-100">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{analysisResult.generalQuestions.length}</div>
                  <div className="text-sm text-blue-100">General</div>
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Interview Questions */}
          {analysisResult.personalizedQuestions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Personalized Interview Questions</h3>
                    <p className="text-purple-100">
                      {analysisResult.personalizedQuestions.length} questions tailored to your resume
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {analysisResult.personalizedQuestions.map((question, idx) => (
                    <div 
                      key={idx}
                      className="group relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-100"
                      style={{ 
                        animationDelay: `${idx * 0.1}s`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed text-lg font-medium">{question}</p>
                          <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => copyToClipboard(question, 'personalized', idx)}
                              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 bg-white px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              {copiedIndex?.section === 'personalized' && copiedIndex?.index === idx ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              {copiedIndex?.section === 'personalized' && copiedIndex?.index === idx ? 'Copied!' : 'Copy'}
                            </button>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star className="w-4 h-4 text-yellow-500" />
                              High Priority
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Companies to Target */}
          {analysisResult.topCompanies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Top Companies to Target</h3>
                    <p className="text-blue-100">
                      {analysisResult.topCompanies.length} companies perfect for your profile
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                {/* Section Label */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800">Recommended Companies</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Based on your resume analysis, here are the top companies that align with your skills and experience for the <span className="font-semibold text-blue-600">{selectedRole?.name}</span> role:
                  </p>
                </div>

                <div className="space-y-6">
                  {analysisResult.topCompanies.map((company, idx) => (
                    <div 
                      key={idx}
                      className="group relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-100 hover:scale-[1.02]"
                      style={{ 
                        animationDelay: `${idx * 0.1}s`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="space-y-4">
                        {/* Company Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {company.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-800 mb-1">{company.name}</h4>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(company.level)}`}>
                                  <span className="text-sm">{getLevelIcon(company.level)}</span>
                                  {company.level}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm font-semibold text-gray-700">{company.matchScore}% Match</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-blue-600 hover:text-blue-800 hover:bg-white rounded-full shadow-sm">
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Company Description */}
                        <div className="pl-18">
                          <p className="text-gray-700 leading-relaxed">{company.description}</p>
                        </div>
                        
                        {/* Company Stats */}
                        <div className="flex items-center gap-4 pl-18 pt-2">
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>High Growth</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <Briefcase className="w-4 h-4" />
                            <span>Active Hiring</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-purple-600">
                            <Award className="w-4 h-4" />
                            <span>Great Culture</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* General Most Asked Questions */}
          {analysisResult.generalQuestions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">General Most Asked Questions</h3>
                    <p className="text-green-100">
                      {analysisResult.generalQuestions.length} essential questions for {selectedRole?.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {analysisResult.generalQuestions.map((question, idx) => (
                    <div 
                      key={idx}
                      className="group relative bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-green-100"
                      style={{ 
                        animationDelay: `${idx * 0.1}s`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed text-lg font-medium">{question}</p>
                          <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => copyToClipboard(question, 'general', idx)}
                              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 bg-white px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              {copiedIndex?.section === 'general' && copiedIndex?.index === idx ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              {copiedIndex?.section === 'general' && copiedIndex?.index === idx ? 'Copied!' : 'Copy'}
                            </button>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Target className="w-4 h-4 text-green-500" />
                              Common Question
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Ready for Your Interview?</h3>
              <p className="text-gray-600">Practice these questions and land your dream job!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => handleDownloadPDF()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Download PDF Report
                </button>
                <button 
                  onClick={() => handleAnalyzeAnother()}
                  className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md">
                  Analyze Another Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;