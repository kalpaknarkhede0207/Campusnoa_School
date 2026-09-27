import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, RefreshCw, CheckCircle, Star, ShieldCheck, Clock, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useInstitutional } from '../context/InstitutionalContext';

export default function EventDashboard() {
  const { showToast } = useAuth();
  const { eventApprovals, submitEventForApproval } = useInstitutional();
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'create', 'venues'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('Main Auditorium');
  const [desc, setDesc] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('₹35,000');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEventCalendar().catch(() => ({ events: [] }));
      const loadedEvents = res?.events || (Array.isArray(res) ? res : []);
      setEvents(Array.isArray(loadedEvents) ? loadedEvents : []);
    } catch (err) {
      showToast('Failed to load event calendar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !eventDate) {
      showToast('Please provide event title and date', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // User requirement: Whatever the new event will be added it will go for approval to principal, vice principal, and HOD
      submitEventForApproval({
        title,
        eventDate,
        venue,
        description: desc,
        estimatedBudget: estimatedBudget || '₹35,000'
      });

      await api.createEvent({ title, event_date: eventDate, venue, description: desc }).catch(() => null);

      showToast('Event submitted for Principal, Vice Principal & HOD approval!', 'success');
      setTitle('');
      setEventDate('');
      setDesc('');
      setEstimatedBudget('₹35,000');
      fetchEvents();
      setActiveTab('calendar');
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = (eventApprovals || []).filter(
    (e) => e.status === 'PENDING' || e.status === 'PARTIALLY_SANCTIONED'
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-900 via-rose-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/20 border border-pink-400/30 rounded-xl">
              <Calendar className="w-7 h-7 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Institutional Events &amp; Cultural Affairs</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-500/30 text-pink-200 border border-pink-400/30">
                  Tri-Party Sanction
                </span>
              </div>
              <p className="text-sm text-pink-200/80 mt-0.5">
                Manage Annual Day, Science Fairs, Guest Seminars &amp; route events for Principal, Vice Principal &amp; HOD approval
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchEvents}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Calendar
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'calendar' ? 'border-pink-500 bg-pink-50/50 shadow-md ring-2 ring-pink-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Events</span>
            <div className="p-2 bg-pink-100 text-pink-700 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {(events.length || 5) + (eventApprovals || []).filter(e => e.status === 'SANCTIONED').length} Events
          </div>
          <p className="text-xs text-pink-600 mt-1 font-medium">Click to view event calendar</p>
        </button>

        <button 
          onClick={() => setActiveTab('calendar')}
          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Approvals</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{pendingCount} Awaiting</div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Principal, VP &amp; HOD review</p>
        </button>

        <button 
          onClick={() => setActiveTab('create')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'create' ? 'border-rose-500 bg-rose-50/50 shadow-md ring-2 ring-rose-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Schedule Event</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">New Event</div>
          <p className="text-xs text-rose-600 mt-1 font-medium">Request institutional sanction</p>
        </button>

        <button 
          onClick={() => setActiveTab('venues')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'venues' ? 'border-purple-500 bg-purple-50/50 shadow-md ring-2 ring-purple-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue Bookings</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">4 Venues</div>
          <p className="text-xs text-purple-600 mt-1 font-medium">Click to check venue availability</p>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'calendar' ? 'border-pink-600 text-pink-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Event Calendar &amp; Approvals
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'create' ? 'border-pink-600 text-pink-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Create / Host Event
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'venues' ? 'border-pink-600 text-pink-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Venue Availability
        </button>
      </div>

      {/* Tab 1: Calendar & Institutional Approvals */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* PENDING / TRI-PARTY APPROVAL QUEUE CARD */}
          <div className="card-clean p-6 border-l-4 border-l-pink-500 bg-gradient-to-r from-pink-50/40 to-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-pink-600" /> Tri-Party Institutional Sanctions Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All scheduled events require unanimous sanction from the Principal, Vice Principal, and Department Head (HOD).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 self-start sm:self-auto">
                {pendingCount} Under Sanction Review
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(eventApprovals || []).map((evt) => (
                <div key={evt.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 uppercase tracking-wider">
                        {evt.eventDate}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{evt.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{evt.description}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      evt.status === 'SANCTIONED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      evt.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {evt.status === 'SANCTIONED' ? 'Fully Sanctioned ✓' :
                       evt.status === 'REJECTED' ? 'Sanction Rejected ✕' :
                       'Awaiting Concurrence ⏳'}
                    </span>
                  </div>

                  {/* Tri-Party Review Badges */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Principal Desk</span>
                      <span className={`font-bold block text-[10px] mt-0.5 ${evt.principalApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {evt.principalApproved ? 'Sanctioned ✓' : 'Pending ⏳'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Vice Principal</span>
                      <span className={`font-bold block text-[10px] mt-0.5 ${evt.vpApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {evt.vpApproved ? 'Sanctioned ✓' : 'Pending ⏳'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">HOD Desk</span>
                      <span className={`font-bold block text-[10px] mt-0.5 ${evt.hodApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {evt.hodApproved ? 'Sanctioned ✓' : 'Pending ⏳'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1 font-sans">
                      <MapPin className="w-3 h-3 text-pink-600" /> {evt.venue}
                    </span>
                    <span className="font-semibold text-slate-700 font-sans">
                      Budget: {evt.estimatedBudget || '₹25,000'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE INSTITUTIONAL EVENTS */}
          <div className="card-clean p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Institutional Event Lineup (Grades 1–6)</h2>
                <p className="text-xs text-slate-500">Official campus events published to the parent &amp; student portal</p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div key={evt.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-pink-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800 uppercase">
                      {evt.event_date || '2026-11-05'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Promulgated
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{evt.title}</h3>
                  <p className="text-xs text-slate-600">{evt.description || 'Annual celebration and student showcase.'}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-pink-700 pt-2 border-t border-slate-200">
                    <MapPin className="w-3.5 h-3.5" /> Venue: {evt.venue || 'Main Auditorium'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Create Form */}
      {activeTab === 'create' && (
        <div className="card-clean p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Request Institutional Event Sanction</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-100 text-pink-700">
                Workflow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Newly scheduled events are instantly routed to the Principal, Vice Principal, and HOD for tri-party concurrence before promulgation.
            </p>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Science Exhibition 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Event Date</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Venue</label>
                <select
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  <option value="Main Auditorium">Main Auditorium</option>
                  <option value="Junior Open Amphitheatre">Junior Open Amphitheatre</option>
                  <option value="STEM Innovation Lab">STEM Innovation Lab</option>
                  <option value="Sports Complex Arena">Sports Complex Arena</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Estimated Budget Requirement</label>
              <input
                type="text"
                placeholder="e.g. ₹35,000"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Event Description &amp; Participation Scope</label>
              <textarea
                rows={3}
                placeholder="Details on student participation, parent invitations, dress code, guest speakers..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-pink-600" /> Tri-Party Approval Pipeline
              </div>
              <p>
                Submitting this event notifies Dr. Neha Bhatnagar (Principal), the Vice Principal, and the Academic HOD. Once all three desks sanction the proposal, it will automatically appear on the official institutional calendar.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-pink-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'Routing for Sanctions...' : 'Submit Event for Tri-Party Approval'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Venues */}
      {activeTab === 'venues' && (
        <div className="card-clean p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Campus Venues &amp; Capacity Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-pink-700 uppercase">Main Auditorium</span>
              <h4 className="font-bold text-slate-900 mt-1">Capacity: 500 Seats</h4>
              <p className="text-xs text-slate-500 mt-1">Equipped with Surround Sound, Stage Lights &amp; AV Projection</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-purple-700 uppercase">Junior Amphitheatre</span>
              <h4 className="font-bold text-slate-900 mt-1">Capacity: 250 Seats</h4>
              <p className="text-xs text-slate-500 mt-1">Open-air venue ideal for drama recitals &amp; Grade 1–3 gatherings</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-indigo-700 uppercase">STEM Innovation Lab</span>
              <h4 className="font-bold text-slate-900 mt-1">Capacity: 120 Students</h4>
              <p className="text-xs text-slate-500 mt-1">Equipped with 3D printers, robotic kits &amp; interactive digital whiteboards</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-emerald-700 uppercase">Sports Complex Arena</span>
              <h4 className="font-bold text-slate-900 mt-1">Capacity: 800 Spectators</h4>
              <p className="text-xs text-slate-500 mt-1">Multi-purpose indoor basketball, badminton &amp; gymnastics arena</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
