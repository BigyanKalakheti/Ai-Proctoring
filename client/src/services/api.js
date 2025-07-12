const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // User login
async loginUser(email, password) {
  const response = await this.request('/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.token) {
    this.setToken(response.token);
  }

  return response;
}



  // Auth methods
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentAdmin() {
    return this.request('/auth/me');
  }
  
  async getCurrentUser() {
    return this.request('/api/user/me');
  }


  async createDefaultAdmin() {
    return this.request('/auth/create-admin', {
      method: 'POST',
    });
  }

  // User methods
  async getUsers(page = 1, limit = 10, search = '', status = 'all') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      status,
    });
    return this.request(`/users?${params}`);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });

    return this.request('/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });
  }

  async updateUser(id, userData) {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });

    return this.request(`/users/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Exam methods
  async getExams(page = 1, limit = 10, search = '', status = 'all') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      status,
    });
    return this.request(`/exams?${params}`);
  }

  async getExamById(id) {
    return this.request(`/exams/${id}`);
  }

  async createExam(examData) {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(id, examData) {
    return this.request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  async deleteExam(id) {
    return this.request(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  // Results methods
  async getResults(page = 1, limit = 10, search = '', status = 'all') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      status,
    });
    return this.request(`/results?${params}`);
  }

  async getResultById(id) {
    return this.request(`/results/${id}`);
  }

  async createResult(resultData) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  }

  async updateResult(id, resultData) {
    return this.request(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resultData),
    });
  }

  async deleteResult(id) {
    return this.request(`/results/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats() {
    return this.request('/results/dashboard/stats');
  }
}

export default new ApiService();