import React, { useState } from 'react';
import {
 Activity,
 ArrowRight,
 BrainCircuit,
 Building2,
 CheckCircle2,
 Eye,
 EyeOff,
 Lock,
 Mail,
 ShieldCheck,
 SlidersHorizontal,
 Sparkles,
 User,
 UserPlus
} from 'lucide-react';

const ACCOUNTS_KEY = 'finsim_accounts';
const SESSION_KEY = 'finsim_session';

const DEMO_ACCOUNT = {
 name: 'Aarav Mehta',
 business: 'NovaTech Studio',
 email: 'founder@novatech.io',
 password: 'finsim2026'
};

export function loadStoredSession() {
 try {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
 } catch {
  return null;
 }
}

export function saveStoredSession(session) {
 try {
  if (session) {
   localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
   localStorage.removeItem(SESSION_KEY);
  }
 } catch {
  // Ignore storage quota or private-mode restrictions
 }
}

function loadAccounts() {
 try {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return Array.isArray(parsed) ? parsed : [];
 } catch {
  return [];
 }
}

function saveAccounts(accounts) {
 try {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
 } catch {
  // Ignore storage errors
 }
}

export function getInitials(label) {
 const parts = (label || 'NS').trim().split(/\s+/).filter(Boolean);
 if (parts.length === 0) return 'NS';
 if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
 return (parts[0][0] + parts[1][0]).toUpperCase();
}

function PasswordInput({ id, label, value, onChange, placeholder, show, onToggle, autoComplete }) {
 return (
  <div className="auth-field-group">
   <label className="auth-label" htmlFor={id}>{label}</label>
   <div className="auth-input-wrap">
    <Lock size={15} className="auth-input-icon" />
    <input
     id={id}
     type={show ? 'text' : 'password'}
     value={value}
     onChange={onChange}
     placeholder={placeholder}
     autoComplete={autoComplete}
    />
    <button
     type="button"
     className="auth-eye-btn"
     onClick={onToggle}
     aria-label={show ? 'Hide password' : 'Show password'}
    >
     {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
   </div>
  </div>
 );
}

export default function AuthPage({ onAuthenticate }) {
 const [mode, setMode] = useState('login');
 const [name, setName] = useState('');
 const [business, setBusiness] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [remember, setRemember] = useState(true);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [error, setError] = useState('');

 const switchMode = nextMode => {
  setMode(nextMode);
  setError('');
 };

 const fillDemoCredentials = () => {
  setMode('login');
  setEmail(DEMO_ACCOUNT.email);
  setPassword(DEMO_ACCOUNT.password);
  setError('');
 };

 const handleDemoGuest = () => {
  onAuthenticate(
   {
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    business: DEMO_ACCOUNT.business,
    isDemo: true
   },
   true
  );
 };

 const handleSubmit = e => {
  e.preventDefault();
  setError('');

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
   setError('Please enter a valid email address.');
   return;
  }

  if (password.length < 6) {
   setError('Password must be at least 6 characters long.');
   return;
  }

  const accounts = loadAccounts();

  if (mode === 'login') {
   const allAccounts = [DEMO_ACCOUNT, ...accounts];
   const matched = allAccounts.find(
    acc => acc.email.toLowerCase() === normalizedEmail && acc.password === password
   );
   if (!matched) {
    setError('Invalid email or password. Try the demo credentials or sign up for a new account.');
    return;
   }
   onAuthenticate(
    {
     name: matched.name,
     email: matched.email,
     business: matched.business,
     isDemo: matched.email === DEMO_ACCOUNT.email
    },
    remember
   );
   return;
  }

  if (!name.trim()) {
   setError('Please enter your full name.');
   return;
  }
  if (!business.trim()) {
   setError('Please enter your business or workspace name.');
   return;
  }
  if (password !== confirmPassword) {
   setError('Passwords do not match.');
   return;
  }
  if (
   normalizedEmail === DEMO_ACCOUNT.email ||
   accounts.some(acc => acc.email.toLowerCase() === normalizedEmail)
  ) {
   setError('An account with this email already exists. Please log in instead.');
   return;
  }

  const newAccount = {
   name: name.trim(),
   business: business.trim(),
   email: normalizedEmail,
   password
  };
  saveAccounts([...accounts, newAccount]);
  onAuthenticate(
   {
    name: newAccount.name,
    email: newAccount.email,
    business: newAccount.business,
    isDemo: false
   },
   remember
  );
 };

 return (
  <div className="auth-shell">
   <div className="auth-grid">
    <section className="auth-hero">
     <div className="brand auth-brand">
      <div className="brand-icon"><Activity size={19} /></div>
      <div className="brand-copy">
       <b>FinSim <span>AI</span></b>
       <small>FINANCIAL INTELLIGENCE</small>
      </div>
     </div>

     <div className="eyebrow">BUSINESS INTELLIGENCE <span>•</span> SIMULATION PLATFORM</div>
     <h1>Test financial decisions before they hit your cash runway.</h1>
     <p className="auth-lead">
      Model pricing shifts, marketing spend, and hiring plans in a controlled environment—paired
      with a Gemini-powered AI financial advisor.
     </p>

     <div className="auth-features">
      <div className="auth-feature panel">
       <div className="quick-icon purple"><SlidersHorizontal size={16} /></div>
       <div>
        <b>What-if Decision Lab</b>
        <small>Compare projected revenue, expenses, and cash balance side by side.</small>
       </div>
      </div>
      <div className="auth-feature panel">
       <div className="quick-icon blue"><BrainCircuit size={16} /></div>
       <div>
        <b>Context-Aware AI Copilot</b>
        <small>Ask Gemini about margins, burn rate, and next steps using live metrics.</small>
       </div>
      </div>
      <div className="auth-feature panel">
       <div className="quick-icon amber"><ShieldCheck size={16} /></div>
       <div>
        <b>Risk & Resilience Telemetry</b>
        <small>Monitor health score, cash runway, and operating expense ratios.</small>
       </div>
      </div>
     </div>

     <div className="auth-stats panel">
      <div>
       <span>HEALTH SCORE</span>
       <strong>86/100</strong>
      </div>
      <div>
       <span>SAMPLE REVENUE</span>
       <strong>₹4,82,000</strong>
      </div>
      <div>
       <span>AI ADVISOR</span>
       <strong className="good">LIVE</strong>
      </div>
     </div>
    </section>

    <section className="auth-card panel">
     <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
      <button
       type="button"
       role="tab"
       aria-selected={mode === 'login'}
       className={mode === 'login' ? 'active' : ''}
       onClick={() => switchMode('login')}
      >
       Log In
      </button>
      <button
       type="button"
       role="tab"
       aria-selected={mode === 'signup'}
       className={mode === 'signup' ? 'active' : ''}
       onClick={() => switchMode('signup')}
      >
       Sign Up
      </button>
     </div>

     <div className="auth-card-head">
      <h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h2>
      <p>
       {mode === 'login'
        ? 'Sign in to continue to your FinSim AI simulation dashboard.'
        : 'Set up your profile to launch a personalized business simulation.'}
      </p>
     </div>

     {error && (
      <div className="auth-error" role="alert">
       <span>{error}</span>
      </div>
     )}

     <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {mode === 'signup' && (
       <>
        <div className="auth-field-group">
         <label className="auth-label" htmlFor="auth-name">Full name</label>
         <div className="auth-input-wrap">
          <User size={15} className="auth-input-icon" />
          <input
           id="auth-name"
           type="text"
           value={name}
           onChange={e => setName(e.target.value)}
           placeholder="Aarav Mehta"
           autoComplete="name"
          />
         </div>
        </div>

        <div className="auth-field-group">
         <label className="auth-label" htmlFor="auth-business">Business name</label>
         <div className="auth-input-wrap">
          <Building2 size={15} className="auth-input-icon" />
          <input
           id="auth-business"
           type="text"
           value={business}
           onChange={e => setBusiness(e.target.value)}
           placeholder="NovaTech Studio"
           autoComplete="organization"
          />
         </div>
        </div>
       </>
      )}

      <div className="auth-field-group">
       <label className="auth-label" htmlFor="auth-email">Work email</label>
       <div className="auth-input-wrap">
        <Mail size={15} className="auth-input-icon" />
        <input
         id="auth-email"
         type="email"
         value={email}
         onChange={e => setEmail(e.target.value)}
         placeholder="founder@novatech.io"
         autoComplete="email"
        />
       </div>
      </div>

      <PasswordInput
       id="auth-password"
       label="Password"
       value={password}
       onChange={e => setPassword(e.target.value)}
       placeholder={mode === 'login' ? 'Enter your password' : 'Minimum 6 characters'}
       show={showPassword}
       onToggle={() => setShowPassword(s => !s)}
       autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />

      {mode === 'signup' && (
       <PasswordInput
        id="auth-confirm"
        label="Confirm password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your password"
        show={showConfirm}
        onToggle={() => setShowConfirm(s => !s)}
        autoComplete="new-password"
       />
      )}

      <div className="auth-options">
       <label className="auth-check">
        <input
         type="checkbox"
         checked={remember}
         onChange={e => setRemember(e.target.checked)}
        />
        <span>Keep me signed in</span>
       </label>
       {mode === 'login' && (
        <button type="button" className="text-action" onClick={fillDemoCredentials}>
         Use demo login
        </button>
       )}
      </div>

      <button type="submit" className="primary auth-submit">
       {mode === 'login' ? (
        <>
         Log In to Workspace <ArrowRight size={15} />
        </>
       ) : (
        <>
         <UserPlus size={15} /> Create Account
        </>
       )}
      </button>
     </form>

     {mode === 'login' && (
      <div className="auth-demo-hint">
       <CheckCircle2 size={14} />
       <span>
        Demo account: <b>{DEMO_ACCOUNT.email}</b> / <b>{DEMO_ACCOUNT.password}</b>
       </span>
      </div>
     )}

     <div className="auth-divider"><span>OR</span></div>

     <button type="button" className="secondary auth-guest" onClick={handleDemoGuest}>
      <Sparkles size={14} /> Continue with Demo Workspace
     </button>

     <p className="auth-switch">
      {mode === 'login' ? (
       <>
        New to FinSim AI?{' '}
        <button type="button" onClick={() => switchMode('signup')}>Create an account</button>
       </>
      ) : (
       <>
        Already have an account?{' '}
        <button type="button" onClick={() => switchMode('login')}>Log in</button>
       </>
      )}
     </p>
    </section>
   </div>
  </div>
 );
}
