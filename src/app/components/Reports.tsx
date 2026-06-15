import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, BarChart2, Plus, RefreshCw, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { generateReport } from '../../api';

export function Reports() {
  const [reports, setReports] = useState([
    { id: 'RPT-001', name: 'Daily Revenue Summary', date: '2026-06-03', type: 'Financial', status: 'Ready' },
    { id: 'RPT-002', name: 'Passenger Volume Analysis', date: '2026-06-02', type: 'Operations', status: 'Ready' },
    { id: 'RPT-003', name: 'Maintenance Logs', date: '2026-06-01', type: 'Maintenance', status: 'Processing' },
    { id: 'RPT-004', name: 'On-Time Performance', date: '2026-05-31', type: 'Performance', status: 'Ready' },
  ]);
  const [generating, setGenerating] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [downloading, setDownloading] = useState<string | null>(null);

  const filteredReports = reports.filter(r => {
    if (filterActive) {
      if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== 'All' && r.type !== typeFilter) return false;
    }
    return true;
  });

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      toast.loading('Generating new report...', { id: 'gen' });
      await generateReport('new', { date: new Date().toISOString() });
      const newId = `RPT-00${reports.length + 1}`;
      setReports(prev => [
        { id: newId, name: 'Custom Operations Report', date: new Date().toISOString().slice(0, 10), type: 'Operations', status: 'Ready' },
        ...prev,
      ]);
      toast.success('Report generated successfully!', { id: 'gen' });
    } catch {
      toast.error('Failed to generate report.', { id: 'gen' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string, reportName: string) => {
    try {
      setDownloading(reportId);
      toast.loading(`Downloading ${reportName}...`, { id: `dl-${reportId}` });
      await generateReport('download', { id: reportId });
      // Simulate CSV download
      const blob = new Blob([`Report: ${reportName}\nGenerated: ${new Date().toLocaleString()}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${reportName.replace(/ /g, '_')}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`${reportName} downloaded!`, { id: `dl-${reportId}` });
    } catch {
      toast.error('Download failed.', { id: `dl-${reportId}` });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Reports Center</h2>
          <p className="text-slate-400 text-sm mt-1">Generate, view, and export railway operations reports.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setFilterActive(f => !f); toast.info(filterActive ? 'Filter cleared.' : 'Filter panel opened.'); }} className="flex items-center gap-2 px-4 py-2 glass-panel glass-panel-hover rounded-xl text-slate-300 text-sm font-medium">
            <Filter className="w-4 h-4 text-emerald-400" /> Filter
          </button>
          <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-900/50 disabled:opacity-50">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Generate New
          </button>
        </div>
      </div>
      
      {filterActive && (
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2 bg-black/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none min-w-[150px] cursor-pointer"
          >
            <option value="All" className="bg-slate-900">All Types</option>
            <option value="Financial" className="bg-slate-900">Financial</option>
            <option value="Operations" className="bg-slate-900">Operations</option>
            <option value="Maintenance" className="bg-slate-900">Maintenance</option>
            <option value="Performance" className="bg-slate-900">Performance</option>
          </select>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart2 className="w-16 h-16 text-emerald-400" />
           </div>
           <div className="text-slate-400 text-sm font-medium mb-1">Total Reports Generated</div>
           <div className="text-3xl font-bold text-white">1,248</div>
           <div className="text-emerald-400 text-xs font-medium mt-2">+12% this month</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Download className="w-16 h-16 text-teal-400" />
           </div>
           <div className="text-slate-400 text-sm font-medium mb-1">Downloads</div>
           <div className="text-3xl font-bold text-white">8,492</div>
           <div className="text-teal-400 text-xs font-medium mt-2">Active exports</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="w-16 h-16 text-blue-400" />
           </div>
           <div className="text-slate-400 text-sm font-medium mb-1">Scheduled Jobs</div>
           <div className="text-3xl font-bold text-white">14</div>
           <div className="text-blue-400 text-xs font-medium mt-2">Next run in 2h</div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
           <h3 className="text-lg font-medium text-white">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Report ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-slate-300 font-mono">{report.id}</td>
                  <td className="p-4 text-sm text-white font-medium">{report.name}</td>
                  <td className="p-4 text-sm text-slate-400">{report.date}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-lg text-xs border border-white/5">{report.type}</span>
                  </td>
                  <td className="p-4 text-sm">
                    {report.status === 'Ready' ? (
                       <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                         <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Ready
                       </span>
                    ) : (
                       <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                         <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span> Processing
                       </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => report.status === 'Ready' && handleDownload(report.id, report.name)}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-30"
                      disabled={report.status !== 'Ready' || downloading === report.id}
                    >
                      {downloading === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
