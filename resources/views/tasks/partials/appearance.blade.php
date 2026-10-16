<dialog id="app-appearance" class="app-appearance-popover" aria-labelledby="app-appearance-title">
    <div class="app-popover-heading"><div><h2 id="app-appearance-title">Appearance</h2><p>Make your workspace feel like you.</p></div><button type="button" class="app-shell-button" data-app-close-appearance aria-label="Close appearance">&times;</button></div>
    <fieldset class="app-theme-options"><legend>Theme</legend>
        @foreach(['light'=>'Light','dark'=>'Dark','system'=>'System','kawaii'=>'Kawaii','racing'=>'Racing'] as $appMode=>$appModeTitle)
        <label class="app-theme-option" data-app-mode="{{ $appMode }}"><input class="app-visually-hidden" type="radio" name="app-theme-mode" value="{{ $appMode }}"><span class="app-theme-preview" data-app-preview="{{ $appMode }}" aria-hidden="true"><span></span><i></i></span><span>{{ $appModeTitle }}</span><span class="app-option-check" aria-hidden="true">&#10003;</span></label>
        @endforeach
    </fieldset>
    <fieldset class="app-accent-options"><legend>Accent</legend><div id="app-accent-swatches" class="app-accent-swatches"></div></fieldset>
    <p class="app-appearance-note" id="app-appearance-note" aria-live="polite"></p>
</dialog>
