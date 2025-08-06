import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Database, Users, FileText, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <main className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Privacy & Data Protection
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white">
                Privacy Policy
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Your privacy is our priority. Learn how we collect, use, and protect your information when you use TubeSeek.
              </p>
            </div>

            {/* Last Updated Badge */}
            <div className="flex justify-center mb-12">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <FileText className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </Badge>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              
              {/* Introduction Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Introduction</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="text-lg">
                    Welcome to TubeSeek. We are committed to protecting your privacy and maintaining the highest standards of data security. This Privacy Policy explains our practices regarding the collection, use, and protection of your information when you use our application.
                  </p>
                  <p className="mt-4 font-medium text-slate-800 dark:text-slate-200">
                    By using TubeSeek, you acknowledge that you have read and agree to the collection and use of information in accordance with this policy.
                  </p>
                </CardContent>
              </Card>

              {/* Information We Collect Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Information We Collect</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    We collect and store information necessary to provide and improve our service. The data we collect includes:
                  </p>
                  
                  <div className="grid gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Google Account Information</h4>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        When you sign in, we collect your User ID, email address, display name, and profile picture URL associated with your Google account for authentication and personalization.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Search History</h4>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        We store your search queries to personalize your experience, improve our search functionality, and provide relevant recommendations.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Watch History</h4>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        We maintain a record of videos you watch, including video details and timestamps, to provide you with a comprehensive watch history feature.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Playlists</h4>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        We store the playlists you create, including their names, descriptions, and the videos you add to them for playlist management functionality.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How We Use Information Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">How We Use Your Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    We use the information we collect for the following purposes:
                  </p>
                  
                  <div className="space-y-3">
                    {[
                      "Provide, operate, and maintain our core services and features",
                      "Personalize your experience by remembering preferences and viewing history",
                      "Enable playlist creation and management functionality",
                      "Display your personalized watch history for easy access",
                      "Monitor service usage for internal analysis and continuous improvement",
                      "Manage your account and provide responsive customer support"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-slate-700 dark:text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Storage & Security Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Data Storage & Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                  <p>
                    Your personal information, search history, watch history, and playlists are stored securely in Firebase Realtime Database, which provides enterprise-grade security and reliability.
                  </p>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      🔒 We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your information from unauthorized access, use, or disclosure.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sharing Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-semibold">Information Sharing Policy</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                      ✓ We do not sell, trade, or transfer your personally identifiable information to third parties.
                    </p>
                  </div>
                  <p>
                    This commitment does not include trusted service providers who assist us in operating our platform, provided they agree to maintain confidentiality. We may also release information when required by law or to protect rights, property, or safety.
                  </p>
                </CardContent>
              </Card>

              {/* User Rights Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-semibold">Your Rights & Data Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    We believe in empowering you with complete control over your data. Your rights include:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Data Deletion Rights</h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        You can permanently delete your watch history and all playlists directly from the "Settings" page. These actions are immediate and irreversible.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Access & Correction Rights</h4>
                      <p className="text-indigo-800 dark:text-indigo-200 text-sm">
                        You have the right to access and correct your personal information. For account deletion or data correction requests, please contact us directly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy Updates Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-semibold">Policy Updates</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                  <p>
                    We may periodically update this Privacy Policy to reflect changes in our practices or legal requirements. All updates will be posted on this page with a revised "Last Updated" date.
                  </p>
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      📋 We recommend reviewing this Privacy Policy periodically to stay informed about how we protect your information.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Contact Us</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    Have questions about this Privacy Policy or how we handle your data? We're here to help.
                  </p>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-primary/20">
                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                      Email us at: <a 
                        href="mailto:msdharaniofficial@gmail.com" 
                        className="text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 hover:decoration-primary/60"
                      >
                        msdharaniofficial@gmail.com
                      </a>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      We typically respond within 24-48 hours during business days.
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
