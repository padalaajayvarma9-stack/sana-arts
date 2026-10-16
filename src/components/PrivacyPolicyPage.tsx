import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  UserCheck, 
  Database, 
  Trash2, 
  Eye, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  FileText, 
  Cookie, 
  Sparkles,
  ChevronRight,
  Server,
  Share2,
  Printer
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate?: (tab: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('introduction');

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '/privacy-policy');
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
    { id: 'introduction', title: '1. Introduction & Scope' },
    { id: 'information-collected', title: '2. Information We Collect' },
    { id: 'how-we-use', title: '3. How We Use Information' },
    { id: 'authentication-oauth', title: '4. Authentication & Facebook Login' },
    { id: 'marketplace-features', title: '5. Artwork, Messaging & Profiles' },
    { id: 'storage-processing', title: '6. Storage & Cloud Processing' },
    { id: 'cookies-sessions', title: '7. Cookies & Session Storage' },
    { id: 'data-sharing', title: '8. Data Sharing & Third Parties' },
    { id: 'security-retention', title: '9. Security & Data Retention' },
    { id: 'user-rights', title: '10. Your Privacy Rights' },
    { id: 'data-deletion', title: '11. Data Deletion Instructions (Meta)' },
    { id: 'childrens-privacy', title: '12. Children\'s Privacy' },
    { id: 'policy-changes', title: '13. Changes to This Policy' },
    { id: 'contact-us', title: '14. Contact Information' },
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
            onClick={() => onNavigate ? onNavigate('TermsOfService') : (window.location.href = '/terms-of-service')}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all cursor-pointer"
          >
            Terms of Service
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
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C85A32]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-400/10 text-amber-300 border border-amber-400/25 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Legal Document &bull; Public Transparency</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-wide text-white uppercase mb-3">
            Privacy Policy
          </h1>
          
          <p className="text-sm sm:text-base text-white/60 max-w-2xl font-light leading-relaxed mb-6">
            This Privacy Policy describes how Sana Arts collects, uses, protects, and discloses personal information when you use our online art marketplace, direct messaging services, and artist community exhibition platform.
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
              <span className="text-white/60">Platform URL:</span>{' '}
              <a href="https://sana-arts.vercel.app" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                https://sana-arts.vercel.app
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
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Policy Contents</span>
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
            <div className="rounded-xl bg-amber-400/[0.06] border border-amber-400/20 p-3 text-[11px] text-amber-200/80 leading-relaxed">
              <span className="font-semibold text-amber-300 block mb-1">Need Data Deletion?</span>
              Jump to Section 11 for Facebook Login & Sana Arts automated data deletion steps.
            </div>
          </div>
        </aside>

        {/* POLICY ARTICLES (Mobile & Desktop) */}
        <div className="lg:col-span-8 space-y-10 text-white/80 leading-relaxed font-light">

          {/* 1. INTRODUCTION & SCOPE */}
          <section id="introduction" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Globe className="w-4 h-4" />
              <span>Section 01</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              1. Introduction and Scope
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                Welcome to <strong>Sana Arts</strong> ("we", "us", "our", or the "Platform"). Sana Arts operates a digital art marketplace and artist exhibition platform accessible via{' '}
                <a href="https://sana-arts.vercel.app" className="text-amber-300 underline underline-offset-4">
                  https://sana-arts.vercel.app
                </a>. Our service empowers traditional and digital artists to present portfolios and list handmade artworks for sale, and enables collectors, patrons, and enthusiasts to browse creative collections, create user accounts, follow artists, and engage in direct negotiations and private messaging.
              </p>
              <p>
                This Privacy Policy establishes how we collect, store, handle, and safeguard your personal information when you visit or interact with our website. By accessing or using Sana Arts, you acknowledge that you have read, understood, and agreed to the practices outlined in this policy. If you do not agree with this policy, please refrain from using the platform.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/60">
                <strong className="text-white">Note for Platform Users:</strong> Sana Arts is operated by founders <em>M. Prasanna</em> and <em>Ajay Varma</em>, based in Hyderabad, India. Legal entity details and registered support inquiries can be addressed via the contact information provided in Section 14.
              </div>
            </div>
          </section>

          {/* 2. INFORMATION WE COLLECT */}
          <section id="information-collected" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Database className="w-4 h-4" />
              <span>Section 02</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                We only collect information necessary to operate an art marketplace and ensure secure, reliable communication between artists and collectors. We collect data in the following categories:
              </p>

              {/* Sub-item: Account details */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  A. Account Registration and Profile Information
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  When you register an account, we collect your <strong>full name</strong>, <strong>email address</strong>, chosen <strong>account type</strong> (Artist / Creator or Art Collector), and login credentials. If you set up a public profile, we collect your optional public <strong>bio</strong>, unique <strong>@username</strong> handle, and <strong>profile avatar image URL</strong>.
                </p>
              </div>

              {/* Sub-item: Social OAuth */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  B. Social Login Information (Facebook & Google OAuth)
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  If you choose to authenticate via third-party providers such as <strong>Facebook Login</strong> or <strong>Google Sign-In</strong>, we collect your public profile name, verified email address, profile picture URL, and third-party user ID as authorized through the provider's consent screen. We <strong>never</strong> receive, store, or have access to your Facebook or Google passwords.
                </p>
              </div>

              {/* Sub-item: Artwork Uploads */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  C. Artwork Listings and Exhibition Content
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  When artists upload artwork, we collect artwork image files, titles, descriptions, categories (e.g., Portrait, Mandala, Traditional, AI/Digital), medium, dimensions, and requested selling prices in Indian Rupees (INR).
                </p>
              </div>

              {/* Sub-item: Direct Messages */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  D. Direct Messages and Commission Negotiations
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  When you use our Instagram-style direct messaging section to negotiate pricing, ask about artworks, or request custom portrait sketches, we store message text, participant identifiers, timestamps, and read receipt statuses to deliver synchronized chat history across your devices.
                </p>
              </div>

              {/* Sub-item: Online Presence */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  E. Online Presence & Activity Tracking
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  If you have the <strong>"Show Activity Status"</strong> setting enabled on your profile, our Supabase Realtime channel tracks temporary presence (displaying "Active now" or your last active timestamp). Users can toggle this setting off at any time in their profile.
                </p>
              </div>

              {/* Sub-item: Technical & Log Data */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  F. Technical and Log Data
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  When you browse Sana Arts, our edge delivery network (Vercel) automatically logs standard network requests, including IP address, user-agent browser string, referring URLs, and error logs, used exclusively for security monitoring, DDoS mitigation, and reliability.
                </p>
              </div>
            </div>
          </section>

          {/* 3. HOW WE USE INFORMATION */}
          <section id="how-we-use" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <FileText className="w-4 h-4" />
              <span>Section 03</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              3. How We Use Personal Information
            </h2>
            <div className="space-y-3 text-sm">
              <p>We use collected data solely for the following legitimate business purposes:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-white/70">
                <li><strong className="text-white">Providing Marketplace Services:</strong> To display your artwork catalog, process artist commission proposals, and maintain your account.</li>
                <li><strong className="text-white">Authentication and Security:</strong> To verify your identity, secure sessions, prevent duplicate follows/fraud, and protect against automated abuse.</li>
                <li><strong className="text-white">Facilitating Communication:</strong> To route private direct messages, commission inquiries, and price negotiations between collectors and artists.</li>
                <li><strong className="text-white">Social Connections:</strong> To maintain follower and following relationships, display public counts, and power username-based search.</li>
                <li><strong className="text-white">Customer Support:</strong> To troubleshoot issues, investigate technical bugs, and fulfill data deletion or export requests.</li>
              </ul>
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                <strong>We do not monetize your personal data:</strong> Sana Arts does not sell, rent, or trade your personal details, email addresses, or private messages to data brokers, advertisers, or unaffiliated third parties.
              </div>
            </div>
          </section>

          {/* 4. AUTHENTICATION & FACEBOOK LOGIN */}
          <section id="authentication-oauth" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Lock className="w-4 h-4" />
              <span>Section 04</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              4. Account Registration and Facebook Login
            </h2>
            <div className="space-y-3.5 text-sm">
              <p>
                Sana Arts supports multiple authentication mechanisms: standard email/password registration, password recovery via secure email links, and single sign-on (SSO) through OAuth providers including <strong>Facebook Login</strong> and <strong>Google Sign-In</strong>.
              </p>

              <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.05] p-4 space-y-2 text-xs">
                <span className="font-semibold text-blue-300 block text-sm">Facebook Login Specific Disclosures</span>
                <p className="text-white/80 leading-relaxed">
                  When you choose to sign in to Sana Arts via <strong>Facebook Login</strong>, we request only the minimal permissions required to create and authenticate your account:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li><strong>public_profile:</strong> Used to populate your artist or collector display name and optional profile picture.</li>
                  <li><strong>email:</strong> Used to associate your Sana Arts account with a verified contact email address for account recovery.</li>
                </ul>
                <p className="text-white/80 pt-1">
                  We do not request permissions to post on your Facebook timeline, access your friend list, read private Facebook messages, or access personal media outside the approved public profile scope.
                </p>
              </div>

              <p className="text-xs text-white/70">
                All password hashes for direct registrations are cryptographically salted and managed by Supabase Authentication; Sana Arts engineers and administrators have no means of viewing plaintext passwords.
              </p>
            </div>
          </section>

          {/* 5. ARTWORK LISTINGS, MESSAGING & PROFILES */}
          <section id="marketplace-features" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Section 05</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              5. Artwork Listings, Direct Messages & User Profiles
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                As an art marketplace, Sana Arts maintains a strict boundary between public and private information:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="font-semibold text-amber-300 text-xs uppercase tracking-wider block mb-2">Public Information</span>
                  <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4">
                    <li>Display Name and @username handle</li>
                    <li>Public bio and profile avatar</li>
                    <li>Uploaded artwork images and prices</li>
                    <li>Public follower and following counts</li>
                    <li>Online status (if enabled in settings)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="font-semibold text-rose-300 text-xs uppercase tracking-wider block mb-2">Private Information</span>
                  <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4">
                    <li>Email address</li>
                    <li>Password hashes</li>
                    <li>Direct chat conversations & negotiations</li>
                    <li>Commission payment specifics</li>
                    <li>Internal user IDs & session tokens</li>
                  </ul>
                </div>
              </div>

              <p className="text-xs text-white/70">
                Direct messages between users are protected by database Row Level Security policies: only the two conversation participants have authorization to query or read conversation transcripts.
              </p>
            </div>
          </section>

          {/* 6. STORAGE & PROCESSING */}
          <section id="storage-processing" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Server className="w-4 h-4" />
              <span>Section 06</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              6. Data Storage and Cloud Processing
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                Sana Arts utilizes trusted enterprise cloud infrastructure providers to securely host, process, and deliver platform content:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-white/70">
                <li>
                  <strong className="text-white">Supabase (PostgreSQL & Storage):</strong> User profiles, follow relationships, messages, and metadata are stored in our dedicated Supabase PostgreSQL database located in secure cloud data centers. Uploaded artwork images are stored in Supabase Storage buckets.
                </li>
                <li>
                  <strong className="text-white">Vercel Inc. (Hosting & Edge Delivery):</strong> The web frontend is hosted on Vercel's global Content Delivery Network (CDN), providing low-latency delivery and TLS encryption.
                </li>
              </ul>
              <p className="text-xs text-white/60">
                All database communication is encrypted using Transport Layer Security (TLS 1.3). Database access is constrained by automated Row Level Security (RLS) policies.
              </p>
            </div>
          </section>

          {/* 7. COOKIES & SESSIONS */}
          <section id="cookies-sessions" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Cookie className="w-4 h-4" />
              <span>Section 07</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              7. Cookies, Local Storage & Session Technologies
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                Sana Arts uses essential local browser storage and session cookies strictly necessary to enable authentication and core marketplace features:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-white/70">
                <li><strong className="text-white">Authentication Tokens:</strong> Secure JWT session keys stored in browser <code>localStorage</code> by Supabase to maintain your login status across page visits.</li>
                <li><strong className="text-white">Navigation Session Keys:</strong> Temporary browser <code>sessionStorage</code> keys (e.g., <code>sana_was_reloaded</code>, <code>sana_chat_target_id</code>) used to maintain navigation state and route users smoothly between artworks and chat.</li>
              </ul>
              <p className="text-xs text-white/60 pt-1">
                We do not deploy third-party advertising cookies, cross-site trackers, or behavioral profiling scripts.
              </p>
            </div>
          </section>

          {/* 8. DATA SHARING */}
          <section id="data-sharing" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Share2 className="w-4 h-4" />
              <span>Section 08</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              8. Data Sharing and Third-Party Services
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                We only share personal information under strict, limited circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-white/70">
                <li><strong className="text-white">With Service Providers:</strong> Technical cloud vendors (Supabase, Vercel) that process data exclusively on our behalf under strict confidentiality.</li>
                <li><strong className="text-white">With Other Users:</strong> When you publish artworks, send direct messages, or follow an artist, those actions are transmitted to the intended recipient or public showcase.</li>
                <li><strong className="text-white">Legal Obligations:</strong> If required by valid court order, subpoena, or applicable law to protect the safety, rights, or property of Sana Arts, its users, or the public.</li>
              </ul>
            </div>
          </section>

          {/* 9. SECURITY & RETENTION */}
          <section id="security-retention" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Lock className="w-4 h-4" />
              <span>Section 09</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              9. Data Security and Retention
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                We implement robust technical and organizational safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-white/70">
                <li><strong className="text-white">Encryption:</strong> End-to-end HTTPS/TLS encryption across all web traffic.</li>
                <li><strong className="text-white">Database Row Level Security (RLS):</strong> Cryptographic validation that only authenticated users can update or delete their respective profiles and records.</li>
                <li><strong className="text-white">Retention Period:</strong> We retain account, profile, and messaging data for as long as your account remains active. Upon your explicit request for account deletion, all associated personal data is expunged or anonymized from active databases within 30 days.</li>
              </ul>
            </div>
          </section>

          {/* 10. USER RIGHTS */}
          <section id="user-rights" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <UserCheck className="w-4 h-4" />
              <span>Section 10</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              10. Your Privacy Rights
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                Regardless of your geographic location, Sana Arts grants you the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-white/70">
                <li><strong className="text-white">Right to Access:</strong> You can view your account profile, listed artworks, follow connections, and message history directly in the application.</li>
                <li><strong className="text-white">Right to Rectify:</strong> You can edit and update your full name, bio, handle, and avatar at any time in the Edit Profile modal.</li>
                <li><strong className="text-white">Right to Erasure:</strong> You can request complete deletion of your account and personal data (see Section 11).</li>
                <li><strong className="text-white">Right to Privacy Controls:</strong> You can toggle online presence tracking on or off in your profile settings.</li>
              </ul>
            </div>
          </section>

          {/* 11. DATA DELETION INSTRUCTIONS (META / FACEBOOK COMPLIANCE) */}
          <section id="data-deletion" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#18120c] to-[#0a0a0a] border border-amber-500/30 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Trash2 className="w-4 h-4" />
              <span>Section 11 &bull; Meta / Facebook Compliance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              11. Account Deletion & Data Deletion Instructions
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                In compliance with Meta Platform Developer Policies, the General Data Protection Regulation (GDPR), and international consumer privacy standards, Sana Arts provides a transparent and straightforward mechanism for users to delete their account and associated data.
              </p>

              {/* Method A: In-App / Support Deletion */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  Method 1: Direct Sana Arts Account & Data Deletion
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  You may request the immediate, permanent deletion of your Sana Arts account and all associated profile details, messages, artworks, and follow relationships by sending an email from your registered email address to:
                </p>
                <div className="p-3 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-amber-300">
                  Email: [support@sanaarts.com / Contact Email] &bull; Subject: "Data Deletion Request - [Your Full Name]"
                </div>
                <p className="text-[11px] text-white/50">
                  Please include your registered email address or @username. Our team will verify and execute the deletion within <strong>30 calendar days</strong> and confirm via return email.
                </p>
              </div>

              {/* Method B: Facebook App Settings Data Deletion */}
              <div className="p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/25 space-y-2.5">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  Method 2: Facebook Login User Data Deletion Instructions
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  If you created your account or signed in using <strong>Facebook Login</strong>, you can revoke Sana Arts' access to your Facebook profile data and initiate data removal at any time through your Facebook account settings:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-white/70">
                  <li>Log in to your <strong>Facebook account</strong> on a web browser or mobile app.</li>
                  <li>Navigate to <strong>Settings & Privacy</strong> &rarr; <strong>Settings</strong>.</li>
                  <li>In the left sidebar, click on <strong>Apps and Websites</strong>.</li>
                  <li>Find <strong>Sana Arts</strong> in your active authorized applications list.</li>
                  <li>Click <strong>Remove</strong> to revoke Sana Arts' permissions.</li>
                  <li>Click <strong>View Removed Apps and Websites</strong>, select <strong>Sana Arts</strong>, and click <strong>Send Request</strong> to automatically submit a Meta data deletion request to our server.</li>
                </ol>
                <p className="text-[11px] text-white/50 pt-1">
                  Once we receive the notification or callback, your associated authentication record, social ID mapping, and profile information will be purged from our active Supabase database.
                </p>
              </div>
            </div>
          </section>

          {/* 12. CHILDREN'S PRIVACY */}
          <section id="childrens-privacy" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Section 12</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              12. Children's Privacy
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                Sana Arts is not designed or intended for use by children under the age of 13 (or under 16 in certain jurisdictions). We do not knowingly solicit or collect personal information from children.
              </p>
              <p className="text-xs text-white/70">
                If we discover that a child under 13 has provided personal details without verified parental or legal guardian consent, we will promptly delete such information from our servers. If you believe a minor has registered an account, please alert us at{' '}
                <span className="text-amber-300 font-mono">[support@sanaarts.com / Contact Email]</span>.
              </p>
            </div>
          </section>

          {/* 13. CHANGES TO THIS POLICY */}
          <section id="policy-changes" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <FileText className="w-4 h-4" />
              <span>Section 13</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              13. Changes to This Privacy Policy
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                We may periodically update this Privacy Policy to reflect enhancements in marketplace features, database architecture, or regulatory compliance standards.
              </p>
              <p className="text-xs text-white/70">
                When changes are published, the "Last Updated" date at the top of this document will be revised. For material changes that significantly affect your privacy rights, we will provide prominent notice on our homepage or via an in-app notice prior to the changes taking effect. Continued use of Sana Arts after updates constitutes acceptance of the revised policy.
              </p>
            </div>
          </section>

          {/* 14. CONTACT INFORMATION & LEGAL DISCLOSURES */}
          <section id="contact-us" className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
              <Mail className="w-4 h-4" />
              <span>Section 14</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-white uppercase tracking-wide mb-4">
              14. Contact Information & Legal Entity
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                If you have questions, feedback, or data privacy requests regarding this Privacy Policy or Sana Arts' data practices, please reach out to our team:
              </p>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs font-mono text-white/80">
                <div>
                  <span className="text-white/40">Platform:</span> <strong className="text-white">Sana Arts Digital Marketplace</strong>
                </div>
                <div>
                  <span className="text-white/40">Founders:</span> M. Prasanna (Founder) &bull; Ajay Varma (Co-Founder)
                </div>
                <div>
                  <span className="text-white/40">Support & Privacy Email:</span>{' '}
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
                  <span className="text-white/40">Website:</span>{' '}
                  <a href="https://sana-arts.vercel.app" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    https://sana-arts.vercel.app
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
                  onClick={() => onNavigate ? onNavigate('Gallery') : (window.location.href = '/gallery')}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Explore Art Gallery
                </button>
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* FOOTER NOTE */}
      <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs font-mono text-white/30">
        &copy; 2026 SANA ARTS. ALL RIGHTS RESERVED. SECURED VIA SUPABASE AUTH & POSTGRESQL RLS.
      </div>

    </div>
  );
};
