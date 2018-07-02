import { Reducer } from 'redux';
import { Settings, settings as realSettings } from './settings';
import * as actions from './actions';
import { ActionType, getType } from 'typesafe-actions';

export interface SettingsState {
  readonly settings: Readonly<Settings>;
}

export const initialSettingsState: SettingsState = {
  settings: realSettings
};

export type SettingsAction = ActionType<typeof actions>;

export const settings: Reducer<SettingsState, SettingsAction> = (
  state: SettingsState = initialSettingsState,
  action: SettingsAction
) => {
  switch (action.type) {
    case getType(actions.loaded):
      return {
        settings: action.payload
      };
    case getType(actions.set):
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.property]: action.payload.value
        }
      };
    default:
      return state;
  }
};
