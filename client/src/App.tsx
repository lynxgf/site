import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";

// Layout components
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Pages
import Home from "@/pages/home";
import Products from "@/pages/products";
import Product from "@/pages/product";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Search from "@/pages/search";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import Contacts from "@/pages/contacts";
import Faq from "@/pages/faq";
import Tips from "@/pages/tips";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminProductEdit from "@/pages/admin/product-edit";
import NotFound from "@/pages/not-found";

// Admin route guard
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function AdminRoute({ component: Component, ...rest }: any) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        
        if (!data.isAdmin) {
          setLocation("/admin/login");
        }
      } catch (error) {
        setIsAdmin(false);
        setLocation("/admin/login");
      }
    };
    
    checkAdmin();
  }, [setLocation]);
  
  if (isAdmin === null) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return isAdmin ? <Component {...rest} /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:category" component={Products} />
      <Route path="/product/:id" component={Product} />
      <Route path="/search" component={Search} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      
      {/* Информационные страницы */}
      <Route path="/about" component={About} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/faq" component={Faq} />
      <Route path="/tips" component={Tips} />
      
      {/* User authentication routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        {(params) => <AdminRoute component={AdminDashboard} params={params} />}
      </Route>
      <Route path="/admin/products">
        {(params) => <AdminRoute component={AdminProducts} params={params} />}
      </Route>
      <Route path="/admin/products/new">
        {(params) => <AdminRoute component={AdminProductEdit} params={params} />}
      </Route>
      <Route path="/admin/products/:id/edit">
        {(params) => <AdminRoute component={AdminProductEdit} params={params} />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
