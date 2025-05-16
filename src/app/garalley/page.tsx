'use client'

import Link from 'next/link'
import Image from 'next/image' // ← 追加

const templates = [
  { title: 'Coloured Apartment', file: 'coloured_apartment.glb' },
  { title: 'Hospital Room', file: 'hospital_room.glb' },
  { title: 'Living Room', file: 'living_room.glb' },
  { title: 'Sci-Fi Computer Room', file: 'sci-fi_computer_room.glb' },
  { title: 'Tobacco Warehouse', file: 'tabacco_warehouse.glb' },
  { title: 'The Billiards Room', file: 'the_billiards_room.glb' },
  { title: 'The Morning Room', file: 'the_morning_room.glb' },
  { title: 'Restaurant Room', file: 'restrant_room.glb' },
]

export default function Home() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Choose a Room</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <Link key={tpl.file} href={`/viewer/${tpl.file.replace('.glb', '')}`}>
            <div className="border rounded hover:shadow cursor-pointer overflow-hidden">
              <Image
                src={`/thumbnails/${tpl.file.replace('.glb', '.png')}`}
                alt={tpl.title}
                width={400}        // 例: 画像の横幅（実際の画像に合わせて調整）
                height={160}       // 例: 画像の高さ（同上）
                className="w-full h-40 object-cover"
              />
              <div className="p-2">
                <h3 className="text-sm font-semibold">{tpl.title}</h3>
                <p className="text-xs text-gray-500 truncate">{tpl.file}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}



