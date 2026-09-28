import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, Award, ShieldCheck, 
  Save, X, Check, Bell, Lock, KeyRound, Globe, Phone, Mail, MapPin, Sparkles, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInstitutional } from '../context/InstitutionalContext';
import { api } from '../services/api';

export default function InstitutionalSettingsModal({ isOpen, onClose }) {
  const { user, showToast } = useAuth();
  const { institutionalSettings, updateInstitutionalSettings } = useInstitutional();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'calendar', 'grading', 'security'
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    institutionName: 'CAMPUSNOA PUBLIC SCHOOL',
    trustName: 'CampusNoa Education Foundation',
    affiliationCode: 'CBSE/AFF/113089',
    registrationNumber: 'REG-MH-2018-9921',
    schoolAddress: 'Survey No. 42, Knowledge Park Highway, Pune, Maharashtra 411045',
    contactEmail: 'administration@campusnoa.edu.in',
    contactPhone: '+91 20 2845 9900',
    principalSignatureName: 'Dr. Eleanor Vance, Ph.D.',
    academicYear: '2026–2027',
    term1Start: '2026-04-01',
    term1End: '2026-09-30',
    term2Start: '2026-10-01',
    term2End: '2027-03-31',
    dailyStartHour: '08:00 AM',
    dailyEndHour: '02:30 PM',
    passingMarksPercent: 33,
    currency: 'INR',
    notificationChannels: {
      sms: true,
      whatsapp: true,
      email: true,
      inApp: true
    },
    gradingScale: [
      { grade: 'A1', min: 91, max: 100, gpa: 10.0, remark: 'Outstanding Performance' },
      { grade: 'A2', min: 81, max: 90, gpa: 9.0, remark: 'Excellent Grasp' },
      { grade: 'B1', min: 71, max: 80, gpa: 8.0, remark: 'Very Good' },
      { grade: 'B2', min: 61, max: 70, gpa: 7.0, remark: 'Good Proficiency' },
      { grade: 'C1', min: 51, max: 60, gpa: 6.0, remark: 'Satisfactory' },
      { grade: 'C2', min: 41, max: 50, gpa: 5.0, remark: 'Developing Competency' },
      { grade: 'D', min: 33, max: 40, gpa: 4.0, remark: 'Basic Passing Threshold' },
      { grade: 'E', min: 0, max: 32, gpa: 0.0, remark: 'Needs Remediated Intervention' }
    ]
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (institutionalSettings) {
      setFormData(prev => ({
        ...prev,
        ...institutionalSettings,
        notificationChannels: {
          ...prev.notificationChannels,
          ...(institutionalSettings.notificationChannels || {})
        }
      }));
    }
  }, [institutionalSettings]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleNotificationToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      notificationChannels: {
        ...prev.notificationChannels,
        [channel]: !prev.notificationChannels[channel]
      }
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateInstitutionalSettings(formData);
      showToast('Institutional settings saved and broadcast across campus network!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save institutional settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      showToast('New password must contain at least 8 characters', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New password and confirmation do not match', 'error');
      return;
    }
    showToast('Security credentials updated successfully! Log in again on other devices.', 'success');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Institutional Configuration &amp; Governance Center</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Settings
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage institution profile, CBSE academic term calendar, grading rules &amp; security defaults
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50/80 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Institution Profile
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Academic Calendar
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'grading' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Grading &amp; Assessment
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'security' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Security &amp; Alerts
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: INSTITUTION PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <strong>School Branding &amp; Certification Authority:</strong> Values entered here are dynamically rendered on official student report cards, fee challan receipts, and institutional headers.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Institution Official Name *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => handleChange('institutionName', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                    placeholder="e.g. CAMPUSNOA PUBLIC SCHOOL"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Governing Trust / Society
                  </label>
                  <input
                    type="text"
                    value={formData.trustName}
                    onChange={(e) => handleChange('trustName', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    placeholder="e.g. CampusNoa Education Foundation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Affiliation Code (CBSE / State) *
                  </label>
                  <input
                    type="text"
                    value={formData.affiliationCode}
                    onChange={(e) => handleChange('affiliationCode', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-700"
                    placeholder="e.g. CBSE/AFF/113089"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    School Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-700"
                    placeholder="e.g. REG-MH-2018-9921"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Campus Physical Address *
                  </label>
                  <input
                    type="text"
                    value={formData.schoolAddress}
                    onChange={(e) => handleChange('schoolAddress', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    placeholder="Full postal address with pincode"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Official Administration Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Campus Helpline Contact
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Principal Signatory Authority *
                  </label>
                  <input
                    type="text"
                    value={formData.principalSignatureName}
                    onChange={(e) => handleChange('principalSignatureName', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                    placeholder="e.g. Dr. Eleanor Vance, Ph.D."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Active Academic Session *
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => handleChange('academicYear', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                    placeholder="2026–2027"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Daily School Hours
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.dailyStartHour}
                      onChange={(e) => handleChange('dailyStartHour', e.target.value)}
                      className="w-1/2 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="08:00 AM"
                    />
                    <span className="text-xs text-slate-400 font-bold">to</span>
                    <input
                      type="text"
                      value={formData.dailyEndHour}
                      onChange={(e) => handleChange('dailyEndHour', e.target.value)}
                      className="w-1/2 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="02:30 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Term 1 Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.term1Start}
                    onChange={(e) => handleChange('term1Start', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Term 1 End Date
                  </label>
                  <input
                    type="date"
                    value={formData.term1End}
                    onChange={(e) => handleChange('term1End', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Term 2 Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.term2Start}
                    onChange={(e) => handleChange('term2Start', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Term 2 End Date
                  </label>
                  <input
                    type="date"
                    value={formData.term2End}
                    onChange={(e) => handleChange('term2End', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRADING RULES */}
          {activeTab === 'grading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    CBSE 8-Point Grading Scale Standards
                  </h4>
                  <p className="text-[11px] text-slate-500">Standardized scholastic and co-scholastic grade marks mapping</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-bold">Passing Threshold:</span>
                  <input
                    type="number"
                    value={formData.passingMarksPercent}
                    onChange={(e) => handleChange('passingMarksPercent', Number(e.target.value))}
                    className="w-16 text-xs p-1.5 rounded-lg border border-slate-200 font-bold text-center"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Marks Range</th>
                      <th className="py-2.5 px-3">Grade Point (GPA)</th>
                      <th className="py-2.5 px-3">Official Competency Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.gradingScale.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-indigo-700">{item.grade}</td>
                        <td className="py-2.5 px-3 font-mono">{item.min}% – {item.max}%</td>
                        <td className="py-2.5 px-3 font-bold">{item.gpa.toFixed(1)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ALERTS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Notification Toggles */}
              <div className="card-clean p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" /> Automated Institutional Broadcast Channels
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">SMS Gateway Dispatch</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.sms}
                      onChange={() => handleNotificationToggle('sms')}
                      className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">WhatsApp Guardian Alerts</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.whatsapp}
                      onChange={() => handleNotificationToggle('whatsapp')}
                      className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">Email Digest &amp; Circulars</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.email}
                      onChange={() => handleNotificationToggle('email')}
                      className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">In-App SSE Push Delivery</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.inApp}
                      onChange={() => handleNotificationToggle('inApp')}
                      className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              {/* Password & Credential Update */}
              <div className="card-clean p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" /> Update Account Password &amp; Credentials
                </h4>
                <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">New Password (8+ chars)</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>

      </div>
    </div>
  );
}
