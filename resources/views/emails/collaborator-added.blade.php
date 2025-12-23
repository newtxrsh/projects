<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Task Assignment</title>
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
            color: #10b981;
            font-size: 24px;
            margin: 0;
        }
        .icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #10b981, #059669);
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
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-left: 4px solid #10b981;
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
        .added-by {
            color: #64748b;
            font-size: 14px;
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
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="8.5" cy="7" r="4" stroke="white" stroke-width="2"/>
                    <path d="M20 8V14M17 11H23" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
            <h1>New Task Assignment</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $collaborator->fname ?? $collaborator->email }},</p>
            
            <p>You have been added as a collaborator to a new task by <strong>{{ $addedBy->fname ?? $addedBy->email }}</strong>.</p>
            
            <div class="task-card">
                <div class="task-title">{{ $task->title }}</div>
                <p class="added-by">👤 Added by: {{ $addedBy->fname ?? $addedBy->email }}</p>
                @if($task->due_date)
                <p style="color: #3b82f6; font-weight: 500; margin-top: 8px;">📅 Due: {{ \Carbon\Carbon::parse($task->due_date)->format('F j, Y') }}</p>
                @endif
            </div>
            
            <p>Please check your board to view the full details of the task.</p>
            
            <p>Thank you!</p>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from Task Manager.</p>
        </div>
    </div>
</body>
</html>
