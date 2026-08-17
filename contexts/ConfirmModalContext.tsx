import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

type ConfirmFn = (options: ConfirmOptions) => void;

const ConfirmModalContext = createContext<ConfirmFn>(() => {});

// Mounted once near the root (see app/_layout.tsx) so any screen can trigger
// a themed confirm modal imperatively via useConfirmModal(), the same shape
// as the old Alert.alert-based confirmAlert() it replaces — Alert.alert is a
// no-op on react-native-web, and this also looks like the rest of the app
// instead of a native/browser system dialog.
export function ConfirmModalProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next);
  }, []);

  function handleConfirm() {
    const current = options;
    setOptions(null);
    current?.onConfirm();
  }

  function handleCancel() {
    setOptions(null);
  }

  return (
    <ConfirmModalContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        visible={options !== null}
        title={options?.title ?? ""}
        message={options?.message}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        destructive={options?.destructive}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmModalContext.Provider>
  );
}

export function useConfirmModal(): ConfirmFn {
  return useContext(ConfirmModalContext);
}
