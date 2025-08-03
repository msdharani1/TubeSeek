
import { Header } from '@/components/header';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
          <h1>Privacy Policy for TubeSeek</h1>
          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2>Introduction</h2>
          <p>
            Welcome to TubeSeek. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application. By using TubeSeek, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h2>Information We Collect</h2>
          <p>
            When you sign in to TubeSeek using your Google account, we collect the following information provided by Google's authentication service:
          </p>
          <ul>
            <li><strong>User ID:</strong> A unique identifier for your account.</li>
            <li><strong>Email Address:</strong> Your primary email address.</li>
            <li><strong>Display Name:</strong> Your full name as set in your Google account.</li>
            <li><strong>Profile Picture URL:</strong> A link to your Google account's profile picture.</li>
          </ul>
          <p>
            Additionally, we store your search queries to improve your experience and for analytical purposes. Each search query is linked to your user account.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our services.</li>
            <li>Personalize your experience.</li>
            <li>Monitor the usage of our service for analytical purposes.</li>
            <li>Store your search history for your convenience.</li>
            <li>For administrative purposes, including account management and internal analysis.</li>
          </ul>

          <h2>Data Storage</h2>
          <p>
            Your personal information and search history are stored securely in a Firebase Realtime Database. We take reasonable measures to protect your information from unauthorized access, use, or disclosure.
          </p>

          <h2>Sharing Your Information</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access the personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:msdharaniofficial@gmail.com">msdharaniofficial@gmail.com</a>.
          </p>
        </div>
      </main>
    </>
  );
}
