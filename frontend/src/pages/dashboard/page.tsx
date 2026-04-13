import Cookies from 'js-cookie';
import MarketDashboard from './market-dashboard';
import { UserDashboard } from './user-dashboard';

export function DashboardPage() {
    const userRole = Cookies.get('userRole')
    const userName = Cookies.get('marketName') || Cookies.get('userName') || 'Usuário'
    const isLogged = !!Cookies.get('accessToken')
    const marketId = Cookies.get('marketId') ? Number(Cookies.get('marketId')) : 1

    return userRole === 'MARKET'
        ? <MarketDashboard />
        : <UserDashboard userName={userName} isLogged={isLogged} marketId={marketId} userRole={userRole} />
}