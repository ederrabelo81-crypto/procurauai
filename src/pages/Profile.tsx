import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Settings, Bell, HelpCircle, Share2, ChevronRight, Download, Smartphone } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { businesses, listings } from '@/data/mockData';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';

type Tab = 'favoritos' | 'config';

export default function Profile() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [activeTab, setActiveTab] = useState<Tab>('favoritos');

  const favoriteBusinesses = businesses.filter(b => 
    favorites.some(f => f.type === 'business' && f.id === b.id)
  );
  const favoriteListings = listings.filter(l => 
    favorites.some(f => f.type === 'listing' && f.id === l.id)
  );

  const menuItems = [
    { icon: Bell, label: 'Notificações', action: () => {} },
    { icon: HelpCircle, label: 'Ajuda', action: () => {} },
    { icon: Share2, label: 'Compartilhar app', action: () => {
      if (navigator.share) {
        navigator.share({
          title: 'Procura UAI',
          text: 'Conheça o Procura UAI - sua cidade na palma da mão!',
          url: window.location.origin,
        });
      }
    }},
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Perfil</h1>
          </div>
          
          <div className="flex gap-2">
            <Chip
              isActive={activeTab === 'favoritos'}
              onClick={() => setActiveTab('favoritos')}
            >
              <Heart className="w-4 h-4 mr-1.5" />
              Favoritos
            </Chip>
            <Chip
              isActive={activeTab === 'config'}
              onClick={() => setActiveTab('config')}
            >
              <Settings className="w-4 h-4 mr-1.5" />
              Configurações
            </Chip>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {activeTab === 'favoritos' && (
          <div className="space-y-6 animate-fade-in">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-semibold text-foreground mb-1">Nenhum favorito ainda</p>
                <p className="text-muted-foreground">Toque no ❤️ para salvar seus lugares e anúncios favoritos</p>
              </div>
            ) : (
              <>
                {favoriteBusinesses.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-foreground mb-3">
                      Comércios ({favoriteBusinesses.length})
                    </h2>
                    <div className="space-y-3">
                      {favoriteBusinesses.map(business => (
                        <BusinessCard key={business.id} business={business} variant="compact" />
                      ))}
                    </div>
                  </section>
                )}

                {favoriteListings.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-foreground mb-3">
                      Anúncios ({favoriteListings.length})
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {favoriteListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-4 animate-fade-in">
            {/* Dark Mode Toggle */}
            <ThemeToggle variant="full" />

            {/* Instalar app */}
            {!isInstalled && (
              <button 
                onClick={promptInstall}
                className="w-full flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl text-left hover:bg-primary/10 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  {isInstallable ? (
                    <Download className="w-6 h-6 text-primary" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Instalar app</p>
                  <p className="text-sm text-muted-foreground">
                    {isInstallable 
                      ? 'Clique para instalar na tela inicial' 
                      : 'Adicione à tela inicial pelo menu do navegador'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}

            {isInstalled && (
              <div className="flex items-center gap-4 p-4 bg-status-open/5 border border-status-open/20 rounded-2xl">
                <div className="w-12 h-12 bg-status-open/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-status-open" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">App instalado! ✓</p>
                  <p className="text-sm text-muted-foreground">Você está usando o app instalado</p>
                </div>
              </div>
            )}

            {/* Menu items */}
            <div className="bg-card rounded-2xl card-shadow overflow-hidden">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Versão */}
            <p className="text-center text-sm text-muted-foreground pt-4">
              Procura UAI v2.0.0
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
