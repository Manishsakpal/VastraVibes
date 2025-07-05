
"use client";

import Link from 'next/link';
import { ShoppingBasket, UserCog, LogOut, ShieldCheck, ShoppingBag, UserPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/context/admin-auth-context';
import { usePathname } from 'next/navigation';
import { useBagContext } from '@/context/bag-context';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { isAdmin, isSuperAdmin, logout } = useAdminAuth();
  const { cartCount, isLoading } = useBagContext();
  const pathname = usePathname();

  const isAnyAdmin = isAdmin || isSuperAdmin;

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl md:text-3xl font-bold text-primary hover:text-primary/80 transition-colors" aria-label="Vastra Vibes Home Page">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-7 w-7 md:h-8 md:w-8" />
            <span>Vastra Vibes</span>
          </div>
        </Link>
        <nav>
          <ul className="flex items-center space-x-1 md:space-x-2">
            <li>
              <Button variant="ghost" asChild>
                <Link href="/track">
                  <FileText className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Track Order</span>
                </Link>
              </Button>
            </li>
            
            {isSuperAdmin && (
               <li>
                  <Button variant={pathname.startsWith("/superAdmin") ? "default" : "ghost"} asChild>
                    <Link href="/superAdmin">
                      <UserPlus className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Super Admin</span>
                    </Link>
                  </Button>
                </li>
            )}
            
            {isAnyAdmin ? (
              <>
               {isAdmin && !isSuperAdmin && (
                 <li>
                    <Button variant={pathname.startsWith("/admin") && !pathname.startsWith('/admin/login') ? "default" : "ghost"} asChild>
                      <Link href="/admin/dashboard">
                        <ShieldCheck className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Admin</span>
                      </Link>
                    </Button>
                  </li>
               )}
                <li>
                  <Button variant="ghost" onClick={logout} aria-label="Logout from admin account">
                    <LogOut className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </li>
              </>
            ) : (
              // No "Admin" button is shown to the public. They must navigate to /admin/login directly.
              null
            )}

            <li>
              <Button variant="ghost" asChild className="relative">
                <Link href="/bag">
                  <ShoppingBag />
                  <span className="sr-only">View Shopping Bag</span>
                  {!isLoading && cartCount > 0 && (
                     <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
