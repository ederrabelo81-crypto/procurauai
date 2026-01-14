import { CategoryCard } from '@/components/cards/CategoryCard';
import { categories } from '@/data/mockData';

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          icon={category.icon}
        />
      ))}
    </div>
  );
}
