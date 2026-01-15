import { categories } from '@/data/mockData';
import { CategoryCard } from '@/components/cards/CategoryCard';
export function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          iconKey={category.iconKey}
          size="sm"
        />
      ))}
    </div>
  );
}
