import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import Index from "./pages/Index";
import Search from "./pages/Search";
import Category from "./pages/Category";
import BusinessDetail from "./pages/BusinessDetail";
import ListingDetail from "./pages/ListingDetail";
import DealDetail from "./pages/DealDetail";
import EventDetail from "./pages/EventDetail";
import NewsDetail from "./pages/NewsDetail";
import ObituaryDetail from "./pages/ObituaryDetail";
import Publish from "./pages/Publish";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import GoogleMaps from "./components/GoogleMaps";


// List pages (novos tipos)
import PlacesList from "./pages/PlacesList";
import CarsList from "./pages/CarsList";
import JobsList from "./pages/JobsList";
import RealEstateList from "./pages/RealEstateList";

// Detail pages (CRIAR AGORA)
import PlaceDetail from "./pages/PlaceDetail";
import CarDetail from "./pages/CarDetail";
import JobDetail from "./pages/JobDetail";
import RealEstateDetail from "./pages/RealEstateDetail";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/buscar" element={<Search />} />
              <Route path="/categoria/:categoryId" element={<Category />} />
              <Route path="/comercio/:categorySlug/:id" element={<BusinessDetail />} />
              <Route path="/comercio/:id" element={<BusinessDetail />} />
              <Route path="/anuncio/:id" element={<ListingDetail />} />
              <Route path="/oferta/:id" element={<DealDetail />} />
              <Route path="/evento/:id" element={<EventDetail />} />
              <Route path="/noticia/:id" element={<NewsDetail />} />
              <Route path="/falecimento/:id" element={<ObituaryDetail />} />
              <Route path="/publicar" element={<Publish />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/mapa" element={<GoogleMaps />} />

              {/* Novos tipos - LISTA */}
              <Route path="/lugares" element={<PlacesList />} />
              <Route path="/carros" element={<CarsList />} />
              <Route path="/empregos" element={<JobsList />} />
              <Route path="/imoveis" element={<RealEstateList />} />

              {/* Novos tipos - DETALHE (isso resolve o 404) */}
              <Route path="/lugares/:slug" element={<PlaceDetail />} />
              <Route path="/carros/:id" element={<CarDetail />} />
              <Route path="/empregos/:id" element={<JobDetail />} />
              <Route path="/imoveis/:id" element={<RealEstateDetail />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
