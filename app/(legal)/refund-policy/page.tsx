import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — InstaPilot",
  description: "InstaPilot Refund Policy — information about refunds and cancellations.",
};

export default function RefundPolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Refund Policy</h1>
      <p className="text-muted-foreground">Last updated: August 18, 2026</p>

      <h2>1. Overview</h2>
      <p>
        We want you to be satisfied with InstaPilot. If you&apos;re not happy with your purchase,
        we&apos;re here to help with refunds as described below.
      </p>

      <h2>2. Free Tier</h2>
      <p>
        InstaPilot offers a free tier with limited features. No payment is required to use the free tier,
        and no refund is applicable.
      </p>

      <h2>3. Paid Subscriptions</h2>
      <h3>3.1 Monthly Plans</h3>
      <ul>
        <li>You may cancel your subscription at any time</li>
        <li>Cancellation takes effect at the end of the current billing period</li>
        <li>Full refund available within 7 days of initial purchase</li>
        <li>No partial refunds for unused days after the 7-day window</li>
      </ul>

      <h3>3.2 Annual Plans</h3>
      <ul>
        <li>Full refund available within 14 days of initial purchase</li>
        <li>After 14 days, no refunds are provided for the remaining period</li>
        <li>Cancellation stops future auto-renewal</li>
      </ul>

      <h2>4. How to Request a Refund</h2>
      <ul>
        <li>Email us at <a href="mailto:billing@instapilot.app">billing@instapilot.app</a></li>
        <li>Include your account email and reason for refund</li>
        <li>Refunds are processed within 5-10 business days</li>
        <li>Refunds are issued to the original payment method</li>
      </ul>

      <h2>5. Exceptions</h2>
      <p>We may issue refunds outside the above windows in cases of:</p>
      <ul>
        <li>Service outages exceeding 24 hours during your billing period</li>
        <li>Billing errors or unauthorized charges</li>
        <li>Features that were advertised but not delivered</li>
      </ul>

      <h2>6. Chargebacks</h2>
      <p>
        If you initiate a chargeback, please contact us first so we can resolve the issue directly.
        We are committed to working with you to find a fair solution.
      </p>

      <h2>7. Contact</h2>
      <p>
        For refund requests or billing questions, email{" "}
        <a href="mailto:billing@instapilot.app">billing@instapilot.app</a>.
      </p>
    </article>
  );
}
