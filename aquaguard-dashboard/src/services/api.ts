const API_BASE_URL = 'http://localhost:8000';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Identifiants incorrects');
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Token invalide');
    }

    return response.json();
  }

  async getSensors(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/sensors/`);
    if (!response.ok) {
      throw new Error('Failed to fetch sensors');
    }
    return response.json();
  }

  async getSensor(sensorId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/sensors/${sensorId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sensor');
    }
    return response.json();
  }

  async getSensorDetails(sensorId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/sensors/${sensorId}/details`);
    if (!response.ok) {
      throw new Error('Failed to fetch sensor details');
    }
    return response.json();
  }

  async getDashboardKPIs(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/kpis`);
    if (!response.ok) {
      throw new Error('Failed to fetch KPIs');
    }
    return response.json();
  }

  async getDashboardAlerts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/alerts`);
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
    return response.json();
  }

  async getDashboardActivities(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/activities`);
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    return response.json();
  }

  async getReports(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/reports/`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  }

  async getReportMetrics(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/metrics`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch report metrics');
    }
    return response.json();
  }

  async getHistoryMetrics(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/history/metrics`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch history metrics');
    }
    return response.json();
  }

  async getAlert(alertId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch alert');
    }
    return response.json();
  }

  async updateAlertStatus(alertId: number, statusUpdate: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(statusUpdate),
    });
    if (!response.ok) {
      throw new Error('Failed to update alert status');
    }
    return response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
}

export const apiService = new ApiService();