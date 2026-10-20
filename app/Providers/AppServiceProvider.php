<?php

namespace App\Providers;

use App\Models\Task;
use App\Policies\TaskPolicy;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
        Gate::policy(Task::class, TaskPolicy::class);
        $isLive = ! $this->app->runningInConsole() && request()->getHost() && ! in_array(request()->getHost(), ['localhost', '127.0.0.1']);
        if ($this->app->environment('production') || $isLive) {
            URL::forceScheme('https');
            $liveUrl = $isLive ? 'https://'.request()->getHost() : 'https://simple-task-tracker-production.up.railway.app';
            URL::forceRootUrl($liveUrl);
            config(['app.url' => $liveUrl]);
            config(['services.google.redirect' => $liveUrl.'/auth/google/callback']);
        }

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
