import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import AdminSidebar from '@/components/admin/sidebar';
import ProductForm from '@/components/admin/product-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductEdit() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine if we're editing an existing product or creating a new one
  const isNewProduct = !params.id || params.id === 'new';
  const productId = isNewProduct ? null : parseInt(params.id);
  
  // Fetch product data if editing
  const { data: product, isLoading: isProductLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Show error toast if fetching product fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные товара. Пожалуйста, попробуйте позже.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => navigate('/admin/products')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад к списку товаров
          </Button>
          
          <h1 className="text-3xl font-bold">
            {isNewProduct ? 'Создать новый товар' : 'Редактировать товар'}
          </h1>
        </div>
        
        {isProductLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              <span className="sr-only">Загрузка...</span>
            </div>
            <p className="mt-4 text-gray-500">Загрузка данных товара...</p>
          </div>
        ) : (
          <ProductForm
            product={product}
          />
        )}
      </div>
    </div>
  );
}
