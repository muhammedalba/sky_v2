'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Icons } from '@/shared/ui/Icons';
import { useCountries, useRegions, useCities } from '@/features/locations/hooks/useLocations';
import CityForm from '@/features/locations/components/dashboard/CityForm';
import CountryForm from '@/features/locations/components/dashboard/CountryForm';
import RegionForm from '@/features/locations/components/dashboard/RegionForm';
import { Country, Region, City } from '@/features/locations/types';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import Modal from '@/shared/ui/Modal';

type TabType = 'countries' | 'regions' | 'cities';

export default function LocationsDashboardPage() {
  const t = useTranslations('shipping');

  const [activeTab, setActiveTab] = useState<TabType>('cities');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: countries = [], isLoading: isLoadingCountries } = useCountries();
  const { data: regions = [], isLoading: isLoadingRegions } = useRegions(selectedCountry);
  const { data: cities = [], isLoading: isLoadingCities } = useCities(selectedRegion);

  const countryColumns = [
    {
      header: 'الدولة',
      render: (item: Country) => (
        <div className="font-semibold">{item.name?.ar} - {item.name?.en}</div>
      ),
    },
    { header: 'الكود', render: (item: Country) => item.code },
    { header: 'العملة', render: (item: Country) => item.currency },
    {
      header: 'إجراءات',
      render: (item: Country) => (
        <Button variant="ghost" size="sm" onClick={() => {
          setEditingCountry(item);
          setIsFormOpen(true);
        }}>تعديل</Button>
      )
    }
  ];

  const regionColumns = [
    {
      header: 'المنطقة',
      render: (item: Region) => (
        <div className="font-semibold">{item.name?.ar} - {item.name?.en}</div>
      ),
    },
    {
      header: 'إجراءات',
      render: (item: Region) => (
        <Button variant="ghost" size="sm" onClick={() => {
          setEditingRegion(item);
          setIsFormOpen(true);
        }}>تعديل</Button>
      )
    }
  ];

  const cityColumns = [
    {
      header: 'المدينة',
      render: (item: City) => (
        <div className="font-semibold">{item.name?.ar} - {item.name?.en}</div>
      ),
    },
    { header: 'الرمز البريدي', render: (item: City) => item.postalCode || '-' },
    {
      header: 'التوصيل',
      render: (item: City) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isDeliveryAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {item.isDeliveryAvailable ? 'متاح' : 'غير متاح'}
        </span>
      ),
    },
    {
      header: 'إجراءات',
      render: (item: City) => (
        <Button variant="ghost" size="sm" onClick={() => {
          setEditingCity(item);
          setIsFormOpen(true);
        }}>تعديل</Button>
      )
    }
  ];

  const handleAddNew = () => {
    setEditingCountry(null);
    setEditingRegion(null);
    setEditingCity(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icons.MapPin className="w-6 h-6 text-primary" />
            إدارة المواقع الجغرافية
          </h1>
          <p className="text-muted-foreground mt-1">إدارة الدول، المناطق، والمدن المتاحة في النظام</p>
        </div>
        <Button onClick={handleAddNew}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          {activeTab === 'countries' ? 'إضافة دولة' : activeTab === 'regions' ? 'إضافة منطقة' : 'إضافة مدينة'}
        </Button>
      </div>

      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit border">
        <button 
          onClick={() => setActiveTab('countries')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'countries' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
        >الدول</button>
        <button 
          onClick={() => setActiveTab('regions')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'regions' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
        >المناطق</button>
        <button 
          onClick={() => setActiveTab('cities')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'cities' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
        >المدن</button>
      </div>

      {(activeTab === 'regions' || activeTab === 'cities') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-4 rounded-xl border">
          <Select
            label="اختر الدولة"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedRegion(''); 
            }}
            options={countries.map(c => ({ label: c.name?.ar, value: c._id }))}
            disabled={isLoadingCountries}
          />                   

          {activeTab === 'cities' && (
            <Select
              label="اختر المنطقة"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              options={regions.map(r => ({ label: r.name?.ar, value: r._id }))}
              disabled={!selectedCountry || isLoadingRegions}
            />
          )}
        </div>
      )}

      {activeTab === 'countries' && (
        <EntityDataTable
          data={countries}
          columns={countryColumns}
          isLoading={isLoadingCountries}
          emptyState={{ title: 'لا توجد دول' }}
        />
      )}

      {activeTab === 'regions' && (
        selectedCountry ? (
          <EntityDataTable
            data={regions}
            columns={regionColumns}
            isLoading={isLoadingRegions}
            emptyState={{ title: 'لا توجد مناطق' }}
          />
        ) : (
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/50">
            <h3 className="text-lg font-bold">يرجى اختيار الدولة لعرض مناطقها</h3>
          </div>
        )
      )}

      {activeTab === 'cities' && (
        selectedRegion ? (
          <EntityDataTable
            data={cities}
            columns={cityColumns}
            isLoading={isLoadingCities}
            emptyState={{ title: 'لا توجد مدن' }}
          />
        ) : (
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/50">
            <h3 className="text-lg font-bold">يرجى اختيار الدولة والمنطقة لعرض مدنها</h3>
          </div>
        )
      )}

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={
          activeTab === 'countries' ? (editingCountry ? 'تعديل دولة' : 'إضافة دولة') :
          activeTab === 'regions' ? (editingRegion ? 'تعديل منطقة' : 'إضافة منطقة') :
          (editingCity ? 'تعديل مدينة' : 'إضافة مدينة')
        }
        size="md"
      >
        {activeTab === 'countries' && (
          <CountryForm
            editingCountry={editingCountry}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        {activeTab === 'regions' && (
          <RegionForm
            initialCountryId={selectedCountry}
            editingRegion={editingRegion}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        {activeTab === 'cities' && (
          <CityForm
            countryId={selectedCountry}
            regionId={selectedRegion}
            editingCity={editingCity}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
      </Modal>
     </div>
  );
}
