'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, X, Upload, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null, preview: string) => void;
  onImageRemove?: () => void;
  disabled?: boolean;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  showPreview?: boolean;
  placeholder?: React.ReactNode;
  label?: string;
  description?: string;
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  onImageRemove,
  disabled = false,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  size = 'md',
  shape = 'circle',
  showPreview = true,
  placeholder,
  label,
  description
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  const handleFileSelect = (file: File) => {
    setError('');

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Please select a valid image file (${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')})`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    onImageChange(null, '');
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className={`space-y-3 ${className} `}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div
        className={`
          relative group cursor-pointer transition-all duration-200 center
          ${sizeClasses[size]} ${shapeClasses[shape]}
          ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'}
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Image Container */}
        <div className={`
          w-full h-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300
          flex items-center justify-center
          ${shapeClasses[shape]}
          ${isDragOver ? 'bg-blue-50 border-blue-400' : ''}
          ${disabled ? 'opacity-50' : 'hover:border-gray-400'}
        `}>
          {displayImage ? (
            <img 
              src={displayImage} 
              alt="Upload preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            placeholder || (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Upload Image</span>
              </div>
            )
          )}
        </div>

        {/* Upload Button Overlay */}
        {!disabled && (
          <div className="absolute inset-0 hover:bg-black bg-opacity-0 group-hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        {/* Remove Button */}
        {displayImage && onImageRemove && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center">
        {description && <p className="mb-1">{description}</p>}
        <p>Click to upload or drag and drop</p>
        <p>Max size: {maxSize}MB • {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
      </div>
    </div>
  );
}
