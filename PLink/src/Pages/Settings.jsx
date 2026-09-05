import { useState, useEffect } from 'react';
import api from '../api';
import { useData } from '../context/DataContext.jsx';
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
  UsersIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';

export function Settings() {
  // Use settings and plastic types from our data context!
  const { 
    settings, 
    plasticTypes,
    refreshSections,
    refreshPlasticTypes,
    refreshSettings,
    updateSettings: updateSettingsInContext,
    addSection: addSectionToContext,
    updateSection: updateSectionInContext,
    removeSection: removeSectionFromContext
  } = useData();
  
  useEffect(() => {
    Promise.allSettled([refreshSettings(), refreshPlasticTypes(), refreshSections()]);
  }, [refreshSettings, refreshPlasticTypes, refreshSections]);

  // Safe default matching your exact database records layout
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'PLP',
    address: 'PLP',
    year: '2023-2027',
    email: 'PLP@gmail.com',
  });

  const [conversion, setConversion] = useState(5);
  const [penalties, setPenalties] = useState({
    rejected: 1, // contaminated PET points
    nonPet: 0, // invalid/non-accepted items earn 0 points
  });
  const [plasticTypeConfig, setPlasticTypeConfig] = useState({
    pet: null,
    contaminated: null,
    nonPet: null,
  });

  const [notifications, setNotifications] = useState({
    machineFull: true,
    scannerErrors: true,
    machineOffline: true,
    maintenance: true,
    weeklySummary: false,
    milestones: true,
  });

  const [autoBackup, setAutoBackup] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, done = true) => {
    setToast({ show: true, msg, done });
    if (done) setTimeout(() => setToast(null), 3000);
  };

  const mapPlasticTypesToConfig = (plasticTypes) => {
    const findByKeywords = (keywords) =>
      plasticTypes.find((item) => {
        const name = item.name.toLowerCase();
        return keywords.some((keyword) => name.includes(keyword));
      }) || null;

    return {
      pet: findByKeywords(['pet bottle', 'pet']),
      contaminated: findByKeywords(['contaminated']),
      nonPet: findByKeywords(['invalid', 'non-pet', 'non pet', 'other plastics', 'aluminum']),
    };
  };

  // CONTROLLER 1: System Settings Loader - Initialize from context
  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSchoolInfo({
        name: settings.school_name || '',
        address: settings.school_address || '',
        year: settings.school_year || '',
        email: settings.school_email || '',
      });
      setNotifications({
        machineFull: settings.notify_machine_full == 1,
        scannerErrors: settings.notify_scanner_errors == 1,
        machineOffline: settings.notify_machine_offline == 1,
        maintenance: settings.notify_maintenance == 1,
        weeklySummary: settings.notify_weekly_summary == 1,
        milestones: settings.notify_milestones == 1,
      });
    }
  }, [settings]);

  // Update plastic type config when plasticTypes from context changes!
  useEffect(() => {
    if (plasticTypes && plasticTypes.length > 0) {
      const mappedConfig = mapPlasticTypesToConfig(plasticTypes);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlasticTypeConfig(mappedConfig);
      if (mappedConfig.pet) {
        setConversion(mappedConfig.pet.points);
      }
      setPenalties({
        rejected: mappedConfig.contaminated?.points ?? 1,
        nonPet: mappedConfig.nonPet?.points ?? 0,
      });
    }
  }, [plasticTypes]);

  // CONTROLLER 1: System Settings Updater
  const handleSaveAll = async () => {
    showToast('Saving configurations...', false);
    
    const payload = {
      school_name: schoolInfo.name,
      school_address: schoolInfo.address,
      school_year: schoolInfo.year,
      school_email: schoolInfo.email,
      notify_machine_full: notifications.machineFull ? 1 : 0,
      notify_scanner_errors: notifications.scannerErrors ? 1 : 0,
      notify_machine_offline: notifications.machineOffline ? 1 : 0,
      notify_maintenance: notifications.maintenance ? 1 : 0,
      notify_weekly_summary: notifications.weeklySummary ? 1 : 0,
      notify_milestones: notifications.milestones ? 1 : 0,
    };

    try {
      const plasticTypeUpdates = [];

      if (plasticTypeConfig.pet?.id) {
        plasticTypeUpdates.push(
          api.updatePlasticType(plasticTypeConfig.pet.id, {
            ...plasticTypeConfig.pet.raw,
            points_value: Number(conversion),
          })
        );
      }

      if (plasticTypeConfig.contaminated?.id) {
        plasticTypeUpdates.push(
          api.updatePlasticType(plasticTypeConfig.contaminated.id, {
            ...plasticTypeConfig.contaminated.raw,
            points_value: Number(penalties.rejected),
          })
        );
      }

      if (plasticTypeConfig.nonPet?.id) {
        plasticTypeUpdates.push(
          api.updatePlasticType(plasticTypeConfig.nonPet.id, {
            ...plasticTypeConfig.nonPet.raw,
            points_value: Number(penalties.nonPet),
          })
        );
      }

      await Promise.all([
        api.updateSettings(payload),
        ...plasticTypeUpdates,
      ]);

      // Update the context directly so we don't refresh everything
      updateSettingsInContext(payload);
      await refreshPlasticTypes(); // Refresh plastic types in context after saving!
      showToast('Settings saved successfully!');
    } catch (error) {
      console.error(error);
      showToast('Cannot reach server. Run php artisan serve.');
    }
  };

  return (
    <div className="space-y-5 relative select-none font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* School Information */}
        <SettingsCard icon={SchoolIcon} title="School Information" desc="Identify your school across the system">
          <div className="space-y-4">
            <Field label="School Name" value={schoolInfo.name} onChange={(val) => setSchoolInfo({ ...schoolInfo, name: val })} />
            <Field label="Campus Address" value={schoolInfo.address} onChange={(val) => setSchoolInfo({ ...schoolInfo, address: val })} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="School Year" value={schoolInfo.year} onChange={(val) => setSchoolInfo({ ...schoolInfo, year: val })} />
              <Field label="Contact Email" value={schoolInfo.email} onChange={(val) => setSchoolInfo({ ...schoolInfo, email: val })} />
            </div>
          </div>
        </SettingsCard>

        {/* Point Conversion & Penalties */}
        <SettingsCard icon={SparklesIcon} title="Point Conversion & Rules" desc="Configure points awarded for accepted and non-accepted items">
          <div className="space-y-3">
            <PointRule label="Accepted PET Bottle" desc="Points awarded for a valid, accepted bottle" value={conversion} onChange={setConversion} min={1} />
            <PointRule label="Contaminated Bottle Points" desc="Points awarded for a contaminated PET bottle" value={penalties.rejected} onChange={(v) => setPenalties({ ...penalties, rejected: v })} min={0} />
            <PointRule label="Invalid Item Points" desc="Points awarded for invalid or non-accepted items" value={penalties.nonPet} onChange={(v) => setPenalties({ ...penalties, nonPet: v })} min={0} />
          </div>
        </SettingsCard>

        {/* Notification Settings */}
        <SettingsCard icon={BellIcon} title="Notification Settings" desc="Choose what alerts you want to receive">
          <div className="space-y-2">
            <ToggleRow label="Machine Almost Full" desc="When the bin exceeds 80% capacity" isOn={notifications.machineFull} onChange={(val) => setNotifications({ ...notifications, machineFull: val })} />
            <ToggleRow label="Scanner Errors" desc="When AI detection fails repeatedly" isOn={notifications.scannerErrors} onChange={(val) => setNotifications({ ...notifications, scannerErrors: val })} />
            <ToggleRow label="Machine Offline" desc="When the machine loses internet" isOn={notifications.machineOffline} onChange={(val) => setNotifications({ ...notifications, machineOffline: val })} />
            <ToggleRow label="Maintenance Reminders" desc="Scheduled service alerts" isOn={notifications.maintenance} onChange={(val) => setNotifications({ ...notifications, maintenance: val })} />
            <ToggleRow label="Weekly Summary Email" desc="Receive a weekly digest on Mondays" isOn={notifications.weeklySummary} onChange={(val) => setNotifications({ ...notifications, weeklySummary: val })} />
            <ToggleRow label="Student Milestone Alerts" desc="When a student reaches a goal" isOn={notifications.milestones} onChange={(val) => setNotifications({ ...notifications, milestones: val })} />
          </div>
        </SettingsCard>

        {/* CONTROLLER 2: Sections Component Embedded Inside Section Management Card */}
        <SettingsCard icon={UsersIcon} title="Section Management" desc="Add, edit, and remove student sections">
          <SectionsManager 
            onToast={(msg) => showToast(msg)} 
            refreshSections={refreshSections}
            addSectionToContext={addSectionToContext}
            updateSectionInContext={updateSectionInContext}
            removeSectionFromContext={removeSectionFromContext}
          />
        </SettingsCard>

        {/* Backup & Data */}
        <SettingsCard icon={DatabaseIcon} title="Backup & Data" desc="Export your data or restore from a backup">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f6f3] border border-[#eef2ed]">
              <div>
                <div className="text-sm font-semibold text-[#2d4a33]">Last Backup</div>
                <div className="text-xs text-[#7a947e] mt-0.5">May 23, 2026 · 11:48 PM</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#c7eabb]/40 text-[#2d4a33] text-xs font-semibold rounded-full">
                <CheckIcon className="w-3 h-3" /> Healthy
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="inline-flex items-center justify-center gap-2 py-2.5 bg-[#3e5f44] text-white rounded-xl text-sm font-semibold border-none cursor-pointer">
                <DownloadIcon className="w-4 h-4" /> Export Data
              </button>
              <button className="inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-[#dbe6db] text-[#2d4a33] rounded-xl text-sm font-semibold cursor-pointer">
                <UploadIcon className="w-4 h-4" /> Import Backup
              </button>
            </div>
            <ToggleRow label="Automatic Daily Backups" desc="Back up the system every night at midnight" isOn={autoBackup} onChange={setAutoBackup} />
          </div>
        </SettingsCard>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 bg-white rounded-3xl p-4 shadow-sm border border-[#dbe6db]/60 sticky bottom-4">
        <button className="px-5 py-2.5 bg-[#e8f5bd]/60 text-[#2d4a33] border-none rounded-xl font-semibold text-sm cursor-pointer">Discard</button>
        <button onClick={handleSaveAll} className="px-6 py-2.5 bg-[#3e5f44] text-white border-none rounded-xl font-semibold text-sm inline-flex items-center gap-2 cursor-pointer">
          <CheckIcon className="w-4 h-4" /> Save All Settings
        </button>
      </div>

      {/* Toast Popup HUD */}
      {toast && toast.show && (
        <div className="fixed bottom-8 right-8 bg-[#3e5f44] text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 z-50 transition-all duration-300">
          {toast.done ? <CheckIcon className="w-5 h-5 text-[#e8f5bd]" /> : <div className="w-5 h-5 border-2 border-white/30 border-t-[#e8f5bd] rounded-full animate-spin" />}
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

function SettingsCard({ icon: Icon, title, desc, children }) {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#dbe6db]/60 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-[#c7eabb]/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#3e5f44]" />
        </div>
        <div>
          <h3 className="font-bold text-[#2d4a33] text-lg leading-tight">{title}</h3>
          <p className="text-xs text-[#7a947e] mt-1">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#2d4a33] mb-1.5 block">{label}</span>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#f4f6f3] border border-[#dbe6db] rounded-xl px-3.5 py-2.5 text-sm text-[#2d4a33] focus:outline-none focus:border-[#5a7c61] transition-colors" />
    </label>
  );
}

function ToggleRow({ label, desc, isOn, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-[#f4f6f3] transition-colors">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#2d4a33]">{label}</div>
        <div className="text-xs text-[#7a947e]">{desc}</div>
      </div>
      <button onClick={() => onChange(!isOn)} role="switch" aria-checked={isOn} className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer border-none ${isOn ? 'bg-[#5a7c61]' : 'bg-[#c7eabb]/60'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${isOn ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function PointRule({ label, desc, value, onChange, min, max }) {
  return (
    <div className="bg-[#e8f5bd]/20 rounded-2xl p-4 flex items-center justify-between border border-[#dbe6db]/60">
      <div className="pr-4">
        <div className="text-sm font-semibold text-[#2d4a33]">{label}</div>
        <div className="text-xs text-[#7a947e] mt-0.5">{desc}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => min !== undefined && value <= min ? null : onChange(value - 1)} className="w-8 h-8 rounded-xl bg-white border border-[#dbe6db] text-[#2d4a33] hover:bg-[#c7eabb]/40 flex items-center justify-center cursor-pointer"><MinusIcon className="w-4 h-4" /></button>
        <div className="w-16 text-center"><div className={`text-xl font-bold ${value < 0 ? 'text-red-600' : 'text-[#2d4a33]'}`}>{value > 0 ? `+${value}` : value}</div></div>
        <button onClick={() => max !== undefined && value >= max ? null : onChange(value + 1)} className="w-8 h-8 rounded-xl bg-[#3e5f44] text-white hover:bg-[#5a7c61] flex items-center justify-center cursor-pointer"><PlusIcon className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// CONTROLLER 2: Section Table Manager Component
function SectionsManager({ 
  onToast, 
  refreshSections, 
  addSectionToContext, 
  updateSectionInContext, 
  removeSectionFromContext 
}) {
  const { sections: sectionsFromContext } = useData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });

  // 1. Use sections from context
  const sections = (sectionsFromContext || []).map(s => ({
    ...s,
    name: s.section_name || s.name || ''
  }));

  const filtered = sections.filter(
    (s) => s && s.name && s.name.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Isolated Save Function
  const save = async () => {
    if (!form.name.trim()) return;
    
    const payload = {
      name: form.name,
    };

    try {
      if (editing) {
        const targetIdentifier = editing.id || editing.name;
        const res = await api.updateSection(targetIdentifier, payload);
        if (res.data) {
          updateSectionInContext(targetIdentifier, res.data);
        } else {
          await refreshSections();
        }
        onToast('Section updated successfully');
      } else {
        const res = await api.addSection(payload);
        if (res.data) {
          addSectionToContext(res.data);
        } else {
          await refreshSections();
        }
        onToast('Section added successfully');
      }
    } catch (e) {
      console.error(e);
      onToast('Error handling section request');
    }
    setShowModal(false);
  };

  // 3. Isolated Delete Function
  const handleDelete = async (sectionItem) => {
    try {
      const targetIdentifier = sectionItem.id || sectionItem.name;
      await api.deleteSection(targetIdentifier);
      removeSectionFromContext(targetIdentifier);
      onToast('Section removed successfully');
    } catch (error) {
      console.error(error);
      onToast('Error deleting section');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#f4f6f3] rounded-xl px-3.5 py-2.5 flex-1 border border-[#dbe6db]">
          <SearchIcon className="w-4 h-4 text-[#7a947e]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sections…" className="bg-transparent outline-none text-sm flex-1 text-[#2d4a33]" />
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '' }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3e5f44] text-white rounded-xl font-semibold text-sm border-none cursor-pointer">
          <PlusIcon className="w-4 h-4" /> Add Section
        </button>
      </div>

      <div className="border border-[#dbe6db]/80 rounded-2xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-[#e8f5bd]/40 text-[#2d4a33]">
            <tr>
              <th className="text-left text-[11px] font-semibold uppercase px-4 py-3">Section</th>
              <th className="text-right text-[11px] font-semibold uppercase px-4 py-3">Students</th>
              <th className="text-right text-[11px] font-semibold uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef2ed]">
            {filtered.length === 0 ? (
              <tr><td colSpan="3" className="px-4 py-8 text-center text-sm text-[#7a947e]">No student sections found.</td></tr>
            ) : (
              filtered.map((s, idx) => (
                <tr key={idx} className="hover:bg-[#f4f6f3]">
                  <td className="px-4 py-3 text-sm font-semibold text-[#2d4a33]">{s.name}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-[#2d4a33]">{s.students || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => { setEditing(s); setForm({ name: s.name }); setShowModal(true); }} className="w-8 h-8 rounded-lg bg-[#e8f5bd]/60 text-[#2d4a33] flex items-center justify-center border-none cursor-pointer"><PencilIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border-none cursor-pointer"><TrashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#2d4a33]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-7 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <h3 className="font-bold text-[#2d4a33] text-xl">{editing ? 'Edit Section' : 'Add Section'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-[#f4f6f3] flex items-center justify-center border-none cursor-pointer"><XIcon className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#2d4a33] mb-1.5 block">Section Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ name: e.target.value })} className="w-full bg-[#f4f6f3] border border-[#dbe6db] rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <button onClick={save} className="w-full py-2.5 bg-[#3e5f44] text-white rounded-xl font-semibold border-none cursor-pointer">{editing ? 'Save Changes' : 'Add Section'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
