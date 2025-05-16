'use client'

import { useState, DragEvent } from 'react'
import Image from 'next/image'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

function Model() {
  const gltf = useGLTF('/mapmap-3d.glb')
  return <primitive object={gltf.scene} scale={1.5} />
}

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [show3D, setShow3D] = useState(false)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start px-4 py-10 gap-8">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full max-w-lg border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-white transition-colors duration-300"
      >
        <label className="cursor-pointer text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <div className="text-lg">Click or drag an image here to upload</div>
          <div className="text-sm text-gray-400 mt-1">Only image files are accepted</div>
        </label>

        {preview && (
          <div className="mt-4 w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src={preview}
              alt="Preview"
              width={500}
              height={500}
              className="object-contain w-full max-h-[400px] bg-black"
            />
          </div>
        )}
      </div>

      <button
        onClick={() => setShow3D(true)}
        className="bg-indigo-600 hover:bg-indigo-700 transition-colors px-6 py-2 rounded-xl text-lg font-medium shadow-lg"
      >
        image to 3d
      </button>

      {show3D && (
        <div className="w-full max-w-4xl h-[500px] mt-6 rounded-2xl overflow-hidden border border-gray-700">
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls />
            <Model />
          </Canvas>
        </div>
      )}
    </div>
  )
}
