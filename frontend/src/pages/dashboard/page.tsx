import Cookies from 'js-cookie';
import MarketDashboard from './market-dashboard';
import { UserDashboard } from './user-dashboard';

export function DashboardPage() {
    const userRole = Cookies.get('userRole')

    const userType = userRole === 'MARKET' ? 'market' : 'user'

    return userType === 'market' ? <MarketDashboard /> : <UserDashboard />
}
