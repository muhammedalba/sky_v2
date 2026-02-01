import { useState } from 'react';

interface ConfirmDialogState {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void | Promise<void>;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = ({
    title,
    message,
    onConfirm,
  }: {
    title?: string;
    message?: string;
    onConfirm: () => void | Promise<void>;
  }) => {
    setState({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const closeDialog = () => {
    if (!isLoading) {
      setState({ isOpen: false });
    }
  };

  const handleConfirm = async () => {
    if (state.onConfirm) {
      setIsLoading(true);
      try {
        await state.onConfirm();
        setState({ isOpen: false });
      } catch (error) {
        console.error('Confirmation action failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    isLoading,
    openDialog,
    closeDialog,
    handleConfirm,
  };
}
