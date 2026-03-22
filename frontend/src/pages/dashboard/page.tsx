import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { UserDashboard } from './user-dashboard';
import MarketDashboard from './market-dashboard';

export function DashboardPage() {
    const navigate = useNavigate();
    const [userType, setUserType] = useState<'user' | 'market' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken')
        const storedUserType = localStorage.getItem('userType')

        if (!token) {
            navigate({ to: '/login' })
            return
        }

        if (storedUserType === 'USER') {
            setUserType('user')
        }

        if (storedUserType === 'MARKET') {
            setUserType('market')
        }

        setIsLoading(false)
    }, [navigate])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-blue-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return userType === 'market' ? <MarketDashboard /> : <UserDashboard />;
}
