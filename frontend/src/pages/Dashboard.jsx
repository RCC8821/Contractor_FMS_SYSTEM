// // components/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { Search, User, FileText, ShoppingCart, ChevronDown,DollarSign , LogOut, Menu, Bell, X,Receipt } from 'lucide-react';
// import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { logout } from '../features/auth/authSlice';

// const Dashboard = () => {
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [selectedPage, setSelectedPage] = useState(null);
//   const [activeMenu, setActiveMenu] = useState(null);

//   const [dropdownOpen, setDropdownOpen] = useState({
//     fms: false,
//     billing: false,
//   });

//   const { userType, token } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Redirect if not logged in
//   useEffect(() => {
//     if (!token) {
//       navigate('/');
//     }
//   }, [token, navigate]);

//   // Sync selectedPage with current path
//   useEffect(() => {
//     const page = allPages.find(p => p.path === location.pathname);
//     if (page) {
//       setSelectedPage(page.id);
//       const menu = menuItems.find(m => m.pages.some(p => p.id === page.id));
//       setActiveMenu(menu ? menu.id : null);
//     } else {
//       setSelectedPage(null);
//       setActiveMenu(null);
//     }
//   }, [location.pathname]);

//   // ====================== ALL PAGES ======================
//   const allPages = [
//     // FMS
//     {
//       id: 'contractor-requirement-form',
//       name: 'Contractor Requirement Form',
//       icon: FileText,
//       path: '/dashboard/contractor-requirement-form',
//       allowedUserTypes: ['admin'],
//       category: 'fms',
//     },
//     // Billing
//     {
//       id: 'Bill_Tally_form',
//       name: 'Bill Tally Form',
//       icon: Receipt,
//       path: '/dashboard/Bill_Tally_form',
//       allowedUserTypes: ['admin'],
//       category: 'billing',
//     },
//     {
//       id: 'Bill_Checked',
//       name: 'Bill_Checked',
//       icon: FileText,
//       path: '/dashboard/Bill_Checked',
//       allowedUserTypes: ['admin'],
//       category: 'billing',
//     },
//     {
//       id: 'billing-payments',
//       name: 'Payment Status',
//       icon: FileText,
//       path: '/dashboard/billing/payments',
//       allowedUserTypes: ['admin'],
//       category: 'billing',
//     },
//   ];

//   const getPagesByCategory = (category) => {
//     return allPages.filter(
//       p => p.allowedUserTypes.includes(userType) && p.category === category
//     );
//   };

//   const fmsPages = getPagesByCategory('fms');
//   const billingPages = getPagesByCategory('billing');

//   // ====================== MENU ITEMS ======================
//   const menuItems = [
//     {
//       id: 'fms',
//       name: 'Contractor FMS',
//       icon: ShoppingCart,
//       pages: fmsPages,
//     },
//     {
//       id: 'billing',
//       name: 'Contractor Billing',
//       icon: DollarSign,
//       pages: billingPages,
//     },
//     {
//       id: 'sheet-link',
//       name: 'Sheet Link',
//       icon: FileText,
//       url: 'https://docs.google.com/spreadsheets/d/1-ZhXcSS3yYh3komYk5020JSAxyczYW3Pq6iob74NvhM/edit?gid=663292535#gid=663292535',
//       pages: [],
//     },
//   ];

//   // ====================== HANDLERS ======================
//   const toggleDropdown = (menuId) => {
//     setDropdownOpen(prev => ({
//       ...prev,
//       [menuId]: !prev[menuId]
//     }));
//     setActiveMenu(menuId);
//   };

//   const selectPage = (pageId) => {
//     const page = allPages.find(p => p.id === pageId);
//     if (page) {
//       setSelectedPage(pageId);
//       const menu = menuItems.find(m => m.pages.some(p => p.id === pageId));
//       setActiveMenu(menu ? menu.id : null);
//       setDropdownOpen({});
//       setIsMobileMenuOpen(false);
//       navigate(page.path); // This triggers Outlet to render
//     }
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/');
//   };

//   const getCurrentTitle = () => {
//     const page = allPages.find(p => p.id === selectedPage);
//     return page ? page.name : 'Select a Module';
//   };

//   const isMenuActive = (menu) => {
//     return menu.pages.some(p => p.id === selectedPage);
//   };

//   const getActiveMenuPages = () => {
//     if (!activeMenu) return [];
//     const menu = menuItems.find(m => m.id === activeMenu);
//     return menu ? menu.pages : [];
//   };

//   // ====================== RENDER ======================
//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div
//         className={`${
//           isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
//           isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'
//         }`}
//         onMouseEnter={() => setIsSidebarExpanded(true)}
//         onMouseLeave={() => setIsSidebarExpanded(false)}
//       >
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className={`flex items-center p-6 border-b border-gray-100 transition-all duration-300 ${isSidebarExpanded ? 'justify-between' : 'lg:justify-center'}`}>
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-blue-600">
//                 <span className="text-white font-bold text-xl">R</span>
//               </div>
//               <h1 className={`text-xl font-bold text-gray-800 transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
//                 RCC Contractor
//               </h1>
//             </div>
//             <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
//               <X className="w-6 h-6 text-gray-500" />
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 p-4">
//             <ul className="space-y-2">
//               {menuItems.map((menu) => (
//                 <li key={menu.id} className="relative">
//                   <button
//                     onClick={() => {
//                       if (menu.url) {
//                         window.open(menu.url, '_blank', 'noopener,noreferrer');
//                       } else if (menu.pages.length > 0) {
//                         toggleDropdown(menu.id);
//                       }
//                     }}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
//                       isMenuActive(menu)
//                         ? 'bg-blue-50 text-blue-600 border border-blue-200'
//                         : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
//                     } ${!isSidebarExpanded ? 'lg:justify-center' : ''}`}
//                     title={!isSidebarExpanded ? menu.name : ''}
//                   >
//                     <menu.icon className="w-5 h-5 flex-shrink-0" />
//                     <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
//                       {menu.name}
//                     </span>
//                     {menu.pages.length > 0 && isSidebarExpanded && (
//                       <ChevronDown
//                         className={`w-4 h-4 ml-auto transition-transform duration-200 ${
//                           dropdownOpen[menu.id] ? 'rotate-180' : ''
//                         }`}
//                       />
//                     )}
//                     {!isSidebarExpanded && (
//                       <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
//                         {menu.name}
//                       </div>
//                     )}
//                   </button>

//                   {/* Dropdown */}
//                   {isSidebarExpanded && menu.pages.length > 0 && dropdownOpen[menu.id] && (
//                     <ul className="ml-6 mt-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-md p-2">
//                       {menu.pages.map((page) => (
//                         <li key={page.id}>
//                           <button
//                             onClick={() => selectPage(page.id)}
//                             className={`w-full flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
//                               selectedPage === page.id
//                                 ? 'bg-blue-100 text-blue-700 font-medium'
//                                 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
//                             }`}
//                           >
//                             <page.icon className="w-4 h-4 flex-shrink-0" />
//                             <span className="truncate">{page.name}</span>
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </nav>

//           {/* User + Logout */}
//           <div className="p-4 border-t border-gray-100">
//             <div className={`flex items-center mb-4 transition-all duration-300 ${isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'}`}>
//               <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               <div className={`transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
//                 <p className="font-semibold text-gray-800">{userType || 'Guest'}</p>
//                 <p className="text-sm text-gray-600">{userType === 'admin' ? 'Admin' : 'User'}</p>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className={`w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group relative ${
//                 isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'
//               }`}
//               title={!isSidebarExpanded ? 'Logout' : ''}
//             >
//               <LogOut className="w-5 h-5 flex-shrink-0" />
//               <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
//                 Logout
//               </span>
//               {!isSidebarExpanded && (
//                 <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
//                   Logout
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="bg-white shadow-sm border-b border-gray-100 p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
//                 <Menu className="w-6 h-6 text-gray-600" />
//               </button>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
//                 />
//               </div>
//               <button className="relative p-2 rounded-xl hover:bg-gray-100">
//                 <Bell className="w-6 h-6 text-gray-600" />
//                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
//               </button>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-auto p-6">
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <h3 className="text-2xl font-bold text-gray-800">{getCurrentTitle()}</h3>
//                 <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
//               </div>

//               {/* Page Selector Dropdown */}
//               <div className="relative">
//                 <select
//                   value={selectedPage || ''}
//                   onChange={(e) => selectPage(e.target.value)}
//                   className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[220px]"
//                   disabled={!activeMenu}
//                 >
//                   <option value="" disabled>
//                     {activeMenu ? 'Select Page' : 'Open a menu first'}
//                   </option>
//                   {getActiveMenuPages().map(page => (
//                     <option key={page.id} value={page.id}>
//                       {page.name}
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
//               </div>
//             </div>

//             {/* Content Outlet */}
//             <div className="min-h-[500px] p-4 bg-gray-50 rounded-xl">
//               <Outlet />
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
//           onClick={() => setIsMobileMenuOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  FileText,
  ShoppingCart,
  ChevronDown,
  DollarSign,
  LogOut,
  Menu,
  Bell,
  X,
  Receipt,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const Dashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState({
    fms: false,
    billing: false,
  });

  const { userType, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const page = allPages.find((p) => p.path === location.pathname);
    if (page) {
      setSelectedPage(page.id);
      const menu = menuItems.find((m) => m.pages.some((p) => p.id === page.id));
      setActiveMenu(menu ? menu.id : null);
    } else {
      setSelectedPage(null);
      setActiveMenu(null);
    }
  }, [location.pathname]);

  const allPages = [
    {
      id: "contractor-requirement-form",
      name: "Contractor Requirement Form",
      icon: FileText,
      path: "/dashboard/contractor-requirement-form",
      allowedUserTypes: ["admin"],
      category: "fms",
    },
    {
      id: "Bill_Tally_form",
      name: "Bill Tally Form",
      icon: Receipt,
      path: "/dashboard/Bill_Tally_form",
      allowedUserTypes: ["admin"],
      category: "billing",
    },
    {
      id: "Bill_Checked",
      name: "Bill Checked",
      icon: FileText,
      path: "/dashboard/Bill_Checked",
      allowedUserTypes: ["admin"],
      category: "billing",
    },
    {
      id: "billing-payments",
      name: "Payment Status",
      icon: FileText,
      path: "/dashboard/billing/payments",
      allowedUserTypes: ["admin"],
      category: "billing",
    },
  ];

  const getPagesByCategory = (category) => {
    return allPages.filter(
      (p) => p.allowedUserTypes.includes(userType) && p.category === category
    );
  };

  const fmsPages = getPagesByCategory("fms");
  const billingPages = getPagesByCategory("billing");

  const menuItems = [
    {
      id: "fms",
      name: "Contractor FMS",
      icon: ShoppingCart,
      pages: fmsPages,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "billing",
      name: "Contractor Billing",
      icon: DollarSign,
      pages: billingPages,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "sheet-link",
      name: "Sheet Link",
      icon: FileText,
      url: "https://docs.google.com/spreadsheets/d/1-ZhXcSS3yYh3komYk5020JSAxyczYW3Pq6iob74NvhM/edit?gid=663292535#gid=663292535",
      pages: [],
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const toggleDropdown = (menuId) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
    setActiveMenu(menuId);
  };

  const selectPage = (pageId) => {
    const page = allPages.find((p) => p.id === pageId);
    if (page) {
      setSelectedPage(pageId);
      const menu = menuItems.find((m) => m.pages.some((p) => p.id === pageId));
      setActiveMenu(menu ? menu.id : null);
      setDropdownOpen({});
      setIsMobileMenuOpen(false);
      navigate(page.path);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const getCurrentTitle = () => {
    const page = allPages.find((p) => p.id === selectedPage);
    return page ? page.name : "Select a Module";
  };

  const isMenuActive = (menu) => {
    return menu.pages.some((p) => p.id === selectedPage);
  };

  const getActiveMenuPages = () => {
    if (!activeMenu) return [];
    const menu = menuItems.find((m) => m.id === activeMenu);
    return menu ? menu.pages : [];
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-all duration-150 ease-out ${
          isSidebarExpanded ? "lg:w-72" : "lg:w-20"
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-50"></div>

          {/* Logo */}
          <div
            className={`flex items-center p-6 border-b border-white/10 backdrop-blur-sm transition-all duration-300 relative z-10 ${
              isSidebarExpanded ? "justify-between" : "lg:justify-center"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl  bg-white transform hover:scale-110 transition-transform duration-300 relative group overflow-hidden">
                {/* Logo Image */}
                <img
                  src="/rcc-logo.png"
                  alt="RCC Contractor Logo"
                  className="w-full h-full object-contain rounded-2xl relative z-10"
                />
                <div className=""></div>
              </div>
              <h1
                className={`text-lg font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent transition-all duration-150 whitespace-nowrap ${
                  isSidebarExpanded
                    ? "lg:opacity-100"
                    : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                RCC Contractor
              </h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 relative z-10 overflow-y-auto">
            <ul className="space-y-3">
              {menuItems.map((menu) => (
                <li key={menu.id} className="relative">
                  <button
                    onClick={() => {
                      if (menu.url) {
                        window.open(menu.url, "_blank", "noopener,noreferrer");
                      } else if (menu.pages.length > 0) {
                        toggleDropdown(menu.id);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-150 group relative overflow-hidden ${
                      isMenuActive(menu)
                        ? "bg-gradient-to-r " +
                          menu.gradient +
                          " text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm"
                    } ${!isSidebarExpanded ? "lg:justify-center" : ""}`}
                    title={!isSidebarExpanded ? menu.name : ""}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        isMenuActive(menu) ? "bg-white/20" : "bg-white/5"
                      } transition-colors`}
                    >
                      <menu.icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <span
                      className={`font-medium text-sm transition-all duration-150 whitespace-nowrap ${
                        isSidebarExpanded
                          ? "lg:opacity-100"
                          : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                      }`}
                    >
                      {menu.name}
                    </span>
                    {menu.pages.length > 0 && isSidebarExpanded && (
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                          dropdownOpen[menu.id] ? "rotate-180" : ""
                        }`}
                      />
                    )}
                    {!isSidebarExpanded && (
                      <div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 whitespace-nowrap hidden lg:block shadow-xl border border-white/10">
                        {menu.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  {isSidebarExpanded &&
                    menu.pages.length > 0 &&
                    dropdownOpen[menu.id] && (
                      <ul className="ml-4 mt-2 space-y-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-3 animate-in slide-in-from-top-2 duration-300">
                        {menu.pages.map((page) => (
                          <li key={page.id}>
                            <button
                              onClick={() => selectPage(page.id)}
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                                selectedPage === page.id
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                                  : "text-gray-300 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <page.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{page.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User + Logout */}
          <div className="p-4 border-t border-white/10 backdrop-blur-sm relative z-10">
            <div
              className={`flex items-center mb-4 transition-all duration-300 ${
                isSidebarExpanded
                  ? "space-x-3"
                  : "lg:justify-center lg:space-x-0"
              }`}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-110 transition-transform duration-300 relative group">
                <User className="w-5 h-5 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
              </div>
              <div
                className={`transition-all duration-300 whitespace-nowrap ${
                  isSidebarExpanded
                    ? "lg:opacity-100"
                    : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <p className="font-semibold text-white">
                  {userType || "Guest"}
                </p>
                <p className="text-sm text-gray-400">
                  {userType === "admin" ? "Administrator" : "User"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/20 hover:text-red-300 backdrop-blur-sm transition-all duration-300 group relative border border-red-500/20 hover:border-red-500/40 ${
                isSidebarExpanded
                  ? "space-x-3"
                  : "lg:justify-center lg:space-x-0"
              }`}
              title={!isSidebarExpanded ? "Logout" : ""}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 transform group-hover:scale-110 transition-transform" />
              <span
                className={`font-medium transition-all duration-300 whitespace-nowrap ${
                  isSidebarExpanded
                    ? "lg:opacity-100"
                    : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                Logout
              </span>
              {!isSidebarExpanded && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 whitespace-nowrap hidden lg:block shadow-xl">
                  Logout
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-red-600"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-64 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                />
              </div>
              <button className="relative p-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 group">
                <Bell className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"></div>

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {getCurrentTitle()}
                  </h3>
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
                <div className="mt-3 h-1.5 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
              </div>

              {/* Page Selector Dropdown */}
              <div className="relative group">
                <select
                  value={selectedPage || ""}
                  onChange={(e) => selectPage(e.target.value)}
                  className="appearance-none bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 text-gray-700 py-3 pl-5 pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 cursor-pointer min-w-[240px] font-medium transition-all duration-300 hover:shadow-lg hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!activeMenu}
                >
                  <option value="" disabled>
                    {activeMenu ? "Select Page" : "Open a menu first"}
                  </option>
                  {getActiveMenuPages().map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none transition-transform group-hover:translate-y-[-8px]" />
              </div>
            </div>

            {/* Content Outlet */}
            <div className="min-h-[500px] p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-2xl backdrop-blur-sm border border-gray-200/50 shadow-inner relative z-10">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
