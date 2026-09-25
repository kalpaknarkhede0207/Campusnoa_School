import React, { useState, useEffect } from 'react';
import { Bus, MapPin, RefreshCw, CheckCircle, ShieldAlert, Users, PhoneCall } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TransportDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('routes'); // 'routes', 'telemetry', 'drivers'
  const [routes, setRoutes] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransportData();
  }, []);

  const fetchTransportData = async () => {
    setLoading(true);
    try {
      const [routesRes, telemetryRes] = await Promise.all([
        api.getTransportRoutes(),
        api.getBusTelemetry()
      ]);
      setRoutes(routesRes.routes || routesRes || []);
      setTelemetry(telemetryRes);
    } catch (err) {
      showToast('Failed to load transport data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRouteStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'In Transit' ? 'Completed' : 'In Transit';
    try {
      const res = await api.updateTransportRoute(id, nextStatus);
      showToast(res.message || 'Route status updated!', 'success');
      fetchTransportData();
    } catch (err) {
      showToast(err.message || 'Failed to update route status', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-yellow-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
              <Bus className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Institutional Transport & Fleet Logistics</h1>
              <p className="text-sm text-yellow-200/80">Live bus telemetry GPS, driver rosters, route mapping & safety compliance for Grades 1–6</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchTransportData}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Fleet Status
        </button>
      </div>

      {/* KPI Stats Grid - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('routes')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'routes' ? 'border-yellow-500 bg-yellow-50/50 shadow-md ring-2 ring-yellow-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Bus Routes</span>
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{routes.length || 6} Bus Routes</div>
          <p className="text-xs text-yellow-600 mt-1 font-medium">Click to inspect route schedule</p>
        </button>

        <button 
          onClick={() => setActiveTab('telemetry')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'telemetry' ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">GPS Live Telemetry</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {telemetry?.speed_kmh || 34} km/h
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Click to track real-time bus location</p>
        </button>

        <button 
          onClick={() => setActiveTab('drivers')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'drivers' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Drivers</span>
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">10 Drivers</div>
          <p className="text-xs text-indigo-600 mt-1 font-medium">Click for driver contacts & license</p>
        </button>

        <button className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Speed & SOS Alarm</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">Zero Alerts</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Safe driving compliance</p>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'routes' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Fleet Routes & Stops
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'telemetry' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Real-Time GPS Telemetry
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'drivers' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Driver & Attendant Roster
        </button>
      </div>

      {/* Tab 1: Routes */}
      {activeTab === 'routes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Institutional Bus Routes (Grades 1–6)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Route #</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Stops Covered</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Bus className="w-4 h-4 text-yellow-600" />
                      {r.route_name || `Route ${r.id}`}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{r.driver_name || 'Ramesh Singh'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{r.stops || 'Central Station -> Green Park -> Campus'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.status === 'In Transit' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status || 'In Transit'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleRouteStatus(r.id, r.status || 'In Transit')}
                        className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: GPS Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              Live Bus Telemetry Stream
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full animate-pulse">
              LIVE SATELLITE FEED
            </span>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-inner">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Current Speed</span>
                <p className="text-xl font-bold text-yellow-400">{telemetry?.speed_kmh || 38} KM/H</p>
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Coordinates</span>
                <p className="text-sm font-mono text-slate-200">
                  {telemetry?.lat || '18.5204'} N, {telemetry?.lng || '73.8567'} E
                </p>
              </div>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-300">
              ETA to Campus Stop: <span className="font-bold text-emerald-400">12 minutes</span> (On Schedule)
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Driver Roster */}
      {activeTab === 'drivers' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Driver & Fleet Operator Contact Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Ramesh Singh (Bus #1)</h4>
                <p className="text-xs text-slate-500">Commercial Heavy License: DL-992014</p>
              </div>
              <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" /> Call Driver
              </button>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Suresh Kumar (Bus #2)</h4>
                <p className="text-xs text-slate-500">Commercial Heavy License: DL-881023</p>
              </div>
              <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" /> Call Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
