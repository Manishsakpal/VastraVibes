"use client";

import Link from 'next/link';
import { ShoppingBasket, UserCog, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { isAdmin, logout } = useAdminAuth();
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl md:text-3xl font-bold text-primary hover:text-primary/80 transition-colors" aria-label="Vastra Vibes Home Page">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-7 w-7 md:h-8 md:w-8" />
            <span>Vastra Vibes</span>
          </div>
        </Link>
        <nav>
          <ul className="flex items-center space-x-3 md:space-x-6">
            <li>
              <Button variant={pathname === "/" ? "default" : "ghost"} asChild>
                <Link href="/">Home</Link>
              </Button>
            </li>
            {isAdmin ? (
              <>
                <li>
                  <Button variant={pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/add-item") ? "default" : "ghost"} asChild>
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" onClick={logout} aria-label="Logout from admin account">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </li>
              </>
            ) : (
              <li>
                <Button variant={pathname === "/admin/login" ? "default" : "ghost"} asChild>
                  <Link href="/admin/login">
                    <UserCog className="mr-2 h-4 w-4" /> Admin Login
                  </Link>
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
