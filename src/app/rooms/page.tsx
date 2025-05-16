'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React from 'react'

function RoomGrid() {
  const gridSize = 3          // 3x3 グリッド
  const spacing = 6           // 各部屋の間隔

  return (
    <>
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const row = Math.floor(index / gridSize)
        const col = index % gridSize
        const x = (col - 1) * spacing
        const z = (row - 1) * spacing

        return (
          <mesh position={[x, 0, z]} key={index}>
            <boxGeometry args={[5, 3, 5]} />
            <meshStandardMaterial color="lightblue" />
          </mesh>
        )
      })}
    </>
  )
}

export default function RoomsPage() {
  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <RoomGrid />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
