'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchOrders, setInitialOrders } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { format } from 'date-fns';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';

interface OrdersClientProps {
  initialData: {
    items: any[];
    lastEvaluatedKey: any;
    total: number;
  };
}

export default function OrdersClient({ initialData }: OrdersClientProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, ordersLastEvaluatedKey, totalOrders } = useSelector((state: RootState) => state.shopify);

  // Initialize Redux with server-side data
  useEffect(() => {
    dispatch(setInitialOrders(initialData));
  }, [dispatch, initialData]);

  // Flatten orders if needed
  const flatOrders = orders.map(order => order.item ? order.item : order);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'order_number', 'customer', 'email', 'phone', 'total_price', 'financial_status', 'fulfillment_status', 'line_items', 'created_at', 'updated_at'
  ]);

  // Multi-filter states
  const [status, setStatus] = useState('All');
  const [fulfillment, setFulfillment] = useState('All');
  // Smart filter states
  const [smartField, setSmartField] = useState('order_number');
  const [smartValue, setSmartValue] = useState('');

  const handleNextPage = async () => {
    if (!ordersLastEvaluatedKey || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await dispatch(fetchOrders({ 
        limit: 50, 
        lastKey: ordersLastEvaluatedKey,
        isServerSide: false // Ensure client-side pagination
      })).unwrap();
    } catch (err) {
      console.error('Error loading more orders:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Add error boundary for failed data fetches
  useEffect(() => {
    if (error) {
      console.error('Orders data fetch error:', error);
      // Optionally show a toast notification here
    }
  }, [error]);

  // Add loading state handling
  useEffect(() => {
    if (loading) {
      // Optionally show a loading indicator
      console.log('Loading orders data...');
    }
  }, [loading]);

  // Build filter options from data
  const statusOptions = ['All', ...Array.from(new Set(flatOrders.map((d: any) => d.financial_status).filter(Boolean)))];
  const fulfillmentOptions = ['All', ...Array.from(new Set(flatOrders.map((d: any) => d.fulfillment_status).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Order #', value: 'order_number' },
    { label: 'Customer', value: 'customer' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Total', value: 'total_price' },
    { label: 'Status', value: 'financial_status' },
    { label: 'Fulfillment', value: 'fulfillment_status' },
    { label: 'Items', value: 'line_items' },
    { label: 'Created', value: 'created_at' },
    { label: 'Updated', value: 'updated_at' },
  ];

  // Multi-filter logic
  let filteredOrders = flatOrders.filter((row: any) =>
    (status === 'All' || row.financial_status === status) &&
    (fulfillment === 'All' || row.fulfillment_status === fulfillment)
  );

  // Smart filter logic
  if (smartValue) {
    filteredOrders = filteredOrders.filter((row: any) => {
      let val = row[smartField];
      if (smartField === 'customer') {
        val = `${row.customer?.first_name || ''} ${row.customer?.last_name || ''}`.trim();
      }
      if (smartField === 'line_items') {
        val = Array.isArray(row.line_items) ? row.line_items.length : '';
      }
      if (smartField === 'created_at' || smartField === 'updated_at') {
        val = row[smartField] ? new Date(row[smartField]).toLocaleDateString() : '';
      }
      if (Array.isArray(val)) {
        return val.some((v) => String(v).toLowerCase().includes(smartValue.toLowerCase()));
      }
      return String(val ?? '').toLowerCase().includes(smartValue.toLowerCase());
    });
  }

  const columns = [
    { 
      header: 'Order #', 
      accessor: 'order_number',
      render: (value: any) => value?.toString() ?? ''
    },
    { 
      header: 'Customer', 
      accessor: 'customer',
      render: (value: any) => `${value?.first_name || ''} ${value?.last_name || ''}`.trim()
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Phone', 
      accessor: 'phone',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Total', 
      accessor: 'total_price',
      render: (value: any, row: any) => row.currency && value ? `${row.currency} ${value}` : ''
    },
    { 
      header: 'Status', 
      accessor: 'financial_status',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Fulfillment', 
      accessor: 'fulfillment_status',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Items', 
      accessor: 'line_items',
      render: (value: any) => Array.isArray(value) ? value.length : 0
    },
    { 
      header: 'Created', 
      accessor: 'created_at',
      render: (value: any) => value ? format(new Date(value), 'MMM d, yyyy') : ''
    },
    { 
      header: 'Updated', 
      accessor: 'updated_at',
      render: (value: any) => value ? format(new Date(value), 'MMM d, yyyy') : ''
    },
  ];

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  // Reset all filters
  const handleResetFilters = () => {
    setStatus('All');
    setFulfillment('All');
    setSmartField('order_number');
    setSmartValue('');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={() => dispatch(fetchOrders({ limit: 50 }))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <UniversalAnalyticsBar section="shopify" tabKey="orders" total={totalOrders} currentCount={filteredOrders.length} />
      <UniversalOperationBar 
        section="shopify" 
        tabKey="orders" 
        analytics={analytics} 
        data={filteredOrders}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={filteredOrders}
            columns={filteredColumns}
            onSort={(column) => {
              // Implement sorting logic
            }}
            onSearch={(query) => {
              // Implement search logic
            }}
            section="shopify"
            tabKey="orders"
            onSelectionChange={setSelectedRows}
            onLoadMore={handleNextPage}
            hasMore={!!ordersLastEvaluatedKey}
            isLoadingMore={isLoadingMore}
            status={status}
            setStatus={setStatus}
            statusOptions={statusOptions}
            type={fulfillment}
            setType={setFulfillment}
            typeOptions={fulfillmentOptions}
            board={''}
            setBoard={() => {}}
            boardOptions={[]}
            smartField={smartField}
            setSmartField={setSmartField}
            smartFieldOptions={smartFieldOptions}
            smartValue={smartValue}
            setSmartValue={setSmartValue}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
} 