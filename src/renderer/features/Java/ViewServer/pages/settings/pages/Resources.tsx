import { TAB_FIELDS, PROPERTY_META } from '../lib/settingsMeta';
import type { ServerProperties } from '@main/minecraftServers/javaTypes';
import RenderPropertyInput from '../components/RenderPropertyInput';

interface ResourcesProps {
  properties: ServerProperties;
  onPropertyChange: (key: keyof ServerProperties, value: any) => void;
}

export default function Resources({
  properties,
  onPropertyChange,
}: ResourcesProps) {
  const fields = TAB_FIELDS.resources;

  return (
    <div className="space-y-6">
      <div className="text-sm text-base-content/70 mb-4">
        Resource pack configuration and requirements.
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
