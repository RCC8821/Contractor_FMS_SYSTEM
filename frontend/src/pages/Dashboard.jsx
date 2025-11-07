// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Search, User, FileText, ShoppingCart, ChevronDown, LogOut, Menu, Bell, X,Receipt } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

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

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Sync selectedPage with current path
  useEffect(() => {
    const page = allPages.find(p => p.path === location.pathname);
    if (page) {
      setSelectedPage(page.id);
      const menu = menuItems.find(m => m.pages.some(p => p.id === page.id));
      setActiveMenu(menu ? menu.id : null);
    } else {
      setSelectedPage(null);
      setActiveMenu(null);
    }
  }, [location.pathname]);

  // ====================== ALL PAGES ======================
  const allPages = [
    // FMS
    {
      id: 'contractor-requirement-form',
      name: 'Contractor Requirement Form',
      icon: FileText,
      path: '/dashboard/contractor-requirement-form',
      allowedUserTypes: ['admin'],
      category: 'fms',
    },
    // Billing
    {
      id: 'Bill_Tally_form',
      name: 'Bill Tally Form',
      icon: Receipt,
      path: '/dashboard/Bill_Tally_form',
      allowedUserTypes: ['admin'],
      category: 'billing',
    },
    {
      id: 'Bill_Checked',
      name: 'Bill_Checked',
      icon: FileText,
      path: '/dashboard/Bill_Checked',
      allowedUserTypes: ['admin'],
      category: 'billing',
    },
    {
      id: 'billing-payments',
      name: 'Payment Status',
      icon: FileText,
      path: '/dashboard/billing/payments',
      allowedUserTypes: ['admin'],
      category: 'billing',
    },
  ];

  const getPagesByCategory = (category) => {
    return allPages.filter(
      p => p.allowedUserTypes.includes(userType) && p.category === category
    );
  };

  const fmsPages = getPagesByCategory('fms');
  const billingPages = getPagesByCategory('billing');

  // ====================== MENU ITEMS ======================
  const menuItems = [
    {
      id: 'fms',
      name: 'Contractor FMS',
      icon: ShoppingCart,
      pages: fmsPages,
    },
    {
      id: 'billing',
      name: 'Contractor Billing',
      icon: ShoppingCart,
      pages: billingPages,
    },
    {
      id: 'sheet-link',
      name: 'Sheet Link',
      icon: FileText,
      url: 'https://docs.google.com/spreadsheets/d/1-ZhXcSS3yYh3komYk5020JSAxyczYW3Pq6iob74NvhM/edit?gid=663292535#gid=663292535',
      pages: [],
    },
  ];

  // ====================== HANDLERS ======================
  const toggleDropdown = (menuId) => {
    setDropdownOpen(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
    setActiveMenu(menuId);
  };

  const selectPage = (pageId) => {
    const page = allPages.find(p => p.id === pageId);
    if (page) {
      setSelectedPage(pageId);
      const menu = menuItems.find(m => m.pages.some(p => p.id === pageId));
      setActiveMenu(menu ? menu.id : null);
      setDropdownOpen({});
      setIsMobileMenuOpen(false);
      navigate(page.path); // This triggers Outlet to render
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getCurrentTitle = () => {
    const page = allPages.find(p => p.id === selectedPage);
    return page ? page.name : 'Select a Module';
  };

  const isMenuActive = (menu) => {
    return menu.pages.some(p => p.id === selectedPage);
  };

  const getActiveMenuPages = () => {
    if (!activeMenu) return [];
    const menu = menuItems.find(m => m.id === activeMenu);
    return menu ? menu.pages : [];
  };

  // ====================== RENDER ======================
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center p-6 border-b border-gray-100 transition-all duration-300 ${isSidebarExpanded ? 'justify-between' : 'lg:justify-center'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-blue-600">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <h1 className={`text-xl font-bold text-gray-800 transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                RCC Contractor
              </h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((menu) => (
                <li key={menu.id} className="relative">
                  <button
                    onClick={() => {
                      if (menu.url) {
                        window.open(menu.url, '_blank', 'noopener,noreferrer');
                      } else if (menu.pages.length > 0) {
                        toggleDropdown(menu.id);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isMenuActive(menu)
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    } ${!isSidebarExpanded ? 'lg:justify-center' : ''}`}
                    title={!isSidebarExpanded ? menu.name : ''}
                  >
                    <menu.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                      {menu.name}
                    </span>
                    {menu.pages.length > 0 && isSidebarExpanded && (
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                          dropdownOpen[menu.id] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                    {!isSidebarExpanded && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
                        {menu.name}
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  {isSidebarExpanded && menu.pages.length > 0 && dropdownOpen[menu.id] && (
                    <ul className="ml-6 mt-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-md p-2">
                      {menu.pages.map((page) => (
                        <li key={page.id}>
                          <button
                            onClick={() => selectPage(page.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                              selectedPage === page.id
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
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
          <div className="p-4 border-t border-gray-100">
            <div className={`flex items-center mb-4 transition-all duration-300 ${isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className={`transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                <p className="font-semibold text-gray-800">{userType || 'Guest'}</p>
                <p className="text-sm text-gray-600">{userType === 'admin' ? 'Admin' : 'User'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group relative ${
                isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'
              }`}
              title={!isSidebarExpanded ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                Logout
              </span>
              {!isSidebarExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button className="relative p-2 rounded-xl hover:bg-gray-100">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{getCurrentTitle()}</h3>
                <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              </div>

              {/* Page Selector Dropdown */}
              <div className="relative">
                <select
                  value={selectedPage || ''}
                  onChange={(e) => selectPage(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[220px]"
                  disabled={!activeMenu}
                >
                  <option value="" disabled>
                    {activeMenu ? 'Select Page' : 'Open a menu first'}
                  </option>
                  {getActiveMenuPages().map(page => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Content Outlet */}
            <div className="min-h-[500px] p-4 bg-gray-50 rounded-xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;