
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Check from "@/pages/Check";
import Upload from "@/pages/Upload";
import ApiTest from "@/pages/ApiTest";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/check" element={<Check />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
