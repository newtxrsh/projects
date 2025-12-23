@extends('layouts.app')

@push('styles')
    @vite(['resources/css/calendar.css'])
@endpush

@section('content')
<div class="calendar-page">
    <div class="calendar-card">
        <div class="calendar-headline">
            <div class="calendar-title-block">
                <h1>Calendar</h1>
                <p>Track upcoming due dates across all active tasks.</p>
            </div>
            <div class="month-nav">
                <button class="month-button" id="prevMonth">‹</button>
                <div class="month-label" id="calendarTitle">November 2025</div>
                <button class="month-button" id="nextMonth">›</button>
            </div>
        </div>

        <div class="calendar-weekdays" id="calendarWeekdays"></div>
        <div class="calendar-days" id="calendarDays"></div>
    </div>

    <div class="week-card">
        <div class="week-card-header">
            <div>
                <h3>Due Tasks</h3>
                <p class="week-range" id="weekRangeLabel">Click on a date to view tasks</p>
            </div>
        </div>
        <div class="week-task-list" id="weekTasks">
            <div class="no-data">Click on a date to view tasks for that day.</div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    @vite(['resources/js/calendar.js'])
@endpush