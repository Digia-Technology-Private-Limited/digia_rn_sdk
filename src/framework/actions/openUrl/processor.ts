import InAppBrowser from 'react-native-inappbrowser-reborn';
import { ScopeContext } from '../../expr/scope_context';
import { ActionProcessor, Context } from '../base/processor';
import { OpenUrlAction } from './action';
import { Linking } from 'react-native';
import { To } from '../../utils/type_convertors';

/**
 * Processor for OpenUrlAction.
 *
 * Evaluates URL expression and attempts to open it using React Native Linking.
 */
export class OpenUrlProcessor extends ActionProcessor<OpenUrlAction> {
    async execute(
        context: Context,
        action: OpenUrlAction,
        options?: {
            id: string;
            parentActionId?: string;
        }
    ): Promise<any> {
        const urlRaw = action.url?.evaluate(context.scopeContext) ?? null;
        if (!urlRaw) {
            throw new Error('OpenUrlAction: url is required');
        }

        const trimmed = String(urlRaw).trim();
        // Evaluate optional launchMode (string). RN Linking doesn't support
        // different launch modes like Flutter's launch modes, so we accept the
        // value for compatibility but treat it as advisory. If callers pass
        // 'inApp' consider it unsupported in this environment.
        const launchModeRaw = action.launchMode?.evaluate(context.scopeContext) ?? null;
        const launchMode = launchModeRaw != null ? String(launchModeRaw).trim() : undefined;
        // Basic validation using URL constructor
        try {
            // eslint-disable-next-line no-new
            new URL(trimmed);
        } catch (err) {
            throw new Error(`OpenUrlAction: invalid URL '${trimmed}'`);
        }

        try {
            // If an in-app experience is requested, try using react-native-inappbrowser-reborn
            if (launchMode && (launchMode.toLowerCase() === 'inappwebview' || launchMode.toLowerCase() === 'inapp')) {
                try {
                    const available = await InAppBrowser.isAvailable();
                    if (available) {
                        await InAppBrowser.open(trimmed, {
                            // iOS
                            dismissButtonStyle: 'cancel',
                            preferredBarTintColor: '#ffffff',
                            preferredControlTintColor: '#000000',
                            readerMode: false,
                            // Android
                            showTitle: true,
                            toolbarColor: '#6200EE',
                            secondaryToolbarColor: 'black',
                            enableUrlBarHiding: true,
                            enableDefaultShare: true,
                        });
                        return null;
                    }
                } catch (err) {
                    // fall through to Linking fallback
                }
            }

            // default: open with system browser
            try {
                await Linking.openURL(trimmed);
            } catch (linkError) {
                const errorMessage = linkError instanceof Error ? linkError.message : String(linkError);
                throw new Error(`OpenUrlAction: failed to open URL '${trimmed}' - ${errorMessage}`);
            }
            return null;
        } catch (e) {
            // Surface error to caller
            throw e;
        }
    }
}
