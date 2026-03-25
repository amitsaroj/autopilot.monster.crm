'use client';

import { useState, useEffect } from 'react';
import { adminRolesService } from '@/services/admin-roles.service';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await adminRolesService.findAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Roles</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">New Role</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{role.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {role.isSystem ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold uppercase">System</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">Custom</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.slice(0, 3).map((p: any) => (
                        <span key={p.id} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-[10px]">{p.action}:{p.resource}</span>
                      ))}
                      {(role.permissions?.length || 0) > 3 && (
                        <span className="text-[10px] text-gray-500">+{role.permissions.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                    {!role.isSystem && (
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
