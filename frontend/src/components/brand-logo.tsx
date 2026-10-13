import Image from 'next/image';

/** Both regions display the original supplied full-logo artwork without recoloring. */
export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-logo" role="img" aria-label="Autopilot Monster">
      <span className="brand-logo-art" aria-hidden="true">
        <Image
          src="/brand/autopilot-monster.png"
          alt=""
          width={64}
          height={64}
          sizes="64px"
          loading="eager"
        />
      </span>
      {!compact && (
        <span className="brand-wordmark" aria-hidden="true">
          <Image
            src="/brand/autopilot-monster.png"
            alt=""
            width={190}
            height={190}
            sizes="190px"
            loading="eager"
          />
        </span>
      )}
    </span>
  );
}
