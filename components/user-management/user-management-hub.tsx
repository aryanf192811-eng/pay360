"use client";

import React, { useState } from "react";
import { Search, Plus, Filter, ShieldAlert, Check, X } from "lucide-react";
import { useStore } from "@/lib/store-context";

export function UserManagementHub() {
  const { employees } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Mock initial users linked to employees
  const [users, setUsers] = useState([
    {
      id: "USR-001",
      name: "Aarav Mehta",
      employeeName: "Aarav Mehta",
      email: "aarav@company.com",
      role: "Payroll User",
      status: "Active",
    },
    {
      id: "USR-002",
      name: "Maya Shah",
      employeeName: "Maya Shah",
      email: "maya@company.com",
      role: "Time Off Admin",
      status: "Active",
    },
    {
      id: "USR-003",
      name: "Rohan Patel",
      employeeName: "Rohan Patel",
      email: "rohan@company.com",
      role: "Payroll Admin",
      status: "Active",
    },
    {
      id: "USR-004",
      name: "Nisha Rao",
      employeeName: "Nisha Rao",
      email: "nisha@company.com",
      role: "Payroll Admin",
      status: "Active",
    },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    employeeName: "",
    email: "",
    role: "Employee",
    status: "Active",
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      employeeName: user.employeeName,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  const handleNewUser = () => {
    setSelectedUser("NEW");
    setFormData({
      employeeName: "",
      email: "",
      role: "Employee",
      status: "Active",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser === "NEW") {
      setUsers([
        {
          id: `USR-${Math.floor(Math.random() * 1000)}`,
          name: formData.employeeName || "New User",
          employeeName: formData.employeeName,
          email: formData.email,
          role: formData.role,
          status: formData.status,
        },
        ...users,
      ]);
    } else if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData, name: formData.employeeName || u.name } : u));
    }
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#F4F6FA] p-6 lg:p-8 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:px-6 mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
            Admin Only
          </span>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel: User List */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 ${selectedUser ? 'w-2/3 hidden lg:flex' : 'w-full'}`}>
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <button
              onClick={handleNewUser}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New User</span>
            </button>
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search users, employees or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors ml-auto">
              <span>Role Filter</span>
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600">User</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Employee</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Work Email</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Role</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleEditUser(user)}
                    className={`cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3 -ml-6">
                        <span className="font-bold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{user.employeeName}</td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{user.role}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
            User accounts are separate from Employee records, but should be linked to an employee for access and ownership.
          </div>
        </div>

        {/* Right Panel: Create / Edit User */}
        {selectedUser && (
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedUser === "NEW" ? "Create New User" : "Edit User Access"}
              </h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="user-form" onSubmit={handleSave} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Employee *
                  </label>
                  <select
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 text-slate-900 text-sm rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.department})</option>
                    ))}
                    <option value="External Consultant">External Consultant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="employee@company.com"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 text-slate-900 text-sm rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Roles *
                  </label>
                  <div className="space-y-3">
                    {["Employee", "Hr Manager", "Hr Payroll User", "Hr Payroll Admin", "Admin"].map((r) => (
                      <label key={r} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.role === r ? 'border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                          {formData.role === r && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Account Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Inactive" : "Active" })}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold border transition-colors ${
                      formData.status === "Active" 
                        ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {formData.status}
                  </button>
                </div>

              </form>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <button
                type="submit"
                form="user-form"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                Create User / Save Access
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
