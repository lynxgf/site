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
    <div>
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
        {fabricsInCategory.map((fabric) => (
          <div 
            key={fabric.id}
            onClick={() => onSelectFabric(fabric.id)}
            className="cursor-pointer relative group"
          >
            <div
              className={`
                w-12 h-12 rounded-full overflow-hidden border-2 transition-all
                ${selectedFabric === fabric.id 
                  ? 'border-neutral-800 shadow-sm' 
                  : 'border-neutral-200 hover:border-neutral-400'
                }
              `}
              title={fabric.name}
            >
              <img 
                src={fabric.thumbnail} 
                alt={fabric.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            {selectedFabric === fabric.id && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-800 text-white rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Selected fabric display */}
      {selectedFabricObject && (
        <div className="mt-4 border border-neutral-200 p-3 rounded-sm flex items-center">
          <div className="w-16 h-16 rounded-sm overflow-hidden border border-neutral-300 mr-4">
            <img 
              src={selectedFabricObject.image} 
              alt={selectedFabricObject.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <span className="block font-medium text-neutral-900">{selectedFabricObject.name}</span>
            <span className="text-sm text-neutral-500">Категория: {selectedFabricCategory}</span>
          </div>
        </div>
      )}
    </div>
  );
}
