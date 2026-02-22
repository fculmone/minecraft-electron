import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
  MinecraftBlockIcon,
  CloudIcon,
  JavaIcon,
  MinecraftWorldIcon,
  DashboardIcon,
} from '../icons/NavbarIcons';

export default function Drawer({ children }: { children?: React.ReactNode }) {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setIsNight(savedTheme === 'dim');
  }, []);

  const closeDrawer = () => {
    const drawerToggle = document.getElementById(
      'my-drawer-3',
    ) as HTMLInputElement;
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  return (
    <div className="drawer lg:drawer-open h-full">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200 flex h-full overflow-x-auto w-full ">
        {children}
        <label
          htmlFor="my-drawer-3"
          className="btn drawer-button rounded-full absolute bottom-2 left-2 lg:hidden shadow border-1 border-primary-content"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2"
            fill="none"
            stroke="currentColor"
            className="inline-block size-4"
          >
            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
            <path d="M9 4v16" />
            <path d="M14 10l2 2l-2 2" />
          </svg>
        </label>
      </div>
      <div className="drawer-side h-full">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <div className="h-full w-56 bg-base-100 flex flex-col justify-between overflow-hidden pt-8">
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-base-content/20 scrollbar-track-transparent">
            {/* Epic Header Section */}
            <div className="relative p-6 border-b border-base-300 mb-2 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-t-lg overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-2 left-4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="absolute top-6 right-6 w-1 h-1 bg-secondary rounded-full animate-ping"></div>
                <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-accent rounded-full "></div>
                <div className="absolute bottom-2 right-4 w-1 h-1 bg-primary rounded-full animate-ping"></div>
              </div>

              {/* Main content */}
              <div className="relative flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <MinecraftWorldIcon className="w-14 h-14 drop-shadow-xl animate-pulse" />
                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping border-2 border-base-100"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-base-100"></div>
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-sm ">
                    BlockCraft Control
                  </h1>
                  <p className="text-xs text-base-content/70 font-medium mt-1 tracking-wider">
                    SERVER ONLINE
                  </p>
                </div>

                {/* Decorative accent line */}
                <div className="flex items-center gap-2 w-full max-w-32">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
                </div>
              </div>
            </div>
            <ul className="menu">
              {/* Sidebar content here */}
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive ? 'bg-primary bg-opacity-20' : ''
                  }
                  onClick={closeDrawer}
                >
                  <DashboardIcon className="w-5 h-5" />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/java"
                  className={({ isActive }) =>
                    isActive ? 'bg-primary bg-opacity-20' : ''
                  }
                  onClick={closeDrawer}
                >
                  <JavaIcon className="w-5 h-5" />
                  Java Servers
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/bedrock"
                  className={({ isActive }) =>
                    isActive ? 'bg-primary bg-opacity-20' : ''
                  }
                  onClick={closeDrawer}
                >
                  <MinecraftBlockIcon className="w-5 h-5" />
                  Bedrock Servers
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/logs"
                  className={({ isActive }) =>
                    isActive ? 'bg-primary bg-opacity-20' : ''
                  }
                  onClick={closeDrawer}
                >
                  <CloudIcon className="w-5 h-5" />
                  Playit.gg Tunnel
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="p-4">
            <label className="swap swap-rotate">
              {/* this hidden checkbox controls the state */}
              <input
                type="checkbox"
                className="theme-controller"
                value="dim"
                checked={isNight}
                onChange={(event) => {
                  const nextTheme = event.target.checked ? 'dim' : 'light';
                  setIsNight(event.target.checked);
                  document.documentElement.setAttribute(
                    'data-theme',
                    nextTheme,
                  );
                  localStorage.setItem('theme', nextTheme);
                }}
              />

              {/* sun icon */}
              <svg
                className="swap-off h-10 w-10 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              {/* moon icon */}
              <svg
                className="swap-on h-10 w-10 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
