'use client';

import dynamic from 'next/dynamic';

// The 3D scene loads after the page content, so it never delays the first paint or search engines.
const NightScene = dynamic(() => import('./NightScene'), { ssr: false });

export default function NightSceneLoader() {
  return <NightScene />;
}
