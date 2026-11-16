/** Brand mark for generated images (favicon, Apple icon): a night orb with the initials, Satori-friendly. */
export function BrandMark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050a18',
        borderRadius: size * 0.22,
      }}
    >
      <div
        style={{
          width: size * 0.78,
          height: size * 0.78,
          borderRadius: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 32% 28%, #96c8ff 0%, #3b82f6 45%, #1e3a8a 100%)',
          boxShadow: `0 0 ${size * 0.18}px rgba(59,130,246,0.75)`,
          color: '#ffffff',
          fontSize: size * 0.36,
          fontWeight: 800,
          letterSpacing: -size * 0.02,
        }}
      >
        VM
      </div>
    </div>
  );
}
