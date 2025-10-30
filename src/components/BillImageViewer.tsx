import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Download, ZoomIn, AlertCircle } from 'lucide-react';

interface BillImageViewerProps {
  billUrls: string[];
  expenseName?: string;
}

export default function BillImageViewer({ billUrls, expenseName = 'Bill' }: BillImageViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const downloadImage = (url: string, index: number) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${expenseName}-bill-${index + 1}.jpg`;
      a.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!billUrls || billUrls.length === 0) {
    return null;
  }

  return (
    <>
      <div className="pt-3 border-t">
        <p className="text-sm font-medium mb-3">Uploaded Bills ({billUrls.length}):</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {billUrls.map((url, index) => {
            const hasError = imageErrors.has(index);
            
            return (
              <div key={index} className="relative group">
                {!hasError ? (
                  <>
                    <div 
                      className="relative w-full aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-500 transition-all"
                      onClick={() => setSelectedImage(url)}
                    >
                      <img 
                        src={url} 
                        alt={`Bill ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={() => handleImageError(index)}
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center gap-2">
                          <ZoomIn className="w-8 h-8 text-white" />
                          <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                            Click to enlarge
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Download button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(url, index);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full aspect-square bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center p-4">
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-red-600">Failed to load image</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs"
                        onClick={() => {
                          // Retry loading
                          setImageErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(index);
                            return newSet;
                          });
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Image number badge */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  Bill {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>Bill Image</DialogTitle>
              <div className="flex items-center gap-2">
                {selectedImage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const index = billUrls.indexOf(selectedImage);
                      downloadImage(selectedImage, index);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
            {selectedImage && (
              <div className="flex items-center justify-center bg-gray-50 rounded-lg min-h-[400px]">
                <img
                  src={selectedImage}
                  alt="Bill"
                  className="max-w-full max-h-[calc(90vh-120px)] object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
