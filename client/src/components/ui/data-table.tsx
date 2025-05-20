import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    accessorKey: string;
    header: string;
    cell?: (info: { row: { original: T }}) => React.ReactNode;
  }[];
  searchPlaceholder?: string;
  onSearch?: (searchTerm: string) => void;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Поиск...",
  onSearch,
  pageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  const handlePreviousPage = () => {
    setPage((p) => Math.max(0, p - 1));
  };
  
  const handleNextPage = () => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };
  
  return (
    <div className="w-full">
      {onSearch && (
        <div className="flex items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {column.cell
                        ? column.cell({ row: { original: row } })
                        : (row as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Нет данных.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Предыдущая страница</span>
          </Button>
          <div className="text-sm text-gray-600">
            Страница {page + 1} из {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Следующая страница</span>
          </Button>
        </div>
      )}
    </div>
  );
}