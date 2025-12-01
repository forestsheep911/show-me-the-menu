"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

export function EditableCell({
  value,
  onChange,
  multiline = false,
  placeholder = "点击编辑...",
  className,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = editValue.length;
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.setSelectionRange(len, len);
      } else {
        inputRef.current.selectionStart = len;
        inputRef.current.selectionEnd = len;
      }
    }
  }, [isEditing, editValue.length]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && !multiline) {
      handleSave();
    } else if (e.key === "Enter" && e.metaKey && multiline) {
      // Cmd/Ctrl + Enter to save for multiline
      handleSave();
    }
  };

  if (isEditing) {
    const commonProps = {
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        setEditValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      placeholder,
      className: cn(
        "w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white",
        className
      ),
    };

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          {...commonProps}
          rows={3}
          className={cn(commonProps.className, "resize-none")}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        {...commonProps}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "min-h-[24px] px-1 py-0.5 cursor-text rounded hover:bg-gray-100 transition-colors",
        !value && "text-gray-400 italic",
        multiline && "whitespace-pre-wrap",
        className
      )}
    >
      {value || placeholder}
    </div>
  );
}

