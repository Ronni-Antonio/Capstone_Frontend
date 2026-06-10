import React, { useState } from 'react';
import {
  SchoolIcon,
  SparklesIcon,
  BellIcon,
  DatabaseIcon,
  DownloadIcon,
  UploadIcon,
  MinusIcon,
  PlusIcon,
  CheckIcon,
} from 'lucide-react';

export function Settings() {
  const [conversion, setConversion] = useState(5);
  const [toast, setToast] = useState(null);

  const handleExport = () => {
    setToast({
      show: true,
      msg: 'Preparing backup...',
      done: false,
    });
    setTimeout(
      () =>
        setToast({
          show: true,
          msg: 'plink-backup-2026.zip downloaded ✓',
          done: true,
        }),
      1500,
    );
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-5 relative select-none font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* School Information */}
        <SettingsCard
          icon={SchoolIcon}
          title="School Information"
          desc="Identify your school across the system"
        >
          <div className="space-y-4">
            <Field label="School Name" value="Greenfield Elementary School" />
            <Field
              label="Campus Address"
              value="123 Mabini St., Quezon City, PH"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field label="School Year" value="2025–2026" />
              <Field label="Contact Email" value="admin@plinkschool.ph" />
            </div>
          </div>
        </SettingsCard>

        {/* Point Conversion */}
        <SettingsCard
          icon={SparklesIcon}
          title="Point Conversion"
          desc="Set how many points students earn per bottle"
        >
          <div className="bg-[#e8f5bd]/50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#2d4a33]">
                1 PET bottle =
              </div>
              <div className="text-xs text-[#7a947e] mt-0.5">
                Adjust your reward conversion rate
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConversion((v) => Math.max(1, v - 1))}
                className="w-9 h-9 rounded-xl bg-white border border-[#dbe6db] text-[#2d4a33] hover:bg-[#c7eabb]/30 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Decrease"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <div className="w-20 text-center">
                <div className="text-2xl font-bold text-[#2d4a33]">
                  {conversion}
                </div>
                <div className="text-[11px] text-[#7a947e]">points</div>
              </div>
              <button
                onClick={() => setConversion((v) => v + 1)}
                className="w-9 h-9 rounded-xl bg-[#3e5f44] text-white hover:bg-[#5a7c61] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Increase"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              {
                label: 'Today',
                value: `+${224 * conversion} pts`,
              },
              {
                label: 'This Week',
                value: `+${1526 * conversion} pts`,
              },
              {
                label: 'Avg per Student',
                value: `${Math.round((1526 * conversion) / 224)} pts`,
              },
            ].map((p) => (
              <div
                key={p.label}
                className="bg-[#f4f6f3] rounded-xl p-3 text-center border border-[#eef2ed]"
              >
                <div className="text-[11px] text-[#7a947e]">{p.label}</div>
                <div className="font-bold text-[#2d4a33] text-sm mt-0.5">
                  {p.value}
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard
          icon={BellIcon}
          title="Notification Settings"
          desc="Choose what alerts you want to receive"
        >
          <div className="space-y-2">
            <ToggleRow
              label="Machine Almost Full"
              desc="When the bin exceeds 80% capacity"
              defaultOn
            />
            <ToggleRow
              label="Scanner Errors"
              desc="When AI detection fails repeatedly"
              defaultOn
            />
            <ToggleRow
              label="Machine Offline"
              desc="When the machine loses internet"
              defaultOn
            />
            <ToggleRow
              label="Maintenance Reminders"
              desc="Scheduled service alerts"
              defaultOn
            />
            <ToggleRow
              label="Weekly Summary Email"
              desc="Receive a weekly digest on Mondays"
            />
            <ToggleRow
              label="Student Milestone Alerts"
              desc="When a student reaches a goal"
              defaultOn
            />
          </div>
        </SettingsCard>

        {/* Backup & Data */}
        <SettingsCard
          icon={DatabaseIcon}
          title="Backup & Data"
          desc="Export your data or restore from a backup"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f6f3] border border-[#eef2ed]">
              <div>
                <div className="text-sm font-semibold text-[#2d4a33]">
                  Last Backup
                </div>
                <div className="text-xs text-[#7a947e] mt-0.5">
                  May 23, 2026 · 11:48 PM
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#c7eabb]/40 text-[#2d4a33] text-xs font-semibold rounded-full">
                <CheckIcon className="w-3 h-3" /> Healthy
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 py-2.5 bg-[#3e5f44] text-white rounded-xl text-sm font-semibold hover:bg-[#5a7c61] transition-all duration-200 cursor-pointer border-none"
              >
                <DownloadIcon className="w-4 h-4" /> Export Data
              </button>
              <button className="inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-[#dbe6db] text-[#2d4a33] rounded-xl text-sm font-semibold hover:bg-[#e8f5bd]/40 transition-all duration-200 cursor-pointer">
                <UploadIcon className="w-4 h-4" /> Import Backup
              </button>
            </div>
            <ToggleRow
              label="Automatic Daily Backups"
              desc="Back up the system every night at midnight"
              defaultOn
            />
          </div>
        </SettingsCard>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3 bg-white rounded-3xl p-4 shadow-sm border border-[#dbe6db]/60 sticky bottom-4">
        <button className="px-5 py-2.5 bg-[#e8f5bd]/60 text-[#2d4a33] border-none rounded-xl font-semibold text-sm hover:bg-[#c7eabb]/40 transition-colors cursor-pointer">
          Discard
        </button>
        <button className="px-6 py-2.5 bg-[#3e5f44] text-white border-none rounded-xl font-semibold text-sm hover:bg-[#5a7c61] transition-colors inline-flex items-center gap-2 cursor-pointer">
          <CheckIcon className="w-4 h-4" /> Save All Settings
        </button>
      </div>

      {/* Toast Notification Container with pure CSS slide-up transition */}
      {toast && toast.show && (
        <div className="fixed bottom-8 right-8 bg-[#3e5f44] text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 z-50 animate-bounce-short transition-all duration-300">
          {toast.done ? (
            <CheckIcon className="w-5 h-5 text-[#e8f5bd]" />
          ) : (
            <div className="w-5 h-5 border-2 border-white/30 border-t-[#e8f5bd] rounded-full animate-spin" />
          )}
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

function SettingsCard({ icon: Icon, title, desc, children }) {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#dbe6db]/60 transition-all duration-300 hover:shadow-md transform translate-y-0">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-[#c7eabb]/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#3e5f44]" />
        </div>
        <div>
          <h3 className="font-bold text-[#2d4a33] text-lg leading-tight">
            {title}
          </h3>
          <p className="text-xs text-[#7a947e] mt-1">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#2d4a33] mb-1.5 block">
        {label}
      </span>
      <input
        type="text"
        defaultValue={value}
        className="w-full bg-[#f4f6f3] border border-[#dbe6db] rounded-xl px-3.5 py-2.5 text-sm text-[#2d4a33] focus:outline-none focus:border-[#5a7c61] transition-colors"
      />
    </label>
  );
}

function ToggleRow({ label, desc, defaultOn }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-[#f4f6f3] transition-colors">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#2d4a33]">{label}</div>
        <div className="text-xs text-[#7a947e]">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        role="switch"
        aria-checked={on}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer border-none ${
          on ? 'bg-[#5a7c61]' : 'bg-[#c7eabb]/60'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
            on ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}