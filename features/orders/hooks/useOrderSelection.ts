'use client';

import { useState, useCallback, useMemo } from 'react';

export function useOrderSelection(orderIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === orderIds.length && orderIds.length > 0) {
        return new Set();
      }
      return new Set(orderIds);
    });
  }, [orderIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const isAllSelected = useMemo(
    () => orderIds.length > 0 && selectedIds.size === orderIds.length,
    [orderIds.length, selectedIds.size],
  );

  const isSomeSelected = useMemo(
    () => selectedIds.size > 0 && selectedIds.size < orderIds.length,
    [orderIds.length, selectedIds.size],
  );

  const selectedCount = selectedIds.size;
  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds,
    selectedArray,
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleOne,
    toggleAll,
    clearSelection,
  };
}
