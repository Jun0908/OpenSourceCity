'use client'

import { useParams } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'

function Room({ model }: { model: string }) {
  const { scene } = useGLTF(`/${model}.glb`)
  return <primitive object={scene} />
}

export default function ViewerPage() {
  const params = useParams()
  const model = typeof params.model === 'string' ? params.model : params.model?.[0]

  if (!model) return <div className="text-center p-10">Invalid model</div>

  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Room model={model} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  )
}
