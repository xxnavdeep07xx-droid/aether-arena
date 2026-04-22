'use client';

import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { MessageSquare, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function LegalPageWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{title}</h1>
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6 md:p-8 prose-sm text-arena-text-secondary leading-relaxed space-y-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-arena-text-primary [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-arena-text-primary [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:text-sm [&_strong]:text-arena-text-primary [&_strong]:font-medium [&_a]:text-arena-accent [&_a]:hover:underline">
        {children}
      </div>
      <p className="text-xs text-arena-text-muted mt-4 text-center">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  );
}

export function PrivacyPolicyView() {
  return (
    <LegalPageWrapper title="🔒 Privacy Policy">
      <p>Welcome to Aether Arena (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>

      <h2>1. Information We Collect</h2>
      <h3>1.1 Personal Information</h3>
      <ul>
        <li><strong>Account Details:</strong> Username, display name, email address, and password when you register.</li>
        <li><strong>Discord Data:</strong> Discord ID, username, and avatar when you sign in via Discord OAuth.</li>
        <li><strong>Profile Information:</strong> Avatar URL, bio, and any information you choose to share on your public profile.</li>
      </ul>
      <h3>1.2 Gaming Data</h3>
      <ul>
        <li><strong>Tournament Participation:</strong> Tournament registrations, match results, kills, deaths, placements, and scores.</li>
        <li><strong>Leaderboard Data:</strong> Points, ranks, win rates, and K/D ratios displayed on public leaderboards.</li>
        <li><strong>Payment Information:</strong> Transaction references and payment screenshots for tournament fee verification. <strong>We do NOT store credit card numbers, UPI IDs, or bank details.</strong></li>
      </ul>
      <h3>1.3 Automatically Collected Data</h3>
      <ul>
        <li>Device type, browser type, IP address (anonymized), and usage patterns.</li>
        <li>Cookies and local storage for session management and preferences.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and operate the Aether Arena tournament platform.</li>
        <li>To process tournament registrations and verify payments.</li>
        <li>To maintain leaderboards, rankings, and player statistics.</li>
        <li>To send notifications about tournaments, results, and platform updates.</li>
        <li>To improve our platform, fix bugs, and enhance user experience.</li>
        <li>To enforce our Terms and Conditions and prevent fraud.</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do <strong>NOT</strong> sell, rent, or trade your personal information. We may share data only with:</p>
      <ul>
        <li><strong>Tournament Organizers:</strong> Registration details (username, payment status) for tournaments you&apos;ve joined.</li>
        <li><strong>Public Leaderboards:</strong> Your username, stats, and rank are publicly visible.</li>
        <li><strong>Legal Requirements:</strong> If required by Indian law or court order.</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We implement industry-standard security measures including encrypted passwords (bcrypt), secure session tokens, and HTTPS encryption. However, no system is 100% secure. We recommend using unique passwords and enabling 2FA on your Discord account.</p>

      <h2>5. Data Retention</h2>
      <ul>
        <li><strong>Active Accounts:</strong> Data is retained while your account is active.</li>
        <li><strong>Deleted Accounts:</strong> Personal data is removed within 30 days of account deletion request.</li>
        <li><strong>Leaderboard History:</strong> Anonymized statistics may be retained for historical purposes.</li>
      </ul>

      <h2>6. Your Rights</h2>
      <ul>
        <li><strong>Access:</strong> You can view all your data through your profile.</li>
        <li><strong>Correction:</strong> You can update your profile information at any time.</li>
        <li><strong>Deletion:</strong> You can request account deletion via Discord support.</li>
        <li><strong>Opt-out:</strong> You can disable notifications in your profile settings.</li>
      </ul>

      <h2>7. Children&apos;s Privacy</h2>
      <p>Aether Arena is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the data immediately.</p>

      <h2>8. Third-Party Services</h2>
      <ul>
        <li><strong>Discord:</strong> OAuth authentication provider. Subject to Discord&apos;s Privacy Policy.</li>
        <li><strong>Codashop:</strong> Top-up affiliate links. We receive no personal data from Codashop transactions.</li>
        <li><strong>Vercel:</strong> Hosting provider. Subject to Vercel&apos;s Privacy Policy.</li>
      </ul>

      <h2>9. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify users of significant changes via platform announcements or email.</p>

      <h2>10. Contact Us</h2>
      <p>For privacy-related questions or requests, contact us at our Discord server or via the Contact page.</p>
    </LegalPageWrapper>
  );
}

export function TermsConditionsView() {
  return (
    <LegalPageWrapper title="📜 Terms &amp; Conditions">
      <p>Welcome to Aether Arena. By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By creating an account, participating in tournaments, or using any feature of Aether Arena, you acknowledge that you have read, understood, and agree to these Terms.</p>

      <h2>2. Eligibility</h2>
      <ul>
        <li>You must be at least <strong>13 years old</strong> to use this platform.</li>
        <li>If you are under 18, you must have parental or guardian consent.</li>
        <li>You must not be legally prohibited from participating in online gaming tournaments.</li>
        <li>You must reside in a jurisdiction where online gaming tournaments with prize pools are legal.</li>
      </ul>

      <h2>3. Account Registration</h2>
      <ul>
        <li>You must provide accurate and complete registration information.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You must not create multiple accounts. One person = one account.</li>
        <li>You must not use offensive, misleading, or impersonating usernames.</li>
        <li>We reserve the right to suspend or ban accounts that violate these rules.</li>
      </ul>

      <h2>4. Tournament Participation</h2>
      <h3>4.1 Registration</h3>
      <ul>
        <li>By registering for a tournament, you agree to follow all tournament rules and the host&apos;s room settings.</li>
        <li>Registration is confirmed only after payment verification (for paid tournaments).</li>
        <li>We reserve the right to refuse or cancel registrations at our discretion.</li>
      </ul>
      <h3>4.2 Entry Fees &amp; Prizes</h3>
      <ul>
        <li>Entry fees are non-refundable once the tournament begins, except as outlined in our Refund Policy.</li>
        <li>Prize pools are distributed as per the tournament&apos;s prize breakdown.</li>
        <li>Prize distribution may take up to <strong>48 hours</strong> after tournament completion.</li>
        <li>All prize amounts are in Indian Rupees (INR) and subject to applicable taxes.</li>
      </ul>
      <h3>4.3 Fair Play</h3>
      <ul>
        <li><strong>No Cheating:</strong> Use of hacks, mods, exploits, or any unfair advantage is strictly prohibited.</li>
        <li><strong>No Team Killing:</strong> Intentional team kills will result in disqualification.</li>
        <li><strong>No Collusion:</strong> Players must not conspire with opponents to manipulate match outcomes.</li>
        <li><strong>No Smurfing:</strong> Playing on another person&apos;s account is prohibited.</li>
        <li>Violations may result in disqualification, prize forfeiture, and permanent ban.</li>
      </ul>

      <h2>5. Payment &amp; Transactions</h2>
      <ul>
        <li>Payments are processed via UPI transfer. Aether Arena does not directly process payments.</li>
        <li>Users must upload payment screenshots/proof for verification.</li>
        <li>Fake or manipulated payment proofs will result in permanent ban.</li>
        <li>Aether Arena is not liable for payment failures, delays, or disputes with payment providers.</li>
      </ul>

      <h2>6. User Conduct</h2>
      <ul>
        <li>Be respectful to all players, admins, and staff.</li>
        <li>No harassment, hate speech, discrimination, or abusive behavior.</li>
        <li>No spamming, advertising, or self-promotion without permission.</li>
        <li>No sharing of personal information of other users without consent.</li>
        <li>No impersonation of Aether Arena staff or administrators.</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <ul>
        <li>The Aether Arena name, logo, and branding are our intellectual property.</li>
        <li>Game assets, logos, and trademarks belong to their respective owners (Krafton, Garena, Activision, etc.).</li>
        <li>User-generated content (clips, screenshots) may be used by Aether Arena for promotional purposes with credit.</li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>Aether Arena provides the platform &quot;as is&quot; without warranties. We are not liable for:</p>
      <ul>
        <li>Server downtime, connectivity issues, or technical glitches during matches.</li>
        <li>Actions of players, tournament organizers, or third parties.</li>
        <li>Loss of in-game items, currency, or rankings.</li>
        <li>Any indirect, incidental, or consequential damages.</li>
      </ul>

      <h2>9. Dispute Resolution</h2>
      <ul>
        <li>All disputes will be resolved through our internal review process.</li>
        <li>Final decisions on disputes rest with Aether Arena administration.</li>
        <li>For unresolved disputes, the matter falls under the jurisdiction of courts in India.</li>
      </ul>

      <h2>10. Modifications</h2>
      <p>We may modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>

      <h2>11. Termination</h2>
      <p>We may suspend or terminate your account for violation of these Terms. You may delete your account at any time through our Discord support.</p>
    </LegalPageWrapper>
  );
}

export function RefundPolicyView() {
  return (
    <LegalPageWrapper title="💰 Refund Policy">
      <p>At Aether Arena, we strive to provide a fair and transparent refund process. This policy outlines when refunds are available and how to request one.</p>

      <h2>1. Refund Eligibility</h2>
      <h3>1.1 Full Refund</h3>
      <p>You are eligible for a <strong>full refund</strong> if:</p>
      <ul>
        <li>The tournament is <strong>cancelled by Aether Arena</strong> or the organizer before it begins.</li>
        <li>You were <strong>incorrectly charged</strong> (duplicate payment, wrong amount).</li>
        <li>The tournament <strong>did not start within 30 minutes</strong> of the scheduled start time without communication.</li>
        <li>Technical issues on Aether Arena&apos;s end prevented your participation.</li>
      </ul>

      <h3>1.2 Partial Refund (50%)</h3>
      <p>You may be eligible for a <strong>partial refund</strong> if:</p>
      <ul>
        <li>You request cancellation <strong>more than 2 hours before</strong> the tournament starts.</li>
        <li>You were disconnected due to a server-side issue during the match (partial, based on rounds completed).</li>
      </ul>

      <h3>1.3 No Refund</h3>
      <p>Refunds are <strong>NOT available</strong> if:</p>
      <ul>
        <li>The tournament has already started.</li>
        <li>You request cancellation <strong>less than 2 hours before</strong> the tournament starts.</li>
        <li>You were disqualified for rule violations (cheating, team killing, etc.).</li>
        <li>You failed to join the match room on time.</li>
        <li>You experienced internet connectivity issues on your end.</li>
        <li>Your account was banned at the time of the tournament.</li>
      </ul>

      <h2>2. Free Tournaments</h2>
      <p>Free tournaments (₹0 entry fee) have no refund applicable. However, if the tournament is cancelled, any bonus credits or rewards will still be distributed as applicable.</p>

      <h2>3. Refund Process</h2>
      <ol>
        <li><strong>Submit a Request:</strong> Contact us via Discord or the Contact page with your username, tournament name, and reason for refund.</li>
        <li><strong>Review:</strong> Our team will review your request within <strong>24-48 hours</strong>.</li>
        <li><strong>Decision:</strong> You will be notified of the decision via in-app notification or Discord DM.</li>
        <li><strong>Processing:</strong> Approved refunds will be processed within <strong>5-7 business days</strong> via the original payment method.</li>
      </ol>

      <h2>4. Prize Distribution Issues</h2>
      <p>If you won a prize but did not receive it:</p>
      <ul>
        <li>Report within <strong>7 days</strong> of tournament completion.</li>
        <li>Provide your tournament registration details and payment proof.</li>
        <li>Prizes will be re-issued after verification.</li>
      </ul>

      <h2>5. Affiliate Purchases (Top Up)</h2>
      <p>Purchases made through our Codashop affiliate links are processed by Codashop directly. Aether Arena does not handle these transactions. For refund requests on top-up purchases, contact Codashop support directly.</p>

      <h2>6. Contact</h2>
      <p>For refund requests, contact us on Discord or via our Contact page. Include your username and tournament details for faster processing.</p>
    </LegalPageWrapper>
  );
}

export function ContactView() {
  const { navigate } = useAppStore();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Message sent! We\'ll get back to you soon.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Try Discord instead.');
      }
    } catch {
      toast.error('Failed to send message. Try Discord instead.');
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">📩 Contact Us</h1>
      <p className="text-arena-text-secondary text-sm mb-8">Have a question, issue, or suggestion? We&apos;d love to hear from you.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: MessageSquare, title: 'Discord', desc: 'Join our Discord server for instant support', value: 'Join Server', color: 'text-[#5865F2]', bg: 'bg-[#5865F2]/10' },
          { icon: Mail, title: 'Email', desc: 'For business inquiries only', value: 'support@aetherarena.com', color: 'text-arena-accent', bg: 'bg-arena-accent/10' },
          { icon: Clock, title: 'Response Time', desc: 'We typically reply within', value: '24-48 hours', color: 'text-arena-warning', bg: 'bg-arena-warning/10' },
        ].map(item => (
          <div key={item.title} className="bg-arena-card border border-arena-border rounded-xl p-4 text-center">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3', item.bg)}>
              <item.icon className={cn('w-5 h-5', item.color)} />
            </div>
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-arena-text-muted mb-2">{item.desc}</p>
            <p className={cn('text-xs font-medium', item.color)}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-arena-card border border-arena-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-arena-text-secondary mb-1 block">Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs text-arena-text-secondary mb-1 block">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors" placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <label className="text-xs text-arena-text-secondary mb-1 block">Subject</label>
            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors" placeholder="What's this about?" />
          </div>
          <div>
            <label className="text-xs text-arena-text-secondary mb-1 block">Message *</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors resize-none" placeholder="Tell us what's on your mind..." />
          </div>
          <button type="submit" disabled={sending} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
