import { fetchFromStrapi } from '@/lib/api';

export const authService = {
  // Login with email/username and password
  async login(identifier, password) {
    return await fetchFromStrapi('/auth/local', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  // Register a new user
  async register(username, email, password) {
    return await fetchFromStrapi('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  // Fetch the logged-in user profile populated with their Role
  async getMe(token) {
    return await fetchFromStrapi('/users/me?populate=role', {
      token,
      method: 'GET',
    });
  },
};