<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Due Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
        }
        .header h1 {
            color: #3b82f6;
            font-size: 24px;
            margin: 0;
        }
        .icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
        }
        .icon svg {
            width: 32px;
            height: 32px;
            fill: white;
        }
        .content {
            margin-bottom: 24px;
        }
        .task-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-left: 4px solid #3b82f6;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
        }
        .task-title {
            font-weight: 600;
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .due-date {
            color: #ef4444;
            font-weight: 500;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #64748b;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/>
                </svg>
            </div>
            <h1>Task Due Reminder</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $user->fname ?? $user->email }},</p>
            
            <p>Just a quick reminder that your task is due tomorrow. Please ensure to complete it on time.</p>
            
            <div class="task-card">
                <div class="task-title">{{ $task->title }}</div>
                <p class="due-date">📅 Due: {{ \Carbon\Carbon::parse($dueDate)->format('F j, Y') }}</p>
            </div>
            
            <p>Please check your board to view the full details and complete the task on time.</p>
            
            <p>Thank you!</p>
        </div>
        
        <div class="footer">
            <p>This is an automated reminder from Task Manager.</p>
        </div>
    </div>
</body>
</html>
