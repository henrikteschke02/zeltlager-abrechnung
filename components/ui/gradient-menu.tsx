"use client";
import React from 'react';
import Link from 'next/link';
import { Home, ClipboardList, Beer, Flame, Croissant, PieChart } from 'lucide-react';

const menuItems = [
  { title: 'Start', href: '/dashboard', icon: <Home />, gradientFrom: '#14532d', gradientTo: '#22c55e' },
  { title: 'Brett', href: '/dashboard/schwarzes-brett', icon: <ClipboardList />, gradientFrom: '#1e3a8a', gradientTo: '#3b82f6' },
  { title: 'Getränke', href: '/dashboard/getraenke', icon: <Beer />, gradientFrom: '#0891b2', gradientTo: '#2dd4bf' },
  { title: 'Grill', href: '/dashboard/grillfleisch', icon: <Flame />, gradientFrom: '#ea580c', gradientTo: '#fbbf24' },
  { title: 'Brötchen', href: '/dashboard/broetchen', icon: <Croissant />, gradientFrom: '#b45309', gradientTo: '#fcd34d' },
  { title: 'Statistik', href: '/dashboard/statistik', icon: <PieChart />, gradientFrom: '#9f1239', gradientTo: '#f43f5e' }
];

export function GradientMenu() {
  return (
    <div className="flex justify-center items-center py-4 w-full overflow-hidden">
      <ul className="flex gap-2 md:gap-4 flex-nowrap overflow-x-auto no-scrollbar justify-start sm:justify-center px-2 pb-2 w-full max-w-full">
        {menuItems.map(({ title, href, icon, gradientFrom, gradientTo }, idx) => (
          <Link key={idx} href={href}>
            <li
              style={{ '--gradient-from': gradientFrom, '--gradient-to': gradientTo } as React.CSSProperties}
              className="relative w-[44px] h-[44px] md:w-[50px] md:h-[50px] bg-slate-900/80 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[120px] md:hover:w-[140px] hover:shadow-none group cursor-pointer border border-slate-700 shrink-0"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
              <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>
              <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0 text-slate-300">
                {icon}
              </span>
              <span className="absolute text-white uppercase tracking-wide text-xs md:text-sm font-semibold transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
                {title}
              </span>
            </li>
          </Link>
        ))}
      </ul>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
