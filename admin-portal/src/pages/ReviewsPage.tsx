import React from 'react';
import ReviewQueue from '../components/ReviewQueue';
import { Place } from '../types';

interface ReviewsPageProps {
  places: Place[];
  onRefresh: () => void;
  onOpenRejectModal: (place: Place) => void;
}

export default function ReviewsPage({
  places,
  onRefresh,
  onOpenRejectModal,
}: ReviewsPageProps) {
  return (
    <ReviewQueue
      places={places}
      onRefresh={onRefresh}
      onOpenRejectModal={onOpenRejectModal}
    />
  );
}
