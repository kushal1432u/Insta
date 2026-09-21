'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  User, CreditCard, Bell, Users, Shield, Globe,
  ChevronRight, Check, Info, Edit2, Lock, Mail,
  Phone, Building2, MapPin, Clock, DollarSign,
  ToggleLeft, ToggleRight, AlertCircle, Plus,
  Trash2, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const SETTINGS_NAV = [
  { id: 'account', label: 'Ad Account Settings', icon: User },
  { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

// ── Small reusable pieces ─────────────────────────────────────────────────────
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[17px] font-bold text-[#1C1E21]">{title}</h2>
      {description && <p className="text-[13px] text-[#65676B] mt-0.5">{description}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  editable = false,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  editable?: boolean;
  type?: string;
  hint?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div className="flex items-start justify-between py-4 border-b border-[#DADDE1] last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-[#65676B] uppercase tracking-wide mb-1">{label}</div>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              autoFocus
              type={type}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="border border-[#0064E0] rounded-md px-3 py-1.5 text-[13px] text-[#1C1E21] focus:outline-none w-72"
            />
            <button
              onClick={() => setEditing(false)}
              className="text-[13px] font-semibold text-white bg-[#0064E0] px-3 py-1.5 rounded-md hover:bg-[#0052C2] transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setVal(value); setEditing(false); }}
              className="text-[13px] text-[#65676B] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-[14px] text-[#1C1E21] font-medium mt-0.5">{val}</div>
        )}
        {hint && !editing && <div className="text-[12px] text-[#65676B] mt-0.5">{hint}</div>}
      </div>
      {editable && !editing && (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-[13px] font-semibold text-[#0064E0] hover:bg-[#E7F3FF] px-2.5 py-1 rounded-md transition-colors opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="h-3.5 w-3.5" /> Edit
        </button>
      )}
    </div>
  );
}

function Toggle({ label, description, defaultOn = false }: { label: string; description?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#DADDE1] last:border-0">
      <div>
        <div className="text-[13px] font-semibold text-[#1C1E21]">{label}</div>
        {description && <div className="text-[12px] text-[#65676B] mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0', on ? 'bg-[#0064E0]' : 'bg-[#DADDE1]')}
        aria-label={label}
      >
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform', on ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden mb-4">
      {children}
    </div>
  );
}

function PanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#DADDE1]">
      <h3 className="text-[14px] font-bold text-[#1C1E21]">{title}</h3>
      {action}
    </div>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────

function AccountSection({ user }: { user: any }) {
  return (
    <div>
      <SectionHeader
        title="Ad Account Settings"
        description="Manage your ad account information, currency, and time zone."
      />

      <Panel>
        <PanelHeader title="Account Information" />
        <div className="px-6">
          {/* Instagram page identity block — exactly as Meta shows */}
          <div className="flex items-center gap-3 py-4 border-b border-[#DADDE1]">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 relative"
              style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
            >
              PDA
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                  <defs>
                    <linearGradient id="igGradSetting" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="50%" stopColor="#dc2743"/>
                      <stop offset="100%" stopColor="#bc1888"/>
                    </linearGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#igGradSetting)"/>
                  <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none"/>
                  <circle cx="17" cy="7" r="1.3" fill="white"/>
                </svg>
              </div>
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#1C1E21]">Puri District Administration</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] text-[#65676B]">@puridistrictadmin</span>
                <span className="text-[#DADDE1]">·</span>
                <span className="text-[12px] text-[#65676B]">19K followers</span>
              </div>
              <a
                href="https://www.instagram.com/puridistrictadmin/"
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-[#0064E0] hover:underline font-medium mt-0.5 inline-block"
              >
                View on Instagram ↗
              </a>
            </div>
          </div>
          <Field label="Account Name" value="Puri District Administration" editable />
          <Field label="Account ID" value="Act #1234567890" />
          <Field label="Account Status" value="Active" hint="Your account is in good standing." />
          <Field label="Account Type" value="Instagram Business" />
          <Field label="Connected Page" value="@puridistrictadmin · Instagram" />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Currency & Time Zone" />
        <div className="px-6">
          <Field label="Currency" value="Indian Rupee (₹ INR)" hint="Currency cannot be changed after account creation." />
          <Field label="Time Zone" value="Asia/Kolkata (IST, UTC+5:30)" editable />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Ad Account Spending Limit" />
        <div className="px-6">
          <Field label="Spending Limit" value="No limit set" editable hint="Set a maximum amount you want to spend across all campaigns." />
        </div>
        <div className="px-6 py-4 bg-[#F8F9FA]">
          <div className="flex items-start gap-2 text-[12px] text-[#65676B]">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Your ad account will pause when it reaches the spending limit. You can update or remove the limit at any time.</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function BillingSection() {
  const methods = [
    { type: 'UPI', detail: 'taraibabu@ybl', primary: true },
  ];

  return (
    <div>
      <SectionHeader
        title="Billing & Payments"
        description="Manage your payment methods and view billing activity."
      />

      <Panel>
        <PanelHeader
          title="Payment Methods"
          action={
            <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0064E0] hover:bg-[#E7F3FF] px-3 py-1.5 rounded-md transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add payment method
            </button>
          }
        />
        <div className="divide-y divide-[#DADDE1]">
          {methods.map((m, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[#F8F9FA] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#E7F3FF] flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-[#0064E0]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#1C1E21]">{m.type}</span>
                    {m.primary && (
                      <span className="text-[11px] font-semibold bg-[#E7F3FF] text-[#0064E0] px-1.5 py-0.5 rounded">Primary</span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#65676B] mt-0.5">{m.detail}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[12px] text-[#0064E0] font-semibold hover:underline">Edit</button>
                <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#F0F2F5] text-[#65676B] transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Billing Threshold" />
        <div className="px-6">
          <Field label="Current Threshold" value="₹1,000" editable hint="Your account is charged when spending reaches this amount." />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Billing Activity" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#DADDE1] bg-[#F8F9FA]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#65676B]">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#65676B]">Description</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#65676B]">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#65676B]">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Sep 21, 2026', desc: 'Ad charges — Instagram Reels', amount: '₹3.00', status: 'Paid' },
                { date: 'Sep 20, 2026', desc: 'Ad charges — Instagram Reels', amount: '₹3.00', status: 'Paid' },
                { date: 'Sep 19, 2026', desc: 'Ad charges — Instagram Reels', amount: '₹3.00', status: 'Paid' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#DADDE1] hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-3 text-[13px] text-[#65676B]">{row.date}</td>
                  <td className="px-6 py-3 text-[13px] text-[#1C1E21]">{row.desc}</td>
                  <td className="px-6 py-3 text-right text-[13px] font-semibold text-[#1C1E21]">{row.amount}</td>
                  <td className="px-6 py-3">
                    <span className="text-[11px] font-semibold text-[#2DA44E] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-[#DADDE1]">
          <button className="flex items-center gap-1 text-[13px] text-[#0064E0] font-semibold hover:underline">
            View all billing activity <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </Panel>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div>
      <SectionHeader
        title="Notifications"
        description="Choose when and how you receive notifications about your ads."
      />

      <Panel>
        <PanelHeader title="Email Notifications" />
        <div className="px-6">
          <Toggle label="Ad performance alerts" description="Get notified when your ads need attention." defaultOn />
          <Toggle label="Billing notifications" description="Receive invoices and payment receipts." defaultOn />
          <Toggle label="New features & tips" description="Hear about new features and advertising tips from Meta." defaultOn={false} />
          <Toggle label="Ad approval updates" description="Get notified when your ads are reviewed." defaultOn />
          <Toggle label="Weekly summary" description="Receive a weekly report of your ad performance." defaultOn={false} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="In-App Notifications" />
        <div className="px-6">
          <Toggle label="Campaign budget alerts" description="Get notified when a campaign budget is nearly spent." defaultOn />
          <Toggle label="Low account balance" description="Get notified when your prepaid balance is low." defaultOn />
          <Toggle label="Policy violations" description="Get notified when an ad violates a Meta policy." defaultOn />
        </div>
      </Panel>
    </div>
  );
}

function UsersSection({ user, isAdmin }: { user: any; isAdmin: boolean }) {
  const people = [
    { name: user?.full_name || 'Account Owner', email: user?.email || 'admin@example.com', role: 'Admin', you: true },
    { name: 'Ravi Kumar', email: 'ravi@example.com', role: 'Analyst', you: false },
  ];

  return (
    <div>
      <SectionHeader
        title="Users & Roles"
        description="Manage who has access to this ad account and what they can do."
      />

      <Panel>
        <PanelHeader
          title="People with Account Access"
          action={
            isAdmin ? (
              <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0064E0] hover:bg-[#E7F3FF] px-3 py-1.5 rounded-md transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add people
              </button>
            ) : null
          }
        />
        <div className="divide-y divide-[#DADDE1]">
          {people.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[#F8F9FA] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#0064E0] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {p.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#1C1E21]">{p.name}</span>
                    {p.you && <span className="text-[11px] text-[#65676B] bg-[#F0F2F5] px-1.5 py-0.5 rounded">You</span>}
                  </div>
                  <div className="text-[12px] text-[#65676B] mt-0.5">{p.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                  p.role === 'Admin' ? 'bg-[#E7F3FF] text-[#0064E0]' : 'bg-[#F0F2F5] text-[#65676B]'
                )}>
                  {p.role}
                </span>
                {isAdmin && !p.you && (
                  <button className="text-[12px] text-[#FA3E3E] font-semibold hover:underline">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Role Permissions" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#DADDE1] bg-[#F8F9FA]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#65676B]">Permission</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#65676B]">Admin</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#65676B]">Analyst</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#65676B]">Advertiser</th>
              </tr>
            </thead>
            <tbody>
              {[
                { perm: 'View performance', admin: true, analyst: true, advertiser: true },
                { perm: 'Create & edit ads', admin: true, analyst: false, advertiser: true },
                { perm: 'Manage billing', admin: true, analyst: false, advertiser: false },
                { perm: 'Manage users', admin: true, analyst: false, advertiser: false },
                { perm: 'Edit account settings', admin: true, analyst: false, advertiser: false },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#DADDE1] hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-3 text-[13px] text-[#1C1E21]">{row.perm}</td>
                  {[row.admin, row.analyst, row.advertiser].map((has, j) => (
                    <td key={j} className="px-4 py-3 text-center">
                      {has ? (
                        <Check className="h-4 w-4 text-[#2DA44E] mx-auto" />
                      ) : (
                        <span className="text-[#DADDE1] text-lg leading-none">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function BusinessSection() {
  return (
    <div>
      <SectionHeader
        title="Business Info"
        description="This information is used for billing and ad transparency."
      />

      <Panel>
        <PanelHeader title="Business Details" />
        <div className="px-6">
          <Field label="Business Name" value="Puri District Administration" editable />
          <Field label="Business Category" value="Government & Politics" editable />
          <Field label="Instagram Handle" value="@puridistrictadmin" hint="19K Followers · 964 Posts" />
          <Field label="Website" value="https://www.instagram.com/puridistrictadmin/" editable />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Business Address" />
        <div className="px-6">
          <Field label="Country" value="India" />
          <Field label="Address Line 1" value="Collectorate, Station Road" editable />
          <Field label="City" value="Puri" editable />
          <Field label="State" value="Odisha" editable />
          <Field label="PIN Code" value="752001" editable />
        </div>
      </Panel>
    </div>
  );
}

function PrivacySection() {
  return (
    <div>
      <SectionHeader
        title="Privacy & Security"
        description="Manage your account security and data privacy settings."
      />

      <Panel>
        <PanelHeader title="Account Security" />
        <div className="px-6">
          <Toggle label="Two-factor authentication" description="Add an extra layer of security to your account." defaultOn />
          <Toggle label="Login notifications" description="Get notified when someone logs in to your account." defaultOn />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Data & Privacy" />
        <div className="px-6">
          <Field label="Data Processing" value="Standard (GDPR Compliant)" />
          <Field label="Ad Data Usage" value="Enabled for ad optimization" />
        </div>
        <div className="px-6 py-4 border-t border-[#DADDE1] flex flex-col gap-2">
          <button className="flex items-center gap-1.5 text-[13px] text-[#0064E0] font-semibold hover:underline w-fit">
            <ExternalLink className="h-3.5 w-3.5" /> Download your data
          </button>
          <button className="flex items-center gap-1.5 text-[13px] text-[#FA3E3E] font-semibold hover:underline w-fit">
            <AlertCircle className="h-3.5 w-3.5" /> Request account deletion
          </button>
        </div>
      </Panel>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('account');

  const renderSection = () => {
    switch (activeSection) {
      case 'account': return <AccountSection user={user} />;
      case 'billing': return <BillingSection />;
      case 'notifications': return <NotificationsSection />;
      case 'users': return <UsersSection user={user} isAdmin={isAdmin} />;
      case 'business': return <BusinessSection />;
      case 'privacy': return <PrivacySection />;
      default: return <AccountSection user={user} />;
    }
  };

  return (
    <div className="max-w-[1100px]">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1C1E21]">Settings</h1>
        <p className="text-[13px] text-[#65676B] mt-0.5">
          Manage your ad account, billing, users, and privacy preferences.
        </p>
      </div>

      <div className="flex gap-4 items-start">
        {/* ── Left sidebar nav ── */}
        <nav className="w-[220px] bg-white border border-[#DADDE1] rounded-lg overflow-hidden shrink-0 sticky top-[72px]">
          {SETTINGS_NAV.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-left transition-colors border-l-2',
                  active
                    ? 'bg-[#E7F3FF] text-[#0064E0] border-[#0064E0]'
                    : 'text-[#1C1E21] border-transparent hover:bg-[#F0F2F5]'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#0064E0]' : 'text-[#65676B]')} />
                <span className="truncate">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
