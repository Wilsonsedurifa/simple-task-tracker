        <section class="app-settings-panel" id="app-settings-account" role="tabpanel" aria-labelledby="app-settings-tab-account" hidden>
            <h2>Account</h2><p class="app-settings-help">Your profile is saved securely to your account, not just this browser.</p>
            <form id="app-profile-form" class="app-settings-form" action="{{ route('settings.profile') }}" method="POST" novalidate>
                @csrf @method('PATCH')
                <div class="field"><label for="app-profile-name">Display name</label><input id="app-profile-name" name="name" value="{{ auth()->user()->name }}" required maxlength="255" autocomplete="name" aria-describedby="app-profile-name-help"><p id="app-profile-name-help" class="app-settings-help">Required. Up to 255 characters. Capitalization in the sidebar is display-only.</p></div>
                <div class="field"><label for="app-profile-email">Email</label><input id="app-profile-email" type="email" value="{{ auth()->user()->email }}" readonly autocomplete="email" aria-describedby="app-profile-email-help"><p id="app-profile-email-help" class="app-settings-help">Email is read-only.</p></div>
                <p class="app-field-error" data-app-form-error role="alert" hidden></p><button type="submit" class="button button-primary">Save profile</button>
            </form>
            <form id="app-password-form" class="app-settings-form app-settings-divider" action="{{ route('settings.password') }}" method="POST" novalidate>
                @csrf @method('PUT')
                <h3>Change password</h3>
                <div class="field"><label for="app-current-password">Current password</label><input id="app-current-password" type="password" name="current_password" required autocomplete="current-password" aria-describedby="app-current-password-help"><p id="app-current-password-help" class="app-settings-help">Verify your identity before changing your password.</p></div>
                <div class="field"><label for="app-new-password">New password</label><input id="app-new-password" type="password" name="password" required minlength="8" autocomplete="new-password" aria-describedby="app-new-password-help"><p id="app-new-password-help" class="app-settings-help">At least 8 characters. Use a unique password. {{ config('hashing.driver', 'bcrypt') === 'bcrypt' ? 'This server supports up to 72 bytes (some characters use multiple bytes).' : '' }}</p></div>
                <div class="field"><label for="app-password-confirmation">Confirm new password</label><input id="app-password-confirmation" type="password" name="password_confirmation" required autocomplete="new-password" aria-describedby="app-password-confirmation-help"><p id="app-password-confirmation-help" class="app-settings-help">Enter your new password again.</p></div>
                <p class="app-field-error" data-app-form-error role="alert" hidden></p><button type="submit" class="button button-primary">Change password</button>
            </form>
        </section>
