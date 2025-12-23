<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attachment;
use Illuminate\Support\Facades\Storage;

class AttachmentsController extends Controller
{
    public function apiIndex()
    {
        $attachments = Attachment::all();
            return response()->json($attachments);
    }

    /**
     * Serve an attachment file with authentication (inline for preview)
     */
    public function show(Request $request, $attachmentId)
    {
        $attachment = Attachment::findOrFail($attachmentId);
        
        // Check if file exists
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $filePath = Storage::disk('public')->path($attachment->file_path);
        $mimeType = mime_content_type($filePath);
        
        // Use 'inline' to allow preview in browser
        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . ($attachment->original_filename ?? basename($attachment->file_path)) . '"',
        ]);
    }

    /**
     * Download an attachment file
     */
    public function download(Request $request, $attachmentId)
    {
        $attachment = Attachment::findOrFail($attachmentId);
        
        // Check if file exists
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $filePath = Storage::disk('public')->path($attachment->file_path);
        $mimeType = mime_content_type($filePath);
        
        // Force download
        return response()->download($filePath, $attachment->original_filename ?? basename($attachment->file_path), [
            'Content-Type' => $mimeType,
        ]);
    }
}
