import { Category } from '../types';

// Fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Admin endpoints

// Fetch all categories (admin)
export async function fetchCategoriesAdmin(): Promise<Category[]> {
  try {
    const response = await fetch('/api/admin/categories', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Fetch a category by ID (admin)
export async function fetchCategoryById(id: string): Promise<Category | null> {
  try {
    const response = await fetch(`/api/admin/categories/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return null;
  }
}

// Create a new category (admin)
export async function createCategory(categoryData: Omit<Category, 'id'>): Promise<Category | null> {
  try {
    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// Update a category (admin)
export async function updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null> {
  try {
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
}

// Delete a category (admin)
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
} 