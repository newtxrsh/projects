<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the task due reminder command to run daily at 8:00 AM
Schedule::command('tasks:send-due-reminders')->dailyAt('08:00');

// Schedule the overdue task notification command to run daily at 9:00 AM
Schedule::command('tasks:send-overdue-notifications')->dailyAt('09:00');
