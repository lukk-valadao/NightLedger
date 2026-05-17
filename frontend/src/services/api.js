const API_BASE_URL = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errorMsg = result.error?.message || result.message || response.statusText || 'Erro na requisição';
      throw new Error(errorMsg);
    }

    return result.data;
  } catch (error) {
    console.error(`API Request Error [${path}]:`, error);
    throw error;
  }
}

export const api = {
  // Dashboard
  getDashboard: (month, year) => {
    let query = '';
    if (month && year) {
      query = `?month=${month}&year=${year}`;
    }
    return request(`/dashboard${query}`);
  },

  // Expenses CRUD
  getExpenses: () => request('/expenses'),
  createExpense: (data) => request('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateExpense: (id, data) => request(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteExpense: (id) => request(`/expenses/${id}`, {
    method: 'DELETE',
  }),
  payExpense: (id, accountId) => request(`/expenses/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ accountId }),
  }),

  // Incomes CRUD
  getIncomes: () => request('/incomes'),
  createIncome: (data) => request('/incomes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteIncome: (id) => request(`/incomes/${id}`, {
    method: 'DELETE',
  }),

  // Accounts CRUD
  getAccounts: () => request('/accounts'),
  createAccount: (data) => request('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAccount: (id, data) => request(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAccount: (id) => request(`/accounts/${id}`, {
    method: 'DELETE',
  }),
};
export default api;
