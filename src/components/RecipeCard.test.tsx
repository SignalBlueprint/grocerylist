import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from './RecipeCard';
import { Recipe } from '@/types';

const mockRecipe: Recipe = {
  id: 'test-recipe',
  name: 'Test Recipe',
  cuisine: 'Italian',
  tags: ['pasta', 'quick'],
  servingsBase: 4,
  ingredients: [
    { name: 'pasta', quantity: 400, unit: 'g', category: 'Pantry' },
    { name: 'sauce', quantity: 1, unit: 'cup', category: 'Pantry' },
  ],
};

describe('RecipeCard - List View', () => {
  it('renders recipe name', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });

  it('renders cuisine', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('pasta')).toBeInTheDocument();
    expect(screen.getByText('quick')).toBeInTheDocument();
  });

  it('renders servings and ingredient count', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('4 servings • 2 ingredients')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText('Test Recipe'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('shows "Selected" badge when selected', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('does not show "Selected" badge when not selected', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.queryByText('Selected')).not.toBeInTheDocument();
  });
});

describe('RecipeCard - Selected View', () => {
  it('renders servings controls when in selected mode', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        servings={4}
        onSelect={() => {}}
        onRemove={() => {}}
        onServingsChange={() => {}}
      />
    );

    expect(screen.getByText('Servings:')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease servings')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase servings')).toBeInTheDocument();
  });

  it('calls onServingsChange when + is clicked', () => {
    const onServingsChange = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        servings={4}
        onSelect={() => {}}
        onRemove={() => {}}
        onServingsChange={onServingsChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Increase servings'));

    expect(onServingsChange).toHaveBeenCalledWith(5);
  });

  it('calls onServingsChange when - is clicked', () => {
    const onServingsChange = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        servings={4}
        onSelect={() => {}}
        onRemove={() => {}}
        onServingsChange={onServingsChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Decrease servings'));

    expect(onServingsChange).toHaveBeenCalledWith(3);
  });

  it('does not go below 1 serving', () => {
    const onServingsChange = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        servings={1}
        onSelect={() => {}}
        onRemove={() => {}}
        onServingsChange={onServingsChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Decrease servings'));

    expect(onServingsChange).toHaveBeenCalledWith(1);
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        servings={4}
        onSelect={() => {}}
        onRemove={onRemove}
        onServingsChange={() => {}}
      />
    );

    fireEvent.click(screen.getByLabelText('Remove recipe'));

    expect(onRemove).toHaveBeenCalled();
  });

  it('shows base servings info', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        servings={8}
        onSelect={() => {}}
        onRemove={() => {}}
        onServingsChange={() => {}}
      />
    );

    expect(screen.getByText('(base: 4)')).toBeInTheDocument();
  });

  it('uses recipe base servings when servings prop not provided', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isSelected={true}
        onSelect={() => {}}
        onRemove={() => {}}
        onServingsChange={() => {}}
      />
    );

    // Should show the base servings (4) as current
    const servingsDisplay = screen.getByText('4');
    expect(servingsDisplay).toBeInTheDocument();
  });
});
