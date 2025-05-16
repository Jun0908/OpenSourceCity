'use client'

import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { OBJLoader } from 'three-stdlib'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'

export default function ObjDropPage() {
  const [objUrl, setObjUrl] = useState<string | null>(null)

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setObjUrl(url)
  }

  return (
    <div className="h-screen w-screen relative">
      <input
        type="file"
        accept=".obj"
        onChange={handleFile}
        className="absolute top-4 left-4 z-10 bg-white p-2 rounded"
      />

      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <OrbitControls />
        {objUrl && <LoadedObj url={objUrl} />}
      </Canvas>
    </div>
  )
}

function LoadedObj({ url }: { url: string }) {
  const [object, setObject] = useState<THREE.Object3D | null>(null)

  useEffect(() => {
    new OBJLoader().load(url, (obj) => {
      setObject(obj)
    })
  }, [url])

  if (!object) return null

  return <primitive object={object} position={[0, 0, 0]} scale={1} />
}
