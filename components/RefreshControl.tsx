import React from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';

interface CustomRefreshControlProps extends Omit<RefreshControlProps, 'colors' | 'tintColor' | 'title' | 'titleColor'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function CustomRefreshControl({ refreshing, onRefresh, ...props }: CustomRefreshControlProps) {
  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#FE8C00"]}
      tintColor="#FE8C00"
      title="Pull to refresh"
      titleColor="#878787"
      {...props}
    />
  );
} 