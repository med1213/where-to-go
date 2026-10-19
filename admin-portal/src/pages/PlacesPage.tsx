import React from 'react';
import PlacesList from '../components/PlacesList';
import { Place } from '../types';

interface PlacesPageProps {
  places: Place[];
  onRefresh: () => void;
  selectedProvince: string;
  onSelectProvince: (province: string) => void;
}

export default function PlacesPage({
  places,
  onRefresh,
  selectedProvince,
  onSelectProvince,
}: PlacesPageProps) {
  return (
    <PlacesList
      places={places}
      onRefresh={onRefresh}
      selectedProvince={selectedProvince}
      onSelectProvince={onSelectProvince}
    />
  );
}
