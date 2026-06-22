'use client';

import React, { useState } from 'react';
import { useGallery, usePatients } from '@/shared/hooks/useClinicApi';
import { Image as ImageIcon, Sliders, Calendar, User, Info, Plus } from 'lucide-react';
import Badge from '@/shared/components/ui/Badge';
import Spinner from '@/shared/components/ui/Spinner';

export default function GalleryPage() {
  const { data: gallery = [], isLoading } = useGallery();
  const { data: patients = [] } = usePatients();

  const [activeGalleryId, setActiveGalleryId] = useState<string | null>('g-1');
  const [sliderVal, setSliderVal] = useState<number>(50); // percentage of 'before' visible

  const activeItem = gallery.find(g => g.id === activeGalleryId);

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">Treatment Recovery Gallery</h1>
        <p className="text-sm text-clinic-text-secondary mt-1">
          Review clinical photography files, and compare before & after patient treatments using interactive sliders.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : gallery.length === 0 ? (
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-16 text-center text-clinic-text-secondary flex flex-col items-center gap-2 justify-center">
          <ImageIcon className="h-10 w-10 text-clinic-border" />
          <p className="text-sm font-semibold">No gallery images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start max-w-[1800px] w-full">
          
          {/* Gallery Directory Index (Left 1 Column) */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-4 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-3">Treatment Folders</h3>
            
            <div className="flex flex-col gap-2.5">
              {gallery.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveGalleryId(item.id)}
                  className={`p-3.5 border rounded-clinic-10 cursor-pointer flex gap-3.5 items-center transition-all ${
                    activeGalleryId === item.id 
                      ? 'bg-clinic-accent/5 border-clinic-accent/30 shadow-inner' 
                      : 'bg-clinic-bg border-clinic-border hover:bg-clinic-surface'
                  }`}
                >
                  <div className="h-12 w-12 rounded-clinic-6 overflow-hidden border border-clinic-border bg-clinic-bg shrink-0">
                    <img src={item.afterUrl} alt="thumbnail" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-clinic-text-primary truncate">{item.title}</span>
                    <span className="text-xs text-clinic-text-secondary truncate mt-0.5">{item.patientName}</span>
                    <span className="text-[10px] text-clinic-text-secondary mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Slider Workspace (Right 2 Columns) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {activeItem ? (
              <div className="flex flex-col gap-6">
                
                {/* Active Comparison Canvas */}
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-clinic-border pb-3">
                    <div className="flex flex-col">
                      <h2 className="text-base font-bold text-clinic-text-primary">{activeItem.title}</h2>
                      <span className="text-xs text-clinic-text-secondary">Patient Profile: {activeItem.patientName}</span>
                    </div>
                    <Badge variant="success">Completed Treatment</Badge>
                  </div>

                  {/* Image Diff Slider container */}
                  <div className="relative w-full max-w-xl mx-auto h-[400px] border border-clinic-border rounded-clinic-14 overflow-hidden select-none shadow-lg bg-zinc-950">
                    {/* Before Image (Bottom Layer) */}
                    <img 
                      src={activeItem.beforeUrl} 
                      alt="Before treatment"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute left-4 top-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-md">
                      Before
                    </div>

                    {/* After Image (Top Layer, clipped by width %) */}
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                      style={{ clipPath: `inset(0 0 0 ${sliderVal}%)` }}
                    >
                      <img 
                        src={activeItem.afterUrl} 
                        alt="After treatment"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ width: '100%', height: '100%' }} // prevent clip warping
                      />
                    </div>
                    <div className="absolute right-4 top-4 z-10 bg-clinic-accent px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-md">
                      After
                    </div>

                    {/* Interactive Slider Bar */}
                    <div 
                      className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                      style={{ left: `${sliderVal}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white border border-clinic-border shadow-md flex items-center justify-center pointer-events-auto">
                        <Sliders className="h-4 w-4 text-clinic-text-primary rotate-90" />
                      </div>
                    </div>

                    {/* HTML Hidden Range input overlay for smooth dragging */}
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={sliderVal}
                      onChange={(e) => setSliderVal(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    />
                  </div>

                  {/* Drag directions helper */}
                  <p className="text-center text-xs text-clinic-text-secondary flex items-center justify-center gap-1.5 mt-2">
                    <Info className="h-4 w-4 text-clinic-accent" />
                    <span>Drag/Slide cursor across image to compare pigment changes.</span>
                  </p>
                </div>

                {/* Case details notes */}
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Clinical Case Notes</h4>
                  <p className="text-sm text-clinic-text-primary leading-relaxed">
                    {activeItem.notes}
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-12 text-center text-clinic-text-secondary italic">
                Select a treatment folder from the left index.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
