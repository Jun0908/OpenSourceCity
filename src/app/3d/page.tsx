'use client'

import { useParams } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import { Suspense } from 'react'

/** モデル読み込み用コンポーネント */
function Room({ name }: { name: string }) {
  // 例: name === 'coloured_apartment'
  const { scene } = useGLTF(`/${name}.glb`)
  return <primitive object={scene} />
}
useGLTF.preload('/coloured_apartment.glb') // 代表的なものを先読み (任意)

export default function ViewerPage() {
  const { model } = useParams<{ model: string }>()   // 'coloured_apartment' など

  if (!model) return <div className="p-10 text-center">Model not specified</div>

  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <Suspense
          fallback={
            <Html>
              <div className="text-white bg-black/50 px-3 py-1 rounded">Loading…</div>
            </Html>
          }
        >
          <Room name={model} />
        </Suspense>

        <OrbitControls />
      </Canvas>
    </div>
  )
}

