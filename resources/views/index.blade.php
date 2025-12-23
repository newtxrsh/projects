<h1>Tasks List</h1>

@foreach($tasks as $task)
    <div style="border:1px solid #000; padding:10px; margin-bottom:15px;">
        <h2>{{ $task->title }} (Status: {{ $task->status }})</h2>
        <p><strong>Assigned to:</strong> {{ $task->user->fname ?? 'N/A' }}</p>
        <p><strong>Due Date:</strong> {{ $task->due_date }}</p>
        <p><strong>Description:</strong> {{ $task->description }}</p>

        <h3>Subtasks:</h3>
        <ul>
            @foreach($task->subtasks as $subtask)
                <li>{{ $subtask->title }} (Status: {{ $subtask->status }})</li>
            @endforeach
        </ul>

        <h3>Attachments:</h3>
        <ul>
            @foreach($task->attachments as $attachment)
                <li>{{ $attachment->file_path }}</li>
            @endforeach
        </ul>

        <h3>Collaborators:</h3>
        <ul>
            @foreach($task->taskCollaborators as $collab)
                <li>{{ $collab->user->fname ?? 'N/A' }}</li>
            @endforeach
        </ul>
    </div>
@endforeach
