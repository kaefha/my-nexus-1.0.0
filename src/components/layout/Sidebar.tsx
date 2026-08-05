'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  ShoppingCart,
  Truck,
  Warehouse,
  ArrowLeftRight,
  Package,
  BarChart3,
  Database,
  Zap,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

const groupedNavigation = [
  {
    group: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
    ]
  },
  {
    group: 'Transactional',
    items: [
      {
        label: 'Project Management',
        href: '/projects',
        icon: FolderKanban,
        children: [
          { label: 'Project List', href: '/projects' },
          { label: 'Material Requirement', href: '/projects/requirements' },
        ],
      },
      {
        label: 'RFC Management',
        href: '/rfc',
        icon: FileText,
        children: [
          { label: 'RFC List', href: '/rfc' },
          { label: 'Approval Queue', href: '/rfc/approval' },
        ],
      },
      {
        label: 'Procurement',
        href: '/procurement',
        icon: ShoppingCart,
        children: [
          { label: 'Purchase Orders', href: '/procurement' },
          { label: 'Vendors', href: '/procurement/vendors' },
        ],
      },
      {
        label: 'Logistics',
        href: '/logistics',
        icon: Truck,
        children: [
          { label: 'Delivery Tracking', href: '/logistics' },
          { label: 'Shipment History', href: '/logistics/history' },
        ],
      },
    ]
  },
  {
    group: 'Non-Transactional',
    items: [
      {
        label: 'Warehouse',
        href: '/warehouse',
        icon: Warehouse,
        children: [
          { label: 'Warehouse List', href: '/warehouse' },
          { label: 'Material Receive', href: '/warehouse/receive' },
          { label: 'Material Issue', href: '/warehouse/issue' },
          { label: 'Stock Monitoring', href: '/warehouse/stock' },
        ],
      },
      {
        label: 'Inventory',
        href: '/inventory',
        icon: Package,
        children: [
          { label: 'Material Catalog', href: '/inventory/catalog' },
          { label: 'Stock Balance', href: '/inventory' },
          { label: 'Movement History', href: '/inventory/movements' },
        ],
      },
      {
        label: 'Material Transfer',
        href: '/transfer',
        icon: ArrowLeftRight,
      },
      {
        label: 'Reports',
        href: '/reports',
        icon: BarChart3,
      },
      {
        label: 'Master Data',
        href: '/master-data',
        icon: Database,
        children: [
          { label: 'Materials', href: '/master-data/materials' },
          { label: 'Warehouses', href: '/master-data/warehouses' },
          { label: 'Vendors', href: '/master-data/vendors' },
          { label: 'Users', href: '/master-data/users' },
        ],
      },
    ]
  }
];

function NavCollapsible({ item, pathname }: { item: any, pathname: string }) {
  const isItemActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  const [open, setOpen] = React.useState(isItemActive);

  React.useEffect(() => {
    if (isItemActive) setOpen(true);
  }, [isItemActive]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <SidebarMenuButton 
          isActive={isItemActive} 
          tooltip={item.label}
          render={<CollapsibleTrigger />}
        >
          <item.icon />
          <span>{item.label}</span>
          <ChevronRight className={`ml-auto transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child: any) => (
              <SidebarMenuSubItem key={child.label}>
                <SidebarMenuSubButton 
                  isActive={pathname === child.href}
                  render={<Link href={child.href} />}
                >
                  <span>{child.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader className="border-b h-16 flex justify-center px-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MAI Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-wide">MAI</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">NIMS</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {groupedNavigation.map((group) => (
          <SidebarGroup key={group.group} className="mb-2 last:mb-0">
            {group.group !== 'Main' && (
              <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isItemActive = isActive(item.href);
                  
                  if (hasChildren) {
                    return <NavCollapsible key={item.label} item={item} pathname={pathname} />;
                  }

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton 
                        isActive={isItemActive} 
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                <span className="text-xs font-semibold">AD</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@nexus.com</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
