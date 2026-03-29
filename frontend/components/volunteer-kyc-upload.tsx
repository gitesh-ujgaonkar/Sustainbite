'use client';

import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload, FileCheck, AlertCircle, Loader2, X, Eye, ShieldCheck,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png,.pdf';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface VolunteerKYCUploadProps {
    volunteerId: string;
    volunteerName?: string;
    currentDocumentUrl?: string | null;
    approvalStatus?: string;
    onUploadComplete?: (storagePath: string) => void;
}

export function VolunteerKYCUpload({
    volunteerId,
    volunteerName,
    currentDocumentUrl,
    approvalStatus = 'PENDING',
    onUploadComplete,
}: VolunteerKYCUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── File Selection & Validation ────────────────────────────
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setUploadSuccess(false);

        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError(
                `Invalid file type "${file.type}". Please upload a JPG, PNG, or PDF file.`
            );
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            setError(
                `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
            );
            return;
        }

        setSelectedFile(file);

        // Generate preview for images (not PDFs)
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => setPreviewUrl(event.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    }, []);

    // ── Clear Selection ────────────────────────────────────────
    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Upload Flow ────────────────────────────────────────────
    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            // Step 1: Build unique storage path
            const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
            const timestamp = Date.now();
            const storagePath = `${volunteerId}/${volunteerId}_${timestamp}.${fileExt}`;

            // Step 2: Upload to Supabase Storage (private bucket)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('volunteer_ids')
                .upload(storagePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: selectedFile.type,
                });

            if (uploadError) {
                // Handle specific Supabase errors
                if (uploadError.message?.includes('already exists')) {
                    throw new Error('A file with this name already exists. Please try again.');
                }
                if (uploadError.message?.includes('Payload too large')) {
                    throw new Error(`File exceeds the ${MAX_FILE_SIZE_MB}MB upload limit.`);
                }
                throw new Error(`Storage upload failed: ${uploadError.message}`);
            }

            if (!uploadData?.path) {
                throw new Error('Upload succeeded but no file path was returned.');
            }

            // Step 3: Notify backend to update the volunteer's record
            const backendResponse = await fetch(
                `${API_BASE}/api/v1/volunteers/confirm-upload`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        volunteer_id: volunteerId,
                        storage_path: uploadData.path,
                    }),
                }
            );

            if (!backendResponse.ok) {
                const errorData = await backendResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.detail || `Backend returned status ${backendResponse.status}`
                );
            }

            // Success
            setUploadSuccess(true);
            setSelectedFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            onUploadComplete?.(uploadData.path);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    // ── Already Approved ───────────────────────────────────────
    if (approvalStatus === 'APPROVED') {
        return (
            <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                        <ShieldCheck className="h-6 w-6" />
                        <div>
                            <p className="font-semibold">Identity Verified</p>
                            <p className="text-sm opacity-80">Your KYC verification is complete. You can accept deliveries.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5 text-primary" />
                    Identity Verification (KYC)
                </CardTitle>
                <CardDescription>
                    Upload a government-issued ID (Aadhaar, PAN, Driving License) to verify
                    your identity. Accepted formats: JPG, PNG, PDF (max {MAX_FILE_SIZE_MB}MB).
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Success Message */}
                {uploadSuccess && (
                    <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
                        <FileCheck className="h-4 w-4 text-green-600" />
                        <AlertDescription className="ml-2 text-green-800 dark:text-green-200">
                            <span className="font-semibold">Document uploaded successfully!</span>{' '}
                            Your account is now under review. An administrator will verify your
                            identity within 24–48 hours.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="ml-2">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Already has a document on file */}
                {currentDocumentUrl && !uploadSuccess && (
                    <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
                        <Eye className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
                            A document is already on file and under review. You may upload a
                            replacement if needed.
                        </AlertDescription>
                    </Alert>
                )}

                {/* File Input */}
                <div className="space-y-3">
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${selectedFile
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/50'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ALLOWED_EXTENSIONS}
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />

                        {selectedFile ? (
                            <div className="space-y-2">
                                {/* Image Preview */}
                                {previewUrl && (
                                    <div className="mx-auto w-48 h-32 rounded-md overflow-hidden border bg-muted mb-3">
                                        <img
                                            src={previewUrl}
                                            alt="ID Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <FileCheck className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{selectedFile.name}</span>
                                    <span className="text-muted-foreground">
                                        ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                    </span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                                    className="text-muted-foreground"
                                    disabled={uploading}
                                >
                                    <X className="h-3 w-3 mr-1" /> Clear
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground/60" />
                                <p className="text-sm font-medium">Click to select your ID document</p>
                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG, or PDF • Max {MAX_FILE_SIZE_MB}MB
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="w-full"
                        size="lg"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading & Verifying...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload ID Document
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
