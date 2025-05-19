import { Fabric } from "@shared/schema";
import { Label } from "@/components/ui/label";

interface FabricSelectorProps {
  fabrics: Fabric[];
  selectedFabricCategory: string;
  selectedFabric: string;
  onSelectFabric: (fabricId: string) => void;
}

export default function FabricSelector({
  fabrics,
  selectedFabricCategory,
  selectedFabric,
  onSelectFabric
}: FabricSelectorProps) {
  // Filter fabrics by selected category
  const fabricsInCategory = fabrics.filter(
    (fabric) => fabric.category === selectedFabricCategory
  );
  
  // Get the selected fabric object
  const selectedFabricObject = fabrics.find(
    (fabric) => fabric.id === selectedFabric
  );

  return (
    <div className="mb-6">
      <Label className="block text-gray-700 font-medium mb-2">
        Цвет ткани
      </Label>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {fabricsInCategory.map((fabric) => (
          <div 
            key={fabric.id}
            className={`fabric-swatch cursor-pointer w-12 h-12 rounded-full overflow-hidden ${
              selectedFabric === fabric.id ? 'active' : ''
            }`}
            onClick={() => onSelectFabric(fabric.id)}
            title={fabric.name}
          >
            <img 
              src={fabric.thumbnail} 
              alt={fabric.name} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {selectedFabricObject?.name || 'Выберите цвет'}
      </p>
    </div>
  );
}
