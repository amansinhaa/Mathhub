import React, { useState, useEffect, ComponentType } from 'react';

interface DynamicOptions<P = {}> {
  ssr?: boolean;
  loading?: () => React.ReactNode;
}

export default function dynamic<P = any>(
  loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P> | any>,
  options?: DynamicOptions<P>
): ComponentType<any> {
  return function DynamicComponent(props: any) {
    const [Comp, setComp] = useState<ComponentType<P> | null>(null);

    useEffect(() => {
      let isMounted = true;
      loader().then((mod: any) => {
        if (isMounted) {
          setComp(() => mod.default || mod);
        }
      });
      return () => {
        isMounted = false;
      };
    }, []);

    if (!Comp) {
      return options?.loading ? <>{options.loading()}</> : null;
    }

    return <Comp {...props} />;
  };
}

