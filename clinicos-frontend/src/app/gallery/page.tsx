'use client';

<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useGallery, usePatients, useUploadClinicalPhoto } from '@/shared/hooks/useClinicApi';
import { Image as ImageIcon, Sliders, Calendar, Info, UploadCloud, Images } from 'lucide-react';
import Badge from '@/shared/components/ui/Badge';
import Spinner from '@/shared/components/ui/Spinner';
import Button from '@/shared/components/ui/Button';

function getClinicalPhotoUrl(photoUrl?: string) {
  if (!photoUrl) return '';
  if (/^(https?:|data:|blob:)/i.test(photoUrl)) return photoUrl;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${apiUrl.replace(/\/$/, '')}/${photoUrl.replace(/^\/+/, '')}`;
}

export default function GalleryPage() {
  const { data: patients = [] } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const { data: gallery = [], isLoading } = useGallery(selectedPatientId || undefined);
  const uploadClinicalPhotoMutation = useUploadClinicalPhoto();
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState<number>(50); // percentage of 'before' visible
  const [bodyArea, setBodyArea] = useState('Face');
  const [notes, setNotes] = useState('');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  const activeItem = gallery.find(g => g.id === activeGalleryId) ?? gallery[0];

  useEffect(() => {
    if (gallery.length > 0 && !gallery.some((item) => item.id === activeGalleryId)) {
      setActiveGalleryId(gallery[0].id);
    }
  }, [gallery, activeGalleryId]);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!selectedPatientId || !beforeFile || !afterFile) {
      setUploadError('Choose a patient and both before and after images.');
      return;
    }
    if (beforeFile.size > 10 * 1024 * 1024 || afterFile.size > 10 * 1024 * 1024) {
      setUploadError('Each image must be 10 MB or smaller.');
      return;
    }

    setUploadError('');
    try {
      await uploadClinicalPhotoMutation.mutateAsync({
        patientId: selectedPatientId, file: beforeFile, bodyArea, photoType: 'BEFORE', notes,
      });
      const afterPhoto = await uploadClinicalPhotoMutation.mutateAsync({
        patientId: selectedPatientId, file: afterFile, bodyArea, photoType: 'AFTER', notes,
      });
      setActiveGalleryId(afterPhoto.id);
      setBeforeFile(null);
      setAfterFile(null);
      setNotes('');
      form.reset();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      setUploadError(Array.isArray(message) ? message.join(', ') : message || 'Could not upload the treatment images.');
    }
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Title */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-clinic-accent mb-2">Clinical photography</p>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-clinic-text-primary">Treatment gallery</h1>
        <p className="text-sm text-clinic-text-secondary mt-1.5">
          Review progress over time with secure before and after comparisons.
        </p>
      </div>

      <div className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-6 shadow-sm shadow-[#123b37]/[0.025] flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-xs font-semibold max-w-xl">
          Patient
          <select
            value={selectedPatientId}
            onChange={(event) => { setSelectedPatientId(event.target.value); setActiveGalleryId(null); }}
            className="rounded-xl border border-clinic-border bg-clinic-bg/70 px-3.5 py-3 text-sm font-normal outline-none focus:border-clinic-accent focus:ring-2 focus:ring-clinic-accent/10"
          >
            <option value="">Select a patient to view or add photos</option>
            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
          </select>
        </label>

        {selectedPatientId && (
          <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold">
              Before image
            <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setBeforeFile(event.target.files?.[0] ?? null)} className="w-full rounded-xl border border-clinic-border bg-clinic-bg/70 p-2.5 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-clinic-accent file:px-3 file:py-2 file:font-semibold file:text-white" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold">
              After image
            <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setAfterFile(event.target.files?.[0] ?? null)} className="w-full rounded-xl border border-clinic-border bg-clinic-bg/70 p-2.5 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-clinic-accent file:px-3 file:py-2 file:font-semibold file:text-white" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold">
              Body area
              <input value={bodyArea} onChange={(event) => setBodyArea(event.target.value)} maxLength={100} required className="rounded-xl border border-clinic-border bg-clinic-bg/70 px-3.5 py-3 text-sm font-normal outline-none focus:border-clinic-accent focus:ring-2 focus:ring-clinic-accent/10" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold">
              Notes <span className="font-normal text-clinic-text-secondary">(optional)</span>
              <input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} className="rounded-xl border border-clinic-border bg-clinic-bg/70 px-3.5 py-3 text-sm font-normal outline-none focus:border-clinic-accent focus:ring-2 focus:ring-clinic-accent/10" />
            </label>
            <div className="md:col-span-2 flex flex-col items-end gap-2">
              {uploadError && <p role="alert" className="w-full text-xs text-clinic-danger">{uploadError}</p>}
              <Button type="submit" isLoading={uploadClinicalPhotoMutation.isPending} disabled={uploadClinicalPhotoMutation.isPending}>
                <UploadCloud className="mr-2 h-4 w-4" /> Save before and after images
              </Button>
            </div>
          </form>
        )}
      </div>

      {!selectedPatientId ? (
        <div className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-12 text-center text-sm text-clinic-text-secondary shadow-sm">
          <Images className="h-8 w-8 mx-auto mb-3 text-clinic-accent/60" />
          Select a patient above to view their treatment comparisons.
        </div>
      ) : isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : gallery.length === 0 ? (
        <div className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-16 text-center text-clinic-text-secondary flex flex-col items-center gap-2 justify-center shadow-sm">
          <ImageIcon className="h-10 w-10 text-clinic-accent/40" />
          <p className="text-sm font-semibold">No gallery images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start max-w-[1800px] w-full">
          
          {/* Gallery Directory Index (Left 1 Column) */}
          <div className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 shadow-sm shadow-[#123b37]/[0.025] flex flex-col gap-4 lg:col-span-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-clinic-text-secondary border-b border-clinic-border pb-3">Treatment history</h3>
=======
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
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            
            <div className="flex flex-col gap-2.5">
              {gallery.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveGalleryId(item.id)}
                  className={`p-3.5 border rounded-clinic-10 cursor-pointer flex gap-3.5 items-center transition-all ${
                    activeGalleryId === item.id 
<<<<<<< HEAD
                      ? 'bg-clinic-accent/[0.06] border-clinic-accent/30 shadow-sm' 
=======
                      ? 'bg-clinic-accent/5 border-clinic-accent/30 shadow-inner' 
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                      : 'bg-clinic-bg border-clinic-border hover:bg-clinic-surface'
                  }`}
                >
                  <div className="h-12 w-12 rounded-clinic-6 overflow-hidden border border-clinic-border bg-clinic-bg shrink-0">
<<<<<<< HEAD
                  <img src={getClinicalPhotoUrl(item.afterUrl)} alt="thumbnail" className="h-full w-full object-cover" />
=======
                    <img src={item.afterUrl} alt="thumbnail" className="h-full w-full object-cover" />
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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
<<<<<<< HEAD
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 min-w-0">
=======
          <div className="xl:col-span-2 flex flex-col gap-6">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            {activeItem ? (
              <div className="flex flex-col gap-6">
                
                {/* Active Comparison Canvas */}
<<<<<<< HEAD
                <div className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-6 shadow-sm shadow-[#123b37]/[0.025] flex flex-col gap-6">
=======
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                  <div className="flex justify-between items-center border-b border-clinic-border pb-3">
                    <div className="flex flex-col">
                      <h2 className="text-base font-bold text-clinic-text-primary">{activeItem.title}</h2>
                      <span className="text-xs text-clinic-text-secondary">Patient Profile: {activeItem.patientName}</span>
                    </div>
                    <Badge variant="success">Completed Treatment</Badge>
                  </div>

                  {/* Image Diff Slider container */}
<<<<<<< HEAD
                  <div className="relative w-full max-w-xl mx-auto aspect-[4/3] sm:aspect-[3/2] max-h-[400px] border border-clinic-border rounded-xl sm:rounded-2xl overflow-hidden select-none shadow-lg bg-zinc-950">
                    {/* Before Image (Bottom Layer) */}
                    <img 
                      src={getClinicalPhotoUrl(activeItem.beforeUrl)} 
=======
                  <div className="relative w-full max-w-xl mx-auto h-[400px] border border-clinic-border rounded-clinic-14 overflow-hidden select-none shadow-lg bg-zinc-950">
                    {/* Before Image (Bottom Layer) */}
                    <img 
                      src={activeItem.beforeUrl} 
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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
<<<<<<< HEAD
                        src={getClinicalPhotoUrl(activeItem.afterUrl)} 
=======
                        src={activeItem.afterUrl} 
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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
