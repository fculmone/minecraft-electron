import { useEffect, useState } from 'react';
import { toast, ToastMessage } from './toast.service';

export default function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const subscription = toast.subscribe(setMessages);
    return () => subscription.unsubscribe();
  }, []);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="toast toast-bottom toast-end z-[9999] text-white">
      {messages.map((message) => (
        <div key={message.id} className={`alert alert-${message.type}`}>
          <div>
            <span>{message.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
