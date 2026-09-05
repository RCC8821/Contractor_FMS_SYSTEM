
import React, { useState, useEffect, useRef } from "react";
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
  ExternalLink,
} from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // tracking open dropdown in header
  const [selectedPage, setSelectedPage] = useState(null);
  const dropdownRef = useRef(null);

  const { userType, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync route path with selected page
  useEffect(() => {
    const page = allPages.find((p) => p.path.toLowerCase() === location.pathname.toLowerCase());
    if (page) {
      setSelectedPage(page.id);
    } else {
      setSelectedPage(null);
    }
  }, [location.pathname]);

  // ============== ALL PAGES (Matched perfectly with App.jsx routes) ==============
  const allPages = [
    // FMS
    {
      id: "contractor-requirement-form",
      name: "Contractor Requirement Form",
      icon: FileText,
      path: "/dashboard/Contractor-Requirement-Form",
      allowedUserTypes: ["admin"],
      category: "fms",
    },
    {
      id: "Approval_For_Meeting",
      name: "Contractor Quotation Approval ",
      icon: FileText,
      path: "/dashboard/Approval_For_Meeting",
      allowedUserTypes: ["admin"],
      category: "fms",
    },
    {
      id: "First_Meeting_Attend",
      name: "WORK ORDER ",
      icon: FileText,
      path: "/dashboard/First_Meeting_Attend",
      allowedUserTypes: ["admin"],
      category: "fms",
    },
    {
      id: "Meeting_Mom",
      name: "Meeting MOM",
      icon: FileText,
      path: "/dashboard/Meeting_Mom",
      allowedUserTypes: ["admin"],
      category: "fms",
    },
    {
      id: "Second_Meeting_Attend",
      name: "Second Meeting Attend",
      icon: FileText,
      path: "/dashboard/Second_Meeting_Attend",
      allowedUserTypes: ["admin"],
      category: "fms",
    },

    // BILLING
    {
      id: "Bill_Tally_form",
      name: "Bill Entry Form (Tally)",
      icon: Receipt,
      path: "/dashboard/Bill_Tally_form",
      allowedUserTypes: ["admin", "Mohit Mishra"],
      category: "billing",
    },
    {
      id: "Bill_Checked",
      name: "Bill Checked by Site Engineer",
      icon: FileText,
      path: "/dashboard/Bill_Checked",
      allowedUserTypes: ["admin", "Mohit Mishra"],
      category: "billing",
    },
    {
      id: "Bill_Checked_By_Office",
      name: "Bill Checked By Office",
      icon: FileText,
      path: "/dashboard/Bill_Checked_By_Office",
      allowedUserTypes: ["admin", "Mohit Mishra"],
      category: "billing",
    },

    // PAYMENT
    {
      id: "BILL_FINAL_BY_OFFICE",
      name: "Bill Final By Office",
      icon: FileText,
      path: "/dashboard/BILL_FINAL_BY_OFFICE",
      allowedUserTypes: ["admin", "Mohit Mishra"],
      category: "payment",
    },
    {
      id: "BiLL_Checked_BY_RavindraSir",
      name: "Bill Checked By Ravindra Sir",
      icon: DollarSign,
      path: "/dashboard/BiLL_Checked_BY_RavindraSir",
      allowedUserTypes: ["admin", "Ravindra Singh"],
      category: "payment",
    },
    {
      id: "BiLL_Checked_BY_AshokSir",
      name: "Bill Checked By Ashok Sir",
      icon: DollarSign,
      path: "/dashboard/BiLL_Checked_BY_AshokSir",
      allowedUserTypes: ["admin", "Ashok Sir"],
      category: "payment",
    },
    {
      id: "Payment_Tally",
      name: "Payment Tally",
      icon: DollarSign,
      path: "/dashboard/Payment_Tally",
      allowedUserTypes: ["admin", "Ramprasad"],
      category: "payment",
    },

    // DEBIT
    {
      id: "Material_debit",
      name: "Material Debit",
      icon: FileText,
      path: "/dashboard/Material_debit",
      allowedUserTypes: ["admin", "Mohit Mishra"],
      category: "debit",
    },
    {
      id: "Labour_debit",
      name: "Labour Debit",
      icon: FileText,
      path: "/dashboard/Labour_debit",
      allowedUserTypes: ["admin", "Mohit Mishra"],
      category: "debit",
    },
  ];

  const getPagesByCategory = (category) => {
    return allPages.filter(
      (p) => p.allowedUserTypes.includes(userType) && p.category === category
    );
  };

  const menuItems = [
    {
      id: "fms",
      name: "Contractor Selection",
      icon: ShoppingCart,
      pages: getPagesByCategory("fms"),
      color: "hover:text-blue-600 border-blue-500",
    },
    {
      id: "billing",
      name: "Billing",
      icon: Receipt,
      pages: getPagesByCategory("billing"),
      color: "hover:text-emerald-600 border-emerald-500",
    },
    {
      id: "payment",
      name: "Payment",
      icon: DollarSign,
      pages: getPagesByCategory("payment"),
      color: "hover:text-purple-600 border-purple-500",
    },
    {
      id: "debit",
      name: "Debit",
      icon: FileText,
      pages: getPagesByCategory("debit"),
      color: "hover:text-orange-600 border-orange-500",
    },
  ];

  const handlePageClick = (page) => {
    setSelectedPage(page.id);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    navigate(page.path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const getCurrentTitle = () => {
    const page = allPages.find((p) => p.id === selectedPage);
    return page ? page.name : "Welcome to Dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Header & Navigation (Fixed on Top) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" ref={dropdownRef}>
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-12 h-12 bg-white rounded-xl shadow-md border border-gray-100 p-1 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-200">
                <img
                  src="/rcc-logo.png"
                  alt="RCC Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">RCC Contractor</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">FMS Dashboard</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {menuItems.map((menu) => {
                // If user doesn't have permission for any page in this category, don't show it
                if (menu.pages.length === 0) return null;

                const isOpen = activeDropdown === menu.id;
                const isAnyChildActive = menu.pages.some((p) => p.id === selectedPage);

                return (
                  <div key={menu.id} className="relative">
                    <button
                      onClick={() => setActiveDropdown(isOpen ? null : menu.id)}
                      className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isAnyChildActive
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <menu.icon className="w-4 h-4" />
                      <span>{menu.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu (Desktop) */}
                    {isOpen && (
                      <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{menu.name}</p>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto px-2 space-y-1">
                          {menu.pages.map((page) => (
                            <button
                              key={page.id}
                              onClick={() => handlePageClick(page)}
                              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-150 ${
                                selectedPage === page.id
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <page.icon className={`w-4 h-4 flex-shrink-0 ${selectedPage === page.id ? "text-white" : "text-slate-400"}`} />
                              <span className="truncate">{page.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Static Sheet Link */}
              <a
                href="https://docs.google.com/spreadsheets/d/1oDOdk15OIRVJvMWiSy2WFIiHUJ4cVK4XFUB8govLer0/edit?gid=500756859#gid=500756859"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
              >
                <FileText className="w-4 h-4 text-green-600" />
                <span>Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </nav>

            {/* Right Side Actions (Profile, Search & Logout) */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* User Profile Info */}
              <div className="flex items-center space-x-3 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-3">{userType || "Guest"}</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-3 mt-0.5 capitalize">{userType === "admin" ? "Administrator" : "Team Member"}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center lg:hidden space-x-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-gray-100 shadow-2xl p-4 flex flex-col space-y-4">
            
            {/* User Profile Card Mobile */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{userType || "Guest"}</p>
                <p className="text-xs text-slate-500 capitalize">{userType === "admin" ? "Admin" : "User"}</p>
              </div>
            </div>

            {/* Mobile Menus */}
            <div className="space-y-2">
              {menuItems.map((menu) => {
                if (menu.pages.length === 0) return null;
                const isExpanded = activeDropdown === menu.id;

                return (
                  <div key={menu.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setActiveDropdown(isExpanded ? null : menu.id)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 font-bold text-slate-700 text-sm hover:bg-slate-100/50 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <menu.icon className="w-4 h-4 text-slate-500" />
                        <span>{menu.name}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && (
                      <div className="bg-white p-2 space-y-1 border-t border-slate-50">
                        {menu.pages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => handlePageClick(page)}
                            className={`w-full flex items-center space-x-3 p-2.5 rounded-xl text-sm font-semibold transition-all ${
                              selectedPage === page.id
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <page.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{page.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Sheet Link Mobile */}
              <a
                href="https://docs.google.com/spreadsheets/d/1oDOdk15OIRVJvMWiSy2WFIiHUJ4cVK4XFUB8govLer0/edit?gid=500756859#gid=500756859"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center space-x-2.5 p-3.5 border border-slate-100 rounded-2xl font-bold text-sm text-green-700 bg-green-50/50 hover:bg-green-50 transition-all"
              >
                <FileText className="w-4 h-4 text-green-600" />
                <span>Google Sheet Link</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
              </a>
            </div>

            {/* Logout Mobile */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-3.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-2xl font-bold text-sm transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8 flex flex-col space-y-6">
        
        {/* Page Title Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {getCurrentTitle()}
              </h3>
              {selectedPage && <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />}
            </div>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              {selectedPage ? `Active Module: ${getCurrentTitle()}` : "Select any module from the navigation bar above to view the forms."}
            </p>
          </div>

          {/* Elegant Page Route indicator */}
          <div className="text-xs bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl font-mono font-bold text-slate-600 self-start md:self-auto">
            {location.pathname}
          </div>
        </div>

        {/* Dynamic Form Layout Wrapper (Outlet takes 100% horizontal space) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/50 p-6 flex-1 min-h-[550px] relative overflow-hidden">
          {/* Subtle design accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500/5 to-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 w-full h-full">
            {selectedPage ? (
              <Outlet />
            ) : (
              // Empty State Dashboard Landing Page
              <div className="h-[450px] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm mb-6 animate-bounce duration-1000">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-black text-slate-800">RCC Contractor FMS</h4>
                <p className="text-slate-500 max-w-md text-sm font-medium mt-2">
                  Aapka swagat hai! Contractor selection, billing entries, approvals ya payments ko process karne ke liye upar diye gaye menu options ka use karein.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <div className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-2xl">
                    ⚡ Fast Response Layout
                  </div>
                  <div className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-2xl">
                    🖥️ Full Width Workspace
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;