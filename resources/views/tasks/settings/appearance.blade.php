        <section class="app-settings-panel" id="app-settings-appearance" role="tabpanel" aria-labelledby="app-settings-tab-appearance">
            <h2>Appearance</h2><p class="app-settings-help">Preview changes here and across your workspace. Your theme remembers its own accent.</p>
            <fieldset class="app-theme-options"><legend>Theme</legend>
                @foreach(['light'=>'Light','dark'=>'Dark','system'=>'System','kawaii'=>'Kawaii','racing'=>'Racing'] as $appMode=>$appModeTitle)
                <label class="app-settings-theme-option"><input class="app-visually-hidden" type="radio" name="app-settings-theme" data-app-theme-mode value="{{ $appMode }}"><span class="app-theme-preview" data-app-preview="{{ $appMode }}" aria-hidden="true"><span></span><i></i></span><span>{{ $appModeTitle }}</span><span class="app-option-check" aria-hidden="true">&#10003;</span></label>
                @endforeach
            </fieldset>
            <fieldset class="app-accent-options"><legend>Accent</legend><p class="app-settings-help">Used for buttons, selected controls, and focus rings.</p><div id="app-settings-accents" class="app-accent-swatches" data-app-accent-group data-app-accent-class="app-settings-accent-option"></div></fieldset>
            <div class="app-settings-preview" aria-label="Live appearance preview"><div><strong>Your workspace</strong><p class="app-settings-help">A live preview of your current colors and spacing.</p></div><span class="app-settings-preview-chip">In progress</span><button type="button" class="button button-primary" id="app-settings-preview-button">Try this button</button></div>
            <div class="app-settings-fields">
                <div class="field"><label for="app-density">Density</label><select id="app-density" data-app-setting="density" aria-describedby="app-density-help"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select><p id="app-density-help" class="app-settings-help">Adjust card spacing without shrinking touch targets.</p></div>
                <div class="field"><label for="app-motion">Motion</label><select id="app-motion" data-app-setting="motion" aria-describedby="app-motion-help"><option value="system">Follow device setting</option><option value="reduce">Reduce motion</option></select><p id="app-motion-help" class="app-settings-help">Reduce animations here, or follow your device accessibility preference.</p></div>
            </div>
        </section>
