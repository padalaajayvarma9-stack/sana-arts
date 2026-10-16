import React, { useState } from 'react';
import { 
  FileCheck, 
  ArrowLeft, 
  ShieldCheck, 
  Scale, 
  UserCheck, 
  Sparkles, 
  AlertTriangle, 
  Lock, 
  Share2, 
  Printer, 
  CheckCircle2, 
  ChevronRight, 
  Globe, 
  Mail, 
  HelpCircle,
  Palette,
  MessageSquare
} from 'lucide-react';

interface TermsOfServicePageProps {
  onNavigate?: (tab: string) => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigate }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('acceptance');

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '/terms-of-service');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'acceptance', title: '1. Acceptance & Eligibility' },
    { id: 'accounts-auth', title: '2. Accounts & Social Authentication' },
    { id: 'marketplace-role', title: '3. Marketplace Role & Scope' },
    { id: 'artist-warranties', title: '4. Artist Uploads & Originality' },
    { id: 'collector-terms', title: '5. Collector Terms & Pricing' },
    { id: 'messaging-conduct', title: '6. Direct Messaging & Conduct' },
    { id: 'intellectual-property', title: '7. Intellectual Property & DMCA' },
    { id: 'prohibited-activities', title: '8. Prohibited Platform Use' },
    { id: 'moderation-termination', title: '9. Moderation & Termination' },
    { id: 'disclaimers', title: '10. Warranty Disclaimers' },
    { id: 'liability', title: '11. Limitation of Liability' },
    { id: 'governing-law', title: '12. Governing Law & Jurisdiction' },
    { id: 'modifications', title: '13. Changes to Terms' },
    { id: 'contact-info', title: '14. Legal Contact Information' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 font-sans text-white select-text">
      
      {/* TOP NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <button
          onClick={() => onNavigate ? onNavigate('Home') : (window.location.href = '/')}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>RETURN TO SANA ARTS</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate ? onNavigate('PrivacyPolicy') : (window.location.href = '/privacy-policy')}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all cursor-pointer"
          >
            Privacy Policy
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
            title="Copy Public Link"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share URL'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#161616] via-[#0c0c0c] to-[#050505] border border-white/10 p-6 sm:p-10 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C85A32]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#C85A32]/20 text-[#E07A5F] border border-[#C85A32]/30 mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Marketplace Terms of Service &bull; Legal Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-wide text-white uppercase mb-3">
            Terms of Service
          </h1>
          
          <p className="text-sm sm:text-base text-white/60 max-w-2xl font-light leading-relaxed mb-6">
            Please read these Terms of Service carefully before accessing or using Sana Arts. These terms set forth the legally binding terms and conditions for your use of our art marketplace, creator exhibition platform, and customer-artist direct messaging services.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-white/40 pt-4 border-t border-white/10">
            <div>
              <span className="text-white/60">Effective Date:</span> October 16, 2026
            </div>
            <div>&bull;</div>
            <div>
              <span className="text-white/60">Last Updated:</span> October 16, 2026
            </div>
            <div>&bull;</div>
            <div>
              <span className="text-white/60">Official URL:</span>{' '}
              <a href="https://sana-arts.vercel.app/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                https://sana-arts.vercel.app/terms-of-service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT WITH QUICK JUMP NAV */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TABLE OF CONTENTS SIDEBAR (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-28 rounded-2xl bg-[#0c0c0c]/80 border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-xs font-mono uppercase tracking-widest text-white/50">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Terms Outline</span>
          </div>

          <nav className="space-y-1 text-xs">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between text-xs ${
                  activeSection === sec.id
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
                }`}
              >
                <span className="truncate">{sec.title}</span>
                <ChevronRight className={`w-3 h-3 shrink-0 ${activeSection === sec.id ? 'text-amber-400' : 'text-white/20'}`} />
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/20 p-3 text-[11px] text-[#E07A5F] leading-relaxed">
              <span className="font-semibold block mb-1">Artists & Sellers:</span>
              See Section 4 regarding original artwork ownership, licensing, and authenticity warranties.
            </div>
          </div>
        </aside>

        {/* TERMS ARTICLES (Mobile & Desktop) */}
        <div className="lg:col-span-8 space-y-10 text-white/80 leading-relaxed font-light">

          {/* 1. ACCEPTANCE & ELIGIBILITY */}
          <section id="acceptance" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Globe className="w-4 h-4" />
              <span>Section 01</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              1. Acceptance of Terms & Eligibility
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                By accessing, browsing, creating an account, or transacting on <strong>Sana Arts</strong> (available at{' '}
                <a href="https://sana-arts.vercel.app" className="text-amber-300 underline underline-offset-4">
                  https://sana-arts.vercel.app
                </a>), you enter into a legally binding agreement with Sana Arts and agree to comply with and be bound by these Terms of Service ("Terms") and our incorporated{' '}
                <button 
                  onClick={() => onNavigate ? onNavigate('PrivacyPolicy') : (window.location.href = '/privacy-policy')}
                  className="text-amber-300 underline underline-offset-4 cursor-pointer"
                >
                  Privacy Policy
                </button>.
              </p>
              <p>
                <strong>Eligibility:</strong> You must be at least 18 years of age, or the age of legal majority in your jurisdiction, to create an account, upload artworks, or initiate purchases. If you are at least 13 years old but under the age of majority, you may only use Sana Arts with the active supervision and prior consent of a parent or legal guardian who agrees to be bound by these Terms.
              </p>
            </div>
          </section>

          {/* 2. ACCOUNTS & SOCIAL AUTHENTICATION */}
          <section id="accounts-auth" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <UserCheck className="w-4 h-4" />
              <span>Section 02</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              2. Account Registration, Supabase & Social Authentication
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                To utilize advanced features of Sana Arts—including uploading artwork, creating a public studio profile, following artists, and participating in direct messaging—you must register an account.
              </p>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <span className="font-semibold text-white text-sm block">Account Security & Credentials</span>
                <p className="text-white/70 leading-relaxed">
                  User authentication and password encryption are securely managed via Supabase Authentication. You agree to provide accurate, current, and complete registration information, maintain the security of your login credentials, and immediately notify Sana Arts of any unauthorized account access. You are solely responsible for all activities occurring under your account credentials.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/20 space-y-2 text-xs">
                <span className="font-semibold text-blue-300 text-sm block">Social Sign-In (Facebook Login & Google)</span>
                <p className="text-white/80 leading-relaxed">
                  If you register or authenticate via third-party OAuth providers such as <strong>Facebook Login</strong> or <strong>Google Sign-In</strong>, you authorize Sana Arts to receive your approved public profile information and email address in accordance with provider permissions. You remain subject to Meta's Terms of Service and Community Standards when authenticating through Facebook.
                </p>
              </div>
            </div>
          </section>

          {/* 3. MARKETPLACE ROLE */}
          <section id="marketplace-role" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Palette className="w-4 h-4" />
              <span>Section 03</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              3. Nature of Marketplace & Sana Arts' Role
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                Sana Arts is an online creative marketplace and digital gallery venue. We provide the technical platform, gallery showcases, and communication tools that allow artists ("Sellers" or "Creators") to exhibit original handmade drawings, sketches, paintings, and digital artworks, and allow art patrons ("Buyers" or "Collectors") to discover, inquire about, and negotiate artwork acquisitions.
              </p>
              <p className="text-xs text-white/70">
                Except for specific branded collections curated directly by the Sana Arts founders, Sana Arts is not the author, manufacturer, or physical creator of third-party artist uploads. Commission negotiations, shipping logistics, and custom portrait specifications conducted in direct messages are agreements formed directly between the respective artist and buyer.
              </p>
            </div>
          </section>

          {/* 4. ARTIST WARRANTIES & UPLOADS */}
          <section id="artist-warranties" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Section 04</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              4. Artist Rights, Warranties & Artwork Uploads
            </h2>
            <div className="space-y-4 text-sm">
              <p>Artists who upload artworks to Sana Arts agree to the following standards:</p>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <span className="font-semibold text-amber-300 text-sm block">A. Originality & Ownership Warranty</span>
                <p className="text-white/70 leading-relaxed">
                  You represent and warrant that you own or have obtained all necessary intellectual property rights, licenses, and releases to upload, display, and sell each artwork. You warrant that your uploads do not infringe upon, misappropriate, or violate any third-party copyright, trademark, trade secret, moral right, or privacy right. Plagiarism and unauthorized copying are strictly prohibited.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <span className="font-semibold text-amber-300 text-sm block">B. Retention of Copyright & Platform License</span>
                <p className="text-white/70 leading-relaxed">
                  <strong>Artists retain 100% of their copyright and intellectual property rights.</strong> By uploading artwork to Sana Arts, you grant Sana Arts a non-exclusive, worldwide, royalty-free license to host, display, resize, and showcase your artwork images solely for the purpose of operating the marketplace, presenting gallery exhibitions, and featuring your creations on the platform.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <span className="font-semibold text-amber-300 text-sm block">C. Prohibited Artwork Submissions</span>
                <p className="text-white/70 leading-relaxed">
                  Artists must not upload artworks that depict explicit hate speech, non-consensual imagery, unlawful conduct, or defamatory content. Sana Arts reserves the right to remove any artwork listing that violates community standards without prior notice.
                </p>
              </div>
            </div>
          </section>

          {/* 5. COLLECTOR TERMS & PRICING */}
          <section id="collector-terms" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <FileCheck className="w-4 h-4" />
              <span>Section 05</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              5. Collector Terms, Pricing & Custom Commissions
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                <strong>Pricing Display:</strong> All artwork prices, custom commission estimates, and counteroffers on Sana Arts are denominated in <strong>Indian Rupees (INR)</strong> unless explicitly indicated otherwise.
              </p>
              <p>
                <strong>Commission Agreements:</strong> When a collector requests a custom drawing (such as a realistic pencil portrait or wedding mandala), the agreed-upon price, delivery timeline, and specifications established in the chat negotiation constitute the agreed terms between that collector and artist.
              </p>
              <p className="text-xs text-white/70">
                Collectors agree to provide accurate physical delivery addresses and honor agreed commission commitments. Any physical shipping arrangements, insurance, and packaging standards are to be coordinated directly between the seller and buyer.
              </p>
            </div>
          </section>

          {/* 6. DIRECT MESSAGING & CONDUCT */}
          <section id="messaging-conduct" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Section 06</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              6. Direct Messaging & Community Guidelines
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                Our Instagram-style direct messaging section is provided to facilitate legitimate art negotiations, collector inquiries, and creative commissions. Users agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-white/70">
                <li>Send harassing, abusive, threatening, vulgar, or intimidating messages to any artist or collector.</li>
                <li>Distribute unsolicited commercial advertising, spam, chain letters, or pyramid promotional schemes.</li>
                <li>Impersonate another artist, gallery, or individual, or misrepresent an affiliation with Sana Arts.</li>
                <li>Attempt to transmit malicious links, phishing attempts, or fraudulent off-platform payment schemes.</li>
              </ul>
              <p className="text-xs text-white/60 pt-2">
                Violations of messaging conduct may result in immediate chat restrictions, listing removal, or permanent account termination.
              </p>
            </div>
          </section>

          {/* 7. INTELLECTUAL PROPERTY & DMCA */}
          <section id="intellectual-property" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Section 07</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              7. Intellectual Property & Copyright Infringement Notices
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                <strong>Sana Arts Property:</strong> The Sana Arts name, logo, 3D WebGL interactive models, website source code, UI designs, and graphic assets are the proprietary intellectual property of Sana Arts and are protected by applicable copyright, trademark, and trade dress laws.
              </p>
              <p>
                <strong>Copyright Infringement Notice (DMCA / Indian Copyright Act):</strong> Sana Arts respects the intellectual property rights of creators and expects its users to do the same. If you are a copyright owner or authorized representative and believe that an artwork listing on Sana Arts infringes your copyright, please submit an infringement notice to our designated contact:
              </p>
              <div className="p-4 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white/80 space-y-1">
                <div><span className="text-white/40">Designated Agent:</span> Copyright Compliance / Sana Arts</div>
                <div><span className="text-white/40">Email:</span> <span className="text-amber-300 font-semibold">[support@sanaarts.com / Contact Email]</span></div>
                <div><span className="text-white/40">Subject:</span> "Notice of Copyright Infringement - [Artwork Name]"</div>
              </div>
              <p className="text-xs text-white/60">
                Your notice must identify the copyrighted work claimed to have been infringed, the specific URL or artwork identifier on Sana Arts, your contact information, and a statement made under penalty of perjury that you are the lawful copyright holder or authorized representative.
              </p>
            </div>
          </section>

          {/* 8. PROHIBITED PLATFORM USE */}
          <section id="prohibited-activities" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Section 08</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              8. Prohibited Platform Use & Technical Restrictions
            </h2>
            <div className="space-y-3 text-sm">
              <p>You agree that you will not:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-white/70">
                <li>Deploy automated bots, scrapers, spiders, or crawlers to harvest artwork images or user directory data without our explicit prior written consent.</li>
                <li>Attempt to bypass, test, or circumvent security controls, authentication mechanisms, or database Row Level Security policies.</li>
                <li>Interfere with or disrupt the operation of Sana Arts, hosting servers (Vercel), or cloud database infrastructure (Supabase).</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Sana Arts frontend or backend software.</li>
              </ul>
            </div>
          </section>

          {/* 9. MODERATION & TERMINATION */}
          <section id="moderation-termination" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Scale className="w-4 h-4" />
              <span>Section 09</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              9. Content Moderation & Account Suspension / Termination
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                <strong>Termination by You:</strong> You may terminate your account at any time by requesting account deletion in accordance with our Privacy Policy.
              </p>
              <p>
                <strong>Termination by Sana Arts:</strong> We reserve the right, in our sole discretion, to suspend or terminate your account, remove any uploaded artwork listings, or restrict your platform access if you violate these Terms, infringe upon third-party intellectual property, engage in abusive conduct, or pose a security risk to the marketplace.
              </p>
            </div>
          </section>

          {/* 10. DISCLAIMERS */}
          <section id="disclaimers" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Lock className="w-4 h-4" />
              <span>Section 10</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              10. Warranty Disclaimers
            </h2>
            <div className="space-y-3.5 text-sm">
              <p className="uppercase text-xs font-mono tracking-wider text-amber-300/90">
                Disclaimer of Warranties
              </p>
              <p className="text-xs text-white/70 leading-relaxed">
                THE SANA ARTS PLATFORM, ITS CONTENT, ARTWORK LISTINGS, AND ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, SANA ARTS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. SANA ARTS DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
              </p>
            </div>
          </section>

          {/* 11. LIMITATION OF LIABILITY */}
          <section id="liability" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Scale className="w-4 h-4" />
              <span>Section 11</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              11. Limitation of Liability
            </h2>
            <div className="space-y-3.5 text-sm">
              <p className="text-xs text-white/70 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SANA ARTS, ITS FOUNDERS (M. PRASANNA, AJAY VARMA), EMPLOYEES, PARTNERS, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE SERVICE, UNAUTHORIZED ACCESS TO YOUR ACCOUNT, OR ANY CONDUCT OF ANY THIRD PARTY ON THE MARKETPLACE.
              </p>
            </div>
          </section>

          {/* 12. GOVERNING LAW & JURISDICTION */}
          <section id="governing-law" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Globe className="w-4 h-4" />
              <span>Section 12</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              12. Governing Law & Dispute Resolution
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                These Terms of Service and any separate agreements whereby we provide services shall be governed by and construed in accordance with the laws of <strong>India</strong>, without regard to its conflict of law principles.
              </p>
              <p className="text-xs text-white/70">
                You agree that any legal action, dispute, or proceeding arising out of or relating to these Terms or your use of Sana Arts shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>Hyderabad, Telangana, India</strong>.
              </p>
            </div>
          </section>

          {/* 13. CHANGES TO TERMS */}
          <section id="modifications" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <FileCheck className="w-4 h-4" />
              <span>Section 13</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              13. Changes to These Terms
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. The updated date at the top of this document will reflect the most recent revisions.
              </p>
              <p className="text-xs text-white/70">
                For material changes that affect your legal rights, we will provide prominent notice on our website or through an in-app banner prior to the changes taking effect. Your continued use of or access to Sana Arts following the posting of any revisions constitutes acceptance of those changes.
              </p>
            </div>
          </section>

          {/* 14. CONTACT INFORMATION & LEGAL ENTITY */}
          <section id="contact-info" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Mail className="w-4 h-4" />
              <span>Section 14</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              14. Legal Contact Information
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                If you have questions, inquiries, or notices regarding these Terms of Service, please reach out to our team:
              </p>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs font-mono text-white/80">
                <div>
                  <span className="text-white/40">Platform:</span> <strong className="text-white">Sana Arts Digital Marketplace</strong>
                </div>
                <div>
                  <span className="text-white/40">Founders:</span> M. Prasanna (Founder) &bull; Ajay Varma (Co-Founder)
                </div>
                <div>
                  <span className="text-white/40">Support & Legal Email:</span>{' '}
                  <span className="text-amber-300 font-semibold">[support@sanaarts.com / Contact Email]</span>
                </div>
                <div>
                  <span className="text-white/40">Legal Entity:</span>{' '}
                  <span className="text-amber-300 font-semibold">[Sana Arts / Registered Business Entity Name]</span>
                </div>
                <div>
                  <span className="text-white/40">Registered Location:</span>{' '}
                  <span className="text-amber-300 font-semibold">[Hyderabad, Telangana, India / Registered Address]</span>
                </div>
                <div>
                  <span className="text-white/40">Terms URL:</span>{' '}
                  <a href="https://sana-arts.vercel.app/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    https://sana-arts.vercel.app/terms-of-service
                  </a>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate ? onNavigate('Home') : (window.location.href = '/')}
                  className="px-6 py-2.5 bg-[#C85A32] hover:bg-[#B34D27] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Return to Marketplace
                </button>
                <button
                  onClick={() => onNavigate ? onNavigate('PrivacyPolicy') : (window.location.href = '/privacy-policy')}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  View Privacy Policy
                </button>
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* FOOTER NOTE */}
      <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs font-mono text-white/30">
        &copy; 2026 SANA ARTS. ALL RIGHTS RESERVED. TERMS OF SERVICE GOVERNED UNDER THE LAWS OF INDIA.
      </div>

    </div>
  );
};
