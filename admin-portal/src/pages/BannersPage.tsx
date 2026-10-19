import React from 'react';
import BannerManagement from '../components/BannerManagement';
import { Place } from '../types';

interface BannersPageProps {
  places: Place[];
}

export default function BannersPage({ places }: BannersPageProps) {
  return <BannerManagement places={places} />;
}
