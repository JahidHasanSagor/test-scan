import { generateMetadata as getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = getMetadata({
  title: "Terms of Service",
  description: "Read the terms and conditions for using Powerful Website You Should Know.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: October 13, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing or using Powerful Website You Should Know ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Permission is granted to temporarily access the materials (information or software) on Powerful Website You Should Know for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
            <h3 className="text-xl font-medium mb-3 mt-6">Submissions</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Users may submit tools, websites, reviews, comments, and other content ("User Content") to the Service. By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, publish, and distribute such content.
            </p>
            
            <h3 className="text-xl font-medium mb-3 mt-6">Content Standards</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You agree that all User Content you submit will:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Be accurate and truthful</li>
              <li>Not violate any laws or regulations</li>
              <li>Not infringe on any third party's intellectual property rights</li>
              <li>Not contain offensive, defamatory, or inappropriate content</li>
              <li>Not contain spam, advertising, or promotional material</li>
              <li>Not contain malicious code, viruses, or harmful components</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You may not use the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
              <li>To use any robot, spider, or other automatic device to access the Service for any purpose</li>
              <li>To introduce any viruses, trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-foreground/80 leading-relaxed">
              The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Powerful Website You Should Know and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Payments and Subscriptions</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you purchase a subscription or any paid services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>You agree to pay all fees and charges associated with your purchase</li>
              <li>All payments are processed securely through our third-party payment processors</li>
              <li>Subscription fees are billed in advance on a recurring basis</li>
              <li>You may cancel your subscription at any time, but no refunds will be provided for partial periods</li>
              <li>We reserve the right to change our prices at any time with notice to active subscribers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              The Service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Implied warranties of merchantability and fitness for a particular purpose</li>
              <li>That the Service will be uninterrupted, timely, secure, or error-free</li>
              <li>That the results obtained from the use of the Service will be accurate or reliable</li>
              <li>That the quality of any products, services, information obtained through the Service will meet your expectations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-foreground/80 leading-relaxed">
              In no event shall Powerful Website You Should Know, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-foreground/80 leading-relaxed">
              You agree to defend, indemnify and hold harmless Powerful Website You Should Know and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from your use of and access to the Service, or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-foreground/80 leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80">Email: legal@powerfulwebsiteyoushouldknow.com</p>
              <p className="text-foreground/80">Website: https://powerfulwebsiteyoushouldknow.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}