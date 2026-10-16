<section class="app-dashboard-card app-pet-widget {{ ($appPetCompact ?? false) ? 'app-pet-compact' : 'app-pet-large' }}" data-app-pet-widget aria-labelledby="app-pet-heading">
    <div class="app-dashboard-heading"><h2 id="app-pet-heading">Your little companion</h2>@if($appPetCompact ?? false)<a class="app-dashboard-link" href="{{ route('pet') }}">Pet page →</a>@endif</div>
    <div data-app-pet-loading class="app-pet-placeholder" role="status">Getting your companion ready…</div>
    <div data-app-pet-error class="app-pet-placeholder" hidden><p>Your pet is taking a little break. Your tasks still work.</p><button type="button" class="button button-secondary" data-app-pet-retry>Try again</button></div>
    <div data-app-pet-empty class="app-pet-placeholder" hidden><strong>A little company for your next step.</strong><p>Adopt a companion that grows with you. No pressure, just company.</p><button type="button" class="button button-primary" data-app-pet-adopt>Adopt a pet</button></div>
    <div data-app-pet-content hidden>
        <div class="app-pet-room" data-app-pet-room><span class="app-pet-room-star" aria-hidden="true">✧</span><button type="button" class="app-pet-creature" data-app-pet-touch aria-label="Pet your companion"></button><div class="app-pet-effects" data-app-pet-effects aria-hidden="true"></div></div>
        <div class="app-pet-identity"><strong data-app-pet-name></strong><span data-app-pet-level></span><span data-app-pet-streak></span></div>
        <div class="app-pet-xp" data-app-pet-progress role="progressbar" aria-label="Pet level progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><p class="app-pet-xp-label" data-app-pet-xp></p>
        <p class="app-pet-mood" data-app-pet-mood></p><p class="app-pet-speech" data-app-pet-speech></p>
        <p class="app-pet-celebration" data-app-pet-celebration role="status" aria-live="polite" hidden></p>
    </div>
</section>
