import { BrowserRouter, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ADMIN_ROUTES } from "./admin/routes";
import MainLayout from "./layouts/MainLayout";
import HomeLayout from "./layouts/HomeLayout"; //   NOT lazy (LCP critical)

import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import {
  ProductDetailSkeleton,
  CollectionsSkeleton,
} from "./components/shared/Skeleton";

//   Lazy-loaded pages (non-critical routes)
const Cart = lazy(() => import("./pages/Cart"));
const User = lazy(() => import("./pages/User"));
const Collections = lazy(() => import("./pages/Collections"));
const ProductDetail = lazy(() => import("./pages/Productdetailpage"));

// Simple fallback loader
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-0)",
        color: "var(--accent)",
      }}
    >
      Loading...
    </div>
  );
}

function AppRoutes() {
  const routes = [
    {
      element: <MainLayout />, //   Navbar layout
      children: [
        //   Landing Page (NOT lazy)
        { path: "/", element: <HomeLayout /> },

        //   Cart
        {
          path: "/cart",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Cart />
              </Suspense>
            </ErrorBoundary>
          ),
        },

        //   User
        {
          path: "/user",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <User />
              </Suspense>
            </ErrorBoundary>
          ),
        },

        //    Product Detail
        {
          path: "/product/:slug",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<ProductDetailSkeleton />}>
                <ProductDetail />
              </Suspense>
            </ErrorBoundary>
          ),
        },

        //   Collections
        {
          path: "/collections",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<CollectionsSkeleton />}>
                <Collections />
              </Suspense>
            </ErrorBoundary>
          ),
        },
      ],
    },

    //   Admin routes (already structured separately)
    ...ADMIN_ROUTES,
  ];

  return useRoutes(routes);
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
