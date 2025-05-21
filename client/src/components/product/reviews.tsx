import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, StarHalf, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface ReviewsProps {
  productId: number;
  isAdmin?: boolean;
}

export default function ProductReviews({ productId, isAdmin = false }: ReviewsProps) {
  const queryClient = useQueryClient();
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });
  
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при удалении отзыва");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
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

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { customerName: string; rating: number; comment: string }) => {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при добавлении отзыва");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      toast({
        title: "Отзыв добавлен",
        description: "Спасибо за ваш отзыв!",
      });
      setIsAddingReview(false);
      setCustomerName("");
      setRating(5);
      setComment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить отзыв",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите ваше имя",
        variant: "destructive",
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, напишите текст отзыва",
        variant: "destructive",
      });
      return;
    }
    
    createReviewMutation.mutate({ customerName, rating, comment });
  };

  // Функция для отображения звездочек рейтинга
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }
    
    return stars;
  };

  // Функция для выбора рейтинга при добавлении отзыва
  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  if (isLoading) {
    return <div className="py-4">Загрузка отзывов...</div>;
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-semibold mb-4">Отзывы клиентов</h2>
      
      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review: Review) => (
            <div key={review.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{review.customerName}</p>
                  <div className="flex items-center mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <p className="mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Пока нет отзывов. Будьте первым, кто оставит отзыв!</p>
      )}
      
      {!isAddingReview ? (
        <Button 
          className="mt-6" 
          onClick={() => setIsAddingReview(true)}
        >
          Оставить отзыв
        </Button>
      ) : (
        <div className="mt-6 border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-3">Написать отзыв</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1">Ваше имя</label>
              <Input 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="Иван Иванов"
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Оценка</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Ваш отзыв</label>
              <Textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="Расскажите о вашем опыте использования этого товара"
                className="w-full"
                rows={4}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? "Отправка..." : "Отправить отзыв"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddingReview(false)}
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}