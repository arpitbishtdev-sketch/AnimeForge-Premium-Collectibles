import { BrowserRouter, useRoutes } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDeviceCapabilities } from "./hooks/useDeviceCapabilities";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ADMIN_ROUTES } from "./admin/routes";
import MainLayout from "./layouts/MainLayout";
import HomeLayout from "./layouts/HomeLayout";

import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import ScrollToTop from "./components/shared/ScrollToTop";
import {
  ProductDetailSkeleton,
  CollectionsSkeleton,
} from "./components/shared/Skeleton";
import { AuthProvider } from "./context/AuthContext";

const Cart = lazy(() => import("./pages/Cart"));
const User = lazy(() => import("./pages/User"));
const Collections = lazy(() => import("./pages/Collections"));
const ProductDetail = lazy(() => import("./pages/Productdetailpage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const VerifyEmail = lazy(() => import("./pages/Verifyemail"));

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
      element: <MainLayout />,
      children: [
        { path: "/", element: <HomeLayout /> },
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
        {
          path: "/collections/:tag",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<CollectionsSkeleton />}>
                <Collections />
              </Suspense>
            </ErrorBoundary>
          ),
        },
        {
          path: "/checkout",
          element: (
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Checkout />
              </Suspense>
            </ErrorBoundary>
          ),
        },
        {
  path: "/verify-email",
  element: (
    <Suspense fallback={<PageLoader />}>
      <VerifyEmail />
    </Suspense>
  ),
},
      ],
    },
    ...ADMIN_ROUTES,
  ];

  return (
    <>
      <ScrollToTop />
      {useRoutes(routes)}
    </>
  );
}

export default function App() {
  const { isLowEnd } = useDeviceCapabilities();

  useEffect(() => {
    if (isLowEnd) document.body.classList.add("low-end");
    else document.body.classList.remove("low-end");
  }, [isLowEnd]);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
