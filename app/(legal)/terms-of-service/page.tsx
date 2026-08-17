import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ViraloKit",
  description: "ViraloKit Terms of Service — rules and guidelines for using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: August 18, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using ViraloKit (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
        If you do not agree, do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        ViraloKit is a social media management platform that allows users to:
      </p>
      <ul>
        <li>Connect and manage multiple Instagram accounts</li>
        <li>Create, schedule, and publish Instagram posts</li>
        <li>Generate AI-powered captions for content</li>
        <li>View analytics and engagement metrics</li>
        <li>Manage media files and storage</li>
        <li>Receive real-time notifications for comments and messages</li>
      </ul>

      <h2>3. Account Registration</h2>
      <ul>
        <li>You must be at least 13 years old to use the Service</li>
        <li>You must provide accurate and complete registration information</li>
        <li>You are responsible for maintaining the security of your account</li>
        <li>You must not share your account credentials with others</li>
      </ul>

      <h2>4. Instagram Account Usage</h2>
      <ul>
        <li>You must have legitimate ownership or authorization for any Instagram account you connect</li>
        <li>You agree to comply with Instagram&apos;s Terms of Use and Community Guidelines</li>
        <li>We are not responsible for any action taken by Instagram against your account</li>
        <li>You may not use the Service to post content that violates Instagram&apos;s policies</li>
      </ul>

      <h2>5. Acceptable Use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose</li>
        <li>Post spam, misleading, or deceptive content</li>
        <li>Harass, bully, or harm others through the Service</li>
        <li>Attempt to gain unauthorized access to other accounts or systems</li>
        <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
        <li>Use automated scripts or bots to interact with the Service (except through official APIs)</li>
        <li>Resell or redistribute the Service without written permission</li>
      </ul>

      <h2>6. Content and Intellectual Property</h2>
      <ul>
        <li>You retain ownership of all content you create and publish through ViraloKit</li>
        <li>By using the Service, you grant us a limited license to process and publish your content on your behalf</li>
        <li>AI-generated captions are provided as suggestions — you are responsible for reviewing them before publishing</li>
        <li>We do not claim ownership over your content</li>
      </ul>

      <h2>7. Payment and Subscriptions</h2>
      <ul>
        <li>Free tier usage is subject to applicable limits</li>
        <li>Paid plans are billed in advance on a monthly or annual basis</li>
        <li>All fees are non-refundable except as described in our Refund Policy</li>
        <li>We reserve the right to change pricing with 30 days notice</li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>
        ViraloKit is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
        Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
      </p>

      <h2>9. Service Availability</h2>
      <ul>
        <li>We strive to maintain 99.9% uptime but do not guarantee uninterrupted service</li>
        <li>We may perform scheduled maintenance with reasonable notice</li>
        <li>We are not responsible for downtime caused by third-party services (Instagram, Cloudinary, etc.)</li>
      </ul>

      <h2>10. Termination</h2>
      <ul>
        <li>You may terminate your account at any time from the Settings page</li>
        <li>We may suspend or terminate your account for violation of these Terms</li>
        <li>Upon termination, your data will be handled as described in our Privacy Policy</li>
      </ul>

      <h2>11. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. Continued use of the Service after changes
        constitutes acceptance of the new Terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms? Contact us at{" "}
        <a href="mailto:legal@viraloKit.app">legal@viraloKit.app</a>.
      </p>
    </article>
  );
}
