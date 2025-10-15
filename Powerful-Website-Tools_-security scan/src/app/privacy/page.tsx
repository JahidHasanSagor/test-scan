import { generateMetadata as getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = getMetadata({
  title: "Privacy Policy",
  description: "Learn how Powerful Website You Should Know collects, uses, and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: October 13, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Welcome to Powerful Website You Should Know ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-3 mt-6">Personal Information</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Register for an account</li>
              <li>Submit a tool or website</li>
              <li>Leave a review or comment</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              This information may include: name, email address, username, and any other information you choose to provide.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">Automatically Collected Information</h3>
            <p className="text-foreground/80 leading-relaxed">
              When you visit our website, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies installed on your device. We also collect information about your browsing behavior and interaction with our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you for customer service and support</li>
              <li>Send you updates, marketing communications, and promotional materials</li>
              <li>Process your transactions and manage your orders</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>With Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and hosting services.</li>
              <li><strong>For Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
              <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
              <li><strong>Legal Obligations:</strong> We may disclose your information where required by law or in response to valid requests by public authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-foreground/80 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-foreground/80 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>The right to access and receive a copy of your personal information</li>
              <li>The right to rectify or update your personal information</li>
              <li>The right to erase your personal information</li>
              <li>The right to restrict processing of your personal information</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal information</li>
              <li>The right to withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80">Email: privacy@powerfulwebsiteyoushouldknow.com</p>
              <p className="text-foreground/80">Website: https://powerfulwebsiteyoushouldknow.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}