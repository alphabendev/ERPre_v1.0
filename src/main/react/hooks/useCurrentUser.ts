import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Employee {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    employeeTel: string;
    employeeRole: 'admin' | 'manager' | 'staff' | '';
    employeeInsertDate?: string;
    employeeUpdateDate?: string;
    employeeDeleteDate?: string;
    employeeDeleteYn?: 'Y' | 'N';
}

// Simple in-memory cache to prevent multiple concurrent/subsequent page requests
let cachedEmployee: Employee | null = null;
let cachePromise: Promise<Employee | null> | null = null;

export function useCurrentUser() {
    const [employee, setEmployee] = useState<Employee | null>(cachedEmployee);
    const [loading, setLoading] = useState<boolean>(!cachedEmployee);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (cachedEmployee) {
            setEmployee(cachedEmployee);
            setLoading(false);
            return;
        }

        const fetchSession = async () => {
            try {
                if (!cachePromise) {
                    cachePromise = axios.get<Employee>('/api/employee')
                        .then(res => {
                            cachedEmployee = res.data;
                            return res.data;
                        })
                        .catch(err => {
                            cachePromise = null;
                            throw err;
                        });
                }
                const data = await cachePromise;
                setEmployee(data);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    const role = employee?.employeeRole || '';

    return { employee, role, loading, error };
}
