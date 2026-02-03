import SidebarToggle from './topbar/SidebarToggle';
import Breadcrumbs from './topbar/Breadcrumbs';
import TopbarActions from './topbar/TopbarActions';
import UserMenu from './topbar/UserMenu';
// import SearchBar from './topbar/SearchBar';

export default function Topbar({ locale }: { locale: string }) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border/60 supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        
        {/* Toggle & Breadcrumbs */}
        <div className="flex-1 flex items-center gap-4 overflow-hidden">
          <SidebarToggle />
          <Breadcrumbs />
        </div>

        {/* Center Search - Mobile Hidden */}
        {/* <SearchBar /> */}

        {/* Actions & User */}
        <div className="flex items-center gap-3">
          <TopbarActions />
          <UserMenu locale={locale} />
        </div>
      </div>
    </header>
  );
}
