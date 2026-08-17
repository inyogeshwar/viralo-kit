import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — InstaPilot",
  description: "InstaPilot Cookie Policy — how we use cookies and tracking technologies.",
};

export default function CookiePolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Cookie Policy</h1>
      <p className="text-muted-foreground">Last updated: August 18, 2026</p>

      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files that are stored on your device when you visit a website. They are
        widely used to make websites work efficiently and to provide information to website owners.
      </p>

      <h2>2. How We Use Cookies</h2>
      <p>InstaPilot uses cookies and similar technologies for the following purposes:</p>

      <h3>2.1 Essential Cookies</h3>
      <p>These are necessary for the Service to function properly:</p>
      <ul>
        <li><strong>Session cookies</strong> — Maintain your login session via Clerk authentication</li>
        <li><strong>CSRF tokens</strong> — Protect against cross-site request forgery attacks</li>
        <li><strong>Load balancer cookies</strong> — Route requests to the correct server instance</li>
      </ul>

      <h3>2.2 Preference Cookies</h3>
      <ul>
        <li><strong>Theme preference</strong> — Stores your dark/light mode choice</li>
        <li><strong>UI preferences</strong> — Remembers sidebar state and layout preferences</li>
      </ul>

      <h3>2.3 Analytics Cookies</h3>
      <p>
        We may use privacy-respecting analytics to understand how the Service is used. These cookies
        do not track you across other websites.
      </p>

      <h2>3. Third-Party Cookies</h2>
      <p>The following third-party services may set cookies:</p>
      <ul>
        <li><strong>Clerk</strong> — Authentication and session management</li>
        <li><strong>Vercel</strong> — Hosting and performance monitoring</li>
      </ul>

      <h2>4. Managing Cookies</h2>
      <p>You can control and manage cookies through your browser settings:</p>
      <ul>
        <li><strong>Chrome</strong> — Settings → Privacy and security → Cookies</li>
        <li><strong>Firefox</strong> — Settings → Privacy & Security → Cookies</li>
        <li><strong>Safari</strong> → Preferences → Privacy → Manage Website Data</li>
        <li><strong>Edge</strong> → Settings → Cookies and site permissions</li>
      </ul>
      <p>
        Note: Disabling essential cookies may prevent the Service from working correctly.
      </p>

      <h2>5. No Third-Party Advertising</h2>
      <p>
        We do not use cookies for advertising or tracking purposes. We do not sell or share your
        data with advertising networks.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Changes will be posted on this page with
        an updated &quot;Last updated&quot; date.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about our use of cookies? Contact us at{" "}
        <a href="mailto:privacy@instapilot.app">privacy@instapilot.app</a>.
      </p>
    </article>
  );
}
