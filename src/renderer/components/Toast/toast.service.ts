import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

class ToastService {
  private messages$ = new BehaviorSubject<ToastMessage[]>([]);

  private id = 0;

  subscribe(callback: (messages: ToastMessage[]) => void) {
    return this.messages$.subscribe(callback);
  }

  show(message: string, type: ToastType = 'info') {
    const newMessage = { id: this.id++, message, type };
    const currentMessages = this.messages$.getValue();
    this.messages$.next([...currentMessages, newMessage]);

    setTimeout(() => {
      const currentMessages = this.messages$.getValue();
      this.messages$.next(
        currentMessages.filter((m) => m.id !== newMessage.id),
      );
    }, 3000);
  }
}

export const toast = new ToastService();
