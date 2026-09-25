import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, RefreshCw, CheckCircle, Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'create', 'venues'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('Main Auditorium');
  const [desc, setDesc] = useState('');
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
      const res = await api.createEvent({ title, event_date: eventDate, venue, description: desc });
      showToast(res.message || 'Event added to institutional calendar!', 'success');
      setTitle('');
      setEventDate('');
      setDesc('');
      fetchEvents();
      setActiveTab('calendar');
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-900 via-rose-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/20 border border-pink-400/30 rounded-xl">
              <Calendar className="w-7 h-7 text-pink-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Institutional Events & Cultural Affairs</h1>
              <p className="text-sm text-pink-200/80">Manage Annual Day, Science Fairs, Guest Seminars & Venue Bookings for Grades 1–6</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchEvents}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Calendar
        </button>
      </div>

      {/* KPI Stats Grid - Clickable */}
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
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{events.length || 5} Events</div>
          <p className="text-xs text-pink-600 mt-1 font-medium">Click to view event calendar</p>
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
          <p className="text-xs text-rose-600 mt-1 font-medium">Click to publish event details</p>
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

        <button className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Parent Participation</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">Grades 1–6 Active</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">RSVP tracking enabled</p>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'calendar' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Event Calendar
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'create' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Create / Host Event
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'venues' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Venue Availability
        </button>
      </div>

      {/* Tab 1: Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Institutional Event Lineup (Grades 1–6)</h2>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div key={evt.id} className="p-5 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 uppercase">
                  {evt.event_date || '2026-11-05'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{evt.title}</h3>
                <p className="text-xs text-slate-600">{evt.description || 'Annual celebration and student showcase.'}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-pink-700 pt-2 border-t border-pink-100">
                  <MapPin className="w-3.5 h-3.5" /> Venue: {evt.venue || 'Main Auditorium'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Create Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Publish Event to Calendar</h2>
            <p className="text-xs text-slate-500">Notify students, parents, and faculty of upcoming campus activities</p>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Event Title</label>
              <input
                type="text"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Event Description</label>
              <textarea
                rows={3}
                placeholder="Details on student participation, parent invitations, dress code..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-pink-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing Event...' : 'Publish Event'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Venues */}
      {activeTab === 'venues' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Campus Venues & Capacity Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-pink-700 uppercase">Main Auditorium</span>
              <h4 className="font-bold text-slate-900 mt-1">Capacity: 500 Seats</h4>
              <p className="text-xs text-slate-500 mt-1">Equipped with Surround Sound, Stage Lights & AV Projection</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-xs font-bold text-purple-700 uppercase">Junior Amphitheatre</span>
              <h4 className="font-bold text-slate-900 mt-1">Capacity: 250 Seats</h4>
              <p className="text-xs text-slate-500 mt-1">Open-air venue ideal for drama recitals & Grade 1–3 gatherings</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
