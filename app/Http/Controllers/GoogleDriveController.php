<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GoogleDriveController extends Controller
{
    /**
     * Get the Google API configuration for the frontend
     */
    public function getConfig()
    {
        return response()->json([
            'clientId' => env('GOOGLE_CLIENT_ID'),
            'developerKey' => env('GOOGLE_API_KEY'),
            'appId' => env('GOOGLE_APP_ID'),
        ]);
    }

    /**
     * Redirect to Google OAuth with Drive scopes
     */
    public function redirectToDriveAuth()
    {
        $clientId = env('GOOGLE_CLIENT_ID');
        $redirectUri = env('GOOGLE_DRIVE_REDIRECT_URL', env('APP_URL') . '/api/google-drive/callback');
        
        $scopes = [
            'https://www.googleapis.com/auth/drive.readonly',
        ];
        
        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'scope' => implode(' ', $scopes),
            'response_type' => 'code',
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => csrf_token(),
        ];
        
        $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
        
        return redirect($url);
    }

    /**
     * Handle the Google OAuth callback
     */
    public function handleCallback(Request $request)
    {
        $code = $request->get('code');
        
        if (!$code) {
            return redirect(env('FRONTEND_URL') . '/create?error=drive_auth_failed');
        }

        try {
            $response = Http::post('https://oauth2.googleapis.com/token', [
                'client_id' => env('GOOGLE_CLIENT_ID'),
                'client_secret' => env('GOOGLE_CLIENT_SECRET'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => env('GOOGLE_REDIRECT_URL', env('APP_URL') . '/api/google-drive/callback'),
            ]);

            if (!$response->successful()) {
                return redirect(env('FRONTEND_URL') . '/create?error=token_exchange_failed');
            }

            $tokens = $response->json();
            
            // Store the access token in session
            session(['google_drive_token' => $tokens['access_token']]);
            
            if (isset($tokens['refresh_token'])) {
                session(['google_drive_refresh_token' => $tokens['refresh_token']]);
            }

            return redirect(env('FRONTEND_URL') . '/create?drive_connected=true');
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/create?error=drive_auth_failed');
        }
    }

    /**
     * Get a short-lived OAuth token for the Google Picker
     */
    public function getPickerToken(Request $request)
    {
        $user = $request->user();
        
        // Google Picker OAuth token
        // The OAuth flow and returns a token
        $token = session('google_drive_token');
        
        if ($token) {
            return response()->json([
                'token' => $token,
            ]);
        }

        // Return auth URL if no token
        return response()->json([
            'needsAuth' => true,
            'authUrl' => route('google-drive.auth'),
        ]);
    }

    /**
     * Download a file from Google Drive and store it locally
     */
    public function downloadFile(Request $request)
    {
        $request->validate([
            'fileId' => 'required|string',
            'fileName' => 'required|string',
            'mimeType' => 'required|string',
            'accessToken' => 'required|string',
        ]);

        // Get the access token from the request (passed from frontend's Google Picker)
        $token = $request->input('accessToken');

        try {
            $fileId = $request->input('fileId');
            $fileName = $request->input('fileName');
            $mimeType = $request->input('mimeType');

            // Get file metadata first
            $metadataResponse = Http::withToken($token)
                ->get("https://www.googleapis.com/drive/v3/files/{$fileId}", [
                    'fields' => 'id,name,mimeType,size',
                ]);

            if (!$metadataResponse->successful()) {
                return response()->json([
                    'error' => 'Failed to get file metadata',
                ], 400);
            }

            // Determine if we need to export (Google Docs) or download directly
            $isGoogleDoc = str_starts_with($mimeType, 'application/vnd.google-apps');
            
            if ($isGoogleDoc) {
                // Export Google Docs/Sheets/Slides to a standard format
                $exportMimeType = $this->getExportMimeType($mimeType);
                $exportExtension = $this->getExportExtension($mimeType);
                
                $downloadResponse = Http::withToken($token)
                    ->get("https://www.googleapis.com/drive/v3/files/{$fileId}/export", [
                        'mimeType' => $exportMimeType,
                    ]);
                
                $fileName = pathinfo($fileName, PATHINFO_FILENAME) . '.' . $exportExtension;
            } else {
                // Download regular file
                $downloadResponse = Http::withToken($token)
                    ->get("https://www.googleapis.com/drive/v3/files/{$fileId}", [
                        'alt' => 'media',
                    ]);
            }

            if (!$downloadResponse->successful()) {
                return response()->json([
                    'error' => 'Failed to download file from Google Drive',
                ], 400);
            }

            // Generate unique filename
            $uniqueFileName = Str::uuid() . '_' . $fileName;
            $path = 'attachments/' . $uniqueFileName;

            // Store the file
            Storage::disk('public')->put($path, $downloadResponse->body());

            return response()->json([
                'success' => true,
                'path' => $path,
                'fileName' => $fileName,
                'url' => Storage::disk('public')->url($path),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process file: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get export MIME type for Google Docs files
     */
    private function getExportMimeType(string $googleMimeType): string
    {
        $exportMap = [
            'application/vnd.google-apps.document' => 'application/pdf',
            'application/vnd.google-apps.spreadsheet' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.google-apps.presentation' => 'application/pdf',
            'application/vnd.google-apps.drawing' => 'image/png',
        ];

        return $exportMap[$googleMimeType] ?? 'application/pdf';
    }

    /**
     * Get file extension for exported Google Docs files
     */
    private function getExportExtension(string $googleMimeType): string
    {
        $extensionMap = [
            'application/vnd.google-apps.document' => 'pdf',
            'application/vnd.google-apps.spreadsheet' => 'xlsx',
            'application/vnd.google-apps.presentation' => 'pdf',
            'application/vnd.google-apps.drawing' => 'png',
        ];

        return $extensionMap[$googleMimeType] ?? 'pdf';
    }
}
