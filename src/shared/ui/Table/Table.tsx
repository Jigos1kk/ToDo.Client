import type { ReactNode } from 'react';

import { Skeleton } from '../Skeleton/Skeleton';
import styles from './Table.module.css';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyContent?: ReactNode;
  ariaLabel?: string;
}

/** Типизированная таблица со скелетоном загрузки и пустым состоянием. */
export function Table<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  skeletonRows = 5,
  emptyContent,
  ariaLabel,
}: TableProps<T>) {
  if (!isLoading && data.length === 0) {
    return <>{emptyContent ?? null}</>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={column.align ? styles[column.align] : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <Skeleton height={16} width={rowIndex % 2 === 0 ? '70%' : '45%'} />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((row) => (
                <tr key={getRowKey(row)} className={styles.row}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.align ? styles[column.align] : undefined}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
