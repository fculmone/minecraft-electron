interface RenderPropertyInputProps {
  propertyKey: string;
  value: any;
  meta: {
    label: string;
    description: string;
    example?: string;
    allowedValues?: readonly string[];
    min?: number;
    max?: number;
  };
  onChange: (key: any, value: any) => void;
}

export default function RenderPropertyInput({
  propertyKey,
  value,
  meta,
  onChange,
}: RenderPropertyInputProps) {
  const isBoolean = typeof value === 'boolean';
  const isNumber = typeof value === 'number';
  const inputId = `prop-${propertyKey.replace(/\s+/g, '-').toLowerCase()}`;
  const label = meta?.label || propertyKey;
  const hasAllowedValues = meta?.allowedValues && meta.allowedValues.length > 0;

  let inputElement;

  if (hasAllowedValues) {
    // Render a select dropdown if allowed values are specified
    inputElement = (
      <select
        id={inputId}
        className="select select-bordered"
        value={String(value)}
        onChange={(e) => {
          const newValue = e.target.value;
          // Convert back to boolean or number if needed
          if (isBoolean) {
            onChange(propertyKey, newValue === 'true');
          } else if (isNumber) {
            onChange(propertyKey, parseInt(newValue, 10) || 0);
          } else {
            onChange(propertyKey, newValue);
          }
        }}
      >
        {meta.allowedValues?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  } else if (isBoolean) {
    inputElement = (
      <input
        id={inputId}
        type="checkbox"
        className="toggle toggle-primary"
        checked={value}
        onChange={(e) => onChange(propertyKey, e.target.checked)}
      />
    );
  } else if (isNumber) {
    inputElement = (
      <input
        id={inputId}
        type="number"
        className="input input-bordered"
        value={value}
        min={meta?.min}
        max={meta?.max}
        onChange={(e) =>
          onChange(propertyKey, parseInt(e.target.value, 10) || 0)
        }
      />
    );
  } else {
    inputElement = (
      <input
        id={inputId}
        type="text"
        className="input input-bordered"
        value={value}
        onChange={(e) => onChange(propertyKey, e.target.value)}
      />
    );
  }

  return (
    <div className="form-control">
      <label className="label" htmlFor={inputId}>
        <span className="label-text font-medium">{label}</span>
      </label>
      {inputElement}
      {meta?.description && (
        <label className="label" htmlFor={inputId}>
          <span className="label-text-alt text-base-content/60">
            {meta.description}
          </span>
        </label>
      )}
    </div>
  );
}
