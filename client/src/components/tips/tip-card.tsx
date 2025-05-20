import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface TipCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  link?: string;
  linkText?: string;
  className?: string;
}

export function TipCard({
  title,
  description,
  image,
  imageAlt = "Изображение с советом",
  link,
  linkText = "Подробнее",
  className = "",
}: TipCardProps) {
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200'}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200') {
              target.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200';
            }
          }}
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-gray-600 line-clamp-3">{description}</CardDescription>
      </CardContent>
      {link && (
        <CardFooter className="p-4 pt-2">
          {link.startsWith('http') ? (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-[#8e2b85] hover:text-[#76236e] font-medium transition-colors text-sm"
            >
              {linkText} <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          ) : (
            <Link 
              to={link} 
              className="inline-flex items-center text-[#8e2b85] hover:text-[#76236e] font-medium transition-colors text-sm"
            >
              {linkText} <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </CardFooter>
      )}
    </Card>
  );
}