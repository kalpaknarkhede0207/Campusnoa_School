import React, { useState, useEffect } from 'react';
import { Trophy, Shield, RefreshCw, CheckCircle, Plus, Activity } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SportsDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'events', 'roster'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getSportsInventory().catch(() => ({ inventory: [] }));
      const loadedItems = res?.inventory || (Array.isArray(res) ? res : []);
      setItems(Array.isArray(loadedItems) ? loadedItems : []);
    } catch (err) {
      showToast('Failed to load sports inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (id, currentQty) => {
    const newQty = prompt('Enter updated equipment quantity:', currentQty);
    if (newQty === null || isNaN(newQty)) return;
    
    try {
      const res = await api.updateSportsInventory(id, parseInt(newQty, 10));
      showToast(res.message || 'Inventory updated successfully!', 'success');
      fetchInventory();
    } catch (err) {
      showToast(err.message || 'Failed to update inventory', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-900 via-amber-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 border border-orange-400/30 rounded-xl">
              <Trophy className="w-7 h-7 text-orange-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sports & Physical Education Control Center</h1>
              <p className="text-sm text-orange-200/80">Manage athletic gear inventory, inter-house tournaments & team rosters for Grades 1–6</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Sports Stock
        </button>
      </div>

      {/* KPI Stats Grid - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'inventory' ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Equipment Stock</span>
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{items.length || 12} Categories</div>
          <p className="text-xs text-orange-600 mt-1 font-medium">Click to inspect inventory</p>
        </button>

        <button 
          onClick={() => setActiveTab('events')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'events' ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Sports Meet</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">Active Schedule</div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Grades 1–6 Tournament</p>
        </button>

        <button 
          onClick={() => setActiveTab('roster')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'roster' ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">House Captains</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">4 House Teams</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Red, Blue, Green, Yellow</p>
        </button>

        <button className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fitness Audits</span>
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">100% Audited</div>
          <p className="text-xs text-sky-600 mt-1 font-medium">Physical check complete</p>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'inventory' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Sports Inventory & Equipment
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'events' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Inter-House Tournaments
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'roster' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Team Rosters (Grades 1–6)
        </button>
      </div>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Sports Equipment Ledger</h2>
            <button 
              onClick={() => handleUpdateQty(items[0]?.id || 1, items[0]?.quantity || 10)}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" /> Log New Stock
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Equipment Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Quantity Available</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-orange-600" />
                      {item.item_name || item.name}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-600">{item.category || 'Athletics'}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{item.quantity} Units</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {item.condition || 'Good / Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Adjust Qty
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Tournaments */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 uppercase">Upcoming Event</span>
            <h3 className="text-base font-bold text-slate-900">Junior Football Cup (Grades 4–6)</h3>
            <p className="text-xs text-slate-500">Scheduled for Next Friday on Main Sports Ground. 4 House Teams Participating.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase">Track & Field</span>
            <h3 className="text-base font-bold text-slate-900">Grade 1–3 Obstacle & Dash Sprint</h3>
            <p className="text-xs text-slate-500">Junior Athletic events showcasing agility, relay runs and obstacle courses.</p>
          </div>
        </div>
      )}

      {/* Tab 3: House Rosters */}
      {activeTab === 'roster' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Institutional House Roster (Grades 1–6)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <h4 className="font-bold text-red-900">Ruby House</h4>
              <p className="text-xs text-red-700 font-semibold mt-1">Captain: Aarav Patel (Gr 6)</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <h4 className="font-bold text-blue-900">Sapphire House</h4>
              <p className="text-xs text-blue-700 font-semibold mt-1">Captain: Diya Sharma (Gr 6)</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <h4 className="font-bold text-emerald-900">Emerald House</h4>
              <p className="text-xs text-emerald-700 font-semibold mt-1">Captain: Kabir Singh (Gr 5)</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <h4 className="font-bold text-amber-900">Topaz House</h4>
              <p className="text-xs text-amber-700 font-semibold mt-1">Captain: Ananya Rao (Gr 6)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
