<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Task;
use App\Models\User;

class CollaboratorAddedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Task $task;
    public User $collaborator;
    public User $addedBy;

    /**
     * Create a new message instance.
     */
    public function __construct(Task $task, User $collaborator, User $addedBy)
    {
        $this->task = $task;
        $this->collaborator = $collaborator;
        $this->addedBy = $addedBy;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Assignment: You have been added as a collaborator on the task {$this->task->title}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.collaborator-added',
            with: [
                'task' => $this->task,
                'collaborator' => $this->collaborator,
                'addedBy' => $this->addedBy,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
