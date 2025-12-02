// tests/menu.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import app from '../index.js';

let server;
let baseURL;

beforeAll(() => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseURL = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterAll(() => {
  server.close();
});

describe('Menu API Endpoints', () => {
  it('should return 200 OK for the root route', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/`);
    expect(response.status).toBe(200);

    const data = await response.json();
    // Add assertions based on what your root route returns
    expect(data.message).toBe('Welcome to the API');
  });

  it('should get all menu items', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/menu`);
    expect(response.status).toBe(200);

    const menuItems = await response.json();
    expect(Array.isArray(menuItems)).toBe(true);
  });

  it('should add a new menu item', async () => {
    const newItem = {
      name: 'Espresso',
      description: 'Strong coffee shot',
      price: 2.99,
      category: 'Beverage',
    };

    const response = await fetch(`${import.meta.env.VITE_API_URL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });
    expect(response.status).toBe(201);

    const createdItem = await response.json();
    expect(createdItem).toMatchObject(newItem);
    expect(createdItem).toHaveProperty('id');
  });

  it('should get a single menu item', async () => {
    // First, create a new item to ensure it exists
    const newItem = {
      name: 'Latte',
      description: 'Coffee with milk',
      price: 3.49,
      category: 'Beverage',
    };

    const createResponse = await fetch(`${baseURL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });
    const createdItem = await createResponse.json();

    // Now, retrieve the item by ID
    const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/${createdItem.id}`);
    expect(response.status).toBe(200);

    const item = await response.json();
    expect(item).toMatchObject(newItem);
    expect(item.id).toBe(createdItem.id);
  });

  it('should update a menu item', async () => {
    // Create a new item to update
    const newItem = {
      name: 'Cappuccino',
      description: 'Espresso with steamed milk foam',
      price: 3.99,
      category: 'Beverage',
    };

    const createResponse = await fetch(`${baseURL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });
    const createdItem = await createResponse.json();

    // Update the item's price
    const updatedFields = {
      price: 4.49,
    };

    const updateResponse = await fetch(`${baseURL}/menu/${createdItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFields),
    });
    expect(updateResponse.status).toBe(200);

    const updatedItem = await updateResponse.json();
    expect(updatedItem.price).toBe(updatedFields.price);
    expect(updatedItem.name).toBe(newItem.name);
  });

  it('should delete a menu item', async () => {
    // Create a new item to delete
    const newItem = {
      name: 'Mocha',
      description: 'Coffee with chocolate',
      price: 3.99,
      category: 'Beverage',
    };

    const createResponse = await fetch(`${baseURL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });
    const createdItem = await createResponse.json();

    // Delete the item
    const deleteResponse = await fetch(`${baseURL}/menu/${createdItem.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.status).toBe(204);

    // Verify the item no longer exists
    const getResponse = await fetch(`${baseURL}/menu/${createdItem.id}`);
    expect(getResponse.status).toBe(404);
  });
});
