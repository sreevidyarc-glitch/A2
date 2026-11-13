'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  BrainCircuit,
  GraduationCap,
  Users,
  ChevronDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Profile } from '@/types';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<{
    faculty: Profile[];
    students: Profile[];
  }>({ faculty: [], students: [] });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
      if (data.availableProfiles) {
        setAvailableProfiles(data.availableProfiles);
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  }

  async function switchUser(userId: string, role: string) {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setDropdownOpen(false);
        if (role === 'faculty') {
          router.push('/faculty/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (e) {
      console.error('Switch user failed', e);
    }
  }

  const isFaculty = profile?.role === 'faculty';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={isFaculty ? '/faculty/dashboard' : '/student/dashboard'} className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">AdaptiveLearn<span className="text-blue-600">.AI</span></span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Trait Assessment Engine</span>
            </div>
          </Link>

          {/* Role Indicator Pill */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isFaculty 
              ? 'bg-purple-50 text-purple-700 border-purple-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {isFaculty ? 'Faculty Portal' : 'Student Portal'}
          </span>
        </div>

        {/* Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {isFaculty ? (
            <>
              <Link
                href="/faculty/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith('/faculty/dashboard')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/faculty/courses"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith('/faculty/courses')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Courses & Materials
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/student/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith('/student/dashboard')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Courses
              </Link>
              <Link
                href="/student/learning"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith('/student/learning')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Learning & Practice
              </Link>
              <Link
                href="/student/reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith('/student/reports')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Trait Reports
              </Link>
            </>
          )}
        </nav>

        {/* Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isFaculty ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {profile?.full_name || 'Loading...'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize leading-tight">
                {profile?.role} • Apex Tech
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Demo Switcher
                </span>
                <span className="text-[11px] text-slate-500">
                  Switch personas to verify faculty/student workflows
                </span>
              </div>

              {/* Faculty Group */}
              <div className="py-1">
                <div className="px-3 py-1 text-[11px] font-bold text-purple-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Faculty Members
                </div>
                {availableProfiles.faculty.map(f => (
                  <button
                    key={f.id}
                    onClick={() => switchUser(f.id, 'faculty')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 flex items-center justify-between ${
                      profile?.id === f.id ? 'bg-purple-50 font-bold text-purple-900' : 'text-slate-700'
                    }`}
                  >
                    <span>{f.full_name}</span>
                    <span className="text-[10px] text-slate-400">Faculty</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 my-1"></div>

              {/* Students Group */}
              <div className="py-1">
                <div className="px-3 py-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Students
                </div>
                {availableProfiles.students.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    onClick={() => switchUser(s.id, 'student')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 flex items-center justify-between ${
                      profile?.id === s.id ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <span>{s.full_name}</span>
                    <span className="text-[10px] text-slate-400">Student</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

