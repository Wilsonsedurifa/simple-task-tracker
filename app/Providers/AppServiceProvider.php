<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Browser/feature tests must use built assets even when a developer has Vite running.
        if ($this->app->environment('testing')) {
            Vite::useHotFile(storage_path('framework/testing/vite.hot'));
        }
        VerifyEmail::toMailUsing(function (object $notifiable, string $url): MailMessage {
            return (new MailMessage)->view(
                ['emails.verify', 'emails.verify-text'],
                ['url' => $url, 'user' => $notifiable],
            );
        });
    }
}
