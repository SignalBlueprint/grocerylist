import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeList } from './RecipeList';
import { Recipe, SelectedRecipe } from '@/types';

const mockRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Spaghetti Bolognese',
    cuisine: 'Italian',
    tags: ['pasta', 'beef', 'dinner'],
    servingsBase: 4,
    ingredients: [
      { name: 'spaghetti', quantity: 400, unit: 'g', category: 'Pantry' },
      { name: 'ground beef', quantity: 500, unit: 'g', category: 'Meat' },
    ],
  },
  {
    id: 'recipe-2',
    name: 'Chicken Stir Fry',
    cuisine: 'Asian',
    tags: ['chicken', 'quick', 'healthy'],
    servingsBase: 4,
    ingredients: [
      { name: 'chicken breast', quantity: 500, unit: 'g', category: 'Meat' },
    ],
  },
  {
    id: 'recipe-3',
    name: 'Beef Tacos',
    cuisine: 'Mexican',
    tags: ['beef', 'quick'],
    servingsBase: 4,
    ingredients: [
      { name: 'ground beef', quantity: 500, unit: 'g', category: 'Meat' },
    ],
  },
];

describe('RecipeList', () => {
  it('renders all recipes', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.getByText('Chicken Stir Fry')).toBeInTheDocument();
    expect(screen.getByText('Beef Tacos')).toBeInTheDocument();
  });

  it('shows recipe cuisines', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    // Cuisines appear twice: once in filter buttons, once in recipe cards
    expect(screen.getAllByText('Italian').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Asian').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Mexican').length).toBeGreaterThanOrEqual(1);
  });

  it('shows recipe tags', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    expect(screen.getAllByText('beef').length).toBeGreaterThan(0);
    expect(screen.getAllByText('pasta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('quick').length).toBeGreaterThan(0);
  });

  it('calls onSelectRecipe when a recipe is clicked', () => {
    const onSelectRecipe = vi.fn();
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={onSelectRecipe}
      />
    );

    fireEvent.click(screen.getByText('Spaghetti Bolognese'));

    expect(onSelectRecipe).toHaveBeenCalledWith('recipe-1');
  });

  it('filters recipes by search query (name)', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search recipes...');
    fireEvent.change(searchInput, { target: { value: 'Spaghetti' } });

    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.queryByText('Chicken Stir Fry')).not.toBeInTheDocument();
    expect(screen.queryByText('Beef Tacos')).not.toBeInTheDocument();
  });

  it('filters recipes by search query (cuisine)', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search recipes...');
    fireEvent.change(searchInput, { target: { value: 'Italian' } });

    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.queryByText('Chicken Stir Fry')).not.toBeInTheDocument();
  });

  it('filters recipes by search query (tag)', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search recipes...');
    fireEvent.change(searchInput, { target: { value: 'chicken' } });

    expect(screen.getByText('Chicken Stir Fry')).toBeInTheDocument();
    expect(screen.queryByText('Spaghetti Bolognese')).not.toBeInTheDocument();
  });

  it('filters recipes by cuisine button', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    // Find and click the Italian cuisine filter button
    const cuisineButtons = screen.getAllByRole('button');
    const italianButton = cuisineButtons.find((b) => b.textContent === 'Italian');
    fireEvent.click(italianButton!);

    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.queryByText('Chicken Stir Fry')).not.toBeInTheDocument();
    expect(screen.queryByText('Beef Tacos')).not.toBeInTheDocument();
  });

  it('filters recipes by tag button', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    // Find and click the 'quick' tag filter button
    const tagButtons = screen.getAllByRole('button');
    const quickButton = tagButtons.find((b) => b.textContent === 'quick');
    fireEvent.click(quickButton!);

    expect(screen.getByText('Chicken Stir Fry')).toBeInTheDocument();
    expect(screen.getByText('Beef Tacos')).toBeInTheDocument();
    expect(screen.queryByText('Spaghetti Bolognese')).not.toBeInTheDocument();
  });

  it('shows "All" button that clears filters', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    // Filter by cuisine first
    const cuisineButtons = screen.getAllByRole('button');
    const italianButton = cuisineButtons.find((b) => b.textContent === 'Italian');
    fireEvent.click(italianButton!);

    expect(screen.queryByText('Chicken Stir Fry')).not.toBeInTheDocument();

    // Click All button
    const allButton = screen.getByText('All');
    fireEvent.click(allButton);

    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.getByText('Chicken Stir Fry')).toBeInTheDocument();
    expect(screen.getByText('Beef Tacos')).toBeInTheDocument();
  });

  it('shows "No recipes found" when no matches', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search recipes...');
    fireEvent.change(searchInput, { target: { value: 'xyz123notfound' } });

    expect(screen.getByText('No recipes found')).toBeInTheDocument();
  });

  it('marks selected recipes visually', () => {
    const selectedRecipes: SelectedRecipe[] = [{ recipeId: 'recipe-1', servings: 4 }];

    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={selectedRecipes}
        onSelectRecipe={() => {}}
      />
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('toggles cuisine filter on second click', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        selectedRecipes={[]}
        onSelectRecipe={() => {}}
      />
    );

    const cuisineButtons = screen.getAllByRole('button');
    const italianButton = cuisineButtons.find((b) => b.textContent === 'Italian');

    // First click - filter
    fireEvent.click(italianButton!);
    expect(screen.queryByText('Chicken Stir Fry')).not.toBeInTheDocument();

    // Second click - clear filter
    fireEvent.click(italianButton!);
    expect(screen.getByText('Chicken Stir Fry')).toBeInTheDocument();
  });
});
