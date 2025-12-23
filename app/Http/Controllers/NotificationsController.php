<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationsController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $notifications = Notification::with(['task', 'triggeredByUser'])
            ->forUser($request->user()->user_id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Get count of unread notifications.
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::forUser($request->user()->user_id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $notificationId)
    {
        $notification = Notification::where('notification_id', $notificationId)
            ->where('user_id', $request->user()->user_id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(Request $request)
    {
        Notification::forUser($request->user()->user_id)
            ->unread()
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Clear all notifications for the authenticated user.
     */
    public function clearAll(Request $request)
    {
        Notification::forUser($request->user()->user_id)->delete();

        return response()->json(['message' => 'All notifications cleared']);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, $notificationId)
    {
        $notification = Notification::where('notification_id', $notificationId)
            ->where('user_id', $request->user()->user_id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}
