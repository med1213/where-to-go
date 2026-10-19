import React from 'react';
import DashboardReporting from '../components/DashboardReporting';
import { AdminStats, Place } from '../types';

interface DashboardPageProps {
  stats: AdminStats | null;
  places: Place[];
  pendingPlaces: Place[];
}

export default function DashboardPage({
  stats,
  places,
  pendingPlaces,
}: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <DashboardReporting
        stats={stats}
        places={places}
        pendingPlaces={pendingPlaces}
      />
    </div>
  );
}
