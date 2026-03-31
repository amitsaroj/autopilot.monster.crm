'use client';

import { useState, useEffect } from 'react';
import { adminPlansService } from '@/services/admin-plans.service';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await adminPlansService.findAll();
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to load plans', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Pricing / Plans</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">New Plan</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-transform hover:scale-[1.02]">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">${plan.priceMonthly}</span>
                  <span className="text-gray-500 text-sm ml-1">/month</span>
                  <div className="text-xs text-gray-400 mt-1">${plan.priceAnnual}/year</div>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Features</h3>
                  <ul className="space-y-2">
                    {plan.features?.map((feat: any) => (
                      <li key={feat.id} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        {feat.featureKey}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-50">
                  <button className="text-blue-600 font-semibold text-sm hover:underline">Edit Plan</button>
                  <button className="text-red-600 font-semibold text-sm hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
