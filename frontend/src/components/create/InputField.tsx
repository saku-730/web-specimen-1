// src/components/create/InputField.tsx

"use client"; // この部品は onChange を扱うのでクライアント部品なのだ

// フォームの部品を共通化してコードをスッキリさせるのだ！
type InputFieldProps = {
  label: string;
  id: string;
  name: string;
  type: 'text' | 'number' | 'datetime-local' | 'select' | 'textarea';
  value: string | number;
  onChange: (e: React.ChangeEvent<any>) => void;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  step?: string;
  rows?: number;
};

const InputField = ({ label, id, options, type, ...props }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {type === 'select' ? (
      <select id={id} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
        <option value="">Select...</option>
        {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea id={id} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
    ) : (
      <input type={type} id={id} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
    )}
  </div>
);

export default InputField;
