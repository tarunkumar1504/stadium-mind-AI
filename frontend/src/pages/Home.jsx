/**
 * @file Home.jsx
 * @description Landing page for StadiumPulse AI.
 *
 * Fully accessible:
 *  - Semantic landmark elements (<main>, <section>, <article>)
 *  - Descriptive aria-labels on all interactive controls
 *  - Decorative SVGs marked aria-hidden
 *  - A single <h1> per page with logical heading hierarchy
 *
 * @module pages/Home
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Navigation,
  Shield,
  Compass,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Feature card data – defined outside the component to avoid re-creation
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    id: 'gemini-concierge',
    icon: Bot,
    title: 'Gemini Concierge Bot',
    description:
      'Resolve restroom search requests, locate specific beverage booths, and read active alerts instantly. Multilingual support and speech feedback overlays out of the box.',
    badge: 'Powered by GenAI',
  },
  {
    id: 'pathfinding',
    icon: Navigation,
    title: 'Least-Congested Pathfinding',
    description:
      'Our Dijkstra routing algorithm recalculates edge distances based on live ticket counter occupancy and gate queues. Bypass heavy spectator sections with single-click routes.',
    badge: 'SVG Live Heatmap',
  },
  {
    id: 'organizer-dispatch',
    icon: Shield,
    title: 'Operational Decision Support',
    description:
      'Organizers access live attendance metrics, toggle gate security rules, receive AI-generated dispatch guidelines with confidence scores, and broadcast stadium evacuations.',
    badge: 'Staff Dispatch Room',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * A single feature highlight card.
 *
 * @param {{ id: string, icon: React.ElementType, title: string, description: string, badge: string }} props
 */
function FeatureCard({ id, icon: Icon, title, description, badge }) {
  return (
    <article
      aria-labelledby={`feature-${id}-title`}
      className="glass-panel p-6 rounded-2xl flex flex-col justify-between glass-card-hover group"
    >
      <div className="space-y-4">
        <div
          className="p-3 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          aria-hidden="true"
        >
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3
          id={`feature-${id}-title`}
          className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors"
        >
          {title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">{description}</p>
      </div>
      <span
        className="text-[10px] text-emerald-400 font-extrabold tracking-wider mt-4 flex items-center gap-0.5 uppercase"
        aria-label={badge}
      >
        {badge} <Zap className="w-3.5 h-3.5" aria-hidden="true" />
      </span>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

/**
 * Home landing page.
 *
 * @returns {React.JSX.Element}
 */
export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main
      className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-24 relative overflow-hidden"
      aria-label="StadiumPulse AI – Home"
    >
      {/* Hero Section */}
      <section
        className="max-w-4xl text-center space-y-6 z-10"
        aria-labelledby="hero-heading"
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-bounce"
          role="note"
          aria-label="Official FIFA World Cup 2026 Tech Entry"
        >
          <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          Official FIFA World Cup 2026 Tech Entry
        </div>

        {/* Primary heading – exactly one h1 per page */}
        <h1
          id="hero-heading"
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-sans"
        >
          Navigate the Pulse of the{' '}
          <br aria-hidden="true" />
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-500 text-transparent bg-clip-text">
            FIFA Stadium Operations
          </span>
        </h1>

        {/* Tagline */}
        <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed font-medium">
          Say goodbye to restroom queues, congested ticket gates, and complex accessibility
          detours. StadiumPulse AI uses live queue metrics and Google Gemini Generative AI
          to guide fans through dynamic route predictions.
        </p>

        {/* Call-to-action buttons */}
        <nav
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
          aria-label="Primary actions"
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                id="cta-dashboard"
                aria-label="Go to Fan Guide dashboard"
                className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 accessible-focus"
              >
                Go to Fan Guide <Compass className="w-4 h-4" aria-hidden="true" />
              </Link>

              {user?.role === 'organizer' && (
                <Link
                  to="/organizer"
                  id="cta-organizer"
                  aria-label="Open Organizer Board"
                  className="px-6 py-3 rounded-xl bg-gray-900 border border-white/10 hover:border-emerald-500/50 hover:bg-gray-800 text-white font-extrabold text-sm transition-all flex items-center gap-1.5 accessible-focus"
                >
                  Organizer Board <Shield className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/register"
                id="cta-register"
                aria-label="Get started by creating a free account"
                className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 accessible-focus"
              >
                Get Started <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                id="cta-signin"
                aria-label="Sign in to your existing account"
                className="px-6 py-3 rounded-xl bg-gray-900 border border-white/10 hover:bg-gray-800 text-gray-300 font-extrabold text-sm transition-all accessible-focus"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>
      </section>

      {/* Feature Grid */}
      <section
        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24 z-10"
        aria-labelledby="features-heading"
      >
        <h2 id="features-heading" className="sr-only">
          Key Features
        </h2>

        {FEATURES.map((feature) => (
          <FeatureCard key={feature.id} {...feature} />
        ))}
      </section>

      {/* Decorative background element – hidden from assistive technology */}
      <div
        className="absolute bottom-[-10%] opacity-5 w-[400px] h-[400px] border-[30px] border-white rounded-full pointer-events-none"
        aria-hidden="true"
      />
    </main>
  );
}
