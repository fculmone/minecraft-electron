import { TAB_FIELDS, PROPERTY_META } from '../lib/settingsMeta';
import type { ServerProperties } from '@main/minecraftServers/javaTypes';
import RenderPropertyInput from '../components/RenderPropertyInput';

interface SecurityProps {
  properties: ServerProperties;
  onPropertyChange: (key: keyof ServerProperties, value: any) => void;
}

export default function Security({
  properties,
  onPropertyChange,
}: SecurityProps) {
  const fields = TAB_FIELDS.security;

  return (
    <div className="space-y-6">
      <div className="text-sm text-base-content/70 mb-4">
        Security and access control settings.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => {
          const meta = PROPERTY_META[field];
          return (
            <RenderPropertyInput
              key={field}
              propertyKey={field}
              value={properties[field]}
              meta={meta}
              onChange={onPropertyChange}
            />
          );
        })}
      </div>
    </div>
  );
}
