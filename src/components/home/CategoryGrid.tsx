import { useState } from 'react';
import { mainCategories, extraCategories, categories } from '@/data/mockData';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CategoryGrid() {
  const [showAllModal, setShowAllModal] = useState(false);

  return (
    <>
      {/* Grid 3x2 principal */}
      <div className="grid grid-cols-3 gap-2">
        {mainCategories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            iconKey={category.iconKey}
            size="sm"
          />
        ))}
      </div>

      {/* Botão Ver Mais */}
      <button
        onClick={() => setShowAllModal(true)}
        className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-muted/50 hover:bg-muted rounded-xl text-sm font-medium text-muted-foreground transition-colors touch-target"
      >
        Ver mais categorias
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Modal Ver Mais */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
          <div className="safe-top px-4 py-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Todas as Categorias</h2>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors touch-target"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  iconKey={category.iconKey}
                  size="md"
                  onClickOverride={() => setShowAllModal(false)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
