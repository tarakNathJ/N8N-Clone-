
import { Workflow } from "../types";

export interface User {
  id: string;
  email: string;
  password?: string; // Should be hashed in a real app
}

// User Management
export const getUsers = (): User[] => {
  try {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (e) {
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem('users', JSON.stringify(users));
};


// Workflow Management
export const getWorkflows = (): Workflow[] => {
    try {
        const workflows = localStorage.getItem('workflows');
        return workflows ? JSON.parse(workflows) : [];
    } catch (e) {
        return [];
    }
}

export const saveWorkflows = (workflows: Workflow[]): void => {
    localStorage.setItem('workflows', JSON.stringify(workflows));
}
