<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class DeadlineDigest extends Mailable
{
    public function __construct(public string $username, public string $timezone, public array $tasks) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your task deadline reminders');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.deadline-digest');
    }
}
