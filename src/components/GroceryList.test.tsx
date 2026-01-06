import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { GroceryList } from './GroceryList';
import { GroceryItem } from '@/types';

const mockItems: GroceryItem[] = [
  {
    id: '1',
    name: 'onion',
    quantity: 2,
    unit: 'item',
    category: 'Produce',
    checked: false,
    sourceRecipes: ['Recipe 1'],
  },
  {
    id: '2',
    name: 'chicken breast',
    quantity: 500,
    unit: 'g',
    category: 'Meat',
    checked: false,
    sourceRecipes: ['Recipe 1'],
  },
  {
    id: '3',
    name: 'milk',
    quantity: 1,
    unit: 'cup',
    category: 'Dairy',
    checked: true,
    sourceRecipes: ['Recipe 2'],
  },
  {
    id: '4',
    name: 'garlic',
    quantity: 3,
    unit: 'clove',
    category: 'Produce',
    notes: 'minced',
    checked: false,
    sourceRecipes: ['Recipe 1', 'Recipe 2'],
  },
];

describe('GroceryList', () => {
  const defaultProps = {
    items: mockItems,
    onToggleItem: vi.fn(),
    onUpdateItem: vi.fn(),
    onDeleteItem: vi.fn(),
    onAddItem: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders items grouped by category', () => {
    render(<GroceryList {...defaultProps} />);

    // Categories appear in headers with font-medium class
    const categoryHeaders = screen.getAllByText('Produce');
    expect(categoryHeaders.length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('Meat').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Dairy').length).toBeGreaterThanOrEqual(1);
  });

  it('displays item names', () => {
    render(<GroceryList {...defaultProps} />);

    expect(screen.getByText('onion')).toBeInTheDocument();
    expect(screen.getByText('chicken breast')).toBeInTheDocument();
    expect(screen.getByText('milk')).toBeInTheDocument();
    expect(screen.getByText('garlic')).toBeInTheDocument();
  });

  it('displays item quantities and units', () => {
    render(<GroceryList {...defaultProps} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays item notes when present', () => {
    render(<GroceryList {...defaultProps} />);

    expect(screen.getByText('(minced)')).toBeInTheDocument();
  });

  it('shows checked count in header', () => {
    render(<GroceryList {...defaultProps} />);

    expect(screen.getByText('1/4 items checked')).toBeInTheDocument();
  });

  it('calls onToggleItem when checkbox is clicked', () => {
    render(<GroceryList {...defaultProps} />);

    // Find the checkbox for the onion item
    const onionText = screen.getByText('onion');
    const onionRow = onionText.closest('.px-4.py-3');
    const checkbox = within(onionRow as HTMLElement).getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(defaultProps.onToggleItem).toHaveBeenCalledWith('1');
  });

  it('calls onDeleteItem when delete button is clicked', () => {
    render(<GroceryList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete item');
    fireEvent.click(deleteButtons[0]);

    expect(defaultProps.onDeleteItem).toHaveBeenCalled();
  });

  it('shows add item form when button is clicked', () => {
    render(<GroceryList {...defaultProps} />);

    fireEvent.click(screen.getByText('+ Add custom item'));

    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Qty')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Unit')).toBeInTheDocument();
  });

  it('adds item when form is submitted', () => {
    render(<GroceryList {...defaultProps} />);

    fireEvent.click(screen.getByText('+ Add custom item'));

    const nameInput = screen.getByPlaceholderText('Item name');
    const qtyInput = screen.getByPlaceholderText('Qty');
    const unitInput = screen.getByPlaceholderText('Unit');

    fireEvent.change(nameInput, { target: { value: 'apples' } });
    fireEvent.change(qtyInput, { target: { value: '5' } });
    fireEvent.change(unitInput, { target: { value: 'item' } });

    fireEvent.click(screen.getByText('Add Item'));

    expect(defaultProps.onAddItem).toHaveBeenCalledWith({
      name: 'apples',
      quantity: 5,
      unit: 'item',
      category: 'Other',
    });
  });

  it('cancels add item form', () => {
    render(<GroceryList {...defaultProps} />);

    fireEvent.click(screen.getByText('+ Add custom item'));
    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Item name')).not.toBeInTheDocument();
  });

  it('collapses category when header is clicked', () => {
    render(<GroceryList {...defaultProps} />);

    // Produce category should be visible
    expect(screen.getByText('onion')).toBeInTheDocument();

    // Find the Produce category header (the one in the button with the toggle)
    const produceHeaders = screen.getAllByText('Produce');
    const categoryButton = produceHeaders.find((el) =>
      el.closest('button')?.classList.contains('w-full')
    )?.closest('button');
    fireEvent.click(categoryButton!);

    // Item should be hidden
    expect(screen.queryByText('onion')).not.toBeInTheDocument();
  });

  it('expands category when collapsed header is clicked', () => {
    render(<GroceryList {...defaultProps} />);

    // Find the Produce category header
    const produceHeaders = screen.getAllByText('Produce');
    const categoryButton = produceHeaders.find((el) =>
      el.closest('button')?.classList.contains('w-full')
    )?.closest('button');

    // Collapse first
    fireEvent.click(categoryButton!);
    expect(screen.queryByText('onion')).not.toBeInTheDocument();

    // Expand
    fireEvent.click(categoryButton!);
    expect(screen.getByText('onion')).toBeInTheDocument();
  });

  it('allows inline editing of quantity', () => {
    render(<GroceryList {...defaultProps} />);

    // Click on quantity to edit
    fireEvent.click(screen.getByText('2'));

    const input = screen.getByDisplayValue('2');
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.blur(input);

    expect(defaultProps.onUpdateItem).toHaveBeenCalledWith('1', { quantity: 5 });
  });

  it('allows inline editing of name', () => {
    render(<GroceryList {...defaultProps} />);

    // Click on name to edit
    fireEvent.click(screen.getByText('onion'));

    const input = screen.getByDisplayValue('onion');
    fireEvent.change(input, { target: { value: 'red onion' } });
    fireEvent.blur(input);

    expect(defaultProps.onUpdateItem).toHaveBeenCalledWith('1', { name: 'red onion' });
  });

  it('saves edit on Enter key', () => {
    render(<GroceryList {...defaultProps} />);

    fireEvent.click(screen.getByText('2'));

    const input = screen.getByDisplayValue('2');
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(defaultProps.onUpdateItem).toHaveBeenCalledWith('1', { quantity: 10 });
  });

  it('cancels edit on Escape key', () => {
    render(<GroceryList {...defaultProps} />);

    fireEvent.click(screen.getByText('2'));

    const input = screen.getByDisplayValue('2');
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(defaultProps.onUpdateItem).not.toHaveBeenCalled();
  });

  it('does not add item with empty name', () => {
    render(<GroceryList {...defaultProps} />);

    fireEvent.click(screen.getByText('+ Add custom item'));

    const nameInput = screen.getByPlaceholderText('Item name');
    fireEvent.change(nameInput, { target: { value: '   ' } });

    fireEvent.click(screen.getByText('Add Item'));

    expect(defaultProps.onAddItem).not.toHaveBeenCalled();
  });

  it('calls onReset when reset button is clicked', () => {
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<GroceryList {...defaultProps} />);

    const resetButton = screen.getByTitle('Reset all');
    fireEvent.click(resetButton);

    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it('shows category item counts', () => {
    render(<GroceryList {...defaultProps} />);

    // Produce has 2 items (onion, garlic)
    expect(screen.getByText('0/2')).toBeInTheDocument();

    // Meat has 1 item
    expect(screen.getByText('0/1')).toBeInTheDocument();

    // Dairy has 1 checked item
    expect(screen.getByText('1/1')).toBeInTheDocument();
  });

  it('applies strikethrough to checked items', () => {
    render(<GroceryList {...defaultProps} />);

    // milk is checked
    const milkItem = screen.getByText('milk');
    expect(milkItem.closest('div')).toHaveClass('line-through');
  });

  it('allows changing item category', async () => {
    vi.useFakeTimers();
    render(<GroceryList {...defaultProps} />);

    // Find the category button for onion - it's the small button with text 'Produce'
    const categoryButtons = screen.getAllByRole('button').filter(
      (b) => b.textContent === 'Produce' && b.classList.contains('text-xs')
    );
    fireEvent.click(categoryButtons[0]);

    // Now a select should appear
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Pantry' } });

    // The component uses setTimeout to save, so we need to advance timers
    vi.runAllTimers();

    expect(defaultProps.onUpdateItem).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
