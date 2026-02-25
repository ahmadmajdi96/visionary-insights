import { Outlet } from 'react-router-dom';
import { BottomTabs } from './BottomTabs';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <BottomTabs />
    </div>
  );
}
