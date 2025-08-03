
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                Privacy Policy
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Privacy Policy for TubeSeek</CardTitle>
                    <p className="text-sm text-muted-foreground pt-2">
                        <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    
                    <h2>Introduction</h2>
                    <p>
                        Welcome to TubeSeek. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application. By using TubeSeek, you agree to the collection and use of information in accordance with this policy.
                    </p>

                    <h2>Information We Collect</h2>
                    <p>
                        We collect and store information to provide and improve our service. The data we collect includes:
                    </p>
                    <ul>
                        <li><strong>Google Account Information:</strong> When you sign in, we collect the User ID, email address, display name, and profile picture URL associated with your Google account.</li>
                        <li><strong>Search History:</strong> We store your search queries to personalize your experience and for analytical purposes.</li>
                        <li><strong>Watch History:</strong> We keep a record of the videos you watch, including the video details and the time you watched them. This is used to provide you with your watch history.</li>
                         <li><strong>Playlists:</strong> We store the playlists you create, including their names and the videos you add to them.</li>
                    </ul>

                    <h2>How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, operate, and maintain our services.</li>
                        <li>Personalize your experience by remembering your preferences and history.</li>
                        <li>Enable you to create and manage video playlists.</li>
                        <li>Display your watch history for your convenience.</li>
                        <li>Monitor the usage of our service for internal analysis and improvement.</li>
                        <li>Manage your account and provide customer support.</li>
                    </ul>

                    <h2>Data Storage</h2>
                    <p>
                        Your personal information, search history, watch history, and playlists are stored securely in a Firebase Realtime Database. We implement reasonable security measures to protect your information from unauthorized access, use, or disclosure.
                    </p>

                    <h2>Sharing Your Information</h2>
                    <p>
                        We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.
                    </p>

                    <h2>Your Rights and Data Control</h2>
                    <p>
                        We believe in giving you control over your data. You have the right to access, manage, and delete your personal information within our service.
                    </p>
                    <ul>
                        <li><strong>Data Deletion:</strong> You can permanently delete your watch history and all of your playlists directly from the "Settings" page in the application. These actions are irreversible.</li>
                        <li><strong>Access and Correction:</strong> You have the right to access the personal information we hold about you. If you would like to correct any information, or if you wish to delete your entire account, please contact us.</li>
                    </ul>

                    <h2>Changes to This Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>

                    <h2>Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:msdharaniofficial@gmail.com">msdharaniofficial@gmail.com</a>.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
