'use client';

import { useState, useEffect } from 'react';
import { subAdminWorkflowsService } from '@/services/sub-admin-workflows.service';

export default function SubAdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await subAdminWorkflowsService.getWorkflows();
      setWorkflows(response.data || []);
    } catch (error) {
       console.error('Failed to load workflows', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Abolish this workflow vector?')) return;
    try {
      await subAdminWorkflowsService.deleteWorkflow(id);
      loadWorkflows();
    } catch (error) {
       console.error('Failed to delete workflow', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">SubAdmin / Logical Orchestrations</h1>
        <button className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">
           New Sequence
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[120rem]">
         {loading ? (
             <div className="col-span-3 p-20 text-center animate-pulse uppercase tracking-widest font-black text-gray-300">Syncing workflow manifold...</div>
         ) : workflows.map(wf => (
            <div key={wf.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all"></div>
               <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl">⚡</div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${wf.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                     {wf.status || 'Active'}
                  </span>
               </div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">{wf.name}</h3>
               <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-10 line-clamp-2">
                  {wf.description || 'Automated logic sequence bridging multiple operational manifolds.'}
               </p>
               <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                  <div className="flex gap-2">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Triggers: 1</span>
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Actions: 3</span>
                  </div>
                  <button 
                    onClick={() => handleDeactivate(wf.id)}
                    className="text-[10px] font-black text-red-300 hover:text-red-500 transition-colors uppercase tracking-widest"
                  >
                    Abolish
                  </button>
               </div>
            </div>
         ))}
         {!loading && workflows.length === 0 && (
            <div className="col-span-3 p-32 text-center border-2 border-dashed border-gray-100 rounded-[5rem]">
               <div className="text-[5rem] mb-10 grayscale">⚙️</div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-4">No Orchestrations Defined</h2>
               <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mb-10 text-center">
                  Your tenant boundary is currently devoid of automated logical sequences. Establish your first workflow to begin orchestration.
               </p>
               <button className="bg-black text-white px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">
                  INITIALIZE SEQUENCE
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
