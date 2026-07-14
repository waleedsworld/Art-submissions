import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";

// Route-level code splitting: each page ships in its own chunk and is
// fetched on demand, keeping the initial bundle small.
const Index = lazy(() => import("@/pages/Index"));
const Upload = lazy(() => import("@/pages/Upload"));
const Check = lazy(() => import("@/pages/Check"));
const ApiTest = lazy(() => import("@/pages/ApiTest"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground"
      role="status"
      aria-label="Loading"
    />
  </div>
);

const App = () => {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/check" element={<Check />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </Router>
  );
};

export default App;
