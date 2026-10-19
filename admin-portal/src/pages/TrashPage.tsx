import React from 'react';
import TrashBin from '../components/TrashBin';
import { TrashData } from '../types';

interface TrashPageProps {
  trash: TrashData | null;
  onRefresh: () => void;
}

export default function TrashPage({ trash, onRefresh }: TrashPageProps) {
  return <TrashBin trash={trash} onRefresh={onRefresh} />;
}
