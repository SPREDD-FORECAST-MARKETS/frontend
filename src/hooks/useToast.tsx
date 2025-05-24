import { useContext } from "react";
import { ToastContext } from "../components/Toast";

export const useToast = () => {
    const context = useContext(ToastContext);

    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return {
        toast: context.addToast,
        success: (message: string, duration?: number) => context.addToast(message, 'success', duration),
        error: (message: string, duration?: number) => context.addToast(message, 'error', duration),
        info: (message: string, duration?: number) => context.addToast(message, 'info', duration),
        warning: (message: string, duration?: number) => context.addToast(message, 'warning', duration),
        remove: context.removeToast,
    };
};
