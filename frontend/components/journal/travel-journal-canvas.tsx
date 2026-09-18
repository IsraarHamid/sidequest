"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Float, PresentationControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  JOURNAL_BOOK,
  createJournalCoverTexture,
  createPageEdgeTexture,
  deriveSpineColor,
  loadJournalFonts,
} from "@/lib/journal-cover";
import { Color, type Texture } from "three";

type TravelJournalCanvasProps = {
  ownerName: string;
  coverColor: string;
};

const useJournalTextures = (coverColor: string, ownerName: string) => {
  const [coverMap, setCoverMap] = useState<Texture | null>(null);
  const coverMapRef = useRef<Texture | null>(null);
  const pageEdgeMap = useMemo(() => createPageEdgeTexture(), []);
  // ponytail: defers the 1024x1448 repaint so a dragged color picker
  // doesn't repaint + reupload the texture on every intermediate value.
  const deferredCoverColor = useDeferredValue(coverColor);
  const deferredOwnerName = useDeferredValue(ownerName);

  useEffect(() => {
    let cancelled = false;

    const paint = async () => {
      await loadJournalFonts();
      if (cancelled) return;
      const nextTexture = await createJournalCoverTexture(
        deferredCoverColor,
        deferredOwnerName,
      );
      if (cancelled) {
        nextTexture.dispose();
        return;
      }
      coverMapRef.current?.dispose();
      coverMapRef.current = nextTexture;
      setCoverMap(nextTexture);
    };

    void paint();

    return () => {
      cancelled = true;
    };
  }, [deferredCoverColor, deferredOwnerName]);

  useEffect(() => {
    return () => {
      coverMapRef.current?.dispose();
      coverMapRef.current = null;
      pageEdgeMap.dispose();
    };
  }, [pageEdgeMap]);

  return { coverMap, pageEdgeMap };
};

const CameraLookAt = () => {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

const JournalBook = ({
  ownerName,
  coverColor,
}: TravelJournalCanvasProps) => {
  const { coverMap, pageEdgeMap } = useJournalTextures(coverColor, ownerName);
  const spineColor = deriveSpineColor(coverColor);
  const { width, height, depth } = JOURNAL_BOOK;
  const coverTint = useMemo(() => new Color(coverColor), [coverColor]);
  const coverThickness = 0.032;
  const pageDepth = depth - coverThickness * 2 - 0.012;

  return (
    <group>
      <mesh position={[0.045, 0, 0]}>
        <boxGeometry args={[width - 0.1, height - 0.1, pageDepth]} />
        <meshStandardMaterial
          attach="material-0"
          map={pageEdgeMap}
          roughness={0.96}
          color="#F7F1E6"
        />
        <meshStandardMaterial attach="material-1" color="#EFE6D4" roughness={1} />
        <meshStandardMaterial
          attach="material-2"
          map={pageEdgeMap}
          roughness={0.96}
          color="#F7F1E6"
        />
        <meshStandardMaterial
          attach="material-3"
          map={pageEdgeMap}
          roughness={0.96}
          color="#F7F1E6"
        />
        <meshStandardMaterial attach="material-4" color="#FFF8EC" roughness={1} />
        <meshStandardMaterial attach="material-5" color="#FFF8EC" roughness={1} />
      </mesh>

      <mesh position={[0, 0, -depth / 2 + coverThickness / 2]}>
        <boxGeometry args={[width, height, coverThickness]} />
        <meshStandardMaterial color={coverTint} roughness={0.58} metalness={0.03} />
      </mesh>

      <mesh position={[0, 0, depth / 2 - coverThickness / 2]}>
        <boxGeometry args={[width, height, coverThickness]} />
        <meshStandardMaterial color={coverTint} roughness={0.58} metalness={0.03} />
      </mesh>

      <mesh position={[-width / 2 + coverThickness / 2, 0, 0]}>
        <boxGeometry args={[coverThickness, height, depth]} />
        <meshStandardMaterial color={spineColor} roughness={0.68} metalness={0.02} />
      </mesh>

      {coverMap ? (
        <>
          <mesh position={[0, 0, depth / 2 + 0.0015]}>
            <planeGeometry args={[width * 0.995, height * 0.995]} />
            <meshBasicMaterial map={coverMap} transparent toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -depth / 2 - 0.0015]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[width * 0.995, height * 0.995]} />
            <meshBasicMaterial map={coverMap} transparent toneMapped={false} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};

export const TravelJournalCanvas = ({
  ownerName,
  coverColor,
}: TravelJournalCanvasProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Canvas
      className="h-full w-full touch-none"
      camera={{ position: [0.7, 0.18, 5.1], fov: 32, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <CameraLookAt />
      <color attach="background" args={["#F2F2ED"]} />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#FFF8EE", "#C9BBA8", 0.45]} />
      <directionalLight position={[2.8, 3.6, 4.4]} intensity={1.15} />
      <directionalLight position={[-3.4, 1.2, 2]} intensity={0.35} />

      <group rotation={shouldReduceMotion ? [0.04, 0.28, 0] : [0, 0, 0]}>
        <PresentationControls
          global
          cursor
          snap
          speed={1.1}
          damping={0.22}
          zoom={1}
          rotation={[0.06, 0.4, 0]}
          polar={[-0.16, 0.2]}
          azimuth={[-0.4, 0.65]}
          enabled={!shouldReduceMotion}
        >
          <Float
            enabled={!shouldReduceMotion}
            speed={0.9}
            rotationIntensity={0.1}
            floatIntensity={0.16}
            floatingRange={[-0.025, 0.03]}
          >
            <JournalBook ownerName={ownerName} coverColor={coverColor} />
          </Float>
        </PresentationControls>
      </group>
    </Canvas>
  );
};
