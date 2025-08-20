import React from 'react';
import { usePaste } from '../hooks/usePaste';

interface PasteableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
  enablePaste?: boolean;
}

export const PasteableInput: React.FC<PasteableInputProps> = ({ 
  onValueChange, 
  enablePaste = true,
  onChange,
  onPaste,
  ...props 
}) => {
  const pasteHandler = usePaste(onValueChange);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (enablePaste) {
      pasteHandler.handlePaste(e);
    }
    if (onPaste) {
      onPaste(e);
    }
  };

  return (
    <input
      {...props}
      onChange={handleChange}
      onPaste={handlePaste}
    />
  );
};

interface PasteableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
  enablePaste?: boolean;
}

export const PasteableTextarea: React.FC<PasteableTextareaProps> = ({ 
  onValueChange, 
  enablePaste = true,
  onChange,
  onPaste,
  ...props 
}) => {
  const pasteHandler = usePaste(onValueChange);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (enablePaste) {
      pasteHandler.handlePaste(e);
    }
    if (onPaste) {
      onPaste(e);
    }
  };

  return (
    <textarea
      {...props}
      onChange={handleChange}
      onPaste={handlePaste}
    />
  );
};
