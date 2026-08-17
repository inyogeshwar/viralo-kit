import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — InstaPilot",
  description: "InstaPilot Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: August 18, 2026</p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to InstaPilot (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your
        personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose,
        and safeguard your information when you use our social media management platform.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Account Information</h3>
      <ul>
        <li>Name and email address (via Clerk authentication)</li>
        <li>Profile photo (if provided via Clerk/Google)</li>
        <li>Workspace name and settings</li>
      </ul>

      <h3>2.2 Instagram Account Data</h3>
      <ul>
        <li>Instagram account username and profile information</li>
        <li>Access tokens (encrypted and stored securely)</li>
        <li>Post data (captions, media URLs, timestamps, engagement metrics)</li>
        <li>Comments and direct messages received on your posts</li>
        <li>Account insights and analytics data</li>
      </ul>

      <h3>2.3 Media Files</h3>
      <ul>
        <li>Images and videos uploaded through InstaPilot (stored on Cloudinary)</li>
        <li>Media metadata (dimensions, format, file size)</li>
      </ul>

      <h3>2.4 Usage Data</h3>
      <ul>
        <li>Pages visited and features used within the app</li>
        <li>Device type, browser, and operating system</li>
        <li>IP address and approximate location</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain the InstaPilot service</li>
        <li>To publish content to your Instagram accounts on your behalf</li>
        <li>To generate AI-powered captions using Google Gemini</li>
        <li>To display analytics and engagement data for your accounts</li>
        <li>To send notifications about comments and messages (via webhooks)</li>
        <li>To improve and optimize our platform</li>
        <li>To communicate with you about updates and support</li>
      </ul>

      <h2>4. Data Sharing and Third Parties</h2>
      <p>We share your data only with the following third-party services:</p>
      <ul>
        <li><strong>Meta / Instagram Graph API</strong> — to publish content and retrieve analytics</li>
        <li><strong>Google Gemini</strong> — to generate AI captions (images may be sent for analysis)</li>
        <li><strong>Cloudinary</strong> — to store and manage your media files</li>
        <li><strong>Neon</strong> — to store your data in a secure PostgreSQL database</li>
        <li><strong>Clerk</strong> — to manage authentication and user accounts</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>5. Data Security</h2>
      <ul>
        <li>All access tokens are encrypted using AES-256 encryption</li>
        <li>Data is transmitted over HTTPS/TLS</li>
        <li>Database connections use SSL/TLS encryption</li>
        <li>We follow industry-standard security practices</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        We retain your data for as long as your account is active. If you delete your account, we will
        remove your personal data within 30 days. Some data may be retained in backups for up to 90 days
        for disaster recovery purposes.
      </p>

      <h2>7. Your Rights</h2>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Export your data in a portable format</li>
        <li>Revoke access to your Instagram accounts at any time</li>
      </ul>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        InstaPilot is not intended for users under the age of 13. We do not knowingly collect personal
        information from children.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any significant changes
        by posting the new policy on this page and updating the &quot;Last updated&quot; date.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at{" "}
        <a href="mailto:privacy@instapilot.app">privacy@instapilot.app</a>.
      </p>
    </article>
  );
}
