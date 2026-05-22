"use client";

import {
  useRef,
  useMemo,
  Suspense,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollControls, useScroll, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const MODEL_URLS = [
  "/models/Agni_GLTF.glb",
  "/models/Cordura_GLTF.glb",
  "/models/Tejas_GLTF.glb",
  "/models/Velura_GLTF.glb",
];

const CARD_COUNT = MODEL_URLS.length;
const SCROLL_PAGES = 5; // total scrollable viewport-heights

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ModelCarouselProps {
  onActiveChange: (index: number) => void;
}

/* ------------------------------------------------------------------ */
/*  CardModel — loads, centres & scales a single GLB                   */
/* ------------------------------------------------------------------ */

function CardModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 1 / maxDim;
    c.scale.setScalar(s);
    c.position.sub(center.multiplyScalar(s));
    return c;
  }, [scene]);

  return <primitive object={cloned} />;
}

/* ------------------------------------------------------------------ */
/*  CameraRig — sets the lookAt once                                   */
/* ------------------------------------------------------------------ */

function CameraRig() {
  const { camera } = useThree();
  useMemo(() => {
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  ScrollScene — reads scroll offset each frame, animates cards       */
/* ------------------------------------------------------------------ */

function ScrollScene({
  onActiveChange,
  onReady,
}: {
  onActiveChange: (index: number) => void;
  onReady: () => void;
}) {
  const scroll = useScroll();
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const prevIndex = useRef(0);

  // This component only mounts after Suspense resolves (all models loaded)
  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame(() => {
    const offset = scroll.offset; // 0 → 1
    const progress = offset * (CARD_COUNT - 1); // 0 → 3
    const activeIdx = Math.min(Math.round(progress), CARD_COUNT - 1);

    if (activeIdx !== prevIndex.current) {
      prevIndex.current = activeIdx;
      onActiveChange(activeIdx);
    }

    for (let i = 0; i < CARD_COUNT; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;

      // How far this card is from the "active" position
      // negative = hasn't arrived yet, 0 = centred, positive = past
      const cp = progress - i;

      // Hide cards that are far offscreen
      if (cp < -1.1 || cp > 1.1) {
        g.visible = false;
        continue;
      }

      g.visible = true;

      if (cp <= 0) {
        // ---- Entering from below / holding centred ----
        // cp goes from -1 (fully below) to 0 (centred)
        const t = THREE.MathUtils.smoothstep(cp + 1, 0, 1);
        g.position.y = THREE.MathUtils.lerp(-3, 0, t);
        g.rotation.x = THREE.MathUtils.lerp(-Math.PI, 0, t);
      } else {
        // ---- Exiting upward ----
        // cp goes from 0 (centred) to 1 (fully above)
        const t = THREE.MathUtils.smoothstep(cp, 0, 0.5);
        g.position.y = THREE.MathUtils.lerp(0, 3, t);
        g.rotation.x = THREE.MathUtils.lerp(0, Math.PI, t);
      }
    }
  });

  return (
    <>
      {MODEL_URLS.map((url, i) => (
        <group
          key={url}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          visible={i === 0}
        >
          <CardModel url={url} />
        </group>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  ModelCarousel — the exported component                             */
/* ------------------------------------------------------------------ */

export default function ModelCarousel({ onActiveChange }: ModelCarouselProps) {
  const [loaded, setLoaded] = useState(false);
  const handleReady = useCallback(() => setLoaded(true), []);

  return (
    <div className="absolute inset-0">
      {/* Loading overlay — disappears once all GLBs are parsed */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-amber-200/25 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 animate-pulse">
              Loading models…
            </p>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1, 0], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <CameraRig />

        {/* Lighting — matches the original setup */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 7]} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.6} />
        <directionalLight
          color="#d4c5a9"
          position={[0, -3, -5]}
          intensity={0.4}
        />

        <Suspense fallback={null}>
          <ScrollControls pages={SCROLL_PAGES} damping={0.15}>
            <ScrollScene
              onActiveChange={onActiveChange}
              onReady={handleReady}
            />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}

// Start preloading all models as soon as this module is evaluated
MODEL_URLS.forEach((url) => useGLTF.preload(url));
