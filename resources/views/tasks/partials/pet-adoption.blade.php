<dialog id="app-pet-adoption" class="modal app-pet-adoption" aria-labelledby="app-pet-adoption-heading" data-app-pet-levels="{{ json_encode(config('pets.levels')) }}">
    <div class="app-popover-heading"><div><h2 id="app-pet-adoption-heading">Meet your new companion</h2><p>Six little personalities. One new friend.</p></div><button type="button" class="app-shell-button" data-app-pet-later aria-label="Close adoption">×</button></div>
    <form id="app-pet-adopt-form" novalidate>
        <fieldset class="app-pet-species-options"><legend>Choose a species</legend>
        @foreach(config('pets.species') as $appSpecies)
            <label class="app-pet-species-option" data-species="{{ $appSpecies }}"><input type="radio" name="species" value="{{ $appSpecies }}" @checked($loop->first)><span data-app-pet-preview="{{ $appSpecies }}" aria-hidden="true"></span><strong>{{ ucfirst($appSpecies) }}</strong><span class="app-pet-choice-check" aria-hidden="true">✓</span></label>
        @endforeach
        </fieldset>
        <div class="field"><label for="app-pet-adopt-name">Pet name</label><input id="app-pet-adopt-name" class="input" name="name" maxlength="20" required autocomplete="off" aria-describedby="app-pet-name-help"><p class="app-settings-help" id="app-pet-name-help">Up to 20 characters. You can rename your companion later.</p></div>
        <p data-app-pet-form-error class="app-field-error" role="alert" hidden></p><div class="app-settings-actions"><button type="button" class="button button-secondary" data-app-pet-later>Later</button><button type="submit" class="button button-primary">Adopt</button></div>
    </form>
</dialog>
<p id="app-pet-announcement" class="app-sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
