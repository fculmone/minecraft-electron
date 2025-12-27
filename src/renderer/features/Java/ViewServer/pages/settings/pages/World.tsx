import type { ServerProperties } from '@main/minecraftServers/javaTypes';
import { TAB_FIELDS, PROPERTY_META } from '../lib/settingsMeta';
import RenderPropertyInput from '../components/RenderPropertyInput';

interface WorldProps {
  properties: ServerProperties;
  onPropertyChange: (key: keyof ServerProperties, value: any) => void;
}

export default function World({ properties, onPropertyChange }: WorldProps) {
  const fields = TAB_FIELDS.world;

  return (
    <div className="space-y-6">
      <div className="text-sm text-base-content/70 mb-4">
        World generation and dimension settings.
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
