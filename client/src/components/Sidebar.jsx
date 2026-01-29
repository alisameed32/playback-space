import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, ThumbsUp, History, UserCheck, Settings, MessageSquare } from 'lucide-react';

function Sidebar({ isOpen }) {
  const sidebarItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Tweets', path: '/tweets' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/liked-videos' },
    { icon: History, label: 'History', path: '/history' },
    { icon: UserCheck, label: 'Subscriptions', path: '/subscriptions' },
  ];

  return (
    <aside 
        className={`
            fixed left-0 top-16 bottom-0 z-40 bg-black border-r border-white/10
            transition-all duration-300 ease-in-out overflow-y-auto
            ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
        `}
    >
      <nav className="flex flex-col gap-1 p-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-3 py-3 rounded-lg transition-colors
              ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-900'}
              ${!isOpen && 'lg:justify-center'}
            `}
            title={item.label}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`${!isOpen ? 'lg:hidden' : ''} text-sm font-medium whitespace-nowrap`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        
        <div className="my-2 border-t border-gray-800" />
        
        {/* Secondary Items */}
        <NavLink to="/settings" className="flex items-center gap-4 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-900 lg:justify-center xl:justify-start">
             <Settings size={22} />
             <span className={`${!isOpen ? 'lg:hidden' : ''} text-sm font-medium`}>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
