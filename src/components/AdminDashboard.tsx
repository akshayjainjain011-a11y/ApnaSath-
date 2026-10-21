import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  Settings,
  DollarSign,
  FileText,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [plusPrice, setPlusPrice] = useState<number>(299);
  const [freeLimit, setFreeLimit] = useState<number>(15);
  const [priceSuccess, setPriceSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'moderation' | 'pricing' | 'audits'>('metrics');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const mRes = await fetch('/api/admin/metrics');
      const mData = await mRes.json();
      setMetrics(mData);
      if (mData.pricing) {
        setPlusPrice(mData.pricing.plusPriceInr || 299);
        setFreeLimit(mData.pricing.freeAiDailyLimit || 15);
      }

      const rRes = await fetch('/api/admin/reports');
      const rData = await rRes.json();
      if (rData.reports) setReports(rData.reports);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleResolveReport = async (reportId: string, actionTaken: string) => {
    try {
      await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionTaken }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plusPriceInr: plusPrice, freeAiDailyLimit: freeLimit }),
      });
      setPriceSuccess(true);
      setTimeout(() => setPriceSuccess(false), 3000);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2 text-stone-900">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif font-bold text-xl">
              Trust, Safety & Admin Console
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
              Authorized Role
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'metrics'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Engagement & Health
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors relative ${
              activeTab === 'moderation'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Safety Queue ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'pricing'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pricing & Limits
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'audits'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            DPDP Audit Logs
          </button>
        </div>

        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-900 font-medium">Registered 55+ Users</div>
                <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                  {metrics?.totalUsers || 6}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-900 font-medium">Age Assurance Rate</div>
                <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                  {metrics?.ageAssuredRate || 100}%
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-900 font-medium">Active Calls</div>
                <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                  {metrics?.activeCalls || 0}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-xs text-purple-900 font-medium">Mutual Friendships</div>
                <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                  {metrics?.totalConnections || 2}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="font-bold text-stone-900 text-sm">Quality of Connection Guidelines (Section 19)</div>
              <p>
                We do not track vanity screen time or provoke endless scrolling. Our product goal is meaningful, voluntary elder connection, user dignity, and zero scam victimization.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500">
              User reports requiring review. Administrators do not inspect private call recordings or private chat text.
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl">
                No reports submitted. Community is safe.
              </div>
            ) : (
              <div className="space-y-2.5">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-stone-900 text-sm">
                        Report against {report.reportedUserName}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <div className="text-stone-600">
                      <strong>Category:</strong> {report.category} · <strong>Filed by:</strong> {report.reporterName}
                    </div>

                    <p className="p-2 rounded-xl bg-stone-50 text-stone-700 italic">
                      "{report.notes}"
                    </p>

                    {report.actionTaken && (
                      <div className="text-emerald-800 font-medium">
                        Action Taken: {report.actionTaken}
                      </div>
                    )}

                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        <button
                          onClick={() => handleResolveReport(report.id, 'Warned and monitored')}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold"
                        >
                          Issue Warning
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id, 'Account suspended for fraudulent solicitation')}
                          className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold"
                        >
                          Suspend Account
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id, 'Reviewed - dismissed as non-violative')}
                          className="px-3 py-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRICING & LIMITS */}
        {activeTab === 'pricing' && (
          <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-stone-900 text-sm">
                Configurable Subscription Pricing (Section 13)
              </div>
              <p className="text-stone-500">
                Adjust prices and limits without hardcoded redeployment.
              </p>
            </div>

            {priceSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Pricing configuration updated successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">
                  ApnaSaath Plus Monthly (INR ₹)
                </label>
                <input
                  type="number"
                  value={plusPrice}
                  onChange={(e) => setPlusPrice(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-stone-300 font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">
                  Free Daily AI Saathi Turns
                </label>
                <input
                  type="number"
                  value={freeLimit}
                  onChange={(e) => setFreeLimit(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-stone-300 font-mono text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-amber-800 text-white font-bold hover:bg-amber-900"
              >
                Save Pricing Config
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audits' && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500">
              Immutable system audit records verifying compliance with India's DPDP Act and safety policies.
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 font-mono text-[11px] p-2 bg-stone-950 text-stone-300 rounded-2xl">
              {(metrics?.recentAudits || []).map((audit: any) => (
                <div key={audit.id} className="p-1.5 border-b border-stone-800 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">
                    [{new Date(audit.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className="text-emerald-400 font-bold shrink-0">{audit.action}</span>
                  <span className="text-stone-300 truncate">{audit.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
