'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';

import { Icons } from '@/shared/ui/Icons';
import {
  useCountries,
  useRegions,
  useCities,
  useUpdateCountry,
  useUpdateRegion,
  useUpdateCity
} from '@/features/locations/hooks/useLocations';
import CityForm from '@/features/locations/components/dashboard/CityForm';
import CountryForm from '@/features/locations/components/dashboard/CountryForm';
import RegionForm from '@/features/locations/components/dashboard/RegionForm';
import { Country, Region, City } from '@/features/locations/types';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Badge } from '@/shared/ui/Badge';
import { Tooltip } from '@/shared/ui/Tooltip';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import Modal from '@/shared/ui/Modal';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { useToast } from '@/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { Permissions } from '@/features/roles/types';
import Can from '@/components/auth/Can';

type EntityTabType = 'countries' | 'regions' | 'cities';
type StatusTabType = 'all' | 'active' | 'inactive';
type LocationEntity = Country | Region | City;

//  (Empty States)
const EmptySelectionView = ({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>, text: string }) => (
  <div className="p-20 text-center border-2 border-dashed border-border/40 rounded-3xl bg-muted/20 flex flex-col items-center justify-center gap-4 group hover:bg-muted/30 transition-all duration-500">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
      <Icon className="w-8 h-8 text-primary/60" />
    </div>
    <h3 className="text-xl font-bold text-foreground/80">{text}</h3>
  </div>
);

export default function LocationsDashboardPage() {
  const t = useTranslations('locations');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const toast = useToast();
  const { getQueryParam, setQueryParam } = useQueryState();

  // URL States
  const activeTab = (getQueryParam('tab', 'countries') as EntityTabType);
  const statusTab = (getQueryParam('status', 'all') as StatusTabType);
  const search = (getQueryParam('search', '') as string);

  // Local States for cascading selects
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  // Editing States
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  // Status Filter mapping
  const isActiveFilter = useMemo(() => {
    if (statusTab === 'active') return true;
    if (statusTab === 'inactive') return false;
    return undefined;
  }, [statusTab]);

  // Data Fetching
  const { data: countries = [], isLoading: isLoadingCountries } = useCountries(activeTab === 'countries' ? isActiveFilter : undefined);
  const { data: regions = [], isLoading: isLoadingRegions } = useRegions(selectedCountry, activeTab === 'regions' ? isActiveFilter : undefined);
  const { data: cities = [], isLoading: isLoadingCities } = useCities(selectedRegion, activeTab === 'cities' ? isActiveFilter : undefined);

  // Lists for Select Dropdowns
  const { data: allCountries = [] } = useCountries(true);
  const { data: allRegions = [] } = useRegions(selectedCountry, true);

  // Mutations
  const updateCountryMutation = useUpdateCountry();
  const updateRegionMutation = useUpdateRegion();
  const updateCityMutation = useUpdateCity();

  const isAnyMutationPending = updateCountryMutation.isPending || updateRegionMutation.isPending || updateCityMutation.isPending;
  const isAnyLoading = isLoadingCountries || isLoadingRegions || isLoadingCities || isAnyMutationPending;

  const handleStatusToggle = useCallback(async (type: EntityTabType, item: LocationEntity) => {
    try {
      const newStatus = !item.isActive;
      const payload = { id: item._id, data: { isActive: newStatus } };

      if (type === 'countries') {
        await updateCountryMutation.mutateAsync(payload);
      } else if (type === 'regions') {
        await updateRegionMutation.mutateAsync(payload);
      } else {
        await updateCityMutation.mutateAsync(payload);
      }
      toast.success(tCommon('messages.updateSuccess'));
    } catch (error) {
      toast.error(tCommon('errors.updateFailed'));
    }
  }, [updateCountryMutation, updateRegionMutation, updateCityMutation, toast, tCommon]);


  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);
  // Memoized Columns
  const renderNameColumn = useCallback((item: LocationEntity) => (
    <div className="flex flex-col">
      <span className="font-bold text-foreground">{item.name?.[locale as 'ar' | 'en'] || item.name?.ar}</span>
      <span className="text-xs text-muted-foreground">{item.name?.[locale === 'ar' ? 'en' : 'ar']}</span>
    </div>
  ), [locale]);

  const renderStatusColumn = useCallback((type: EntityTabType, item: LocationEntity) => (
    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={item.isActive}
        onCheckedChange={() => handleStatusToggle(type, item)}
        disabled={isAnyMutationPending}
      />
      <Badge variant={item.isActive ? 'success' : 'secondary'} className={type === 'cities' ? (item.isActive ? 'text-green-600' : 'text-destructive') : undefined}>
        {item.isActive ? tCommon('tabs.active') : tCommon('tabs.inactive')}
      </Badge>
    </div>
  ), [handleStatusToggle, isAnyMutationPending, tCommon]);

  const renderActionColumn = useCallback((editAction: () => void, tooltipText: string) => (
    <Can permission={Permissions.UPDATE_LOCATION}>
      <Tooltip content={tooltipText}>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-primary rounded-xl bg-background/50 border-border/40"
          onClick={editAction}
        >
          <Icons.Edit className="w-4 h-4" />
        </Button>
      </Tooltip>
    </Can>
  ), []);

  const countryColumns = useMemo(() => [
    { header: t('fields.country'), render: renderNameColumn },
    { header: t('fields.code'), render: (item: Country) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{item.code}</code> },
    { header: t('fields.currency'), render: (item: Country) => item.currency },
    { header: t('fields.status'), render: (item: Country) => renderStatusColumn('countries', item) },
    { header: t('fields.actions'), render: (item: Country) => renderActionColumn(() => { setEditingCountry(item); setIsFormOpen(true); }, t('editCountry')) }
  ], [t, renderNameColumn, renderStatusColumn, renderActionColumn]);

  const regionColumns = useMemo(() => [
    { header: t('fields.region'), render: renderNameColumn },
    { header: t('fields.status'), render: (item: Region) => renderStatusColumn('regions', item) },
    { header: t('fields.actions'), render: (item: Region) => renderActionColumn(() => { setEditingRegion(item); setIsFormOpen(true); }, t('editRegion')) }
  ], [t, renderNameColumn, renderStatusColumn, renderActionColumn]);

  const cityColumns = useMemo(() => [
    { header: t('fields.city'), render: renderNameColumn },
    { header: t('fields.postalCode'), render: (item: City) => item.postalCode || '-' },
    {
      header: t('fields.delivery'),
      render: (item: City) => (
        <Badge variant={item.isDeliveryAvailable ? 'success' : 'secondary'} className={item.isDeliveryAvailable ? 'text-green-600' : 'text-destructive'}>
          {item.isDeliveryAvailable ? tCommon('messages.available') : tCommon('messages.unavailable')}
        </Badge>
      ),
    },
    { header: t('fields.status'), render: (item: City) => renderStatusColumn('cities', item) },
    { header: t('fields.actions'), render: (item: City) => renderActionColumn(() => { setEditingCity(item); setIsFormOpen(true); }, t('editCity')) }
  ], [t, tCommon, renderNameColumn, renderStatusColumn, renderActionColumn]);

  const handleAddNew = useCallback(() => {
    setEditingCountry(null);
    setEditingRegion(null);
    setEditingCity(null);
    setIsFormOpen(true);
  }, []);

  // Filter local data based on search safely without 'any'
  const filteredData = useMemo(() => {
    let baseData: LocationEntity[] = [];
    if (activeTab === 'countries') baseData = countries as Country[];
    else if (activeTab === 'regions') baseData = regions as Region[];
    else baseData = cities as City[];

    if (!search) return baseData;

    const s = search.toLowerCase();
    return baseData.filter((item) => {
      const matchNameAr = item.name?.ar?.toLowerCase().includes(s);
      const matchNameEn = item.name?.en?.toLowerCase().includes(s);
      const matchCode = 'code' in item && typeof item.code === 'string' && item.code.toLowerCase().includes(s);

      return matchNameAr || matchNameEn || matchCode;
    });
  }, [activeTab, countries, regions, cities, search]);

  const viewTabs = useMemo(() => [
    { id: 'all', label: tCommon('tabs.all'), value: 'all', icon: Icons.Box, iconClass: 'w-3 h-3 text-primary', activeClass: 'bg-primary text-white shadow-md shadow-primary/20' },
    { id: 'active', label: tCommon('tabs.active'), value: 'active', icon: Icons.Check, iconClass: 'w-3 h-3 text-success', activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { id: 'inactive', label: tCommon('tabs.inactive'), value: 'inactive', icon: Icons.X, iconClass: 'w-3 h-3 text-destructive', activeClass: 'bg-destructive text-white shadow-md shadow-destructive/20' },
  ], [tCommon]);

  const entityTabs = useMemo(() => [
    { id: 'countries', label: t('tabs.countries'), value: 'countries', icon: Icons.Globe, iconClass: 'w-3 h-3 text-primary' },
    { id: 'regions', label: t('tabs.regions'), value: 'regions', icon: Icons.MapPin, iconClass: 'w-3 h-3 text-success' },
    { id: 'cities', label: t('tabs.cities'), value: 'cities', icon: Icons.MapPin, iconClass: 'w-3 h-3 text-warning' },
  ], [t]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: filteredData.length })}
        action={{
          label: activeTab === 'countries' ? t('createCountry') : activeTab === 'regions' ? t('createRegion') : t('createCity'),
          icon: <Icons.Plus className="w-4 h-4" />,
          onClick: handleAddNew,
          disabled: isAnyLoading,
          permission: Permissions.CREATE_LOCATION
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <EntitySearchBar
            defaultValue={search}
            onSearch={(val) => setQueryParam('search', val)}
            placeholder={t('searchPlaceholder')}
            className="max-w-md"
            disabled={isAnyLoading}
          />
        </div>

        <div className="flex gap-1 bg-muted/30 p-1 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar w-fit">
          {viewTabs.map((tab) => (
            <Button variant={statusTab === tab.value ? 'default' : 'ghost'}
              key={tab.id}
              onClick={() => setQueryParam('status', tab.value)}
              disabled={isAnyLoading}
              className={cn("px-2 md:px-4", statusTab === tab.value ? tab.activeClass : "text-foreground/70 hover:bg-muted/60 hover:text-foreground")}
            >
              <tab.icon className={cn("w-4 h-4", statusTab === tab.value ? "text-white" : tab.iconClass)} />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl border border-border/40 w-fit ">
          {entityTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQueryParam('tab', tab.value)}
              disabled={isAnyLoading}
              className={cn(
                "px-1.5 md:px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-1",
                activeTab === tab.value ? "bg-background text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.value ? "text-primary" : tab.iconClass)} />
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === 'regions' || activeTab === 'cities') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-border/40 shadow-sm">
            <Select
              label={t('placeholders.selectCountry')}
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedRegion('');
              }}
              options={allCountries.map(c => ({ label: c.name?.[locale as 'ar' | 'en'] || c.name?.ar, value: c._id }))}
              disabled={isAnyLoading}
            />

            {activeTab === 'cities' && (
              <Select
                label={t('placeholders.selectRegion')}
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                options={allRegions.map(r => ({ label: r.name?.[locale as 'ar' | 'en'] || r.name?.ar, value: r._id }))}
                disabled={!selectedCountry || isAnyLoading}
              />
            )}
          </div>
        )}

        <div className="min-h-[400px]">
          {activeTab === 'countries' && (
            <EntityDataTable
              data={filteredData as Country[]}
              columns={countryColumns}
              isLoading={isLoadingCountries}
              emptyState={{
                title: t('emptyState.title'), description: t('emptyState.description'),

                createLink: () => setIsFormOpen(true)
              }}
            />
          )}

          {activeTab === 'regions' && (
            selectedCountry ? (
              <EntityDataTable
                data={filteredData as Region[]}
                columns={regionColumns}
                isLoading={isLoadingRegions}
                emptyState={{
                  title: t('emptyState.title'), description: t('emptyState.description')
                  , createLink: () => setIsFormOpen(true)
                }}
              />
            ) : (
              <EmptySelectionView icon={Icons.MapPin} text={t('placeholders.selectCountryToViewRegions')} />
            )
          )}

          {activeTab === 'cities' && (
            selectedRegion ? (
              <EntityDataTable
                data={filteredData as City[]}
                columns={cityColumns}
                isLoading={isLoadingCities}
                emptyState={{ title: t('emptyState.title'), description: t('emptyState.description'), createLink: () => setIsFormOpen(true) }}
              />
            ) : (
              <EmptySelectionView icon={Icons.MapPin} text={t('placeholders.selectRegionToViewCities')} />
            )
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={
          activeTab === 'countries' ? (editingCountry ? t('editCountry') : t('createCountry')) :
            activeTab === 'regions' ? (editingRegion ? t('editRegion') : t('createRegion')) :
              (editingCity ? t('editCity') : t('createCity'))
        }
        size="md"
      >
        <div className="p-1">
          {activeTab === 'countries' && (
            <CountryForm editingCountry={editingCountry} onSuccess={handleCloseForm} onCancel={handleCloseForm} />
          )}
          {activeTab === 'regions' && (
            <RegionForm initialCountryId={selectedCountry} editingRegion={editingRegion} onSuccess={handleCloseForm} onCancel={handleCloseForm} />
          )}
          {activeTab === 'cities' && (
            <CityForm countryId={selectedCountry} regionId={selectedRegion} editingCity={editingCity} onSuccess={handleCloseForm} onCancel={handleCloseForm} />
          )}
        </div>
      </Modal>
    </div>
  );
}