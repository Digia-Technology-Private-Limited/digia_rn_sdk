import { Action } from '../../config/types';
import { ActionContext } from '../ActionExecutor';
import { ScopeContext } from '../../expressions/ExpressionEvaluator';
import { ActionProcessor } from './ActionProcessor';
import { Linking } from 'react-native';

/**
 * Open URL action processor
 */
export class OpenUrlProcessor extends ActionProcessor {
  async execute(
    context: ActionContext,
    action: Action,
    scopeContext?: ScopeContext
  ): Promise<void> {
    const url = action.data.url;

    if (!url) {
      throw new Error('URL not provided in openUrl action');
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      throw new Error(`Cannot open URL: ${url}`);
    }
  }
}
