import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabaseClient';

const buildQuery = (table, options) => {
  const {
    select = '*',
    filters = [],
    order = null,
    limit = null,
  } = options || {};

  let query = supabase.from(table).select(select);

  filters.forEach(({ column, operator, value }) => {
    query = query.filter(column, operator, value);
  });

  if (order?.column) {
    query = query.order(order.column, {
      ascending: order.ascending ?? false,
      nullsFirst: order.nullsFirst ?? false,
    });
  }

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  return query;
};

export const useSupabase = (table, options = {}) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const memoizedOptions = useMemo(
    () => ({ ...options }),
    [JSON.stringify(options)]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: queryError } = await buildQuery(table, memoizedOptions);
    if (queryError) {
      setError(queryError);
    } else {
      setError(null);
      setData(rows ?? []);
    }
    setLoading(false);
  }, [table, memoizedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  };
};
