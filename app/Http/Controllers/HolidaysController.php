<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class HolidaysController extends Controller
{
    /**
     * Get Philippine holidays from Google Calendar API
     */
    public function index(Request $request)
    {
        $year = $request->query('year', date('Y'));
        
        // Cache holidays for 24 hours to reduce API calls
        $cacheKey = "philippine_holidays_{$year}";
        
        $holidays = Cache::remember($cacheKey, 86400, function () use ($year) {
            return $this->fetchHolidaysFromGoogle($year);
        });

        return response()->json([
            'success' => true,
            'holidays' => $holidays,
            'year' => (int) $year,
        ]);
    }

    /**
     * Fetch holidays from Google Calendar API
     */
    private function fetchHolidaysFromGoogle($year)
    {
        $apiKey = env('GOOGLE_API_KEY');
        $calendarId = 'en.philippines%23holiday%40group.v.calendar.google.com';
        
        $timeMin = "{$year}-01-01T00:00:00Z";
        $timeMax = "{$year}-12-31T23:59:59Z";

        try {
            $response = Http::get("https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events", [
                'key' => $apiKey,
                'timeMin' => $timeMin,
                'timeMax' => $timeMax,
                'singleEvents' => 'true',
                'orderBy' => 'startTime',
                'maxResults' => 100,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $items = $data['items'] ?? [];
                
                // Transform the data to a simpler format
                return array_map(function ($item) {
                    return [
                        'id' => $item['id'] ?? '',
                        'summary' => $item['summary'] ?? '',
                        'description' => $item['description'] ?? null,
                        'start' => [
                            'date' => $item['start']['date'] ?? null,
                        ],
                        'end' => [
                            'date' => $item['end']['date'] ?? null,
                        ],
                    ];
                }, $items);
            }

            return [];
        } catch (\Exception $e) {
            \Log::error('Failed to fetch Philippine holidays: ' . $e->getMessage());
            return [];
        }
    }
}
