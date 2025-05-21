import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Star, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Review, Product } from "@shared/schema";

export default function AdminReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  
  // Получаем список отзывов
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
  });
  
  // Получаем список товаров для фильтрации
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Мутация для удаления отзыва
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при удалении отзыва");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({
        title: "Отзыв удален",
        description: "Отзыв был успешно удален",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить отзыв",
        variant: "destructive",
      });
    }
  });
  
  // Функция для отображения звездочек рейтинга
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={`star-${i}`} 
          className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };
  
  // Функция для форматирования даты
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Фильтрация отзывов
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = selectedProduct === "all" || 
      review.productId.toString() === selectedProduct;
    
    return matchesSearch && matchesProduct;
  });
  
  // Функция для получения названия товара по ID
  const getProductNameById = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Товар #${productId}`;
  };
  
  // Обработчик удаления отзыва
  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };
  
  if (reviewsLoading || productsLoading) {
    return (
      <AdminLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Управление отзывами</h1>
          <p>Загрузка данных...</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Управление отзывами</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фильтр отзывов</CardTitle>
            <CardDescription>
              Используйте фильтры для поиска нужных отзывов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени клиента или комментарию"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="w-full md:w-64">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все товары</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Список отзывов ({filteredReviews.length})</CardTitle>
            <CardDescription>
              Просмотр и модерация отзывов клиентов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReviews.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Оценка</TableHead>
                      <TableHead>Комментарий</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.customerName}</TableCell>
                        <TableCell>{getProductNameById(review.productId)}</TableCell>
                        <TableCell>{renderStars(review.rating)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.comment}
                        </TableCell>
                        <TableCell>{formatDate(review.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Удалить отзыв"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedProduct !== "all" 
                  ? "Отзывы не найдены. Измените параметры поиска."
                  : "Отзывы отсутствуют."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}